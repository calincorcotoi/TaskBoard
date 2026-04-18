namespace API.DTOs;

public class CreateWorkspaceDto
{
    public required string Name { get; set; }
    public string? Description { get; set; }
}
