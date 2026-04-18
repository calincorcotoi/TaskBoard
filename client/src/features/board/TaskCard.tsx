import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import { AccessTime, Person } from "@mui/icons-material";
import type { TaskItem } from "../../app/models/board";
import { format } from "date-fns";

interface Props {
    task: TaskItem;
    isDragging: boolean;
    onClick: () => void;
}

export default function TaskCard({ task, isDragging, onClick }: Props) {
    const labels = task.labels?.split(',').filter(l => l.trim()) || [];

    return (
        <Card
            onClick={onClick}
            sx={{
                cursor: 'pointer',
                borderRadius: 2,
                boxShadow: isDragging ? 8 : 1,
                transform: isDragging ? 'rotate(2deg)' : 'none',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': { boxShadow: 3 }
            }}
        >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="subtitle2" fontWeight='bold' sx={{ mb: 0.5 }}>
                    {task.title}
                </Typography>

                {task.description && (
                    <Typography variant="body2" color="text.secondary" sx={{
                        mb: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                    }}>
                        {task.description}
                    </Typography>
                )}

                {labels.length > 0 && (
                    <Box display='flex' gap={0.5} flexWrap='wrap' mb={1}>
                        {labels.map((label, i) => (
                            <Chip key={i} label={label.trim()} size="small" variant="outlined" />
                        ))}
                    </Box>
                )}

                <Box display='flex' justifyContent='space-between' alignItems='center'>
                    {task.assigneeEmail && (
                        <Typography variant="caption" display='flex' alignItems='center' gap={0.5} color="text.secondary">
                            <Person sx={{ fontSize: 14 }} /> {task.assigneeEmail}
                        </Typography>
                    )}
                    {task.dueDate && (
                        <Typography variant="caption" display='flex' alignItems='center' gap={0.5} color="text.secondary">
                            <AccessTime sx={{ fontSize: 14 }} />
                            {format(new Date(task.dueDate), 'MMM d')}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
