import { Box, Button, Container, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { Dashboard, GroupWork, ViewKanban, Sync, PersonAdd, Info } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useUserInfoQuery } from "../account/accountApi";

const steps = [
    {
        icon: <PersonAdd color="primary" />,
        title: '1. Creeaza un cont',
        text: 'Inregistreaza-te cu un email si o parola, apoi autentifica-te.'
    },
    {
        icon: <GroupWork color="primary" />,
        title: '2. Creeaza un Workspace',
        text: 'Un workspace e spatiul de lucru al echipei. Adauga membrii din pagina de editare.'
    },
    {
        icon: <ViewKanban color="primary" />,
        title: '3. Adauga Board-uri si Task-uri',
        text: 'In fiecare workspace poti crea board-uri (ex: Sprint 1). Pe board creezi task-uri pe care le muti intre coloane: To Do, In Progress si Done.'
    },
    {
        icon: <Sync color="primary" />,
        title: '4. Colaboreaza in timp real',
        text: 'Orice modificare facuta de un membru apare instant la toti ceilalti, fara refresh.'
    }
];

const seedUsers = [
    { email: 'bob@test.com', password: 'Pa$$w0rd', role: 'Member' },
    { email: 'alice@test.com', password: 'Pa$$w0rd', role: 'Member' },
];

export default function HomePage() {
    const { data: user } = useUserInfoQuery();

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, mt: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    TaskBoard
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

            <Paper sx={{ p: 4, borderRadius: 3, mt: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
                    Cum functioneaza?
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {steps.map((step) => (
                        <Box key={step.title} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Box sx={{ mt: 0.25 }}>{step.icon}</Box>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                    {step.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {step.text}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>

            <Paper sx={{ p: 4, borderRadius: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                    <Info color="info" />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Date demo preincarcate
                    </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Aplicatia vine cu date de test deja inserate pentru a vedea un demo fara sa faci toti pasii de configurare.
                </Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Parola</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Rol</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {seedUsers.map((u) => (
                                <TableRow key={u.email}>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{u.email}</TableCell>
                                    <TableCell sx={{ fontFamily: 'monospace' }}>{u.password}</TableCell>
                                    <TableCell>{u.role}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    )
}
