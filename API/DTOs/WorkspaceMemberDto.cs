namespace API.DTOs;

public class WorkspaceMemberDto
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public string? Email { get; set; }
    public required string Role { get; set; }
}
