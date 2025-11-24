import { getTutorsByCourse } from '../../Utils/tutors'

export default function ManualTutorList({ course, onShowDetail, onConfirm }) {
  const tutors = getTutorsByCourse(course.id);

  if (!tutors || tutors.length === 0) {
    return <div className="text-gray-500">Không tìm thấy tutor cho môn này.</div>
  }

  return (
    <div className="manual-tutor-list">
      <h2 className="text-center text-2xl font-bold mb-4">Danh sách giáo viên</h2>

      <div className="space-y-4">
        {tutors.map(t => (
          <div key={t.id} className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-2">
              <div className="font-bold text-base">{t.name}</div>
              <div className="text-sm text-gray-700 font-semibold">GPA: {t.gpa} &nbsp; Kinh nghiệm: {t.exp} năm</div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{t.desc}</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-1.5 rounded-full bg-yellow-200 text-yellow-800 text-sm font-medium" onClick={() => onShowDetail && onShowDetail(t)}>Chi tiết</button>
              <button className="px-4 py-1.5 rounded-full bg-green-200 text-green-800 text-sm font-medium" onClick={() => onConfirm && onConfirm(t)}>Đồng ý</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
