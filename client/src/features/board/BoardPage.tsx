import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    Box, Button, Chip, FormControl, InputAdornment, InputLabel,
    MenuItem, Select, TextField, Typography
} from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useFetchBoardQuery } from "./boardApi";
import { useFetchTasksQuery, useMoveTaskMutation } from "./taskApi";
import TaskCard from "./TaskCard";
import TaskDetailModal from "../task/TaskDetailModal";
import TaskForm from "../task/TaskForm";
import type { TaskItem } from "../../app/models/board";

const COLUMNS = [
    { key: 'ToDo', label: 'To Do', color: '#1976d2' },
    { key: 'InProgress', label: 'In Progress', color: '#ed6c02' },
    { key: 'Done', label: 'Done', color: '#2e7d32' }
];

const statusToNumber: Record<string, number> = {
    'ToDo': 0,
    'InProgress': 1,
    'Done': 2
};

export default function BoardPage() {
    const { boardId } = useParams<{ boardId: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const { data: board } = useFetchBoardQuery(Number(boardId));
    const { data: tasks } = useFetchTasksQuery({
        boardId: Number(boardId),
        searchTerm: debouncedSearch || undefined,
        status: statusFilter || undefined
    });
    const [moveTask] = useMoveTaskMutation();

    let searchTimer: ReturnType<typeof setTimeout>;
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            setDebouncedSearch(value);
        }, 500);
    };

    const getTasksByStatus = (status: string) => {
        return (tasks || [])
            .filter(t => t.status === status)
            .sort((a, b) => a.position - b.position);
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { draggableId, destination } = result;
        const taskId = parseInt(draggableId);
        const newStatus = destination.droppableId;
        const newPosition = destination.index;

        await moveTask({
            id: taskId,
            newStatus: statusToNumber[newStatus],
            newPosition
        });
    };

    if (!board) return <Typography>Loading board...</Typography>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{board.name}</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
                    New Task
                </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search tasks..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    sx={{ minWidth: 250 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start"><Search /></InputAdornment>
                            )
                        }
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter by status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Filter by status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="ToDo">To Do</MenuItem>
                        <MenuItem value="InProgress">In Progress</MenuItem>
                        <MenuItem value="Done">Done</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <DragDropContext onDragEnd={handleDragEnd}>
                <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                    {COLUMNS.map(col => (
                        <Droppable key={col.key} droppableId={col.key}>
                            {(provided, snapshot) => (
                                <Box
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    sx={{
                                        minWidth: 320,
                                        flex: 1,
                                        bgcolor: snapshot.isDraggingOver
                                            ? 'action.hover'
                                            : 'background.paper',
                                        borderRadius: 2,
                                        p: 2,
                                        minHeight: 400,
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <Chip
                                            label={col.label}
                                            sx={{
                                                bgcolor: col.color,
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {getTasksByStatus(col.key).length}
                                        </Typography>
                                    </Box>

                                    {getTasksByStatus(col.key).map((task, index) => (
                                        <Draggable
                                            key={task.id}
                                            draggableId={task.id.toString()}
                                            index={index}
                                        >
                                            {(provided, snapshot) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    sx={{ mb: 1 }}
                                                >
                                                    <TaskCard
                                                        task={task}
                                                        isDragging={snapshot.isDragging}
                                                        onClick={() => setSelectedTask(task)}
                                                    />
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </Box>
                            )}
                        </Droppable>
                    ))}
                </Box>
            </DragDropContext>

            {/* Task Detail Modal */}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    open={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    boardId={Number(boardId)}
                />
            )}

            {/* Create Task Form */}
            <TaskForm
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                boardId={Number(boardId)}
            />
        </Box>
    );
}
