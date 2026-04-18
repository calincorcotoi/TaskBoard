using API.DTOs;
using API.Entities;
using AutoMapper;

namespace API.RequestHelpers;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<CreateWorkspaceDto, Workspace>();
        CreateMap<Workspace, WorkspaceDto>()
            .ForMember(d => d.OwnerEmail, o => o.MapFrom(s => s.Owner.Email))
            .ForMember(d => d.MemberCount, o => o.MapFrom(s => s.Members.Count))
            .ForMember(d => d.BoardCount, o => o.MapFrom(s => s.Boards.Count));

        CreateMap<CreateBoardDto, Board>();
        CreateMap<Board, BoardDto>();

        CreateMap<CreateTaskDto, TaskItem>();
        CreateMap<UpdateTaskDto, TaskItem>();
        CreateMap<TaskItem, TaskItemDto>()
            .ForMember(d => d.Status, o => o.MapFrom(s => s.Status.ToString()))
            .ForMember(d => d.AssigneeEmail, o => o.MapFrom(s => s.Assignee != null ? s.Assignee.Email : null));

        CreateMap<WorkspaceMember, WorkspaceMemberDto>()
            .ForMember(d => d.Email, o => o.MapFrom(s => s.User.Email));
    }
}
