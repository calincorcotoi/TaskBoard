import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithErrorHandling } from "../../app/api/baseApi";
import type { Board } from "../../app/models/board";

export const boardApi = createApi({
    reducerPath: 'boardApi',
    baseQuery: baseQueryWithErrorHandling,
    tagTypes: ['Boards'],
    endpoints: (builder) => ({
        fetchBoards: builder.query<Board[], number>({
            query: (workspaceId) => ({
                url: 'boards',
                params: { workspaceId }
            }),
            providesTags: ['Boards']
        }),
        fetchBoard: builder.query<Board, number>({
            query: (id) => `boards/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Boards', id }]
        }),
        createBoard: builder.mutation<Board, { name: string; workspaceId: number }>({
            query: (body) => ({
                url: 'boards',
                method: 'POST',
                body
            }),
            invalidatesTags: ['Boards']
        }),
        updateBoard: builder.mutation<void, { id: number; name: string; workspaceId: number }>({
            query: ({ id, ...body }) => ({
                url: `boards/${id}`,
                method: 'PUT',
                body
            }),
            invalidatesTags: ['Boards']
        }),
        deleteBoard: builder.mutation<void, number>({
            query: (id) => ({
                url: `boards/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['Boards']
        })
    })
});

export const {
    useFetchBoardsQuery, useFetchBoardQuery,
    useCreateBoardMutation, useUpdateBoardMutation, useDeleteBoardMutation
} = boardApi;
