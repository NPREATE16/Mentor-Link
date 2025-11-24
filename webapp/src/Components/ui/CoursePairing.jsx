export default function CoursePairing({ selectedCourse, setSelectedCourse, setMode, searchQuery = "" }) {
  const courses = [
    { id: "CO2011", name: "Mô hình hóa toán học", dept: "Khoa KH&KT Máy tính" },
    { id: "CO2007", name: "Kiến trúc máy tính", dept: "Khoa KH&KT Máy tính" },
    { id: "MT1007", name: "Đại số tuyến tính", dept: "Khoa KH ứng dụng" }
  ];

  const filteredCourses = courses.filter(course => 
    course.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="course-pairing">
      <h2 className="text-center text-2xl font-bold mb-4">Chọn môn học đã đăng ký</h2>

      <div className="space-y-6">
        {filteredCourses.map(course => (
          <div 
            key={course.id} 
            className={`border rounded-xl p-5 bg-gray-50 hover:shadow-md transition cursor-pointer ${selectedCourse?.id === course.id ? 'ring-2 ring-gray-300 bg-white' : ''}`}
            onClick={() => setSelectedCourse(course)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-block bg-black text-white text-xs px-2 py-1 rounded-full">{course.id}</div>
                <div className="text-lg font-semibold mt-2">{course.name}</div>
                <div className="text-sm text-gray-500">{course.dept}</div>
              </div>
            </div>
            {selectedCourse?.id === course.id && (
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-4 py-1.5 rounded-full bg-green-200 text-green-800 text-sm font-medium" onClick={() => setMode("manual")}>Thủ công</button>
                <button className="px-4 py-1.5 rounded-full bg-yellow-200 text-yellow-800 text-sm font-medium" onClick={() => setMode("auto")}>Tự động</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
