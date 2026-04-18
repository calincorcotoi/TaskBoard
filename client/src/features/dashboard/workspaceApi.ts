import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { Workspace, WorkspaceMember } from "../../app/models/workspace";

export const workspaceApi = createApi({
    reducerPath: 'workspaceApi',
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ['Workspaces', 'WorkspaceMembers'],
    endpoints: (builder) => ({
        fetchWorkspaces: builder.query<Workspace[], string | undefined>({
            query: (searchTerm) => ({
                url: 'workspaces',
                params: searchTerm ? { searchTerm } : {}
            }),
            providesTags: ['Workspaces']
        }),
        fetchWorkspace: builder.query<Workspace, number>({
            query: (id) => `workspaces/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Workspaces', id }]
        }),
        createWorkspace: builder.mutation<Workspace, { name: string; description?: string }>({
            query: (body) => ({
                url: 'workspaces',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Workspaces']
        }),
        updateWorkspace: builder.mutation<void, { id: number; name: string; description?: string }>({
            query: ({ id, ...body }) => ({
                url: `workspaces/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Workspaces']
        }),
        deleteWorkspace: builder.mutation<void, number>({
            query: (id) => ({
                url: `workspaces/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Workspaces']
        }),
        fetchMembers: builder.query<WorkspaceMember[], number>({
            query: (workspaceId) => `workspaces/${workspaceId}/members`,
            providesTags: ['WorkspaceMembers']
        }),
        addMember: builder.mutation<void, { workspaceId: number; email: string }>({
            query: ({ workspaceId, email }) => ({
                url: `workspaces/${workspaceId}/members`,
                method: 'POST',
                body: { email }
            }),
            invalidatesTags: ['WorkspaceMembers', 'Workspaces']
        }),
        removeMember: builder.mutation<void, { workspaceId: number; memberId: string }>({
            query: ({ workspaceId, memberId }) => ({
                url: `workspaces/${workspaceId}/members/${memberId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['WorkspaceMembers', 'Workspaces']
        })
    })
});

export const {
    useFetchWorkspacesQuery, useFetchWorkspaceQuery,
    useCreateWorkspaceMutation, useUpdateWorkspaceMutation, useDeleteWorkspaceMutation,
    useFetchMembersQuery, useAddMemberMutation, useRemoveMemberMutation
} = workspaceApi;
