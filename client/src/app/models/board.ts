export type Board = {
    id: number;
    name: string;
    workspaceId: number;
    createdAt: string;
    tasks: TaskItem[];
}

export type TaskItem = {
    id: number;
    title: string;
    description?: string;
    status: string;
    position: number;
    assigneeId?: string;
    assigneeEmail?: string;
    dueDate?: string;
    labels?: string;
    boardId: number;
    createdAt: string;
    updatedAt: string;
}
