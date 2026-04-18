namespace API.DTOs;

public class CreateBoardDto
{
    public required string Name { get; set; }
    public int WorkspaceId { get; set; }
}
