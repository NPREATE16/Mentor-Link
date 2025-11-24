// Mock tutor data and helper to fetch tutors by course id.
const TUTORS = [
  { id: 't1', name: 'Nguyễn Văn A', gpa: 3.8, exp: 2, desc: 'Tutor chuyên về Toán cao cấp.', star: 4.8, reviews: 24, courses: ['CO2011', 'CO2007'] },
  { id: 't2', name: 'Trần Thị B', gpa: 3.6, exp: 3, desc: 'Giảng dạy Lập trình và cấu trúc dữ liệu.', star: 4.6, reviews: 18, courses: ['CO2007', 'MT1007'] },
  { id: 't3', name: 'Lê Văn C', gpa: 3.9, exp: 5, desc: 'Kinh nghiệm hướng dẫn đồ án và luận văn.', star: 4.9, reviews: 45, courses: ['CO2011'] },
  { id: 't4', name: 'Phạm Thị D', gpa: 3.7, exp: 1, desc: 'Tutor nhiệt tình, chuyên lập trình frontend.', star: 4.5, reviews: 9, courses: ['MT1007'] },
];

export function getTutorsByCourse(courseId) {
  if (!courseId) return [];
  const cid = String(courseId).toUpperCase();
  return TUTORS.filter(t => Array.isArray(t.courses) && t.courses.map(c=>c.toUpperCase()).includes(cid));
}

export default TUTORS;
