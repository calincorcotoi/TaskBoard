namespace API.DTOs;

public class BoardDto
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int WorkspaceId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TaskItemDto> Tasks { get; set; } = [];
}
