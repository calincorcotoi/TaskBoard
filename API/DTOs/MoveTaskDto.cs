using API.Entities;

namespace API.DTOs;

public class MoveTaskDto
{
    public int TaskId { get; set; }
    public TaskItemStatus NewStatus { get; set; }
    public int NewPosition { get; set; }
}
