using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Hubs;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class TasksController(
    AppDbContext context,
    IMapper mapper,
    IHubContext<BoardHub> hubContext) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<TaskItemDto>>> GetTasks(
        [FromQuery] int boardId,
        [FromQuery] string? searchTerm,
        [FromQuery] string? status)
    {
        var userId = User.GetUserId();

        var board = await context.Boards.FindAsync(boardId);
        if (board == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        var query = context.TaskItems
            .Include(t => t.Assignee)
            .Where(t => t.BoardId == boardId)
            .Search(searchTerm)
            .FilterByStatus(status)
            .OrderBy(t => t.Position);

        var tasks = await query.Select(t => new TaskItemDto
        {
            Id = t.Id,
            Title = t.Title,
            Description = t.Description,
            Status = t.Status.ToString(),
            Position = t.Position,
            AssigneeId = t.AssigneeId,
            AssigneeEmail = t.Assignee != null ? t.Assignee.Email : null,
            DueDate = t.DueDate,
            Labels = t.Labels,
            BoardId = t.BoardId,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToListAsync();

        return tasks;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskItemDto>> GetTask(int id)
    {
        var userId = User.GetUserId();

        var task = await context.TaskItems
            .Include(t => t.Assignee)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .Include(m => m.Workspace).ThenInclude(w => w.Boards)
            .AnyAsync(m => m.Workspace.Boards.Any(b => b.Id == task.BoardId) && m.UserId == userId);

        if (!isMember) return Forbid();

        return mapper.Map<TaskItemDto>(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskItemDto>> CreateTask(CreateTaskDto dto)
    {
        var userId = User.GetUserId();

        var board = await context.Boards.FindAsync(dto.BoardId);
        if (board == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        // Get max position for this status in this board
        var maxPosition = await context.TaskItems
            .Where(t => t.BoardId == dto.BoardId && t.Status == TaskItemStatus.ToDo)
            .MaxAsync(t => (int?)t.Position) ?? -1;

        var task = mapper.Map<TaskItem>(dto);
        task.Position = maxPosition + 1;

        context.TaskItems.Add(task);

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem creating task");

        // Reload with assignee
        await context.Entry(task).Reference(t => t.Assignee).LoadAsync();
        var taskDto = mapper.Map<TaskItemDto>(task);

        // Notify workspace members
        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == board.WorkspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        await hubContext.Clients.Users(memberIds)
            .SendAsync("TaskCreated", taskDto);

        return CreatedAtAction(nameof(GetTask), new { Id = task.Id }, taskDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateTask(int id, UpdateTaskDto dto)
    {
        var userId = User.GetUserId();

        var task = await context.TaskItems
            .Include(t => t.Board)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == task.Board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        mapper.Map(dto, task);
        task.UpdatedAt = DateTime.UtcNow;

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem updating task");

        await context.Entry(task).Reference(t => t.Assignee).LoadAsync();
        var taskDto = mapper.Map<TaskItemDto>(task);

        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == task.Board.WorkspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        await hubContext.Clients.Users(memberIds)
            .SendAsync("TaskUpdated", taskDto);

        return NoContent();
    }

    [HttpPut("{id}/move")]
    public async Task<ActionResult> MoveTask(int id, MoveTaskDto dto)
    {
        var userId = User.GetUserId();

        var task = await context.TaskItems
            .Include(t => t.Board)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == task.Board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        var oldStatus = task.Status;
        var oldPosition = task.Position;

        task.Status = dto.NewStatus;
        task.Position = dto.NewPosition;
        task.UpdatedAt = DateTime.UtcNow;

        // Reorder tasks in the destination column
        var tasksInNewColumn = await context.TaskItems
            .Where(t => t.BoardId == task.BoardId
                && t.Status == dto.NewStatus
                && t.Id != task.Id)
            .OrderBy(t => t.Position)
            .ToListAsync();

        for (int i = 0; i < tasksInNewColumn.Count; i++)
        {
            if (i >= dto.NewPosition)
            {
                tasksInNewColumn[i].Position = i + 1;
            }
            else
            {
                tasksInNewColumn[i].Position = i;
            }
        }

        // If moved from a different column, reorder old column
        if (oldStatus != dto.NewStatus)
        {
            var tasksInOldColumn = await context.TaskItems
                .Where(t => t.BoardId == task.BoardId
                    && t.Status == oldStatus
                    && t.Id != task.Id)
                .OrderBy(t => t.Position)
                .ToListAsync();

            for (int i = 0; i < tasksInOldColumn.Count; i++)
            {
                tasksInOldColumn[i].Position = i;
            }
        }

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem moving task");

        await context.Entry(task).Reference(t => t.Assignee).LoadAsync();
        var taskDto = mapper.Map<TaskItemDto>(task);

        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == task.Board.WorkspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        await hubContext.Clients.Users(memberIds)
            .SendAsync("TaskMoved", new
            {
                Task = taskDto,
                OldStatus = oldStatus.ToString(),
                OldPosition = oldPosition
            });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTask(int id)
    {
        var userId = User.GetUserId();

        var task = await context.TaskItems
            .Include(t => t.Board)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == task.Board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        var boardId = task.BoardId;
        var workspaceId = task.Board.WorkspaceId;

        context.TaskItems.Remove(task);

        // Reorder remaining tasks in the column
        var remainingTasks = await context.TaskItems
            .Where(t => t.BoardId == boardId
                && t.Status == task.Status
                && t.Id != task.Id)
            .OrderBy(t => t.Position)
            .ToListAsync();

        for (int i = 0; i < remainingTasks.Count; i++)
        {
            remainingTasks[i].Position = i;
        }

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem deleting task");

        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == workspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        await hubContext.Clients.Users(memberIds)
            .SendAsync("TaskDeleted", new { TaskId = id, BoardId = boardId });

        return Ok();
    }
}
