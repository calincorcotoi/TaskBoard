using API.Entities;

namespace API.Extensions;

public static class WorkspaceExtensions
{
    public static IQueryable<Workspace> Search(this IQueryable<Workspace> query, string? searchTerm)
    {
        if (string.IsNullOrEmpty(searchTerm)) return query;

        var lowerCaseSearchTerm = searchTerm.Trim().ToLower();

        return query.Where(x => x.Name.ToLower().Contains(lowerCaseSearchTerm));
    }
}
