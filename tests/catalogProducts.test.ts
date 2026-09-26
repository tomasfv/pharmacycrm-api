import { describe, it, before, mock } from "node:test";
import assert from "node:assert/strict";
import { request, getToken, makeInstance } from "./helpers/setup";
import { CatalogProduct, CatalogCategory } from "../models";

const auth = { Authorization: `Bearer ${getToken()}` };

const categoryId = "11111111-1111-4111-8111-111111111111";
const existingId = "22222222-2222-4222-8222-222222222222";
const createdId = "33333333-3333-4333-8333-333333333333";

const existingSku = "EXIST-001";
const createdSku = "NEW-001";

before(() => {
  mock.method(CatalogCategory as any, "findAll", async () => [
    makeInstance({ id: categoryId, name: "Perfumería" }),
  ]);
  mock.method(CatalogCategory as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ id: categoryId, ...data }),
  );
  mock.method(CatalogProduct as any, "findOne", async (options: any) => {
    const sku = options?.where?.sku;
    if (sku === existingSku) {
      return makeInstance({ id: existingId, sku, name: "Existing", price: "10000.00", categoryId });
    }
    if (sku === "UNCHANGED-1") {
      return makeInstance({
        id: "44444444-4444-4444-8444-444444444444",
        sku,
        name: "Same",
        price: "10000.00",
        categoryId,
      });
    }
    return null;
  });
  mock.method(CatalogProduct as any, "create", async (data: Record<string, unknown>) =>
    makeInstance({ id: createdId, ...data, createdAt: new Date().toISOString() }),
  );
});

describe("POST /api/catalog/products/batch", () => {
  it("returns 401 without a token", async () => {
    const res = await request.post("/api/catalog/products/batch").send({ items: [] });
    assert.equal(res.status, 401);
  });

  it("returns 400 when items is missing", async () => {
    const res = await request.post("/api/catalog/products/batch").set(auth).send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("returns 400 when an item has no sku", async () => {
    const res = await request
      .post("/api/catalog/products/batch")
      .set(auth)
      .send({ items: [{ name: "No sku", price: 100, categoryName: "Perfumería" }] });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("returns 400 when an item price is not numeric", async () => {
    const res = await request
      .post("/api/catalog/products/batch")
      .set(auth)
      .send({ items: [{ sku: "X", name: "P", price: "abc", categoryName: "Perfumería" }] });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it("creates new products and updates prices of existing ones", async () => {
    const res = await request
      .post("/api/catalog/products/batch")
      .set(auth)
      .send({
        items: [
          { sku: existingSku, name: "Existing", price: 12000, categoryName: "Perfumería" },
          { sku: "UNCHANGED-1", name: "Same", price: 10000, categoryName: "Perfumería" },
          { sku: createdSku, name: "Fresh", price: 5000, categoryName: "Perfumería" },
        ],
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.created, 1);
    assert.equal(res.body.data.updated, 1);
    assert.equal(res.body.data.unchanged, 1);
    assert.deepEqual(res.body.data.errors, []);
  });
});
