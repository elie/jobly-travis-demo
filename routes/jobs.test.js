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


describe("POST /jobs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          company_handle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J-new",
        salary: 10,
        equity: "0.2",
        company_handle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          company_handle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fail with missing data", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          company_handle: "c1",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fail with invalid data", async function () {
    const resp = await request(app)
        .post(`/jobs`)
        .send({
          company_handle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

});


describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
          jobs: [
            { id: expect.any(Number), title: "J1", company_handle: "c1" },
            { id: expect.any(Number), title: "J2", company_handle: "c1" },
            { id: expect.any(Number), title: "J3", company_handle: "c1" },
          ],
        },
    );
  });

  test("filtering works", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .send({ hasEquity: true });
    expect(resp.body).toEqual({
          jobs: [
            { id: expect.any(Number), title: "J1", company_handle: "c1" },
            { id: expect.any(Number), title: "J2", company_handle: "c1" },
          ],
        },
    );
  });

  test("filtering on 2 filters work", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .send({ minSalary: 2, title: "3" });
    expect(resp.body).toEqual({
          jobs: [
            { id: expect.any(Number), title: "J3", company_handle: "c1" },
          ],
        },
    );
  });

  test("fails on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/jobs`)
        .send({ minSalary: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("GET /jobs/:id", function () {
  test("anon works", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "J1",
        salary: 1,
        equity: "0.1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          logo_url: null,
          num_employees: 1,
        },
      },
    });
  });

  test("fails for job missing", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});


describe("PATCH /jobs/:id", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "J-New",
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "J-New",
        salary: 1,
        equity: "0.1",
        company_handle: "c1",
      },
    });
  });

  test("fails for others", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "J-New", _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          handle: "new", _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails with invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({ salary: "not-a-number", _token: adminToken });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .send({ _token: adminToken });
    expect(resp.body).toEqual({ deleted: testJobIds[0] });
  });

  test("fails for others", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .send({ _token: u1Token });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for job missing", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .send({ _token: adminToken });
    expect(resp.statusCode).toEqual(404);
  });
});
