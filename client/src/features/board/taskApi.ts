import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { TaskItem } from "../../app/models/board";

export const taskApi = createApi({
    reducerPath: 'taskApi',
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ['Tasks'],
    endpoints: (builder) => ({
        fetchTasks: builder.query<TaskItem[], { boardId: number; searchTerm?: string; status?: string }>({
            query: ({ boardId, searchTerm, status }) => ({
                url: 'tasks',
                params: {
                    boardId,
                    ...(searchTerm ? { searchTerm } : {}),
                    ...(status ? { status } : {})
                }
            }),
            providesTags: ['Tasks']
        }),
        fetchTask: builder.query<TaskItem, number>({
            query: (id) => `tasks/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Tasks', id }]
        }),
        createTask: builder.mutation<TaskItem, {
            title: string; description?: string; assigneeId?: string;
            dueDate?: string; labels?: string; boardId: number
        }>({
            query: (body) => ({
                url: 'tasks',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Tasks']
        }),
        updateTask: builder.mutation<void, {
            id: number; title: string; description?: string;
            assigneeId?: string; dueDate?: string; labels?: string
        }>({
            query: ({ id, ...body }) => ({
                url: `tasks/${id}`,
                method: 'PUT',
                body: { id, ...body }
            }),
            invalidatesTags: ['Tasks']
        }),
        moveTask: builder.mutation<void, { id: number; newStatus: number; newPosition: number }>({
            query: ({ id, ...body }) => ({
                url: `tasks/${id}/move`,
                method: 'PUT',
                body: { taskId: id, ...body }
            }),
            invalidatesTags: ['Tasks']
        }),
        deleteTask: builder.mutation<void, number>({
            query: (id) => ({
                url: `tasks/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Tasks']
        })
    })
});

export const {
    useFetchTasksQuery, useFetchTaskQuery,
    useCreateTaskMutation, useUpdateTaskMutation, useMoveTaskMutation, useDeleteTaskMutation
} = taskApi;
