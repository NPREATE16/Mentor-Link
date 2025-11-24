import HomePage from "./Page/HomePage"
import SignIn from "./Page/SignIn"
import SignUp from "./Page/SignUp"
import ProfilePage from "./Page/ProfilePage"
import Student_CourseRegistration from "./Page/Student_CourseRegistration"
import AuthProvider from "./ContextAPI/AuthProvider"
// 1. Import ProtectedRoute
import ProtectedRoute from "./ContextAPI/ProtectedRoute"
import TutorSchedule from "./Page/TutorSchedule"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Các Route công khai */}

          <Route path="/" element={<SignIn />} />
          <Route path="/SignInPage" element={<SignIn />} />
          <Route path="/SignUpPage" element={<SignUp />} />

          {/* Các Route được bảo vệ
            Bọc các trang cần đăng nhập bằng ProtectedRoute 
          */}
          <Route 
            path="/HomePage" 
            element={
              
                <HomePage />
              
            } 
          />
          <Route 
            path="/ProfilePage" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/CourseRegistration" 
            element={
            <ProtectedRoute>
            <Student_CourseRegistration />
            </ProtectedRoute>
            }
          />
          <Route 
            path="/TutorSchedule" 
            element={
            <ProtectedRoute>
            <TutorSchedule />
            </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App