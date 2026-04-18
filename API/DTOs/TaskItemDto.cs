namespace API.DTOs;

public class TaskItemDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string Status { get; set; } = "ToDo";
    public int Position { get; set; }
    public string? AssigneeId { get; set; }
    public string? AssigneeEmail { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Labels { get; set; }
    public int BoardId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
