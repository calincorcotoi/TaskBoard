import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, TextField
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskSchema } from "../../lib/schemas/taskSchema";
import { useCreateTaskMutation } from "../board/taskApi";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onClose: () => void;
    boardId: number;
}

export default function TaskForm({ open, onClose, boardId }: Props) {
    const [createTask] = useCreateTaskMutation();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<TaskSchema>({
        mode: 'onTouched',
        resolver: zodResolver(taskSchema)
    });

    const onSubmit = async (data: TaskSchema) => {
        await createTask({
            ...data,
            boardId
        });
        toast.success('Task created');
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
            <DialogTitle>Create New Task</DialogTitle>
            <Box component='form' onSubmit={handleSubmit(onSubmit)}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Title"
                        fullWidth
                        autoFocus
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
                        label="Assignee ID (optional)"
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
                        placeholder="e.g. frontend, urgent, bug"
                        {...register('labels')}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type='submit' variant="contained">Create</Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
