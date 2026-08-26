import { describe, it, before, mock } from "node:test";
import assert from "node:assert/strict";
import { request, getToken, makeInstance, makeListResult } from "./helpers/setup";
import { Medication } from "../models";

const auth = { Authorization: `Bearer ${getToken()}` };

const medicationId = "22222222-2222-4222-8222-222222222222";
const missingId = "99999999-9999-4999-8999-999999999999";

const medicationData: Record<string, unknown> = {
  id: medicationId,
  name: "Insulin",
  createdAt: new Date().toISOString(),
};

before(() => {
  mock.method(Medication as any, "findAndCountAll", async () =>
    makeListResult([makeInstance(medicationData)]),
  );
  mock.method(Medication as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ ...medicationData, ...data }),
  );
  mock.method(Medication as any, "findByPk", async (id: string) =>
    id === medicationId ? makeInstance(medicationData) : null,
  );
});

describe("GET /api/medications", () => {
  it("returns 401 without a token", async () => {
    const res = await request.get("/api/medications");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("lists medications", async () => {
    const res = await request.get("/api/medications").set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data[0].id, medicationId);
  });
});

describe("POST /api/medications", () => {
  it("returns 401 without a token", async () => {
    const res = await request.post("/api/medications").send({ name: "X" });
    assert.equal(res.status, 401);
  });

  it("creates a medication", async () => {
    const res = await request.post("/api/medications").set(auth).send({ name: "Amoxicillin" });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.id, /[0-9a-f-]{36}/);
    assert.equal(res.body.data.name, "Amoxicillin");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request.post("/api/medications").set(auth).send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe("PUT /api/medications/:id", () => {
  it("updates a medication", async () => {
    const res = await request.put(`/api/medications/${medicationId}`).set(auth).send({ name: "Insulin Lente" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, "Insulin Lente");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.put(`/api/medications/${missingId}`).set(auth).send({ name: "X" });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("DELETE /api/medications/:id", () => {
  it("deletes a medication", async () => {
    const res = await request.delete(`/api/medications/${medicationId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Medication deleted.");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.delete(`/api/medications/${missingId}`).set(auth);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});