import { Navigate } from "react-router-dom";
import { type ReactNode } from "react"

interface Props{
    children: ReactNode
}

export default function PrivateRoute({ children }: Props){
    const token=  sessionStorage.getItem('token');
    if (!token){
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>
}