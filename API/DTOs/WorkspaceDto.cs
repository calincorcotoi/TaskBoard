namespace API.DTOs;

public class WorkspaceDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public required string OwnerId { get; set; }
    public string? OwnerEmail { get; set; }
    public int MemberCount { get; set; }
    public int BoardCount { get; set; }
}
