import { useEffect, useRef } from 'react';
import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';
import { useAppDispatch } from '../../app/store/store';
import { workspaceApi } from '../../features/dashboard/workspaceApi';
import { boardApi } from '../../features/board/boardApi';
import { taskApi } from '../../features/board/taskApi';

export function useSignalR() {
    const dispatch = useAppDispatch();
    const connectionRef = useRef<HubConnection | null>(null);

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl(import.meta.env.VITE_HUB_URL, {
                withCredentials: true
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        connection.on('WorkspaceUpdated', () => {
            dispatch(workspaceApi.util.invalidateTags(['Workspaces']));
        });

        connection.on('WorkspaceDeleted', () => {
            dispatch(workspaceApi.util.invalidateTags(['Workspaces']));
        });

        connection.on('MemberAdded', () => {
            dispatch(workspaceApi.util.invalidateTags(['WorkspaceMembers', 'Workspaces']));
        });

        connection.on('MemberRemoved', () => {
            dispatch(workspaceApi.util.invalidateTags(['WorkspaceMembers', 'Workspaces']));
        });

        connection.on('BoardCreated', () => {
            dispatch(boardApi.util.invalidateTags(['Boards']));
        });

        connection.on('BoardUpdated', () => {
            dispatch(boardApi.util.invalidateTags(['Boards']));
        });

        connection.on('BoardDeleted', () => {
            dispatch(boardApi.util.invalidateTags(['Boards']));
        });

        connection.on('TaskCreated', () => {
            dispatch(taskApi.util.invalidateTags(['Tasks']));
        });

        connection.on('TaskUpdated', () => {
            dispatch(taskApi.util.invalidateTags(['Tasks']));
        });

        connection.on('TaskMoved', () => {
            dispatch(taskApi.util.invalidateTags(['Tasks']));
        });

        connection.on('TaskDeleted', () => {
            dispatch(taskApi.util.invalidateTags(['Tasks']));
        });

        connection.start()
            .then(() => console.log('SignalR Connected'))
            .catch(err => console.error('SignalR Connection Error:', err));

        connectionRef.current = connection;

        return () => {
            connection.stop();
        };
    }, [dispatch]);

    return connectionRef;
}
