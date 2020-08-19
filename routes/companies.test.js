"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /companies", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          name: "CNew",
          logo_url: "http://cnew.img",
          description: "DescNew",
          num_employees: 10,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: {
        handle: "cnew",
        name: "CNew",
        logo_url: "http://cnew.img",
        description: "DescNew",
        num_employees: 10,
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          name: "CNew",
          logo_url: "http://cnew.img",
          description: "DescNew",
          num_employees: 10,
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          num_employees: 10,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          name: "CNew",
          logo_url: "not-a-url",
          description: "DescNew",
          num_employees: 10,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
          [
            { handle: "c1", name: "C1" },
            { handle: "c2", name: "C2" },
            { handle: "c3", name: "C3" },
          ],
    });
  });

  test("filtering works", async function () {
    const resp = await request(app)
        .get("/companies")
        .send({ minEmployees: 3 });
    expect(resp.body).toEqual({
      companies: [
        { handle: "c3", name: "C3" },
      ],
    });
  });

  test("filtering on 2 filters works", async function () {
    const resp = await request(app)
        .get("/companies")
        .send({ minEmployees: 2, name: "3" });
    expect(resp.body).toEqual({
      companies: [
        { handle: "c3", name: "C3" },
      ],
    });
  });

  test("fail if invalid filter key", async function () {
    const resp = await request(app)
        .get("/companies")
        .send({ minEmployees: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("GET /companies/:handle", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        num_employees: 1,
        logo_url: null,
        jobs: [
          { id: testJobIds[0], title: "J1", equity: "0.1", salary: 1 },
          { id: testJobIds[1], title: "J2", equity: "0.2", salary: 2 },
          { id: testJobIds[2], title: "J3", equity: null, salary: 3 },
        ],
      },
    });
  });

  test("ok for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        num_employees: 2,
        logo_url: null,
        jobs: [],
      },
    });
  });

  test("fails for company missing", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});


describe("PATCH /companies/:handle", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        num_employees: 1,
        logo_url: null,
      },
    });
  });

  test("fails for non-admin", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          handle: "c1-new",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails on invalid data", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          logo_url: "not-a-url",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /companies/:handle", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .send({
          _token: adminToken,
        });
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("fails for non-admin", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .send({
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for missing company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .send({
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(404);
  });
});
