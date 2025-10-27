import { findUserByEmail, createUser } from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import { UserInputError } from 'apollo-server-errors';

export const resolvers = {
  Mutation: {
    signup: async (_, { name, email, password, type }) => {
      const exists = await findUserByEmail(email);
      if (exists) {
        throw new UserInputError('Tài khoản đã tồn tại', { field: 'email' });
      }

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

      const payload = { id: insertId, email, type, name };
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
    }
  },
  Query: {
    _empty: () => 'ok'
  }
};