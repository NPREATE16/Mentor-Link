import { useState } from "react";
import useAuth from "../ContextAPI/UseAuth"; 

export default function GreetingSection() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section className="py-8 border-b border-gray-200">
      <div className="flex justify-between items-start gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Xin chào,
            {user && user.name && (
              <strong className="ml-2">{user.name}</strong>
            )}
          </h1>
          <p className="text-gray-600">Lựa chọn các chức năng bạn muốn sử dụng</p>
        </div>

        {/* Search Bar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <label htmlFor="main-search" className="sr-only">
              Tìm kiếm
            </label>
            <input
              id="main-search"
              type="text"
              placeholder="Tìm kiếm"
              // SỬA w-48 THÀNH w-64 Ở ĐÂY
              className="border border-gray-300 rounded px-4 py-2 w-64 focus:outline-none focus:border-black"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <img
              src="/find.svg"
              alt="search"
              width="18"
              height="18"
              className="absolute right-3 top-2.5"
            />
          </div>
        </div>
      </div>
    </section>
  );
}