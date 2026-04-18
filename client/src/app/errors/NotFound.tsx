import { Button, Container, Paper, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <Container component={Paper} sx={{ height: 400, p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Typography gutterBottom variant="h3">
                Oops - we could not find what you are looking for
            </Typography>
            <Button fullWidth component={Link} to='/dashboard'>
                Go back to dashboard
            </Button>
        </Container>
    )
}
