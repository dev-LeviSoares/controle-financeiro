import { prisma } from "../lib/prisma.js";

const includeRelations = {
  category: {
    select: { id: true, name: true, type: true },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
};

export const transactionRepository = {
  findAll() {
    return prisma.transaction.findMany({
      include: includeRelations,
      orderBy: { date: "desc" },
    });
  },

  findByUserId(userId) {
    return prisma.transaction.findMany({
      where: { userId },
      include: includeRelations,
      orderBy: { date: "desc" },
    });
  },

  findById(id) {
    return prisma.transaction.findUnique({
      where: { id },
      include: includeRelations,
    });
  },

  create(data) {
    return prisma.transaction.create({
      data,
      include: includeRelations,
    });
  },

  update(id, data) {
    return prisma.transaction.update({
      where: { id },
      data,
      include: includeRelations,
    });
  },

  delete(id) {
    return prisma.transaction.delete({ where: { id } });
  },
};
