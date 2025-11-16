import FeatureCard from "./feature-card.jsx"
import { Link } from "react-router-dom" 
const features = [
  {
    id: 1,
    icon: "/note.svg", 
    title: "Đăng ký môn học",
    description: "Tìm và đăng ký các môn học",
    link: "/CourseRegistration"
  },
  {
    id: 2,
    icon: "/find.svg", 
    title: "Tìm & Ghép cặp Tutor",
    description: "Chọn Tutor thủ công hoặc tự động",
  },
  {
    id: 3,
    icon: "/calendar.svg", 
    title: "Quản lý lịch",
    description: "Đặt lịch cố định với Tutor, hoặc thay đổi,hủy lịch khi cần thiết",
  },
  {
    id: 4,
    icon: "/document.svg",
    title: "Tài liệu và buổi học",
    description: "Truy cập, tải tài liệu học tập và ghi chú từ các buổi học",
  },
  {
    id: 5,
    icon: "/star.svg", 
    title: "Đánh giá và phản hồi",
    description: "Đánh giá và cung cấp phản hồi cho Tutor sau khi hoàn thành buổi học",
  },
  {
    id: 6,
    icon: "/graduate.svg", 
    title: "Chương trình khác",
    description: "Khám phá thêm các chương trình khác để nâng cao kỹ năng của bạn",
  },
]

export default function FeatureGrid() {
  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          feature.link ? (
            // ✅ Card có link → bọc bằng Link
            <Link 
              to={feature.link} 
              key={feature.id} 
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <FeatureCard {...feature} />
            </Link>
          ) : (
            // ✅ Card không có link → giữ nguyên
            <FeatureCard key={feature.id} {...feature} />
          )
        ))}
      </div>
    </section>
  )
}