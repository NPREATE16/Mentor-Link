import { getTutorsByCourse } from '../../Utils/tutors'
import TutorDetail from './TutorDetail'

export default function AutoResult({ course, setMode }) {
  const tutors = getTutorsByCourse(course.id) || [];
  const [tutor] = tutors.length ? [tutors[Math.floor(Math.random() * tutors.length)]] : [null];

  if (!tutor) {
    return <div className="auto-result empty">Không có tutor phù hợp.</div>
  }

  return (
    <div className="auto-result">
      <h2 className="text-center text-2xl font-bold mb-4">Kết quả ghép tự động</h2>
      <TutorDetail
        tutor={tutor}
        onBack={() => setMode(null)}
        onConfirm={(tutor, schedule) => {
          alert(`Bạn đã chọn: ${tutor.name} — ${schedule.label} (${schedule.day} ${schedule.start}-${schedule.end})`)
          setMode(null)
        }}
      />
    </div>
  )
}
