import React, { useEffect, useState } from "react";
import Header from "../Components/header";
import { openClass, updateClass, deleteClass, getMyClasses } from "../Utils/tutors";

/* -------------------------------------------------------------------------- */
/* DATA: Day / Time / Type                         */
/* -------------------------------------------------------------------------- */

const DAY_OPTIONS = [
  { id: 1, label: "2-4-6" },
  { id: 2, label: "3-5-7" },
  { id: 3, label: "7-CN" },
];

const TIME_OPTIONS = [
  "7h-9h",
  "9h-11h",
  "13h-15h",
  "15h-17h",
  "17h-19h",
  "19h-21h",
];

const TYPE_OPTIONS = ["Online", "Offline"];

/* -------------------------------------------------------------------------- */
/* POPUP COMPONENT                                 */
/* -------------------------------------------------------------------------- */

function Popup({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl w-[380px] shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-4">{title}</h2>
        {children}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                 */
/* -------------------------------------------------------------------------- */

export default function TutorSchedule() {
  const [schedules, setSchedules] = useState([]);

  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [room, setRoom] = useState(""); 

  /* POPUP STATES */
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  /* ---------------------------------------------------------------------- */
  /* LOGIC BỔ TRỢ (VALIDATION)                   */
  /* ---------------------------------------------------------------------- */

  // Hàm check trùng lịch
  const isScheduleConflict = (newDay, newTime, excludeId = null) => {
    return schedules.some((s) => {
      if (excludeId && s.id === excludeId) return false;
      return s.day === newDay && s.time === newTime;
    });
  };

  // Hàm check định dạng phòng: Chữ Hoa + Số + Gạch ngang + 3 số (VD: A4-508)
  const isValidRoomFormat = (roomStr) => {
    const regex = /^[A-Z]\d-\d{3}$/;
    return regex.test(roomStr);
  };

  /* ---------------------------------------------------------------------- */
  /* LOAD DATA                                  */
  /* ---------------------------------------------------------------------- */

  const mapClassToSchedule = (c) => {
    const toTimeLabel = (hhmm) => {
      if (!hhmm) return '';
      const [hh] = String(hhmm).split(':');
      const h = String(parseInt(hh, 10));
      return `${h}h`;
    };
    const time = `${toTimeLabel(c.start)}-${toTimeLabel(c.end)}`;
    let type = c.method || 'Online';
    let roomVal = null;
    if (typeof c.method === 'string' && c.method.toLowerCase().startsWith('offline')) {
      type = 'Offline';
      const idx = c.method.indexOf('-');
      if (idx !== -1) roomVal = c.method.slice(idx + 1);
    }
    return {
      id: c.id,
      day: c.day,
      time,
      type,
      room: roomVal,
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const list = await getMyClasses();
        const mapped = Array.isArray(list) ? list.map(mapClassToSchedule) : [];
        setSchedules(mapped);
      } catch (err) {
        console.error('load my classes failed', err);
      }
    })();
  }, []);

  const parseTimeRange = (range) => {
    if (!range) return { start: null, end: null };
    const m = range.match(/^(\d{1,2})h-(\d{1,2})h$/);
    if (!m) return { start: null, end: null };
    const s = String(m[1]).padStart(2, "0") + ":00";
    const e = String(m[2]).padStart(2, "0") + ":00";
    return { start: s, end: e };
  };

  /* ---------------------------------------------------------------------- */
  /* ĐĂNG KÝ                                   */
  /* ---------------------------------------------------------------------- */

  const openRegisterPopup = () => {
    setSelectedDay(null);
    setSelectedTime(null);
    setSelectedType(null);
    setRoom("");
    setShowRegisterPopup(true);
  };

  const handleRegister = async () => {
    if (!selectedDay || !selectedTime || !selectedType) return;

    // 1. Check định dạng phòng nếu là Offline
    if (selectedType === "Offline") {
      if (!room) {
        alert("Vui lòng nhập số phòng!");
        return;
      }
      if (!isValidRoomFormat(room)) {
        alert("Tên phòng sai định dạng! Vui lòng nhập đúng mẫu: A4-508 (Chữ in hoa + Số - 3 Chữ số)");
        return;
      }
    }

    // 2. Check trùng lịch
    if (isScheduleConflict(selectedDay, selectedTime)) {
      alert("Lịch dạy này bị trùng! Bạn đã đăng ký khung giờ này rồi.");
      return;
    }

    const newItem = {
      id: Date.now(),
      day: selectedDay,
      time: selectedTime,
      type: selectedType,
      room: selectedType === "Offline" ? room : null,
    };

    try {
      const { start, end } = parseTimeRange(selectedTime);
      const methodValue = selectedType === "Offline" && room ? `Offline-${room}` : selectedType;
      const created = await openClass({ start, end, day: selectedDay, method: methodValue });
      const mapped = { ...newItem, id: created?.id || newItem.id };
      setSchedules([...schedules, mapped]);
      setShowRegisterPopup(false);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Tạo lịch thất bại", err);
      setSchedules([...schedules, newItem]);
      setShowRegisterPopup(false);
      setShowSuccessPopup(true);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* SỬA                                     */
  /* ---------------------------------------------------------------------- */

  const openEditPopup = (item) => {
    setEditingItem(item);
    setSelectedDay(item.day);
    setSelectedTime(item.time);
    setSelectedType(item.type);
    setRoom(item.room || "");
    setShowEditPopup(true);
  };

  const handleEdit = async () => {
    // 1. Check định dạng phòng nếu là Offline
    if (selectedType === "Offline") {
      if (!room) {
        alert("Vui lòng nhập số phòng!");
        return;
      }
      if (!isValidRoomFormat(room)) {
        alert("Tên phòng sai định dạng! Vui lòng nhập đúng mẫu: A4-508");
        return;
      }
    }

    // 2. Check trùng lịch
    if (isScheduleConflict(selectedDay, selectedTime, editingItem.id)) {
      alert("Lịch dạy này bị trùng với một lịch khác đã có!");
      return;
    }

    const updated = schedules.map((s) =>
      s.id === editingItem.id
        ? {
            ...s,
            day: selectedDay,
            time: selectedTime,
            type: selectedType,
            room: selectedType === "Offline" ? room : null,
          }
        : s
    );
    setSchedules(updated);
    try {
      const { start, end } = parseTimeRange(selectedTime);
      const methodValue = selectedType === "Offline" && room ? `Offline-${room}` : selectedType;
      await updateClass({ classId: editingItem.id, start, end, day: selectedDay, method: methodValue });
    } catch (err) {
      console.error("Cập nhật thất bại", err);
    }
    setShowEditPopup(false);
  };

  /* ---------------------------------------------------------------------- */
  /* XOÁ                                     */
  /* ---------------------------------------------------------------------- */

  const openDeletePopup = (item) => {
    setDeleteItem(item);
    setShowDeletePopup(true);
  };

  const handleDelete = async () => {
    setSchedules(schedules.filter((s) => s.id !== deleteItem.id));
    try {
      await deleteClass({ classId: deleteItem.id });
    } catch (err) {
      console.error("Xóa thất bại", err);
    }
    setShowDeletePopup(false);
  };

  /* ---------------------------------------------------------------------- */
  /* RENDER                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold text-center">Thiết lập lịch dạy</h1>
        <p className="text-center text-gray-600 mt-2">
          Mở và quản lý các khung giờ bạn sẵn sàng dạy để sinh viên có thể đặt lịch.
        </p>

        {/* Search */}
        <div className="flex justify-center mt-6 mb-10">
          <input
            type="text"
            placeholder="Tìm kiếm môn học"
            className="w-full max-w-xl px-4 py-2 border border-gray-300 bg-[#f2f2f2] rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        {/* Main Box */}
        <div className="border-2 border-blue-400 rounded-2xl p-8 shadow-md">
          <h2 className="text-3xl font-bold text-center mb-8">Lịch đã đăng ký</h2>

          {/* Table Header */}
          <div className="grid grid-cols-4 text-lg font-semibold mb-4 px-4">
            <span>Ngày</span>
            <span>Giờ</span>
            <span>Hình thức</span>
            <span>Thao tác</span>
          </div>

          {/* Registered Schedules */}
          {schedules.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 items-center px-4 py-3 mb-3"
            >
              <span className="px-4 py-2 bg-gray-100 rounded-lg text-center">{item.day}</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg text-center">{item.time}</span>
              <span className="px-4 py-2 bg-gray-100 rounded-lg text-center">
                {item.type === "Offline" ? `${item.type} (${item.room})` : item.type}
              </span>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => openEditPopup(item)}
                  className="px-4 py-1 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Sửa
                </button>
                <button
                  onClick={() => openDeletePopup(item)}
                  className="px-4 py-1 bg-red-300 rounded-lg hover:bg-red-400"
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}

          {/* Register Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={openRegisterPopup}
              className="px-8 py-3 bg-white border rounded-lg text-xl font-bold shadow hover:bg-gray-100"
            >
              Đăng Ký
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* POPUP: Đăng ký lịch */}
      {/* ------------------------------------------------------------------ */}
      {showRegisterPopup && (
        <Popup title="Đăng ký lịch dạy" onClose={() => setShowRegisterPopup(false)}>
          {/* Day Options */}
          <p className="font-semibold mb-2">Chọn ngày:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.label)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedDay === d.label ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Time Options */}
          <p className="font-semibold mb-2">Chọn giờ:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedTime === t ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Type Options */}
          <p className="font-semibold mb-2">Hình thức:</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedType === type ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Room Input (Check Offline) */}
          {selectedType === "Offline" && (
            <div className="mb-4">
              <p className="font-semibold mb-1">Phòng:</p>
              <input
                type="text"
                value={room}
                // Tự động viết hoa
                onChange={(e) => setRoom(e.target.value.toUpperCase())}
                placeholder="VD: A4-508"
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">VD đúng: A4-508, B8-203</p>
            </div>
          )}

          <button
            onClick={handleRegister}
            className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Đăng ký
          </button>
        </Popup>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* POPUP: Sửa lịch */}
      {/* ------------------------------------------------------------------ */}
      {showEditPopup && (
        <Popup title="Chỉnh sửa lịch dạy" onClose={() => setShowEditPopup(false)}>
          {/* Day */}
          <p className="font-semibold mb-2">Chọn ngày:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.label)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedDay === d.label ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Time */}
          <p className="font-semibold mb-2">Chọn giờ:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {TIME_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTime(t)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedTime === t ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Type */}
          <p className="font-semibold mb-2">Hình thức:</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {TYPE_OPTIONS.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-2 rounded-lg border ${
                  selectedType === type ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Room Input (Check Offline) */}
          {selectedType === "Offline" && (
            <div className="mb-4">
              <p className="font-semibold mb-1">Phòng:</p>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value.toUpperCase())}
                placeholder="VD: A4-508"
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">VD đúng: A4-508, B8-203</p>
            </div>
          )}

          <button
            onClick={handleEdit}
            className="w-full mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
          >
            Đổi
          </button>
        </Popup>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* POPUP: Xóa / Thành công */}
      {/* ------------------------------------------------------------------ */}
      {showDeletePopup && (
        <Popup title="Xóa lịch" onClose={() => setShowDeletePopup(false)}>
          <p className="text-center mb-4">Bạn muốn xóa lịch này?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Xóa
            </button>
            <button
              onClick={() => setShowDeletePopup(false)}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              Hủy
            </button>
          </div>
        </Popup>
      )}

      {showSuccessPopup && (
        <Popup title="Thành công" onClose={() => setShowSuccessPopup(false)}>
          <p className="text-center">Cập nhật lịch thành công.</p>
        </Popup>
      )}
    </div>
  );
}
