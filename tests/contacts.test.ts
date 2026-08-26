import { describe, it, before, mock } from "node:test";
import assert from "node:assert/strict";
import { request, getToken, makeInstance, makeListResult } from "./helpers/setup";
import { Contact } from "../models";

const auth = { Authorization: `Bearer ${getToken()}` };

const contactId = "33333333-3333-4333-8333-333333333333";
const missingId = "99999999-9999-4999-8999-999999999999";

const contactData: Record<string, unknown> = {
  id: contactId,
  name: "Test Contact",
  phone: "555-0001",
  email: "contact@example.com",
  category: "other",
  notes: null,
  createdAt: new Date().toISOString(),
};

before(() => {
  mock.method(Contact as any, "findAndCountAll", async () =>
    makeListResult([makeInstance(contactData)]),
  );
  mock.method(Contact as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ ...contactData, ...data }),
  );
  mock.method(Contact as any, "findByPk", async (id: string) =>
    id === contactId ? makeInstance(contactData) : null,
  );
});

describe("GET /api/contacts", () => {
  it("returns 401 without a token", async () => {
    const res = await request.get("/api/contacts");
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it("lists contacts", async () => {
    const res = await request.get("/api/contacts").set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.total, 1);
    assert.equal(res.body.data[0].id, contactId);
  });
});

describe("POST /api/contacts", () => {
  it("returns 401 without a token", async () => {
    const res = await request.post("/api/contacts").send({ name: "N", phone: "1" });
    assert.equal(res.status, 401);
  });

  it("creates a contact", async () => {
    const res = await request
      .post("/api/contacts")
      .set(auth)
      .send({ name: "New Contact", phone: "555-0100" });
    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.id, /[0-9a-f-]{36}/);
    assert.equal(res.body.data.name, "New Contact");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request.post("/api/contacts").set(auth).send({ phone: "555-0100" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("returns 400 when phone is missing", async () => {
    const res = await request.post("/api/contacts").set(auth).send({ name: "New Contact" });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });
});

describe("PUT /api/contacts/:id", () => {
  it("updates a contact", async () => {
    const res = await request.put(`/api/contacts/${contactId}`).set(auth).send({ phone: "555-0200" });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.phone, "555-0200");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.put(`/api/contacts/${missingId}`).set(auth).send({ phone: "555-0200" });
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe("DELETE /api/contacts/:id", () => {
  it("deletes a contact", async () => {
    const res = await request.delete(`/api/contacts/${contactId}`).set(auth);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.message, "Contact deleted.");
  });

  it("returns 404 for an unknown id", async () => {
    const res = await request.delete(`/api/contacts/${missingId}`).set(auth);
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});