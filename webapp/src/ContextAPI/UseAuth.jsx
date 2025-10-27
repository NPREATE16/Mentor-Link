import { useContext } from 'react';
import AuthContext from './AuthContext'; 

export default function useAuth() {
    const context = useContext(AuthContext);

    // Thêm phần kiểm tra lỗi này
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
}