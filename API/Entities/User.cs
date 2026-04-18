using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class User : IdentityUser
{
    public ICollection<WorkspaceMember> WorkspaceMemberships { get; set; } = [];
    public ICollection<TaskItem> AssignedTasks { get; set; } = [];
}
