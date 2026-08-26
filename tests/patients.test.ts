import { describe, it, before, mock } from "node:test";
import assert from "node:assert/strict";
import { request, getToken, makeInstance, makeListResult } from "./helpers/setup";
import { Patient } from "../models";

const auth = { Authorization: `Bearer ${getToken()}` };

const patientId = "11111111-1111-4111-8111-111111111111";
const missingId = "99999999-9999-4999-8999-999999999999";

const patientData: Record<string, unknown> = {
  id: patientId,
  name: "Test Patient",
  dni: "12345678",
  phone: "555-0001",
  email: "patient@example.com",
  address: "Main St 1",
  healthInsurance: "N/A",
  memberNumber: "N/A",
  status: "active",
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

before(() => {
  mock.method(Patient as any, "findAndCountAll", async () =>
    makeListResult([makeInstance(patientData)]),
  );
  mock.method(Patient as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ ...patientData, ...data }),
  );
  mock.method(Patient as any, "findByPk", async (id: string) =>
    id === patientId ? makeInstance(patientData) : null,
  );
});

describe("GET /api/patients", () => {
  it("returns 401 without a token", async () => {
    const res = await request.get("/api/patients");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("lists patients", async () => {
    const res = await request.get("/api/patients").set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, patientId);
  });
});

describe("POST /api/patients", () => {
  it("returns 401 without a token", async () => {
    const res = await request.post("/api/patients").send({ name: "N", phone: "1" });
    assert.equal(res.status, 401);
  });

  it("creates a patient", async () => {
    const res = await request
      .post("/api/patients")
      .set(auth)
      .send({ name: "New Patient", phone: "555-0100" });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.id, /[0-9a-f-]{36}/);
    assert.equal(res.body.data.name, "New Patient");
    assert.equal(res.body.data.phone, "555-0100");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request.post("/api/patients").set(auth).send({ phone: "555-0100" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe("GET /api/patients/:id", () => {
  it("returns a patient by id", async () => {
    const res = await request.get(`/api/patients/${patientId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, patientId);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.get(`/api/patients/${missingId}`).set(auth);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("PUT /api/patients/:id", () => {
  it("updates a patient", async () => {
    const res = await request.put(`/api/patients/${patientId}`).set(auth).send({ phone: "555-0200" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.phone, "555-0200");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.put(`/api/patients/${missingId}`).set(auth).send({ phone: "555-0200" });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("DELETE /api/patients/:id", () => {
  it("deletes a patient", async () => {
    const res = await request.delete(`/api/patients/${patientId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Patient deleted.");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.delete(`/api/patients/${missingId}`).set(auth);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});