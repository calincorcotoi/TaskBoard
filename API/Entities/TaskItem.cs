namespace API.Entities;

public class TaskItem
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.ToDo;
    public int Position { get; set; }
    public string? AssigneeId { get; set; }
    public User? Assignee { get; set; }
    public DateTime? DueDate { get; set; }
    public string? Labels { get; set; } // Comma-separated labels
    public int BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum TaskItemStatus
{
    ToDo,
    InProgress,
    Done
}
