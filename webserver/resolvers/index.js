import { findUserByEmail, findUserById, createUser, _updateUser } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-errors';
import { deleteOtp, generateOtp, getOtp, getOtpCount, sendEmailOtp, setOtp } from '../MailSender/otpVerify.js';
import { enrollCourse, getCourse, getRegisteredCourses, getAvailableCourses, cancelEnrollCourse, courseExists, isCourseRegistered } from '../models/courseModel.js';

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
                type
            };
            
            const payload = { id: insertId, email: email, type: type, name: name};
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

            const payload = { id: user.UserID, email: user.Email, type: user.Role, name: user.FullName};
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

                if (otp.otp !== code) throw new UserInputError('Mã xác thực không chính xác');

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

        enrollCourse: async (_, {id}, context) => {            
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
                const result = await cancelEnrollCourse(context.userId, courseId);
                if (!result) {
                    throw new UserInputError('Không tìm thấy đăng ký này');
                }
                return true;
            } catch (err) {
                console.error("cancel enroll course error", err);
                if (err instanceof UserInputError) throw err;
                return false;
            }
        },
		
		updateUser: async (_, { id, email, full_name, phone }) => {
			try
			{
				// Tìm user trong DB
				const user = await findUserById(id);
				if (!user) return null;
				await _updateUser({ id, email, full_name, phone });
				// Trả về dữ liệu mới
				const updatedUser = await findUserById(id);
				return {
					id: updatedUser.UserID,
					name: updatedUser.FullName,
					email: updatedUser.Email,
					phone: updatedUser.Phone,
					type: updatedUser.Role
				};
			}
			catch (err)
			{
				console.error('updateUser error:', err);
				throw new Error('Lỗi khi cập nhật dữ liệu user.');
			}
		},
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
            } catch(err) { 
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
  
                return {
                    id: user.UserID,       
                    email: user.Email,     
                    name: user.FullName || "-",   
                    phone: user.Phone,     
                    type: user.Type || "Student",
                };
            } catch (err) {
                console.error('getUserByEmail error:', err);
                throw new Error('Lỗi khi lấy dữ liệu user.');
            }
        },
    }
}
