// src/Components/RegisteredCourses.jsx
import { useNavigate } from 'react-router-dom';

export default function RegisteredCourses({
  registered,
  expandedId,
  toggleDetail,
  handleCancel,
}) {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <h2 className="text-3xl font-bold text-center mt-8 mb-3 text-gray-900">
        Môn học đã đăng ký
      </h2>

      <div className="flex flex-col gap-5">
        {registered.map((course) => (
          <div
            key={course.id}
            className="border border-gray-200 rounded-2xl p-5"
          >
            <div className="inline-block bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">
              {course.id}
            </div>

            <p className="text-gray-900 font-bold">{course.name}</p>
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

              <button 
                onClick={() => navigate('/Find_Tutor', { state: { courseId: course.id, courseName: course.name } })}
                className="border border-green-500 text-green-700 bg-green-100 px-5 py-2 rounded-full font-medium hover:bg-green-200 transition"
              >
                Tìm Tutor
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
