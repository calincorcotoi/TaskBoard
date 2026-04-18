using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DbInitializer
{
    public static async Task InitDb(WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>()
            ?? throw new InvalidOperationException("Failed to retrieve db context");
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>()
            ?? throw new InvalidOperationException("Failed to retrieve user manager");

        await SeedData(context, userManager);
    }

    private static async Task SeedData(AppDbContext context, UserManager<User> userManager)
    {
        context.Database.Migrate();

        if (!userManager.Users.Any())
        {
            var bob = new User
            {
                UserName = "bob@test.com",
                Email = "bob@test.com"
            };
            await userManager.CreateAsync(bob, "Pa$$w0rd");
            await userManager.AddToRoleAsync(bob, "Member");

            var alice = new User
            {
                UserName = "alice@test.com",
                Email = "alice@test.com"
            };
            await userManager.CreateAsync(alice, "Pa$$w0rd");
            await userManager.AddToRoleAsync(alice, "Member");

            var admin = new User
            {
                UserName = "admin@test.com",
                Email = "admin@test.com"
            };
            await userManager.CreateAsync(admin, "Pa$$w0rd");
            await userManager.AddToRolesAsync(admin, ["Member", "Admin"]);
        }

        if (context.Workspaces.Any()) return;

        var users = await userManager.Users.ToListAsync();
        var bobUser = users.First(u => u.Email == "bob@test.com");
        var aliceUser = users.First(u => u.Email == "alice@test.com");

        // Create workspaces
        var workspace1 = new Workspace
        {
            Name = "Project Alpha",
            Description = "Main development project for the Alpha platform",
            OwnerId = bobUser.Id
        };

        var workspace2 = new Workspace
        {
            Name = "Marketing Campaign",
            Description = "Q1 Marketing planning and execution",
            OwnerId = aliceUser.Id
        };

        context.Workspaces.AddRange(workspace1, workspace2);
        await context.SaveChangesAsync();

        // Add members
        context.WorkspaceMembers.AddRange(
            new WorkspaceMember { WorkspaceId = workspace1.Id, UserId = bobUser.Id, Role = "Owner" },
            new WorkspaceMember { WorkspaceId = workspace1.Id, UserId = aliceUser.Id, Role = "Member" },
            new WorkspaceMember { WorkspaceId = workspace2.Id, UserId = aliceUser.Id, Role = "Owner" },
            new WorkspaceMember { WorkspaceId = workspace2.Id, UserId = bobUser.Id, Role = "Member" }
        );
        await context.SaveChangesAsync();

        // Create boards
        var board1 = new Board { Name = "Sprint 1", WorkspaceId = workspace1.Id };
        var board2 = new Board { Name = "Sprint 2", WorkspaceId = workspace1.Id };
        var board3 = new Board { Name = "Content Calendar", WorkspaceId = workspace2.Id };

        context.Boards.AddRange(board1, board2, board3);
        await context.SaveChangesAsync();

        // Create tasks
        var tasks = new List<TaskItem>
        {
            new()
            {
                Title = "Setup project structure",
                Description = "Initialize the repository and setup the project folder structure",
                Status = TaskItemStatus.Done,
                Position = 0,
                AssigneeId = bobUser.Id,
                Labels = "setup,infrastructure",
                BoardId = board1.Id
            },
            new()
            {
                Title = "Design database schema",
                Description = "Create the ERD and define all entity relationships",
                Status = TaskItemStatus.Done,
                Position = 1,
                AssigneeId = aliceUser.Id,
                Labels = "database,design",
                BoardId = board1.Id
            },
            new()
            {
                Title = "Implement authentication",
                Description = "Add login and registration with ASP.NET Identity",
                Status = TaskItemStatus.InProgress,
                Position = 0,
                AssigneeId = bobUser.Id,
                Labels = "auth,backend",
                BoardId = board1.Id
            },
            new()
            {
                Title = "Create REST API endpoints",
                Description = "Build all CRUD endpoints for workspaces, boards, and tasks",
                Status = TaskItemStatus.InProgress,
                Position = 1,
                AssigneeId = aliceUser.Id,
                Labels = "api,backend",
                BoardId = board1.Id
            },
            new()
            {
                Title = "Setup CI/CD pipeline",
                Description = "Configure GitHub Actions for build and deploy",
                Status = TaskItemStatus.ToDo,
                Position = 0,
                Labels = "devops,infrastructure",
                BoardId = board1.Id
            },
            new()
            {
                Title = "Write unit tests",
                Description = "Add unit tests for all service methods",
                Status = TaskItemStatus.ToDo,
                Position = 1,
                AssigneeId = bobUser.Id,
                Labels = "testing",
                BoardId = board1.Id,
                DueDate = DateTime.UtcNow.AddDays(14)
            },
            new()
            {
                Title = "Build React frontend",
                Description = "Create the frontend application with React and Material UI",
                Status = TaskItemStatus.ToDo,
                Position = 2,
                AssigneeId = aliceUser.Id,
                Labels = "frontend,react",
                BoardId = board1.Id,
                DueDate = DateTime.UtcNow.AddDays(21)
            },
            new()
            {
                Title = "Create blog post draft",
                Description = "Write the first draft for the product launch blog post",
                Status = TaskItemStatus.InProgress,
                Position = 0,
                AssigneeId = aliceUser.Id,
                Labels = "content,writing",
                BoardId = board3.Id,
                DueDate = DateTime.UtcNow.AddDays(7)
            },
            new()
            {
                Title = "Design social media graphics",
                Description = "Create visual assets for Twitter, LinkedIn and Instagram",
                Status = TaskItemStatus.ToDo,
                Position = 0,
                Labels = "design,social-media",
                BoardId = board3.Id,
                DueDate = DateTime.UtcNow.AddDays(10)
            },
            new()
            {
                Title = "Schedule email newsletter",
                Description = "Prepare and schedule the launch announcement email",
                Status = TaskItemStatus.ToDo,
                Position = 1,
                AssigneeId = bobUser.Id,
                Labels = "email,marketing",
                BoardId = board3.Id
            }
        };

        context.TaskItems.AddRange(tasks);
        await context.SaveChangesAsync();
    }
}
