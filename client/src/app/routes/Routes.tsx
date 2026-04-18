import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "../layout/App";
import LoginForm from "../../features/account/LoginForm";
import RegisterForm from "../../features/account/RegisterForm";
import RequireAuth from "./RequireAuth";
import DashboardPage from "../../features/dashboard/DashboardPage";
import BoardPage from "../../features/board/BoardPage";
import ServerError from "../errors/ServerError";
import NotFound from "../errors/NotFound";
import HomePage from "../../features/home/HomePage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <RequireAuth />, children: [
                    { path: 'dashboard', element: <DashboardPage /> },
                    { path: 'board/:boardId', element: <BoardPage /> },
                ]
            },
            { path: '', element: <HomePage /> },
            { path: 'login', element: <LoginForm /> },
            { path: 'register', element: <RegisterForm /> },
            { path: 'server-error', element: <ServerError /> },
            { path: 'not-found', element: <NotFound /> },
            { path: '*', element: <Navigate replace to='/not-found' /> }
        ]
    }
]);
