namespace API.Entities;

public class Workspace
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public required string OwnerId { get; set; }
    public User Owner { get; set; } = null!;
    public ICollection<WorkspaceMember> Members { get; set; } = [];
    public ICollection<Board> Boards { get; set; } = [];
}
