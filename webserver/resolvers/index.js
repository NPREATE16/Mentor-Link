import { findUserByEmail, findUserById, createUser, _updateUser, getStudentInfoById, upsertStudentCode, getTutorInfoById, upsertTutorMajor } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-errors';
import { deleteOtp, generateOtp, getOtp, getOtpCount, sendEmailOtp, setOtp } from '../MailSender/otpVerify.js';
import { enrollCourse, getCourse, getRegisteredCourses, getAvailableCourses, cancelEnrollCourse, courseExists, isCourseRegistered } from '../models/courseModel.js';
import { openClass, updateClass, deleteClass, getClassesByTutorId, deleteTutorCourseRegistration, deleteMultipleTutorCourseRegistrations } from '../models/tutorModel.js';
import { getTutorOfCourse, getTutorAutomic } from '../models/tutorModel.js';
import { joinClass, getStudentSchedules } from '../models/studentModel.js';

const OTP_RATE_LIMIT = 100;


export const resolvers = {
    Mutation: {
        signup: async (_, { name, email, password, type }) => {
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertId = await createUser({ name: name, email: email, password: hashedPassword, role: type });

            const user = {
                id: String(insertId),
                name,
                email,
                phone: null,
                type,
                mssv: null,
                major: null,
                faculty: null,
            };

            const payload = { id: insertId, email: email, type: type, name: name };
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, { expiresIn: '4h' });

            return {
                token,
                user
            };
        },

        signin: async (_, { email, password }) => {
            const user = await findUserByEmail(email);
            if (!user) {
                throw new UserInputError('Tài khoản không tồn tại', { field: 'email' });
            }

            const bcrypt = await import('bcryptjs');
            const valid = await bcrypt.compare(password, user.Password);
            if (!valid) throw new UserInputError('Mật khẩu không đúng');

            let studentCode = null;
            let tutorMajor = null;
            const normalizedRole = String(user.Role || '').toLowerCase();
            if (normalizedRole === 'student') {
                const studentInfo = await getStudentInfoById(user.UserID);
                studentCode = studentInfo?.StudentCode || null;
            } else if (normalizedRole === 'tutor') {
                const tutorInfo = await getTutorInfoById(user.UserID);
                tutorMajor = tutorInfo?.Major || null;
            }

            const payload = { id: user.UserID, email: user.Email, type: user.Role, name: user.FullName };
            const secret = process.env.JWT_SECRET;
            const token = jwt.sign(payload, secret, { expiresIn: '4h' });

            return {
                token,
                user: {
                    name: user.FullName,
                    id: String(user.UserID),
                    type: user.Role,
                    phone: user.Phone,
                    email: user.Email,
                    mssv: studentCode,
                    major: tutorMajor,
                    faculty: user.Faculty || ""
                }
            };
        },

        requestOtp: async (_, args) => {
            try {
                if (getOtpCount() >= Number(OTP_RATE_LIMIT)) {
                    throw new UserInputError('Vui lòng thử lại sau');
                }

                const code = generateOtp();
                const expire = Date.now() + 2 * 60 * 1000;
                setOtp(args.email, code, expire);

                await sendEmailOtp(args.email, code);

                return { success: true, expiresAt: expire };
            } catch (err) {
                console.error("requestOtp error:", err);
                return { success: false };
            }
        },

        verifyOtp: async (_, { email, code }) => {
            try {
                const otp = getOtp(email);
                if (!otp) {
                    throw new UserInputError('Mã xác thực đã hết hạn');
                }

                const now = Date.now();
                if (now > otp.expire) {
                    deleteOtp(email);
                    throw new UserInputError('Mã xác thực đã hết hạn');
                }

                if (otp.otp != code) throw new UserInputError('Mã xác thực không chính xác');

                deleteOtp(email);
                return { success: true }
            } catch (err) {
                console.log("verify error", err);

                if (err instanceof UserInputError) {
                    throw err;
                }
                return { success: false }
            }
        },

        enrollCourse: async (_, { id }, context) => {
            if (!context.userId) {
                throw new UserInputError('Bạn cần đăng nhập để đăng ký khóa học');
            }

            try {
                const exists = await courseExists(id);
                if (!exists) {
                    throw new UserInputError('Môn học không tồn tại');
                }

                const already = await isCourseRegistered(context.userId, id);
                if (already) {
                    throw new UserInputError('Bạn đã đăng ký môn này');
                }

                await enrollCourse(context.userId, id);
                return true;
            } catch (err) {
                console.error("enroll course error", err);
                if (err instanceof UserInputError) throw err;

                // Map DB-specific errors to friendly messages
                if (err.code === 'COURSE_NOT_FOUND') {
                    throw new UserInputError('Môn học không tồn tại');
                }
                if (err.code === 'ALREADY_REGISTERED') {
                    throw new UserInputError('Bạn đã đăng ký môn này');
                }

                return false;
            }
        },

        cancelEnrollCourse: async (_, { courseId }, context) => {
            if (!context.userId) {
                throw new UserInputError('Bạn cần đăng nhập để hủy đăng ký khóa học');
            }

            try {
                await cancelEnrollCourse(context.userId, courseId);
                // Return true whether record existed or not (idempotent)
                return true;
            } catch (err) {
                console.error("cancel enroll course error", err);
                if (err instanceof UserInputError) throw err;
                return false;
            }
        },

        updateUser: async (_, { id, email, full_name, phone, introduce, mssv, major, faculty }) => {
            try {
                const user = await findUserById(id);
                if (!user) throw new UserInputError("Tài khoản không tồn tại");
                await _updateUser({ id, email, full_name, phone, introduce, faculty });
                const role = String(user.Role || '').toLowerCase();
                if (role === 'student' && typeof mssv !== 'undefined') {
                    await upsertStudentCode({ id, studentCode: mssv });
                } else if (role === 'tutor' && typeof major !== 'undefined') {
                    const courseCodes = String(major ?? '')
                        .split(';')
                        .map((code) => code.trim())
                        .filter(Boolean);
                    await upsertTutorMajor({ tutorId: id, courseCodes });
                }
                const updatedUser = await findUserById(id);
                const studentInfo = role === 'student' ? await getStudentInfoById(id) : null;
                const tutorInfo = role === 'tutor' ? await getTutorInfoById(id) : null;
                return {
                    id: updatedUser.UserID,
                    name: updatedUser.FullName,
                    email: updatedUser.Email,
                    phone: updatedUser.Phone,
                    type: updatedUser.Role,
                    introduce: updatedUser.Introduce,
                    mssv: studentInfo?.StudentCode || null,
                    major: tutorInfo?.Major || null,
                    faculty: updatedUser.Faculty || null,
                };
            }
            catch (err) {
                console.error('updateUser error:', err);
                throw new Error('Lỗi khi cập nhật dữ liệu user.');
            }
        },

        openClass: async (_, { start, end, day, method }, context) => {
            try {
                if (!context.userId) {
                    throw new UserInputError('Vui lòng đăng nhập');
                }
                const cls = await openClass(context.userId, start, end, day, method);
                return cls;
            } catch (err) {
                console.error('openClassError', err);
                if (err instanceof UserInputError) throw err;
                throw new Error('Không thể mở lớp');
            }
        },

        updateClass: async (_, { classId, start, end, day, method }, context) => {
            try {
                if (!context.userId) {
                    throw new UserInputError('Vui lòng đăng nhập');
                }
                const updated = await updateClass({ classId, tutorId: context.userId, start, end, day, method });
                if (!updated) return null;
                return updated;
            } catch (err) {
                console.error('updateClassError', err);
                if (err.code === 'NOT_OWNER') {
                    throw new UserInputError('Bạn không có quyền sửa lớp này');
                }
                if (err instanceof UserInputError) throw err;
                throw new Error('Không thể cập nhật lớp');
            }
        },

        deleteClass: async (_, { classId }, context) => {
            try {
                if (!context.userId) {
                    throw new UserInputError('Vui lòng đăng nhập');
                }
                const res = await deleteClass(classId, context.userId);
                return res;
            } catch (err) {
                console.error('deleteClassError', err);
                if (err.code === 'NOT_OWNER') {
                    throw new UserInputError('Bạn không có quyền xóa lớp này');
                }
                if (err instanceof UserInputError) throw err;
                return false;
            }
        },

        deleteTutorCourseRegistration: async (_, { courseId }, context) => {
            try {
                if (!context.userId) throw UserInputError("Vui lòng đăng nhập");

                const res = await deleteTutorCourseRegistration(context.userId, courseId);

                return res;

            } catch (err) {
                console.log("deleteTutorCourseRegistration error", err);
                return false;
            }
        },

        deleteMultipleTutorCourseRegistrations: async (_, { courseIds }, context) => {
            try {
                if (!context.userId) throw UserInputError("Vui lòng đăng nhập");
                if (!Array.isArray(courseIds) || courseIds.length === 0) {
                    return true;
                }

                const res = await deleteMultipleTutorCourseRegistrations(context.userId, courseIds);

                return res;

            } catch (err) {
                console.log("deleteMultipleTutorCourseRegistrations error", err);
                return false;
            }
        }, 

        joinClass: async (_, { classId, courseId }, context) => {
            try {
                if (!context.userId) {
                    throw new UserInputError('Bạn cần đăng nhập để tham gia lớp học');
                }

                if (!classId) {
                    throw new UserInputError('Vui lòng chọn lớp học');
                }

                if (!courseId) {
                    throw new UserInputError('Vui lòng chọn môn học');
                }

                const success = await joinClass(context.userId, classId, courseId);
                return success;
            } catch (err) {
                // if (err instanceof UserInputError) {
                //     throw err;
                // }
                
                if (err.code === 'CLASS_FULL') {
                    throw new UserInputError('Lớp học đã đầy');
                }

                
                if (err.code === 'COURSE_ALREADY_REGISTERED' || err.code === '450009') {
                    throw new UserInputError('Bạn đã đăng ký môn này');
                }
                
                if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
                    throw new UserInputError('Lớp học không tồn tại');
                }
                
                if ( err.code === 'SCHEDULE_CONFLICT'  || err.code === '45000' || err.c) {
                    const triggerMessage = 'Không thể tham gia lớp học do trùng lịch' || err.sqlMessage || err.message ;
                    throw new UserInputError(triggerMessage);
                }
                
                if (err.code && err.code.startsWith('ER_')) {
                    const dbMessage = err.sqlMessage || err.message || 'Lỗi cơ sở dữ liệu';
                    throw new UserInputError(`Không thể tham gia lớp học: ${dbMessage}`);
                }
                
                throw new UserInputError('Không thể tham gia lớp học. Vui lòng thử lại sau.');
            }
        }
    },

    Query: {
        checkExistUser: async (_, args) => {
            const exists = await findUserByEmail(args.email);
            return !!exists;
        },
        getCourse: async () => {
            try {
                const courses = await getCourse();
                return courses || [];
            } catch (err) {
                console.error("get course error", err);
                return [];
            }
        },

        getAvailableCourses: async (_, args, context) => {

            if (!context.userId) {
                console.warn('No userId found in context, returning mock data');
                // Return mock data if not authenticated
                try {
                    const courses = await getAvailableCourses(1); // Default user ID for testing
                    return courses || [];
                } catch (err) {
                    console.error("get available courses error", err);
                    return [];
                }
            }

            try {
                const courses = await getAvailableCourses(context.userId);
                return courses || [];
            } catch (err) {
                console.error("get available courses error", err);
                return [];
            }
        },

        getRegisteredCourses: async (_, args, context) => {
            if (!context.userId) {
                console.warn('No userId found in context, returning mock data');
                // Return mock data if not authenticated
                try {
                    const courses = await getRegisteredCourses(1); // Default user ID for testing
                    return courses || [];
                } catch (err) {
                    console.error("get registered courses error", err);
                    return [];
                }
            }

            try {
                const courses = await getRegisteredCourses(context.userId);
                return courses || [];
            } catch (err) {
                console.error("get registered courses error", err);
                return [];
            }
        },

        getUserByEmail: async (_, { email }) => {
            try {
                const user = await findUserByEmail(email);
                if (!user) return null; // không tìm thấy
                const role = String(user.Role || user.Type || '').toLowerCase();
                const studentInfo = role === 'student' ? await getStudentInfoById(user.UserID) : null;
                const tutorInfo = role === 'tutor' ? await getTutorInfoById(user.UserID) : null;
                return {
                    id: user.UserID,
                    email: user.Email,
                    name: user.FullName || "-",
                    phone: user.Phone,
                    type: user.Type || user.Role || "Student",
                    introduce: user.Introduce || "",
                    mssv: studentInfo?.StudentCode || null,
                    major: tutorInfo?.Major || null,
                    faculty: user.Faculty || ""
                };
            } catch (err) {
                console.error('getUserByEmail error:', err);
                throw new Error('Lỗi khi lấy dữ liệu user.');
            }
        },

        getClassesByTutorID: async (_, __, context) => {
            if (!context.userId) {
                throw new UserInputError('Bạn cần đăng nhập');
            }
            const list = await getClassesByTutorId(context.userId);
            return Array.isArray(list) ? list : [];
        },

        getTutorOfCourse: async (_, { courseId }, context) => {
            try {
                if (!context.userId) throw new UserInputError("Vui lòng đăng nhập");

                const rows = await getTutorOfCourse(courseId); 
                
                if (!rows || rows.length === 0) {
                    return [];
                }

                const tutorMap = new Map();
                
                for (const row of rows) {
                    const tutorId = String(row.TutorID);
                    
                    if (!tutorMap.has(tutorId)) {
                        tutorMap.set(tutorId, {
                            name: row.TutorName || '',
                            desc: row.Introduce || null,
                            classes: []
                        });
                    }
                    
                    const tutor = tutorMap.get(tutorId);
                    tutor.classes.push({
                        id: String(row.ClassID),
                        tutorId: tutorId,
                        start: row.StartTime ? row.StartTime.substring(0, 5) : null,
                        end: row.EndTime ? row.EndTime.substring(0, 5) : null,
                        day: row.TeachingDay,
                        method: row.method || null
                    });
                }
                
                return Array.from(tutorMap.values());
            } catch (err) {
                console.log("getTutorOfCourse error", err); 
                throw new Error("getTutorOfCourse error", err);
            }
        },

        getStudentSchedules: async (_, __, context) => {
            try {
                if (!context.userId) {
                    throw new UserInputError('Bạn cần đăng nhập để xem lịch học');
                }

                const rows = await getStudentSchedules(context.userId);
                
                if (!rows || rows.length === 0) {
                    return [];
                }

                const schedules = rows.map((row) => ({
                    tutorName: row.TutorName || '',
                    courseName: row.CourseName || '',
                    day: row.TeachingDay || '',
                    method: row.method || '',
                    start: row.StartTime ? row.StartTime.substring(0, 5) : '',
                    end: row.EndTime ? row.EndTime.substring(0, 5) : ''
                }));

                return schedules;
            } catch (err) {
                console.error("getStudentSchedules error", err);
                if (err instanceof UserInputError) throw err;
                throw new Error("Không thể lấy lịch học");
            }
        }, 

        getTutorAutomic: async (_, { courseId }, context) => {
            try {
                if (!context.userId) {
                    throw new UserInputError('Bạn cần đăng nhập để sử dụng tính năng ghép tự động');
                }

                if (!courseId) {
                    throw new UserInputError('Vui lòng chọn môn học');
                }

                const rows = await getTutorAutomic(courseId, context.userId);

                if (!rows || rows.length === 0) {
                    return null;
                }

                const firstRow = rows[0];
                const tutorId = String(firstRow.TutorID);

                const tutorClasses = rows
                    .filter(row => String(row.TutorID) === tutorId)
                    .map(row => ({
                        id: String(row.ClassID),
                        tutorId: tutorId,
                        start: row.StartTime ? row.StartTime.substring(0, 5) : null,
                        end: row.EndTime ? row.EndTime.substring(0, 5) : null,
                        day: row.TeachingDay,
                        method: row.method || null
                    }));

                return {
                    name: firstRow.TutorName || '',
                    desc: firstRow.Introduce || null,
                    classes: tutorClasses
                };
            } catch (err) {
                console.error("getTutorAutomic error", err);
                if (err instanceof UserInputError) {
                    throw err;
                }
                throw new Error("Không thể lấy tutor tự động");
            }
        }
    }
}