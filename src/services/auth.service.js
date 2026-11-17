import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { AppError } from "../middlewares/errorHandler.js";
import { userRepository } from "../repositories/user.repository.js";

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register({ name, email, password }) {
    if (!name || !email || !password) {
      throw new AppError("Nome, e-mail e senha são obrigatórios.", 400);
    }

    if (password.length < 6) {
      throw new AppError("A senha deve ter pelo menos 6 caracteres.", 400);
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new AppError("E-mail já cadastrado.", 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      role: "USER",
    });

    return sanitizeUser(user);
  },

  async login({ email, password }) {
    if (!email || !password) {
      throw new AppError("E-mail e senha são obrigatórios.", 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new AppError("Credenciais inválidas.", 401);
    }

    const token = jwt.sign(
      { sub: user.id, name: user.name, role: user.role },
      config.jwtSecret,
      { expiresIn: "8h" }
    );

    return {
      token,
      user: sanitizeUser(user),
    };
  },
};
