import { findUserByEmail, createUser } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-errors';
import { deleteOtp, generateOtp, getOtp, getOtpCount, sendEmailOtp, setOtp } from '../MailSender/otpVerify.js';

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

      const payload = { id: insertId, email: email, type: type, name: name };
      const secret = process.env.JWT_SECRET || 'default_secret';
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

      const payload = { id: user.UserID, email: user.Email, type: user.Role, name: user.FullName };
      const secret = process.env.JWT_SECRET || 'default_secret';
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
        const expire = Date.now() + 2 * 60 * 1000
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

        if (otp.otp !== code) throw new UserInputError('Mã xác thực không chính xác');

        deleteOtp(email);
        return { success: true }
      } catch (err) {
        console.log("verify error", err);
        return { success: false }
      }
    }
  },

  Query: {
    checkExistUser: async (_, args) => {
      const exists = await findUserByEmail(args.email);
      return !!exists;
    }
  }
};  