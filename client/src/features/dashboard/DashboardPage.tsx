import { useState } from "react";
import {
    Autocomplete, Box, Button, Card, CardActions, CardContent, Chip, Dialog, DialogActions,
    DialogContent, DialogTitle, Divider, Grid, IconButton, InputAdornment,
    List, ListItem, ListItemText, TextField, Typography
} from "@mui/material";
import { Add, Delete, Edit, Group, PersonRemove, Search, ViewKanban } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { workspaceSchema, type WorkspaceSchema } from "../../lib/schemas/workspaceSchema";
import {
    useAddMemberMutation, useCreateWorkspaceMutation, useDeleteWorkspaceMutation,
    useFetchMembersQuery, useFetchWorkspacesQuery, useRemoveMemberMutation,
    useUpdateWorkspaceMutation
} from "./workspaceApi";
import { useFetchBoardsQuery, useCreateBoardMutation, useDeleteBoardMutation } from "../board/boardApi";
import { useFetchAllUsersQuery } from "../account/accountApi";
import type { Workspace } from "../../app/models/workspace";
import { toast } from "react-toastify";

export default function DashboardPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
    const [expandedWorkspace, setExpandedWorkspace] = useState<number | null>(null);
    const [boardDialogOpen, setBoardDialogOpen] = useState(false);
    const [boardWorkspaceId, setBoardWorkspaceId] = useState<number | null>(null);
    const [boardName, setBoardName] = useState('');

    const { data: workspaces, isLoading } = useFetchWorkspacesQuery(debouncedSearch || undefined);
    const [createWorkspace] = useCreateWorkspaceMutation();
    const [updateWorkspace] = useUpdateWorkspaceMutation();
    const [deleteWorkspace] = useDeleteWorkspaceMutation();
    const [createBoard] = useCreateBoardMutation();
    const [deleteBoard] = useDeleteBoardMutation();
    const navigate = useNavigate();

    const { register, handleSubmit, reset, formState: { errors } } = useForm<WorkspaceSchema>({
        mode: 'onTouched',
        resolver: zodResolver(workspaceSchema)
    });

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            setDebouncedSearch(value);
        }, 500);
    };

    const openCreateDialog = () => {
        setEditingWorkspace(null);
        reset({ name: '', description: '' });
        setDialogOpen(true);
    };

    const openEditDialog = (ws: Workspace) => {
        setEditingWorkspace(ws);
        reset({ name: ws.name, description: ws.description || '' });
        setDialogOpen(true);
    };

    const onSubmit = async (data: WorkspaceSchema) => {
        if (editingWorkspace) {
            await updateWorkspace({ id: editingWorkspace.id, ...data });
            toast.success('Workspace updated');
        } else {
            await createWorkspace(data);
            toast.success('Workspace created');
        }
        setDialogOpen(false);
    };

    const handleDelete = async (id: number) => {
        await deleteWorkspace(id);
        toast.success('Workspace deleted');
    };

    const handleCreateBoard = async () => {
        if (!boardWorkspaceId || !boardName.trim()) return;
        await createBoard({ name: boardName, workspaceId: boardWorkspaceId });
        toast.success('Board created');
        setBoardDialogOpen(false);
        setBoardName('');
    };

    const handleDeleteBoard = async (boardId: number) => {
        await deleteBoard(boardId);
        toast.success('Board deleted');
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Workspaces</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog}>
                    New Workspace
                </Button>
            </Box>

            <TextField
                fullWidth
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{ mb: 3 }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start"><Search /></InputAdornment>
                        )
                    }
                }}
            />

            {isLoading && <Typography>Loading...</Typography>}

            <Grid container spacing={3}>
                {workspaces?.map(ws => (
                    <WorkspaceCard
                        key={ws.id}
                        workspace={ws}
                        expanded={expandedWorkspace === ws.id}
                        onToggleExpand={() => setExpandedWorkspace(expandedWorkspace === ws.id ? null : ws.id)}
                        onEdit={() => openEditDialog(ws)}
                        onDelete={() => handleDelete(ws.id)}
                        onCreateBoard={() => { setBoardWorkspaceId(ws.id); setBoardDialogOpen(true); }}
                        onDeleteBoard={handleDeleteBoard}
                        onNavigateBoard={(boardId) => navigate(`/board/${boardId}`)}
                    />
                ))}
            </Grid>

            {workspaces?.length === 0 && !isLoading && (
                <Typography sx={{ textAlign: 'center', mt: 4 }} color='text.secondary'>
                    No workspaces found. Create one to get started!
                </Typography>
            )}

            {/* Workspace Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth='sm' fullWidth>
                <DialogTitle>{editingWorkspace ? 'Edit Workspace' : 'Create Workspace'}</DialogTitle>
                <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Name"
                            fullWidth
                            autoFocus
                            {...register('name')}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            {...register('description')}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                        <Button type='submit' variant="contained">
                            {editingWorkspace ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </Box>

                {editingWorkspace && (
                    <>
                        <Divider />
                        <MembersSection workspaceId={editingWorkspace.id} />
                    </>
                )}
            </Dialog>

            {/* Board Dialog */}
            <Dialog open={boardDialogOpen} onClose={() => setBoardDialogOpen(false)} maxWidth='sm' fullWidth>
                <DialogTitle>Create Board</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Board Name"
                        fullWidth
                        autoFocus
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBoardDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleCreateBoard} disabled={!boardName.trim()}>
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function WorkspaceCard({
    workspace, expanded, onToggleExpand, onEdit, onDelete,
    onCreateBoard, onDeleteBoard, onNavigateBoard
}: {
    workspace: Workspace;
    expanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onCreateBoard: () => void;
    onDeleteBoard: (id: number) => void;
    onNavigateBoard: (id: number) => void;
}) {
    const { data: boards } = useFetchBoardsQuery(workspace.id, { skip: !expanded });

    return (
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ borderRadius: 2, height: '100%' }}>
                <CardContent sx={{ cursor: 'pointer' }} onClick={onToggleExpand}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{workspace.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {workspace.description || 'No description'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Group fontSize="small" /> {workspace.memberCount} members
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <ViewKanban fontSize="small" /> {workspace.boardCount} boards
                        </Typography>
                    </Box>
                </CardContent>

                {expanded && (
                    <CardContent sx={{ pt: 0 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Boards:</Typography>
                        {boards?.map(board => (
                            <Box key={board.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                <Typography
                                    variant="body2"
                                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                                    onClick={() => onNavigateBoard(board.id)}
                                >
                                    {board.name} ({board.tasks?.length || 0} tasks)
                                </Typography>
                                <IconButton size="small" onClick={() => onDeleteBoard(board.id)}>
                                    <Delete fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        <Button size="small" startIcon={<Add />} onClick={onCreateBoard} sx={{ mt: 1 }}>
                            New Board
                        </Button>
                    </CardContent>
                )}

                <CardActions>
                    <IconButton size="small" onClick={onEdit}><Edit /></IconButton>
                    <IconButton size="small" onClick={onDelete} color="error"><Delete /></IconButton>
                </CardActions>
            </Card>
        </Grid>
    );
}

function MembersSection({ workspaceId }: { workspaceId: number }) {
    const { data: members } = useFetchMembersQuery(workspaceId);
    const { data: allUsers } = useFetchAllUsersQuery();
    const [addMember] = useAddMemberMutation();
    const [removeMember] = useRemoveMemberMutation();

    const memberUserIds = new Set(members?.map(m => m.userId) || []);
    const availableUsers = (allUsers || []).filter(u => !memberUserIds.has(u.id));

    const handleAddMember = async (email: string) => {
        await addMember({ workspaceId, email });
        toast.success('Member added');
    };

    const handleRemoveMember = async (memberId: string) => {
        await removeMember({ workspaceId, memberId });
        toast.success('Member removed');
    };

    return (
        <DialogContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>Members</Typography>

            <List dense disablePadding>
                {members?.map(m => (
                    <ListItem
                        key={m.userId}
                        secondaryAction={
                            m.role !== 'Owner' && (
                                <IconButton edge="end" size="small" onClick={() => handleRemoveMember(m.userId)}>
                                    <PersonRemove fontSize="small" />
                                </IconButton>
                            )
                        }
                        sx={{ px: 0 }}
                    >
                        <ListItemText
                            primary={m.email}
                            secondary={
                                <Chip label={m.role} size="small" color={m.role === 'Owner' ? 'primary' : 'default'} />
                            }
                        />
                    </ListItem>
                ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Add member</Typography>
            <Autocomplete
                options={availableUsers}
                getOptionLabel={(option) => option.email}
                renderInput={(params) => (
                    <TextField {...params} placeholder="Search users..." size="small" />
                )}
                onChange={(_event, value) => {
                    if (value) handleAddMember(value.email);
                }}
                value={null}
                blurOnSelect
                noOptionsText="No users available"
            />
        </DialogContent>
    );
}
