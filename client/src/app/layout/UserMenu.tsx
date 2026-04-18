import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { useLogoutMutation, useUserInfoQuery } from "../../features/account/accountApi";
import { Link } from "react-router-dom";

export default function UserMenu() {
    const { data: user } = useUserInfoQuery();
    const [logout] = useLogoutMutation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    if (!user) {
        return (
            <Button component={Link} to='/login' color='inherit' variant="outlined" sx={{ ml: 2 }}>
                Sign in
            </Button>
        );
    }

    return (
        <>
            <Button color='inherit' onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 2 }}>
                {user.email}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem component={Link} to='/dashboard' onClick={() => setAnchorEl(null)}>
                    My Workspaces
                </MenuItem>
                <MenuItem onClick={() => { logout(); setAnchorEl(null); }}>
                    Logout
                </MenuItem>
            </Menu>
        </>
    )
}
