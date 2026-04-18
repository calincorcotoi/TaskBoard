using API.Entities;

namespace API.Extensions;

public static class TaskExtensions
{
    public static IQueryable<TaskItem> Search(this IQueryable<TaskItem> query, string? searchTerm)
    {
        if (string.IsNullOrEmpty(searchTerm)) return query;

        var lowerCaseSearchTerm = searchTerm.Trim().ToLower();

        return query.Where(x => x.Title.ToLower().Contains(lowerCaseSearchTerm)
            || (x.Description != null && x.Description.ToLower().Contains(lowerCaseSearchTerm)));
    }

    public static IQueryable<TaskItem> FilterByStatus(this IQueryable<TaskItem> query, string? status)
    {
        if (string.IsNullOrEmpty(status)) return query;

        if (Enum.TryParse<TaskItemStatus>(status, true, out var parsedStatus))
        {
            return query.Where(x => x.Status == parsedStatus);
        }

        return query;
    }
}
