"use strict";

const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("authenticate", function () {
  test("ok", async function () {
    const user = await User.authenticate("test", "password");
    expect(user).toEqual({
      username: "test",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
    });
  });

  test("fails: missing user", async function () {
    expect.assertions(1);
    try {
      await User.authenticate("nope", "password");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails: wrong password", async function () {
    expect.assertions(1);
    try {
      await User.authenticate("test", "wrong");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("register", function () {
  test("succeeds", async function () {
    let user = await User.register({
      username: "new",
      password: "password",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
    });
    expect(user).toEqual({
      username: "new",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("succeeds: admin user", async function () {
    let user = await User.register({
      username: "new",
      password: "password",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: true,
    });
    expect(user).toEqual({
      username: "new",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: true,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("fails with missing data", async function () {
    expect.assertions(1);
    try {
      await User.register({
        username: "new",
        password: "password",
        first_name: "Test",
        last_name: "Tester",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with dup data", async function () {
    expect.assertions(1);
    try {
      await User.register({
        username: "test",
        password: "password2",
        first_name: "Test2",
        last_name: "Tester2",
        email: "test2@test.com",
        is_admin: false,
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("findAll", function () {
  test("ok", async function () {
    const users = await User.findAll();
    expect(users).toEqual([
      {
        username: "test",
        first_name: "Test",
        last_name: "Tester",
        email: "test@test.com",
      },
      {
        username: "test2",
        first_name: "Test2",
        last_name: "Tester2",
        email: "test2@test.com",
      },
    ]);
  });
});


describe("get", function () {
  test("succeeds", async function () {
    let user = await User.get("test");
    expect(user).toEqual({
      username: "test",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
      jobs: [{
        id: testJobIds[0],
        title: "Job1",
        company_handle: "c1",
        company_name: "C1",
        state: "applied",
      }],
    });
  });

  test("fails", async function () {
    expect.assertions(1);
    try {
      await User.get("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("update", function () {
  test("succeeds", async function () {
    let job = await User.update("test", {
      last_name: "Testingham",
    });
    expect(job).toEqual({
      username: "test",
      first_name: "Test",
      last_name: "Testingham",
      email: "test@test.com",
      is_admin: false,
    });
  });

  test("fails on username change attempt", async function () {
    expect.assertions(1);
    try {
      await User.update("test", {
        handle: "test-different",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await User.update("nope", {
        first_name: "test",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails if no data", async function () {
    expect.assertions(1);
    try {
      await User.update("test", {});
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("succeeds", async function () {
    await User.remove("test");
    const res = await db.query(
        "SELECT * FROM users WHERE username=$1", ["test"]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await User.remove("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("setJobState", function () {
  test("succeeds", async function () {
    await User.setJobState("test", testJobIds[1], "applied");
    const res = await db.query(
        "SELECT * FROM applications WHERE job_id=$1", [testJobIds[1]]);
    expect(res.rows).toEqual([{
      job_id: testJobIds[1],
      id: expect.any(Number),
      username: "test",
      state: "applied",
      created_at: expect.any(Date),
    }]);
  });

  test("succeeds for multiple states", async function () {
    await User.setJobState("test", testJobIds[1], "applied");
    await User.setJobState("test", testJobIds[1], "rejected");
    const res = await db.query(
        "SELECT * FROM applications WHERE job_id=$1", [testJobIds[1]]);
    expect(res.rows).toEqual([
      {
        job_id: testJobIds[1],
        username: "test",
        state: "applied",
        created_at: expect.any(Date),
        id: expect.any(Number),
      }, {
        job_id: testJobIds[1],
        username: "test",
        state: "rejected",
        created_at: expect.any(Date),
        id: expect.any(Number),
      },
    ]);
  });

  test("fails if job not found", async function () {
    expect.assertions(1);
    try {
      await User.setJobState("test", 0, "applied");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails if username not found", async function () {
    expect.assertions(1);
    try {
      await User.setJobState("nope", testJobIds[0], "applied");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
