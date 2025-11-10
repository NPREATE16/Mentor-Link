import React from "react";
import { enrollCourse, getCourse } from "../../Utils/courseUtil";

  // const res = await enrollCourse(courseid);  ///đăng kí kháo học courseid lấy từ các course
  // const data = await getCourse();     //// lấy dũ liệu các khóa học 


export default function AvailableCourses() {
  const courses = [
    { code: "CO2003", name: "Cấu trúc dữ liệu và giải thuật", faculty: "Khoa Khoa học và Kỹ thuật Máy tính" },
    { code: "MT1005", name: "Giải tích 2", faculty: "Khoa Khoa Học Ứng Dụng" },
    { code: "CO1007", name: "Cấu trúc rời rạc", faculty: "Khoa Khoa học và Kỹ thuật Máy tính" },
  ];

  return (
    <div className="w-full bg-white rounded-2xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Các môn học khả dụng</h2>

      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.code}
            className="flex justify-between items-center p-4 bg-white rounded-xl shadow border border-gray-200 hover:shadow-lg transition"
          >
            <div>
              <span className="text-xs font-semibold bg-gray-200 px-2 py-1 rounded">
                {course.code}
              </span>
              <h3 className="text-lg font-semibold mt-1">{course.name}</h3>
              <p className="text-sm text-gray-500">{course.faculty}</p>
            </div>

            <button
              className="px-4 py-2 bg-green-200 text-green-700 rounded-xl font-medium hover:bg-green-300 transition"
              onClick={() => alert(`Đã đăng ký môn: ${course.name}`)}
            >
              Đăng ký
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
