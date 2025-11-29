// 1. Import thêm useState, useRef, useEffect từ React
import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
// 2. Import useAuth để lấy hàm signOut
import useAuth from "../ContextAPI/UseAuth"

export default function Header() {
  // 3. Lấy hàm signOut từ context
  const { signOut } = useAuth()
  
  // 4. Tạo state để quản lý menu dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  // 5. (Nâng cao) Logic để đóng dropdown khi bấm ra ngoài
  const dropdownRef = useRef(null)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    // Lắng nghe sự kiện click
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      // Dọn dẹp listener
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/HomePage" className="text-2xl font-bold hover:text-gray-300 transition">
          MentorLink
        </Link>

        {/* Nhóm Nav và Icons */}
        <div className="flex items-center gap-8">
          {/* Navigation Menu */}
          <nav className="flex items-center gap-8">
            <Link to="/HomePage" className="font-bold hover:text-gray-300 transition">
              Trang chủ
            </Link>
             <Link to="/MyCourses" className="font-bold hover:text-gray-300 transition">
              Môn học
            </Link>
            <a href="#" className="font-bold hover:text-gray-300 transition">
              Lịch học
            </a>
            <a href="#" className="font-bold hover:text-gray-300 transition">
              Tài liệu
            </a>
            <a href="#" className="font-bold hover:text-gray-300 transition">
              Đánh giá
            </a>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4">
            {/* Nút chuông (giữ nguyên) */}
            <button className="p-2 hover:bg-gray-800 rounded-full transition">
              <img
                src="/bell.svg"
                alt="notifications"
                width="20"
                height="20"
                className="filter brightness-0 invert"
              />
            </button>

            {/* 6. Bọc nút Avatar và Dropdown bằng div 'relative' */}
            <div className="relative" ref={dropdownRef}>
              {/* Nút Avatar giờ sẽ mở/đóng dropdown */}
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-2 hover:bg-gray-800 rounded-full transition"
              >
                <img
                  src="/profile_icon.svg"
                  alt="profile"
                  width="20"
                  height="20"
                  className="filter brightness-0 invert"
                />
              </button>

              {/* 7. Dropdown Menu (Chỉ hiển thị khi isDropdownOpen là true) */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                  {/* Link đến trang Profile */}
                  <Link
                    to="/ProfilePage"
                    onClick={() => setIsDropdownOpen(false)} // Đóng menu khi bấm
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Hồ sơ (Profile)
                  </Link>
                  
                  {/* Nút Đăng xuất */}
                  <button
                    onClick={signOut} // Gọi hàm signOut từ AuthContext
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div> {/* Kết thúc div 'relative' */}

          </div>
        </div>
      </div>
    </header>
  )
}