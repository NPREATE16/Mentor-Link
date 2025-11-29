import { useEffect, useState } from 'react'
import Header from '../Components/header'
import { getRegisteredCourses } from '../Utils/courseRequest'
import { getTutorsByCourse } from '../Utils/tutors'

export default function MyCourses() {
  const [search, setSearch] = useState('')
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCourses() }, [])

  async function fetchCourses() {
    try {
      setLoading(true)
      const regs = await getRegisteredCourses()
      // Map each registered course to a matched tutor (first match for demo)
      const mapped = (regs || []).map((c) => {
        const tutors = getTutorsByCourse(c.id)
        const tutor = tutors && tutors.length ? tutors[0] : null
        // choose first schedule if present
        const schedule = tutor?.schedules?.[0] || { label: 'N/A', day: 'Chưa có', start: '', end: '' }
        return { course: c, tutor, schedule }
      })
      setCourses(mapped)
    } catch (err) {
      console.error('Failed to load registered courses', err)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = courses.filter((r) => r.course.name.toLowerCase().includes(search.toLowerCase()) || r.tutor?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-6xl mx-auto py-12 px-6">
        <h1 className="text-4xl font-black text-center mb-6">Môn học</h1>

        <div className="flex justify-center mb-10">
          <div className="relative w-2/3">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm môn học" className="w-full border border-gray-300 rounded-full px-6 py-3 text-gray-700 focus:ring-2 focus:ring-black focus:outline-none" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">Đang tải...</div>
        ) : (
          <div className="grid grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-6">
              {filtered.slice(0, Math.ceil(filtered.length / 2)).map(({ course, tutor, schedule }) => (
                <div key={course.id} className="bg-white rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-900 leading-tight">{course.name} _ <span className="font-bold">{tutor?.name || 'Chưa có tutor'}</span></h3>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M16 4v3M8 4v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M4 12h16" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">{schedule.day}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">{schedule.start}{schedule.start && schedule.end ? ' - ' : ''}{schedule.end}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] space-y-6">
              {filtered.slice(Math.ceil(filtered.length / 2)).map(({ course, tutor, schedule }) => (
                <div key={course.id} className="bg-white rounded-3xl p-6 shadow-xl">
                  <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 text-gray-900 leading-tight">{course.name} _ <span className="font-bold">{tutor?.name || 'Chưa có tutor'}</span></h3>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M16 4v3M8 4v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        <path d="M4 12h16" stroke="currentColor" strokeWidth="1" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">{schedule.day}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-700">{schedule.start}{schedule.start && schedule.end ? ' - ' : ''}{schedule.end}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
