import { useState } from "react";
import Header from "../Components/header";

import AvailableCourses from "../Components/ui/AvailableCourses.jsx";
import RegisteredCourses from "../Components/ui/RegisteredCourses.jsx";

export default function Student_CourseRegistration() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [registered, setRegistered] = useState([
    {
      id: "C002011",
      name: "Mô hình hóa toán học",
      faculty: "Khoa Khoa học và Kỹ thuật Máy tính",
      content:
        "Giới thiệu các mô hình toán học cơ bản ứng dụng trong kỹ thuật và khoa học máy tính.",
      reference:
        "Nguyễn Văn A - Giáo trình Mô hình toán học, NXB Khoa học Tự nhiên, 2020.",
    },
    {
      id: "C007007",
      name: "Kiến trúc máy tính",
      faculty: "Khoa Khoa học và Kỹ thuật Máy tính",
      content:
        "Nghiên cứu cấu trúc và hoạt động của CPU, bộ nhớ, và các thành phần chính trong máy tính.",
      reference:
        "David Patterson & John Hennessy - Computer Organization and Design, Morgan Kaufmann, 2017.",
    },
    {
      id: "M11007",
      name: "Đại số tuyến tính",
      faculty: "Khoa Khoa học Ứng Dụng",
      content:
        "Khái niệm ma trận, vector, không gian vector và ứng dụng trong giải hệ phương trình tuyến tính.",
      reference: "Ngô Bảo Châu - Đại số tuyến tính cơ bản, NXB Giáo dục, 2015.",
    },
  ]);

  const [available, setAvailable] = useState([
    { id: "C02003", name: "Cấu trúc dữ liệu và giải thuật", faculty: "Khoa Khoa học và Kỹ thuật Máy tính" },
    { id: "M11005", name: "Giải tích 2", faculty: "Khoa Khoa Học Ứng Dụng" },
    { id: "C01007", name: "Cấu trúc rời rạc", faculty: "Khoa Khoa học và Kỹ thuật Máy tính" },
  ]);

  const handleRegister = (course) => {
    setRegistered([...registered, course]);
    setAvailable(available.filter((c) => c.id !== course.id));
  };

  const handleCancel = (course) => {
    setAvailable([...available, course]);
    setRegistered(registered.filter((c) => c.id !== course.id));
  };

  const toggleDetail = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <h1 className="text-3xl font-bold text-center mt-8 mb-3 text-gray-900">
        Đăng ký môn học
      </h1>

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
