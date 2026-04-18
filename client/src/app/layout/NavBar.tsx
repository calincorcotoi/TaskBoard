import {
    AppBar, Box, IconButton, LinearProgress, Switch, Toolbar, Typography
} from "@mui/material";
import { DarkMode, LightMode, Dashboard } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/store";
import { setDarkMode } from "./uiSlice";
import UserMenu from "./UserMenu";
import { useUserInfoQuery } from "../../features/account/accountApi";

export default function NavBar() {
    const dispatch = useAppDispatch();
    const { darkMode, isLoading } = useAppSelector(state => state.ui);
    const { data: user } = useUserInfoQuery();

    return (
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            {isLoading && (
                <LinearProgress color="secondary" sx={{ position: 'absolute', bottom: 0, width: '100%' }} />
            )}
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} component={Link} to='/'>
                    <Dashboard />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        TaskBoard
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {user && (
                        <Typography
                            component={Link}
                            to='/dashboard'
                            variant="button"
                            sx={{ '&:hover': { opacity: 0.8 } }}
                        >
                            My Workspaces
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={() => dispatch(setDarkMode())}>
                        {darkMode ? <DarkMode /> : <LightMode sx={{ color: 'yellow' }} />}
                    </IconButton>
                    <Switch checked={darkMode} onChange={() => dispatch(setDarkMode())} />
                    <UserMenu />
                </Box>
            </Toolbar>
        </AppBar>
    )
}
