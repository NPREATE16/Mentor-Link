import { useState } from 'react'

export default function TutorDetail({ tutor, onBack, onConfirm }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!tutor) return null;

  const schedules = Array.isArray(tutor.schedules) && tutor.schedules.length >= 1
    ? tutor.schedules.slice(0, 2)
    : [
      { id: 's1', label: 'Lịch A', day: 'Thứ 2, Thứ 4, Thứ 6', start: '19:00', end: '22:00' },
      { id: 's2', label: 'Lịch B', day: 'Thứ 3, Thứ 5', start: '18:00', end: '20:00' }
    ];

  

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
        <h4 className="font-bold text-lg mb-3">Lịch rảnh (Chọn một)</h4>
        {/* use provided schedules or default to two sample options */}
        {/** schedules is array of { id, label, day, start, end } */}
        <ScheduleSelector schedules={schedules} selectedIndex={selectedIndex} onSelect={(idx) => setSelectedIndex(idx)} />
      </div>

      <div className="flex justify-end gap-3 mt-8">
        {onBack && <button className="px-5 py-2 rounded-full bg-red-200 text-red-700 font-medium text-sm" onClick={onBack}>Chọn lại</button>}
        {onConfirm && <button className="px-5 py-2 rounded-full bg-green-200 text-green-700 font-medium text-sm" onClick={() => onConfirm(tutor, schedules[selectedIndex])}>Đồng ý</button>}
      </div>
    </div>
  )
}


function ScheduleSelector({ schedules, selectedIndex, onSelect }) {
  const handleClick = (idx) => {
    onSelect(idx);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {schedules.map((s, idx) => (
        <button
          key={s.id || idx}
          type="button"
          onClick={() => handleClick(idx)}
          className={`w-full text-left p-3 border rounded-lg transition-shadow ${selectedIndex === idx ? 'border-green-400 shadow-md bg-green-50' : 'border-gray-200 hover:shadow-sm'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{s.label || `Lịch ${idx + 1}`}</div>
              <div className="text-sm text-gray-600 mt-1">{s.day}</div>
            </div>
            <div className="text-sm text-gray-700">{s.start} - {s.end}</div>
          </div>
        </button>
      ))}
    </div>
  )
}
