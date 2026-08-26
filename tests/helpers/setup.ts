import "./env";
import supertest from "supertest";
import jwt from "jsonwebtoken";
import { before, after, mock } from "node:test";
import app from "../../app";
import sequelize from "../../config/database";
import { User } from "../../models";

export const request = supertest(app);

const TEST_ADMIN = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Test Admin",
  email: "test@pharmacare.com",
  role: "admin",
};

export function getToken(): string {
  return jwt.sign(
    { id: TEST_ADMIN.id, email: TEST_ADMIN.email, role: TEST_ADMIN.role },
    process.env.JWT_SECRET!,
    { expiresIn: 604800 },
  );
}

export function makeInstance<T extends Record<string, unknown>>(data: T): any {
  const values: Record<string, unknown> = { ...data };
  const instance: any = { ...data };
  Object.defineProperty(instance, "update", {
    value: async (patch: Record<string, unknown> = {}) => {
      Object.assign(values, patch);
      Object.assign(instance, patch);
      return instance;
    },
    enumerable: false,
  });
  Object.defineProperty(instance, "destroy", {
    value: async () => undefined,
    enumerable: false,
  });
  Object.defineProperty(instance, "toJSON", {
    value: () => ({ ...values }),
    enumerable: false,
  });
  return instance;
}

export function makeListResult(rows: unknown[] = [], count: number = rows.length) {
  return { rows, count };
}

before(() => {
  for (const method of ["authenticate", "sync", "query", "transaction"] as const) {
    mock.method(sequelize as any, method, () => {
      throw new Error(
        `[TEST SAFETY] Real sequelize.${method}() call attempted. ` +
          "Mock the model methods in your test instead of touching the database.",
      );
    });
  }
  mock.method(User as any, "findByPk", async () => makeInstance({ ...TEST_ADMIN }));
});

after(() => {
  mock.restoreAll();
});