import { findUserByEmail, findUserById, createUser, _updateUser, getStudentInfoById, upsertStudentCode, getTutorInfoById, upsertTutorMajor } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-errors';
import { deleteOtp, generateOtp, getOtp, getOtpCount, sendEmailOtp, setOtp } from '../MailSender/otpVerify.js';
import { enrollCourse, getCourse, getRegisteredCourses, getAvailableCourses, cancelEnrollCourse, courseExists, isCourseRegistered } from '../models/courseModel.js';
import { openClass, updateClass, deleteClass, getClassesByTutorId } from '../models/tutorModel.js';
const OTP_RATE_LIMIT = 100;

// export function safeCompare(a, b) {
//     if (a.length !== b.length) return false;
//     for (let i = 0; i < a.length; i++) {
//         if (a[i] !== b[i]) return false;
//     }
//     return true;
// }
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
            // try {
            //     const otp = getOtp(email);
            //     if (!otp) {
            //         throw new UserInputError('Mã xác thực đã hết hạn');
            //     }

            //     const now = Date.now();
            //     if (now > otp.expire) {
            //         deleteOtp(email);
            //         throw new UserInputError('Mã xác thực đã hết hạn');
            //     }

            //     if (otp.otp != code) throw new UserInputError('Mã xác thực không chính xác');

            //     deleteOtp(email);
            //     return { success: true }
            // } catch (err) {
            //     console.log("verify error", err);

            //     if (err instanceof UserInputError) {
            //         throw err;
            //     }
            //     return { success: false }
            // }
            return { success: true }
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

        updateUser: async (_, { id, email, full_name, phone, introduce, mssv, major }) => {
            try {
                const user = await findUserById(id);
                if (!user) return null;
                await _updateUser({ id, email, full_name, phone, introduce });
                const role = String(user.Role || '').toLowerCase();
                if (role === 'student' && typeof mssv !== 'undefined') {
                    await upsertStudentCode({ id, studentCode: mssv });
                } else if (role === 'tutor' && typeof major !== 'undefined') {
                    await upsertTutorMajor({ id, major });
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
                const ok = await deleteClass(classId, context.userId);
                return ok;
            } catch (err) {
                console.error('deleteClassError', err);
                if (err.code === 'NOT_OWNER') {
                    throw new UserInputError('Bạn không có quyền xóa lớp này');
                }
                if (err instanceof UserInputError) throw err;
                return false;
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
            console.log('getAvailableCourses context:', context);

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
            console.log('getRegisteredCourses context:', context);

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
                };
            } catch (err) {
                console.error('getUserByEmail error:', err);
                throw new Error('Lỗi khi lấy dữ liệu user.');
            }
        },

        // getClassByTutorID: async (_, __, context) => {
        //     if (!context.userId) {
        //         throw new UserInputError('Bạn cần đăng nhập');
        //     }
        //     const cls = await getFirstClassByTutorId(context.userId);
        //     if (!cls) {
        //         throw new UserInputError('Không tìm thấy lớp');
        //     }
        //     return cls;
        // },

        getClassesByTutorID: async (_, __, context) => {
            if (!context.userId) {
                throw new UserInputError('Bạn cần đăng nhập');
            }
            const list = await getClassesByTutorId(context.userId);
            return Array.isArray(list) ? list : [];
        },
    }
}
