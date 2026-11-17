import { prisma } from "../lib/prisma.js";

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  findByUserId(userId) {
    return prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  findById(id) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { transactions: true } },
      },
    });
  },

  create({ name, type, userId }) {
    return prisma.category.create({
      data: { name, type, userId },
    });
  },

  update(id, data) {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  delete(id) {
    return prisma.category.delete({ where: { id } });
  },

  countTransactions(id) {
    return prisma.transaction.count({ where: { categoryId: id } });
  },
};
