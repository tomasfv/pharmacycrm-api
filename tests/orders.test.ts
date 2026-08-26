import { describe, it, before, mock } from "node:test";
import assert from "node:assert/strict";
import { request, getToken, makeInstance, makeListResult } from "./helpers/setup";
import { Order, OrderMedication, FollowUp } from "../models";

const auth = { Authorization: `Bearer ${getToken()}` };

const orderId = "66666666-6666-4666-8666-666666666666";
const patientId = "11111111-1111-4111-8111-111111111111";
const medicationId = "22222222-2222-4222-8222-222222222222";
const missingId = "99999999-9999-4999-8999-999999999999";

const orderData: Record<string, unknown> = {
  id: orderId,
  patientId,
  patientName: "Test Patient",
  lastPickupDate: null,
  nextPickupDate: null,
  notes: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const orderWithMedications = makeInstance({
  ...orderData,
  medications: [
    makeInstance({
      id: "77777777-7777-4777-8777-777777777777",
      orderId,
      medicationId,
      medicationName: "Insulin",
      quantity: "1",
    }),
  ],
});

let medicationBulkCreate: ReturnType<typeof mock.method>;
let medicationDestroy: ReturnType<typeof mock.method>;
let followUpCreate: ReturnType<typeof mock.method>;

before(() => {
  mock.method(Order as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ ...orderData, ...data }),
  );
  mock.method(Order as any, "findAll", async () => [orderWithMedications]);
  mock.method(Order as any, "findByPk", async (id: string) =>
    id === orderId ? orderWithMedications : null,
  );
  medicationBulkCreate = mock.method(OrderMedication as any, "bulkCreate", async () => []);
  medicationDestroy = mock.method(OrderMedication as any, "destroy", async () => 0);
  followUpCreate = mock.method(FollowUp as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ id: "44444444-4444-4444-8444-444444444444", ...data }),
  );
});

describe("GET /api/orders", () => {
  it("returns 401 without a token", async () => {
    const res = await request.get("/api/orders");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("lists orders", async () => {
    const res = await request.get("/api/orders").set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].id, orderId);
  });

  it("lists orders filtered by patient", async () => {
    const res = await request.get(`/api/orders?patientId=${patientId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data[0].patientId, patientId);
  });
});

describe("POST /api/orders", () => {
  it("returns 401 without a token", async () => {
    const res = await request
      .post("/api/orders")
      .send({ patientId, patientName: "Test Patient", medications: [] });
    assert.equal(res.status, 401);
  });

  it("creates an order and auto-generates its follow-up", async () => {
    medicationBulkCreate.mock.resetCalls();
    followUpCreate.mock.resetCalls();
    const res = await request
      .post("/api/orders")
      .set(auth)
      .send({
        patientId,
        patientName: "Test Patient",
        medications: [{ medicationId, medicationName: "Insulin", quantity: "1" }],
      });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, orderId);
    assert.equal(res.body.data.patientName, "Test Patient");
    assert.equal(res.body.data.medications.length, 1);
    assert.equal(medicationBulkCreate.mock.callCount(), 1);
    assert.equal(followUpCreate.mock.callCount(), 1);
  });

  it("returns 400 when patientId is missing", async () => {
    const res = await request.post("/api/orders").set(auth).send({ patientName: "Test Patient" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe("PUT /api/orders/:id", () => {
  it("updates an order", async () => {
    medicationDestroy.mock.resetCalls();
    medicationBulkCreate.mock.resetCalls();
    const res = await request
      .put(`/api/orders/${orderId}`)
      .set(auth)
      .send({ notes: "Priority", medications: [{ medicationId, medicationName: "Paracetamol", quantity: "2" }] });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.notes, "Priority");
    assert.equal(medicationDestroy.mock.callCount(), 1);
    assert.equal(medicationBulkCreate.mock.callCount(), 1);
  });

  it("returns 404 for an unknown id", async () => {
    medicationDestroy.mock.resetCalls();
    const res = await request.put(`/api/orders/${missingId}`).set(auth).send({ notes: "x" });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("DELETE /api/orders/:id", () => {
  it("deletes an order and its order medications", async () => {
    medicationDestroy.mock.resetCalls();
    const res = await request.delete(`/api/orders/${orderId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Order deleted.");
    assert.equal(medicationDestroy.mock.callCount(), 1);
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.delete(`/api/orders/${missingId}`).set(auth);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});