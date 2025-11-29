import { graphQLRequest } from './request';


// Mock tutor data and helper to fetch tutors by course id.
const TUTORS = [
  {
    id: 't1',
    name: 'Nguyễn Văn A',
    gpa: 3.8,
    exp: 2,
    desc: 'Tutor chuyên về Toán cao cấp.',
    star: 4.8,
    reviews: 24,
    courses: ['CO2011', 'CO2007'],
      schedules: [
        { id: 't1s1', label: 'Lịch 1', day: 'Thứ 2, Thứ 4, Thứ 6', start: '19:00', end: '22:00' },
        { id: 't1s2', label: 'Lịch 2', day: 'Thứ 3, Thứ 5', start: '15:00', end: '17:00' }
      ],
  },
  {
    id: 't2',
    name: 'Trần Thị B',
    gpa: 3.6,
    exp: 3,
    desc: 'Giảng dạy Lập trình và cấu trúc dữ liệu.',
    star: 4.6,
    reviews: 18,
    courses: ['CO2007', 'MT1007'],
      schedules: [
        { id: 't2s1', label: 'Lịch 1', day: 'Thứ 2, Thứ 4, Thứ 6', start: '19:00', end: '22:00' },
        { id: 't2s2', label: 'Lịch 2', day: 'Thứ 3, Thứ 5', start: '18:00', end: '20:00' }
      ],
  },
  {
    id: 't3',
    name: 'Lê Văn C',
    gpa: 3.9,
    exp: 5,
    desc: 'Kinh nghiệm hướng dẫn đồ án và luận văn.',
    star: 4.9,
    reviews: 45,
    courses: ['CO2011'],
      schedules: [
        { id: 't3s1', label: 'Lịch 1', day: 'Thứ 2, Thứ 4, Thứ 6', start: '19:00', end: '22:00' },
        { id: 't3s2', label: 'Lịch 2', day: 'Thứ 7', start: '09:00', end: '12:00' }
      ],
  },
  {
    id: 't4',
    name: 'Phạm Thị D',
    gpa: 3.7,
    exp: 1,
    desc: 'Tutor nhiệt tình, chuyên lập trình frontend.',
    star: 4.5,
    reviews: 9,
    courses: ['MT1007'],
      schedules: [
        { id: 't4s1', label: 'Lịch 1', day: 'Thứ 2, Thứ 4, Thứ 6', start: '15:00', end: '18:00' },
        { id: 't4s2', label: 'Lịch 2', day: 'Chủ nhật', start: '14:00', end: '17:00' }
      ],
  },
];

export function getTutorsByCourse(courseId) {
  if (!courseId) return [];
  const cid = String(courseId).toUpperCase();
  return TUTORS.filter(t => Array.isArray(t.courses) && t.courses.map(c => c.toUpperCase()).includes(cid));
}



export async function openClass({ start, end, day, method }) {
  const query = `
    mutation OpenClass($start: String!, $end: String!, $day: String!, $method: String!) {
      openClass(start: $start, end: $end, day: $day, method: $method) {
        id
        tutorId
        start
        end
        day
        method
      }
    }
  `;

  const data = await graphQLRequest({
    query,
    variables: {
      start: start,
      end: end,
      day: day,
      method: method,
    }
  })

  return data.data?.openClass;
}

export async function updateClass({ classId, start, end, day, method }) {
  const query = `
    mutation UpdateClass($classId: ID!, $start: String, $end: String, $day: String, $method: String) {
      updateClass(classId: $classId, start: $start, end: $end, day: $day, method: $method) {
        id
        tutorId
        start
        end
        day
        method
      }
    }
  `;
  const data = await graphQLRequest({
    query,
    variables: {
      classId: classId,
      start: start,
      end: end,
      day: day,
      method: method,
    }
  })
  return data.data?.updateClass;
}

export async function deleteClass({ classId }) {
  const query = `
    mutation DeleteClass($classId: ID!) {
      deleteClass(classId: $classId)
    }
  `;
  const data = await graphQLRequest({
    query,
    variables: {
      classId: classId,
    }
  })
  return data.data?.deleteClass === true;
}

export async function getMyClasses() {
  const query = `
    query GetClassesByTutorID {
      getClassesByTutorID {
        id
        tutorId
        start
        end
        day
        method
      }
    }
  `;
  const data = await graphQLRequest({ 
    query
  })
  return data.data?.getClassesByTutorID || [];
}

export async function deleteTutorCourseRegistration(courseId) {
  const query = `
    mutation DeleteTutorCourseRegistration($courseId: String!) {
      deleteTutorCourseRegistration(courseId: $courseId)
    }
  `;
  const data = await graphQLRequest({
    query,
    variables: {
      courseId: courseId,
    }
  })
  return data.data?.deleteTutorCourseRegistration === true;
}

export async function deleteMultipleTutorCourseRegistrations(courseIds) {
  const query = `
    mutation DeleteMultipleTutorCourseRegistrations($courseIds: [String!]!) {
      deleteMultipleTutorCourseRegistrations(courseIds: $courseIds)
    }
  `;
  const data = await graphQLRequest({
    query,
    variables: {
      courseIds: courseIds,
    }
  })
  return data.data?.deleteMultipleTutorCourseRegistrations === true;
}

// export default TUTORS;

