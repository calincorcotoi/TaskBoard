import { useState } from "react";
import {
    Box, Button, Chip, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, TextField, Typography
} from "@mui/material";
import { AccessTime, Delete, Edit, Person, Label } from "@mui/icons-material";
import type { TaskItem } from "../../app/models/board";
import { useDeleteTaskMutation, useUpdateTaskMutation } from "../board/taskApi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskSchema } from "../../lib/schemas/taskSchema";
import { toast } from "react-toastify";
import { format } from "date-fns";

interface Props {
    task: TaskItem;
    open: boolean;
    onClose: () => void;
    boardId: number;
}

export default function TaskDetailModal({ task, open, onClose, boardId }: Props) {
    const [editing, setEditing] = useState(false);
    const [updateTask] = useUpdateTaskMutation();
    const [deleteTask] = useDeleteTaskMutation();

    const { register, handleSubmit, formState: { errors } } = useForm<TaskSchema>({
        mode: 'onTouched',
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: task.title,
            description: task.description || '',
            assigneeId: task.assigneeId || '',
            dueDate: task.dueDate ? task.dueDate.substring(0, 10) : '',
            labels: task.labels || ''
        }
    });

    const onSubmit = async (data: TaskSchema) => {
        await updateTask({
            id: task.id,
            title: data.title,
            description: data.description,
            assigneeId: data.assigneeId,
            dueDate: data.dueDate,
            labels: data.labels
        });
        toast.success('Task updated');
        setEditing(false);
        onClose();
    };

    const handleDelete = async () => {
        await deleteTask(task.id);
        toast.success('Task deleted');
        onClose();
    };

    const labels = task.labels?.split(',').filter(l => l.trim()) || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editing ? 'Edit Task' : task.title}
                <Box>
                    <Button size="small" startIcon={<Edit />} onClick={() => setEditing(!editing)}>
                        {editing ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button size="small" startIcon={<Delete />} color="error" onClick={handleDelete}>
                        Delete
                    </Button>
                </Box>
            </DialogTitle>

            {editing ? (
                <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Title"
                            fullWidth
                            {...register('title')}
                            error={!!errors.title}
                            helperText={errors.title?.message}
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            multiline
                            rows={3}
                            {...register('description')}
                        />
                        <TextField
                            label="Assignee ID"
                            fullWidth
                            {...register('assigneeId')}
                        />
                        <TextField
                            label="Due Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            {...register('dueDate')}
                        />
                        <TextField
                            label="Labels (comma separated)"
                            fullWidth
                            {...register('labels')}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditing(false)}>Cancel</Button>
                        <Button type='submit' variant="contained">Save</Button>
                    </DialogActions>
                </Box>
            ) : (
                <DialogContent>
                    <Box display='flex' alignItems='center' gap={1} mb={2}>
                        <Chip
                            label={task.status}
                            color={
                                task.status === 'Done' ? 'success'
                                    : task.status === 'InProgress' ? 'warning'
                                        : 'info'
                            }
                            size="small"
                        />
                    </Box>

                    {task.description && (
                        <>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                {task.description}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                        </>
                    )}

                    <Box display='flex' flexDirection='column' gap={1.5}>
                        {task.assigneeEmail && (
                            <Typography variant="body2" display='flex' alignItems='center' gap={1}>
                                <Person fontSize="small" color="action" />
                                Assignee: {task.assigneeEmail}
                            </Typography>
                        )}
                        {task.dueDate && (
                            <Typography variant="body2" display='flex' alignItems='center' gap={1}>
                                <AccessTime fontSize="small" color="action" />
                                Due: {format(new Date(task.dueDate), 'MMMM d, yyyy')}
                            </Typography>
                        )}
                        {labels.length > 0 && (
                            <Box display='flex' alignItems='center' gap={1}>
                                <Label fontSize="small" color="action" />
                                <Box display='flex' gap={0.5} flexWrap='wrap'>
                                    {labels.map((label, i) => (
                                        <Chip key={i} label={label.trim()} size="small" />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                        Created: {format(new Date(task.createdAt), 'MMM d, yyyy HH:mm')}
                        {' | '}
                        Updated: {format(new Date(task.updatedAt), 'MMM d, yyyy HH:mm')}
                    </Typography>
                </DialogContent>
            )}
        </Dialog>
    );
}
