import { useState } from "react";
import CoursePairing from "../Components/ui/CoursePairing";
import TutorPanel from "../Components/ui/TutorPanel";
import Header from "../Components/header";
export default function FindTutorPage() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [mode, setMode] = useState(null); 
  const [search, setSearch] = useState("");
  // mode = "manual" | "auto" | null

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-2">Tìm & Ghép cặp Tutor</h1>
        <p className="text-center text-sm text-gray-500 mb-6">Chọn Tutor thủ công hoặc để hệ thống tự động ghép cặp cho các môn đã đăng ký.</p>

        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
             <input
            type="text"
            placeholder="Tìm kiếm môn học"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded-full px-6 py-3 text-gray-700 focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <CoursePairing 
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              setMode={setMode}
              searchQuery={search}
            />
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <TutorPanel 
              selectedCourse={selectedCourse} 
              mode={mode}
              setMode={setMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
