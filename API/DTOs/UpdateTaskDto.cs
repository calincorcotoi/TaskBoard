namespace API.DTOs;

public class UpdateTaskDto
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public string? AssigneeId { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Labels { get; set; }
}
