// src/Components/AvailableCourses.jsx
export default function AvailableCourses({ available = [], search = '', handleRegister }) {
  const normalize = (s) =>
    String(s || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();

  const q = normalize(search);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <h2 className="text-3xl font-bold text-center mt-8 mb-3 text-gray-900">
        Các môn học khả dụng
      </h2>

      <div className="flex flex-col gap-5">
        {available
          .filter((c) => {
            if (!q) return true;
            const name = normalize(c.name);
            const faculty = normalize(c.faculty);
            return name.includes(q) || faculty.includes(q) || String(c.id || '').toLowerCase().includes(q);
          })
          .map((course) => (
            <div
              key={course.id}
              className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-2"
            >
              <div className="w-fit bg-black text-white text-xs font-semibold px-3 py-1 rounded-full mb-1">
                {course.id}
              </div>

              <p className="text-gray-900 font-bold tracking-tight">{course.name}</p>
              <p className="text-sm text-gray-500">{course.faculty}</p>

              <div className="flex justify-end mt-2">
                <button
                  onClick={() => handleRegister(course)}
                  className="bg-green-200 text-black font-bold px-10 py-1.5 text-sm rounded-full border border-green-400"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
