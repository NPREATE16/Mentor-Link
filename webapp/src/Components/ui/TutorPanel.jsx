import ManualTutorList from "./ManualTutorList";
import AutoResult from "./AutoResult";
import TutorDetail from "./TutorDetail";
import { useState } from 'react'

export default function TutorPanel({ selectedCourse, mode, setMode }) {
  const [selectedTutor, setSelectedTutor] = useState(null);

  if (!selectedCourse) return <div className="tutor-panel empty">Chọn môn để xem tutor</div>;

  // manual: show list; clicking detail sets selectedTutor
  if (mode === 'manual') {
    if (selectedTutor) {
      return (
        <div className="tutor-panel">
          <TutorDetail tutor={selectedTutor} onBack={() => setSelectedTutor(null)} onConfirm={() => {/* confirm action */}} />
        </div>
      )
    }

    return (
      <div className="tutor-panel">
        <ManualTutorList course={selectedCourse} onShowDetail={(t) => setSelectedTutor(t)} onConfirm={() => {/* confirm action */}} />
      </div>
    )
  }

  if (mode === 'auto') {
    return (
      <div className="tutor-panel">
        <AutoResult course={selectedCourse} setMode={setMode} />
      </div>
    )
  }

  return <div className="tutor-panel empty">Chọn chế độ Thủ công hoặc Tự động</div>;
}
