export default function TutorDetail({ tutor, onBack, onConfirm, onCancel }) {
  if (!tutor) return null;

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="text-center text-500 mb-4 font-bold">Hồ sơ chi tiết</div>
      
      <div className="flex gap-6 mb-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
              <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-3xl font-bold mb-3">{tutor.name}</h3>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400 text-xl">⭐</span> 
            <strong className="text-lg">{tutor.star}</strong> 
            <span className="text-gray-400 text-sm">({tutor.reviews} đánh giá)</span>
          </div>
          <div className="flex items-center gap-12 text-base">
            <div><strong>GPA:</strong> {tutor.gpa}</div>
            <div><strong>Kinh nghiệm:</strong> {tutor.exp} năm</div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-lg mb-3">Giới thiệu</h4>
        <p className="text-sm text-gray-600">{tutor.desc}</p>
      </div>

      <div className="mt-6">
        <h4 className="font-bold text-lg mb-3">Lịch rảnh</h4>
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex items-center gap-3"><span className="text-lg">📅</span> Thứ 2, thứ 4, thứ 6</div>
          <div className="flex items-center gap-3"><span className="text-lg">⏰</span> 19:00 - 22:00</div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        {onBack && <button className="px-5 py-2 rounded-full bg-red-200 text-red-700 font-medium text-sm" onClick={onBack}>Chọn lại</button>}
        {onConfirm && <button className="px-5 py-2 rounded-full bg-green-200 text-green-700 font-medium text-sm" onClick={() => onConfirm(tutor)}>Đồng ý</button>}
      </div>
    </div>
  )
}
