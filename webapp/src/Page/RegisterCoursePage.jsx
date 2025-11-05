import { useState } from "react";
import Header from "../Components/header"
export default function RegisterCoursePage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [registered, setRegistered] = useState([
    {
      id: "C002011",
      name: "Mô hình hóa toán học",
      faculty: "Khoa Khoa học và Kỹ thuật Máy tính",
      content: "Giới thiệu các mô hình toán học cơ bản ứng dụng trong kỹ thuật và khoa học máy tính.",
      reference: "Nguyễn Văn A - Giáo trình Mô hình toán học, NXB Khoa học Tự nhiên, 2020.",
    },
    {
      id: "C007007",
      name: "Kiến trúc máy tính",
      faculty: "Khoa Khoa học và Kỹ thuật Máy tính",
      content: "Nghiên cứu cấu trúc và hoạt động của CPU, bộ nhớ, và các thành phần chính trong máy tính.",
      reference: "David Patterson & John Hennessy - Computer Organization and Design, Morgan Kaufmann, 2017.",
    },
    {
      id: "M11007",
      name: "Đại số tuyến tính",
      faculty: "Khoa Khoa học Ứng Dụng",
      content: "Khái niệm ma trận, vector, không gian vector và ứng dụng trong giải hệ phương trình tuyến tính.",
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

      {/* Left Column */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-3xl font-bold text-center mt-8 mb-3 text-gray-900">Các môn học khả dụng</h2>
        <div className="flex flex-col gap-5">
          {available
            .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
            .map((course) => (
              <div key={course.id} className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-2">
			<div className="w-fit bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">
			{course.id}
			</div>
			<p className="text-gray-900 font-semibold tracking-tight">{course.name}</p>
			<p className="text-sm text-gray-500">{course.faculty}</p>
				<div className="flex justify-end mt-2">
					<button onClick={() => handleRegister(course)}
					className="bg-green-200 text-black font-bold px-10 py-1.5 text-sm rounded-full border border-green-400"
					>
						Đăng ký
					</button>
				</div>
			</div>
            ))}
        </div>
      </div>

      {/* Right Column */}
      <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
        <h2 className="text-3xl font-bold text-center mt-8 mb-3 text-gray-900">Môn học đã đăng ký</h2>
        <div className="flex flex-col gap-5">

          {registered.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-2xl p-5">
              <div className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">
  				{course.id}</div>
              <p className="text-gray-900 font-medium">{course.name}</p>
              <p className="text-sm text-gray-500 mb-4">{course.faculty}</p>

              {expandedId === course.id && (
                <div className="bg-white-50 p-4 rounded-2xl text-sm text-gray-700 space-y-3 mb-4">
                  <div>
                    <p className="font-bold">Nội dung môn học:</p>
                    <p>{course.content}</p>
                  </div>
                  <div>
                    <p className="font-bold">Tài liệu tham khảo:</p>
                    <p>{course.reference}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-2 gap-3">
                <button
                  onClick={() => toggleDetail(course.id)}
                  className="border border-yellow-500 text-yellow-700 bg-yellow-100 px-5 py-2 rounded-full font-medium hover:bg-yellow-100 transition"
                >
                  {expandedId === course.id ? "Thu gọn" : "Chi tiết"}
                </button>
                <button
                  onClick={() => handleCancel(course)}
                  className="border border-red-500 text-red-700 bg-red-100 px-5 py-2 rounded-full font-medium hover:bg-red-100 transition"
                >
                  Hủy
                </button>
                <button className="border border-green-500 text-green-700 bg-green-100 px-5 py-2 rounded-full font-medium hover:bg-green-100 transition">
                  Tìm Tutor
                </button>
              </div>
            </div>
          ))}

        </div>
      </div>

    </div>
  </div>
 );
}
