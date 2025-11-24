import { useState, useEffect } from "react";
import Header from "../Components/header";

import AvailableCourses from "../Components/ui/AvailableCourses.jsx";
import RegisteredCourses from "../Components/ui/RegisteredCourses.jsx";
import { getAvailableCourses, getRegisteredCourses, enrollCourse, cancelEnrollCourse } from "../Utils/courseRequest.js";

// Mock data for fallback
const MOCK_AVAILABLE = [
  { id: "C02003", name: "Cấu trúc dữ liệu và giải thuật", faculty: "Khoa Khoa học và Kỹ thuật Máy tính" },
  { id: "M11005", name: "Giải tích 2", faculty: "Khoa Khoa Học Ứng Dụng" },
  { id: "C01007", name: "Cấu trúc rời rạc", faculty: "Khoa Khoa học và Kỹ thuật Máy tính" },
];

const MOCK_REGISTERED = [
  {
    id: "C002011",
    name: "Mô hình hóa toán học",
    faculty: "Khoa Khoa học và Kỹ thuật Máy tính",
    content: "Giới thiệu các mô hình toán học cơ bản ứng dụng trong kỹ thuật và khoa học máy tính.",
    reference: "Nguyễn Văn A - Giáo trình Mô hình toán học, NXB Khoa học Tự nhiên, 2020.",
  },
];

export default function Student_CourseRegistration() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [registered, setRegistered] = useState([]);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching courses from backend...');
      
      const [availData, registeredData] = await Promise.all([
        getAvailableCourses(),
        getRegisteredCourses()
      ]);
      
      console.log('Available courses:', availData);
      console.log('Registered courses:', registeredData);
      
      // Use API data directly; empty array is valid (user enrolled all or has no registrations)
      setAvailable(availData || []);
      setRegistered(registeredData || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      // Only use mock data if API fails completely
      setAvailable(MOCK_AVAILABLE);
      setRegistered(MOCK_REGISTERED);
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async (course) => {
    try {
      await enrollCourse(course.id);
      // Only update UI after API succeeds
      setRegistered([...registered, course]);
      setAvailable(available.filter((c) => c.id !== course.id));
    } catch (err) {
      console.error("Error registering course:", err);
      setError(`Đăng ký môn ${course.name} thất bại. Vui lòng thử lại.`);
    }
  };

  const handleCancel = async (course) => {
    try {
      await cancelEnrollCourse(course.id);
      // Only update UI after API succeeds
      setAvailable([...available, course]);
      setRegistered(registered.filter((c) => c.id !== course.id));
    } catch (err) {
      console.error("Error canceling enrollment:", err);
      setError(`Hủy đăng ký môn ${course.name} thất bại. Vui lòng thử lại.`);
    }
  };

  const toggleDetail = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex justify-center items-center h-96">
          <p className="text-lg text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <h1 className="text-3xl font-bold text-center mt-8 mb-3 text-gray-900">
        Đăng ký môn học
      </h1>
      <p className="text-center text-sm text-gray-500 mb-6">Tìm kiếm và lựa chọn các môn học bạn cần hỗ trợ trong học kỳ này</p>
      
      {error && (
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}
      {/* Search */}
      <div className="flex justify-center mb-12">
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Tìm kiếm môn học"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-6 py-3 text-gray-700 focus:ring-2 focus:ring-black focus:outline-none"
          />
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-2 gap-10 px-16 pb-16">
        <AvailableCourses
          available={available}
          search={search}
          handleRegister={handleRegister}
        />

        <RegisteredCourses
          registered={registered}
          expandedId={expandedId}
          toggleDetail={toggleDetail}
          handleCancel={handleCancel}
        />
      </div>
    </div>
  );
}
