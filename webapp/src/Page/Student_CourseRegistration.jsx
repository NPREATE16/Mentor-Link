import React from "react"
import AvailableCourses from "../Components/ui/AvailableCourses"
import Header from "../Components/header.jsx" 

export default function Student_CourseRegistration() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto py-8 px-6">
        <h1 className="text-3xl font-bold text-center mb-6">Đăng ký môn học</h1>

        {/* Ô tìm kiếm */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            placeholder="Tìm kiếm môn học"
            className="w-full max-w-xl px-4 py-2 border border-gray-300 bg-[#f2f2f2] rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-300"            
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AvailableCourses />
        </div>
      </div>
    </div>
  )
}
