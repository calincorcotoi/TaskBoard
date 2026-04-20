import {
    Box, Button, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControl, InputLabel, MenuItem, Select, TextField
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, type TaskSchema } from "../../lib/schemas/taskSchema";
import { useCreateTaskMutation } from "../board/taskApi";
import { useFetchMembersQuery } from "../dashboard/workspaceApi";
import { toast } from "react-toastify";

interface Props {
    open: boolean;
    onClose: () => void;
    boardId: number;
    workspaceId: number;
}

export default function TaskForm({ open, onClose, boardId, workspaceId }: Props) {
    const [createTask] = useCreateTaskMutation();
    const { data: members } = useFetchMembersQuery(workspaceId);
    const { register, handleSubmit, reset, control, formState: { errors } } = useForm<TaskSchema>({
        mode: 'onTouched',
        resolver: zodResolver(taskSchema)
    });

    const onSubmit = async (data: TaskSchema) => {
        await createTask({
            title: data.title,
            description: data.description || undefined,
            assigneeId: data.assigneeId || undefined,
            dueDate: data.dueDate || undefined,
            labels: data.labels || undefined,
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
                    <Controller
                        name="assigneeId"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <FormControl fullWidth>
                                <InputLabel>Assignee</InputLabel>
                                <Select
                                    {...field}
                                    label="Assignee"
                                >
                                    <MenuItem value="">
                                        <em>Unassigned</em>
                                    </MenuItem>
                                    {members?.map(m => (
                                        <MenuItem key={m.userId} value={m.userId}>
                                            {m.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    />
                    <TextField
                        label="Due Date"
                        type="date"
                        fullWidth
                        slotProps={{ inputLabel: { shrink: true } }}
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
