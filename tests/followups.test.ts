import { describe, it, before, mock } from "node:test";
import assert from "node:assert/strict";
import { request, getToken, makeInstance, makeListResult } from "./helpers/setup";
import { FollowUp, Order } from "../models";

const auth = { Authorization: `Bearer ${getToken()}` };

const followUpId = "44444444-4444-4444-8444-444444444444";
const orderId = "55555555-5555-4555-8555-555555555555";
const missingId = "99999999-9999-4999-8999-999999999999";

const followUpData: Record<string, unknown> = {
  id: followUpId,
  patientId: "11111111-1111-4111-8111-111111111111",
  patientName: "Test Patient",
  orderId: orderId,
  medication: "Insulin",
  status: "order_received",
  scheduledDate: "2026-08-20",
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const orderData: Record<string, unknown> = {
  id: orderId,
  patientId: "11111111-1111-4111-8111-111111111111",
  patientName: "Test Patient",
  lastPickupDate: null,
  nextPickupDate: null,
};

let orderFindByPk: ReturnType<typeof mock.method>;

before(() => {
  mock.method(FollowUp as any, "findAndCountAll", async () =>
    makeListResult([makeInstance(followUpData)]),
  );
  mock.method(FollowUp as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ ...followUpData, ...data }),
  );
  mock.method(FollowUp as any, "findByPk", async (id: string) =>
    id === followUpId ? makeInstance(followUpData) : null,
  );
  orderFindByPk = mock.method(Order as any, "findByPk", async (id: string) =>
    id === orderId ? makeInstance(orderData) : null,
  );
});

describe("GET /api/followups", () => {
  it("returns 401 without a token", async () => {
    const res = await request.get("/api/followups");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("lists follow-ups", async () => {
    const res = await request.get("/api/followups").set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data[0].id, followUpId);
  });
});

describe("POST /api/followups", () => {
  it("returns 401 without a token", async () => {
    const res = await request
      .post("/api/followups")
      .send({ patientId: "x", patientName: "n", scheduledDate: "2026-08-20" });
    assert.equal(res.status, 401);
  });

  it("creates a follow-up", async () => {
    const res = await request
      .post("/api/followups")
      .set(auth)
      .send({ patientId: "11111111-1111-4111-8111-111111111111", patientName: "Test Patient", scheduledDate: "2026-08-22" });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.id, /[0-9a-f-]{36}/);
    assert.equal(res.body.data.patientName, "Test Patient");
  });

  it("returns 400 when scheduledDate is missing", async () => {
    const res = await request
      .post("/api/followups")
      .set(auth)
      .send({ patientId: "11111111-1111-4111-8111-111111111111", patientName: "Test Patient" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe("PUT /api/followups/:id", () => {
  it("updates a follow-up", async () => {
    const res = await request.put(`/api/followups/${followUpId}`).set(auth).send({ notes: "Called patient" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.notes, "Called patient");
  });

  it("updating with status delivered resets the linked order pickup dates", async () => {
    const res = await request
      .put(`/api/followups/${followUpId}`)
      .set(auth)
      .send({ status: "delivered" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, "delivered");
    assert.equal(orderFindByPk.mock.callCount(), 1);
  });

  it("does not touch the order when status is not delivered", async () => {
    orderFindByPk.mock.resetCalls();
    const res = await request
      .put(`/api/followups/${followUpId}`)
      .set(auth)
      .send({ status: "contacted" });
    assert.equal(res.status, 200);
    assert.equal(orderFindByPk.mock.callCount(), 0);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.put(`/api/followups/${missingId}`).set(auth).send({ notes: "x" });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("PATCH /api/followups/:id/status", () => {
  it("updates the status of a follow-up", async () => {
    const res = await request.patch(`/api/followups/${followUpId}/status`).set(auth).send({ status: "prepared" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, "prepared");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.patch(`/api/followups/${missingId}/status`).set(auth).send({ status: "prepared" });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("DELETE /api/followups/:id", () => {
  it("deletes a follow-up", async () => {
    const res = await request.delete(`/api/followups/${followUpId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Follow-up deleted.");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.delete(`/api/followups/${missingId}`).set(auth);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});