import HomePage from "./Page/HomePage"
import SignIn from "./Page/SignIn"
import SignUp from "./Page/SignUp"
import ProfilePage from "./Page/ProfilePage"
import Student_CourseRegistration from "./Page/Student_CourseRegistration"
import AuthProvider from "./ContextAPI/AuthProvider"
// 1. Import ProtectedRoute
import ProtectedRoute from "./ContextAPI/ProtectedRoute"
import TutorSchedule from "./Page/TutorSchedule"
import MyCourses from "./Page/MyCourses"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Find_Tutor from "./Page/Find_turtor"

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Các Route công khai */}
          <Route path="/" element={<SignIn />} />
          <Route path="/SignInPage" element={<SignIn />} />
          <Route path="/SignUpPage" element={<SignUp />} />

          {/* Các Route được bảo vệ */}
          <Route 
            path="/HomePage" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/MyCourses" 
            element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
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
          
          {/* --- ĐÃ SỬA ĐOẠN NÀY --- */}
          <Route  
            path="/TutorSchedule" 
            element={
              <ProtectedRoute>
                <TutorSchedule />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/Find_Tutor" 
            element={
              <ProtectedRoute>
                <Find_Tutor />
              </ProtectedRoute>
            }
          />

        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
