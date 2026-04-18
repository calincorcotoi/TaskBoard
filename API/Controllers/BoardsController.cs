using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Hubs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize]
public class BoardsController(
    AppDbContext context,
    IMapper mapper,
    IHubContext<BoardHub> hubContext) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<BoardDto>>> GetBoards([FromQuery] int workspaceId)
    {
        var userId = User.GetUserId();

        // Verify user is member of workspace
        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == workspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        var boards = await context.Boards
            .Where(b => b.WorkspaceId == workspaceId)
            .Include(b => b.Tasks).ThenInclude(t => t.Assignee)
            .ProjectTo<BoardDto>(mapper.ConfigurationProvider)
            .ToListAsync();

        return boards;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BoardDto>> GetBoard(int id)
    {
        var userId = User.GetUserId();

        var board = await context.Boards
            .Include(b => b.Tasks).ThenInclude(t => t.Assignee)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (board == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        return mapper.Map<BoardDto>(board);
    }

    [HttpPost]
    public async Task<ActionResult<BoardDto>> CreateBoard(CreateBoardDto dto)
    {
        var userId = User.GetUserId();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == dto.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        var board = mapper.Map<Board>(dto);
        context.Boards.Add(board);

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem creating board");

        var boardDto = mapper.Map<BoardDto>(board);

        // Notify workspace members
        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == dto.WorkspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        await hubContext.Clients.Users(memberIds)
            .SendAsync("BoardCreated", boardDto);

        return CreatedAtAction(nameof(GetBoard), new { Id = board.Id }, boardDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateBoard(int id, CreateBoardDto dto)
    {
        var userId = User.GetUserId();

        var board = await context.Boards.FindAsync(id);
        if (board == null) return NotFound();

        var isMember = await context.WorkspaceMembers
            .AnyAsync(m => m.WorkspaceId == board.WorkspaceId && m.UserId == userId);

        if (!isMember) return Forbid();

        board.Name = dto.Name;

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem updating board");

        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == board.WorkspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        await hubContext.Clients.Users(memberIds)
            .SendAsync("BoardUpdated", new { board.Id, board.Name });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteBoard(int id)
    {
        var userId = User.GetUserId();

        var board = await context.Boards.FindAsync(id);
        if (board == null) return NotFound();

        var workspace = await context.Workspaces.FindAsync(board.WorkspaceId);
        if (workspace == null) return NotFound();
        if (workspace.OwnerId != userId) return Forbid();

        var memberIds = await context.WorkspaceMembers
            .Where(m => m.WorkspaceId == board.WorkspaceId)
            .Select(m => m.UserId)
            .ToListAsync();

        context.Boards.Remove(board);

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem deleting board");

        await hubContext.Clients.Users(memberIds)
            .SendAsync("BoardDeleted", new { BoardId = id, board.WorkspaceId });

        return Ok();
    }
}
