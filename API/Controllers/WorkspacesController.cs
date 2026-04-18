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
public class WorkspacesController(
    AppDbContext context,
    IMapper mapper,
    IHubContext<BoardHub> hubContext) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<WorkspaceDto>>> GetWorkspaces([FromQuery] string? searchTerm)
    {
        var userId = User.GetUserId();

        var query = context.Workspaces
            .Include(w => w.Owner)
            .Include(w => w.Members)
            .Include(w => w.Boards)
            .Where(w => w.OwnerId == userId
                || w.Members.Any(m => m.UserId == userId))
            .Search(searchTerm);

        var workspaces = await query
            .ProjectTo<WorkspaceDto>(mapper.ConfigurationProvider)
            .ToListAsync();

        return workspaces;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WorkspaceDto>> GetWorkspace(int id)
    {
        var userId = User.GetUserId();

        var workspace = await context.Workspaces
            .Include(w => w.Owner)
            .Include(w => w.Members)
            .Include(w => w.Boards)
            .Where(w => w.Id == id && (w.OwnerId == userId
                || w.Members.Any(m => m.UserId == userId)))
            .ProjectTo<WorkspaceDto>(mapper.ConfigurationProvider)
            .FirstOrDefaultAsync();

        if (workspace == null) return NotFound();

        return workspace;
    }

    [HttpPost]
    public async Task<ActionResult<WorkspaceDto>> CreateWorkspace(CreateWorkspaceDto dto)
    {
        var userId = User.GetUserId()!;

        var workspace = mapper.Map<Workspace>(dto);
        workspace.OwnerId = userId;

        context.Workspaces.Add(workspace);

        // Add owner as a member
        context.WorkspaceMembers.Add(new WorkspaceMember
        {
            Workspace = workspace,
            UserId = userId,
            Role = "Owner"
        });

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem creating workspace");

        var workspaceDto = await context.Workspaces
            .Include(w => w.Owner)
            .Include(w => w.Members)
            .Include(w => w.Boards)
            .Where(w => w.Id == workspace.Id)
            .ProjectTo<WorkspaceDto>(mapper.ConfigurationProvider)
            .FirstAsync();

        return CreatedAtAction(nameof(GetWorkspace), new { Id = workspace.Id }, workspaceDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateWorkspace(int id, CreateWorkspaceDto dto)
    {
        var userId = User.GetUserId();

        var workspace = await context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workspace == null) return NotFound();
        if (workspace.OwnerId != userId) return Forbid();

        workspace.Name = dto.Name;
        workspace.Description = dto.Description;

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem updating workspace");

        // Notify all workspace members
        var memberIds = workspace.Members.Select(m => m.UserId).ToList();
        await hubContext.Clients.Users(memberIds)
            .SendAsync("WorkspaceUpdated", new { workspace.Id, workspace.Name, workspace.Description });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteWorkspace(int id)
    {
        var userId = User.GetUserId();

        var workspace = await context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workspace == null) return NotFound();
        if (workspace.OwnerId != userId) return Forbid();

        var memberIds = workspace.Members.Select(m => m.UserId).ToList();

        context.Workspaces.Remove(workspace);

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem deleting workspace");

        await hubContext.Clients.Users(memberIds)
            .SendAsync("WorkspaceDeleted", new { WorkspaceId = id });

        return Ok();
    }

    [HttpGet("{id}/members")]
    public async Task<ActionResult<List<WorkspaceMemberDto>>> GetMembers(int id)
    {
        var userId = User.GetUserId();

        var workspace = await context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workspace == null) return NotFound();
        if (!workspace.Members.Any(m => m.UserId == userId)) return Forbid();

        var members = await context.WorkspaceMembers
            .Include(m => m.User)
            .Where(m => m.WorkspaceId == id)
            .Select(m => new WorkspaceMemberDto
            {
                Id = m.Id,
                UserId = m.UserId,
                Email = m.User.Email,
                Role = m.Role
            })
            .ToListAsync();

        return members;
    }

    [HttpPost("{id}/members")]
    public async Task<ActionResult> AddMember(int id, AddMemberDto dto)
    {
        var userId = User.GetUserId();

        var workspace = await context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workspace == null) return NotFound();
        if (workspace.OwnerId != userId) return Forbid();

        var userToAdd = await context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (userToAdd == null) return BadRequest("User not found");

        if (workspace.Members.Any(m => m.UserId == userToAdd.Id))
            return BadRequest("User is already a member");

        context.WorkspaceMembers.Add(new WorkspaceMember
        {
            WorkspaceId = id,
            UserId = userToAdd.Id,
            Role = "Member"
        });

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem adding member");

        var memberIds = workspace.Members.Select(m => m.UserId).Append(userToAdd.Id).ToList();
        await hubContext.Clients.Users(memberIds)
            .SendAsync("MemberAdded", new { WorkspaceId = id, UserId = userToAdd.Id, userToAdd.Email });

        return Ok();
    }

    [HttpDelete("{id}/members/{memberId}")]
    public async Task<ActionResult> RemoveMember(int id, string memberId)
    {
        var userId = User.GetUserId();

        var workspace = await context.Workspaces
            .Include(w => w.Members)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workspace == null) return NotFound();
        if (workspace.OwnerId != userId) return Forbid();

        var member = workspace.Members.FirstOrDefault(m => m.UserId == memberId);
        if (member == null) return NotFound("Member not found");
        if (member.Role == "Owner") return BadRequest("Cannot remove the owner");

        context.WorkspaceMembers.Remove(member);

        var result = await context.SaveChangesAsync() > 0;

        if (!result) return BadRequest("Problem removing member");

        var memberIds = workspace.Members.Select(m => m.UserId).ToList();
        await hubContext.Clients.Users(memberIds)
            .SendAsync("MemberRemoved", new { WorkspaceId = id, UserId = memberId });

        return Ok();
    }
}
