import { Navigate } from "react-router-dom";
import useAuth from "./UseAuth"; // Import hook useAuth

export default function ProtectedRoute({ children }) {

    const { user, isLoading } = useAuth(); // Dùng hook useAuth

    if (isLoading) return null;

    if (!user) {
        return <Navigate to='/SignInPage' replace />;
    }

    if (!localStorage.getItem(`token`)) {
        return <Navigate to='/SignInPage' replace />;
    }

    return children;
}