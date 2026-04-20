import {
    AppBar, Box, LinearProgress, Toolbar, Typography
} from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/store";
import UserMenu from "./UserMenu";
import { useUserInfoQuery } from "../../features/account/accountApi";

export default function NavBar() {
    const { isLoading } = useAppSelector(state => state.ui);
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
                    <UserMenu />
                </Box>
            </Toolbar>
        </AppBar>
    )
}
