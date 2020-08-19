"use strict";

const request = require("supertest");

const db = require("../db.js");
const app = require("../app");
const User = require("../models/User");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /users", function () {
  test("works for admins: make non-admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          first_name: "First-new",
          last_name: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          is_admin: false,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        first_name: "First-new",
        last_name: "Last-newL",
        email: "new@email.com",
        is_admin: false,
      }, token: expect.any(String),
    });
  });

  test("works for admins: make admin", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          first_name: "First-new",
          last_name: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          is_admin: true,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: "u-new",
        first_name: "First-new",
        last_name: "Last-newL",
        email: "new@email.com",
        is_admin: true,
      }, token: expect.any(String),
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          first_name: "First-new",
          last_name: "Last-newL",
          password: "password-new",
          email: "new@email.com",
          is_admin: true,
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails if missing data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails if invalid data", async function () {
    const resp = await request(app)
        .post("/users")
        .send({
          username: "u-new",
          first_name: "First-new",
          last_name: "Last-newL",
          password: "password-new",
          email: "not-an-email",
          is_admin: true,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("GET /users", function () {
  test("works for users", async function () {
    const resp = await request(app)
        .get("/users")
        .send({ _token: u1Token });
    expect(resp.body).toEqual({
      users: [
        {
          username: "u1",
          first_name: "UF1",
          last_name: "UL1",
          email: "user1@user.com",
        },
        {
          username: "u2",
          first_name: "UF2",
          last_name: "UL2",
          email: "user2@user.com",
        },
        {
          username: "u3",
          first_name: "UF3",
          last_name: "UL3",
          email: "user3@user.com",
        },
      ],
    });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
  });

  test("test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE users CASCADE");
    const resp = await request(app)
        .get("/users")
        .send({ _token: adminToken });
    expect(resp.statusCode).toEqual(500);
  });
});


describe("GET /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .send({ _token: adminToken });
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        first_name: "UF1",
        last_name: "UL1",
        email: "user1@user.com",
        is_admin: false,
        jobs: [
          {
            id: testJobIds[0],
            title: "J1",
            company_handle: "c1",
            company_name: "C1",
            state: "applied",
          },
          {
            id: testJobIds[1],
            title: "J2",
            company_handle: "c1",
            company_name: "C1",
            state: "applied",
          },
        ],
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .send({ _token: u1Token });
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        first_name: "UF1",
        last_name: "UL1",
        email: "user1@user.com",
        is_admin: false,
        jobs: [
          {
            id: testJobIds[0],
            title: "J1",
            company_handle: "c1",
            company_name: "C1",
            state: "applied",
          },
          {
            id: testJobIds[1],
            title: "J2",
            company_handle: "c1",
            company_name: "C1",
            state: "applied",
          },
        ],
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
        .get(`/users/u1`)
        .send({ _token: u2Token });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
        .get(`/users/nope`)
        .send({ _token: adminToken });
    expect(resp.statusCode).toEqual(404);
  });
});

describe("PATCH /users/:username", () => {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          first_name: "New",
          _token: u1Token,
        });
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        first_name: "New",
        last_name: "UL1",
        email: "user1@user.com",
        is_admin: false,
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          first_name: "New",
          _token: u1Token,
        });
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        first_name: "New",
        last_name: "UL1",
        email: "user1@user.com",
        is_admin: false,
      },
    });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          first_name: "New",
          _token: u2Token,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails if invalid data", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          first_name: 42,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("can set new password", async function () {
    const resp = await request(app)
        .patch(`/users/u1`)
        .send({
          password: "new-password",
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        first_name: "UF1",
        last_name: "UL1",
        email: "user1@user.com",
        is_admin: false,
      },
    });
    const isSuccessful = await User.authenticate("u1", "new-password");
    expect(isSuccessful).toBeTruthy();
  });

});


describe("DELETE /users/:username", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/users/u1`).send({
          _token: adminToken,
        });
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .send({ _token: u1Token });
    expect(resp.body).toEqual({ deleted: "u1" });
  });

  test("unauth if not same user", async function () {
    const resp = await request(app)
        .delete(`/users/u1`)
        .send({ _token: u2Token });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails if user missing", async function () {
    const resp = await request(app)
        .delete(`/users/nope`)
        .send({ _token: adminToken });
    expect(resp.statusCode).toEqual(404);
  });
});


describe("POST /users/:username/jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .post(`/users/u1/jobs/${testJobIds[0]}`)
        .send({
          state: "accepted",
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      application: {
        id: expect.any(Number),
        job_id: testJobIds[0],
        state: "accepted",
        username: "u1",
      },
    });
  });

  test("works for same user", async function () {
    const resp = await request(app)
        .post(`/users/u1/jobs/${testJobIds[0]}`)
        .send({
          _token: u1Token,
          state: "accepted",
        });
    expect(resp.body).toEqual({
      application: {
        id: expect.any(Number),
        job_id: testJobIds[0],
        state: "accepted",
        username: "u1",
      },
    });
  });

  test("fails for others", async function () {
    const resp = await request(app)
        .post(`/users/u1/jobs/${testJobIds[0]}`)
        .send({
          _token: u2Token,
          state: "accepted",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails invalid job id", async function () {
    const resp = await request(app)
        .post(`/users/u1/jobs/0`)
        .send({
          _token: adminToken,
          state: "accepted",
        });
    expect(resp.statusCode).toEqual(404);
  });
});

