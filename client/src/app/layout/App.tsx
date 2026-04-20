import { Box, Container, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import NavBar from "./NavBar";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { useUserInfoQuery } from "../../features/account/accountApi";
import { useSignalR } from "../../lib/hooks/useSignalR";

const theme = createTheme({
    palette: {
        mode: 'light',
        background: {
            default: '#eaeaea'
        }
    }
});

function App() {
    useUserInfoQuery();

    // Connect to SignalR when user is authenticated
    useSignalR();

    return (
        <ThemeProvider theme={theme}>
            <ScrollRestoration />
            <CssBaseline />
            <NavBar />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'radial-gradient(circle, #baecf9, #f0f9ff)',
                    py: 6
                }}
            >
                <Container maxWidth='xl' sx={{ mt: 8 }}>
                    <Outlet />
                </Container>
            </Box>
        </ThemeProvider>
    )
}

export default App
