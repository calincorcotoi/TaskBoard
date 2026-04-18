import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { accountApi } from "../../features/account/accountApi";
import { workspaceApi } from "../../features/dashboard/workspaceApi";
import { boardApi } from "../../features/board/boardApi";
import { taskApi } from "../../features/board/taskApi";
import { uiSlice } from "../layout/uiSlice";

export const store = configureStore({
    reducer: {
        [accountApi.reducerPath]: accountApi.reducer,
        [workspaceApi.reducerPath]: workspaceApi.reducer,
        [boardApi.reducerPath]: boardApi.reducer,
        [taskApi.reducerPath]: taskApi.reducer,
        ui: uiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            accountApi.middleware,
            workspaceApi.middleware,
            boardApi.middleware,
            taskApi.middleware,
        )
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
