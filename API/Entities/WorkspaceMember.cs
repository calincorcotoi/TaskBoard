namespace API.Entities;

public class WorkspaceMember
{
    public int Id { get; set; }
    public int WorkspaceId { get; set; }
    public Workspace Workspace { get; set; } = null!;
    public required string UserId { get; set; }
    public User User { get; set; } = null!;
    public string Role { get; set; } = "Member"; // Owner, Member
}
