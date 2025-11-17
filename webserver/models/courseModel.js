import dbPool from '../database.js';

// Mock data for fallback
const mockCourses = [
  { id: 'C02003', name: 'Cấu trúc dữ liệu và giải thuật', faculty: 'Khoa Khoa học và Kỹ thuật Máy tính' },
  { id: 'M11005', name: 'Giải tích 2', faculty: 'Khoa Khoa Học Ứng Dụng' },
  { id: 'C01007', name: 'Cấu trúc rời rạc', faculty: 'Khoa Khoa học và Kỹ thuật Máy tính' },
  { id: 'C002011', name: 'Mô hình hóa toán học', faculty: 'Khoa Khoa học và Kỹ thuật Máy tính', content: 'Giới thiệu các mô hình toán học cơ bản ứng dụng trong kỹ thuật và khoa học máy tính.', reference: 'Nguyễn Văn A - Giáo trình Mô hình toán học, NXB Khoa học Tự nhiên, 2020.' },
];

export async function getCourse() {
    try {
        const [rows] = await dbPool.execute('SELECT Cid as id, Cname as name, Faculty as faculty FROM `Course`'); 
        return rows;
    } catch (err) {
        console.error('Error in getCourse:', err.message);
        return mockCourses.map(({ id, name, faculty }) => ({ id, name, faculty }));
    }
}

export async function getRegisteredCourses(userId) {
    try {
        const [rows] = await dbPool.execute(
            'SELECT c.Cid as id, c.Cname as name, c.Faculty as faculty FROM `CourseRegistration` cr JOIN `Course` c ON cr.CourseID = c.Cid WHERE cr.UserID = ?',
            [userId]
        );

        // The actual `Course` table in the deployment doesn't have description/reference columns.
        // Return rows with content/reference keys present but null so GraphQL type can resolve.
        return rows.map((r) => ({ ...r, content: null, reference: null }));
    } catch (err) {
        console.error('Error in getRegisteredCourses:', err.message);
        console.error('Full error:', err);
        return [mockCourses[3]]; // Return mock registered course
    }
}

export async function getAvailableCourses(userId) {
    try {
        const [rows] = await dbPool.execute(
            'SELECT c.Cid as id, c.Cname as name, c.Faculty as faculty FROM `Course` c WHERE c.Cid NOT IN (SELECT CourseID FROM `CourseRegistration` WHERE UserID = ?)',
            [userId]
        );
        return rows;
    } catch (err) {
        console.error('Error in getAvailableCourses:', err.message);
        console.error('Full error:', err);
        // Return mock available courses (all except the registered one)
        return mockCourses.slice(0, 3);
    }
}

export async function enrollCourse (userid, courseid) {
    try {
        // Ensure course exists
        const [exists] = await dbPool.execute('SELECT 1 FROM `Course` WHERE Cid = ? LIMIT 1', [courseid]);
        if (!exists || exists.length === 0) {
            const e = new Error('CourseNotFound');
            e.code = 'COURSE_NOT_FOUND';
            throw e;
        }

        // Prevent duplicate registration
        const [already] = await dbPool.execute('SELECT 1 FROM `CourseRegistration` WHERE UserID = ? AND CourseID = ? LIMIT 1', [userid, courseid]);
        if (already && already.length > 0) {
            const e = new Error('AlreadyRegistered');
            e.code = 'ALREADY_REGISTERED';
            throw e;
        }

        const [rows] = await dbPool.execute('INSERT INTO `CourseRegistration` (UserID, CourseID) VALUES (?, ?)', [userid, courseid]);
        return rows;
    } catch (err) {
        console.error('Error in enrollCourse:', err.message);
        console.error('Full error:', err);
        // Re-throw to let resolver handle friendly messages
        throw err;
    }
}

export async function courseExists(courseId) {
    try {
        const [rows] = await dbPool.execute('SELECT 1 FROM `Course` WHERE Cid = ? LIMIT 1', [courseId]);
        return !!(rows && rows.length);
    } catch (err) {
        console.error('Error checking courseExists:', err.message);
        return false;
    }
}

export async function isCourseRegistered(userId, courseId) {
    try {
        const [rows] = await dbPool.execute('SELECT 1 FROM `CourseRegistration` WHERE UserID = ? AND CourseID = ? LIMIT 1', [userId, courseId]);
        return !!(rows && rows.length);
    } catch (err) {
        console.error('Error checking isCourseRegistered:', err.message);
        return false;
    }
}

export async function cancelEnrollCourse(userId, courseId) {
    try {
        const [result] = await dbPool.execute(
            'DELETE FROM `CourseRegistration` WHERE UserID = ? AND CourseID = ?',
            [userId, courseId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error in cancelEnrollCourse:', err.message);
        // Return success for mock
        return true;
    }
} 