import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useUserInfoQuery } from "../account/accountApi";

export default function HomePage() {
    const { data: user } = useUserInfoQuery();

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, mt: 4 }}>
                <Dashboard sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    TaskBoard Test
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Real-Time Collaborative Task Management.
                    Organize your work with Kanban boards, collaborate with your team in real-time.
                </Typography>
                {user ? (
                    <Button
                        variant="contained"
                        size="large"
                        component={Link}
                        to='/dashboard'
                        sx={{ px: 6, py: 1.5 }}
                    >
                        Go to Dashboard
                    </Button>
                ) : (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            size="large"
                            component={Link}
                            to='/login'
                            sx={{ px: 6, py: 1.5 }}
                        >
                            Sign In
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            component={Link}
                            to='/register'
                            sx={{ px: 6, py: 1.5 }}
                        >
                            Register
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    )
}
