export type Workspace = {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    ownerId: string;
    ownerEmail?: string;
    memberCount: number;
    boardCount: number;
}

export type WorkspaceMember = {
    id: number;
    userId: string;
    email?: string;
    role: string;
}
