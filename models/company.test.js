"use strict";

const db = require("../db.js");
const Company = require("./company.js");
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


describe("findAll", function () {
  test("all", async function () {
    let companies = await Company.findAll();
    expect(companies).toEqual([
      { handle: "c1", name: "C1" },
      { handle: "c2", name: "C2" },
      { handle: "c3", name: "C3" },
    ]);
  });

  test("by min employees", async function () {
    let companies = await Company.findAll({ minEmployees: 2 });
    expect(companies).toEqual([
      { handle: "c2", name: "C2" },
      { handle: "c3", name: "C3" },
    ]);
  });

  test("by max employees", async function () {
    let companies = await Company.findAll({ maxEmployees: 2 });
    expect(companies).toEqual([
      { handle: "c1", name: "C1" },
      { handle: "c2", name: "C2" },
    ]);
  });

  test("by min-max employees", async function () {
    let companies = await Company.findAll(
        { minEmployees: 1, maxEmployees: 1 });
    expect(companies).toEqual([
      { handle: "c1", name: "C1" },
    ]);
  });

  test("by name", async function () {
    let companies = await Company.findAll({ name: "1" });
    expect(companies).toEqual([
      { handle: "c1", name: "C1" },
    ]);
  });

  test("fail if invalid min > max", async function () {
    expect.assertions(1);
    try {
      await Company.findAll({ minEmployees: 10, maxEmployees: 1 });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("get", function () {
  test("succeeds", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      num_employees: 1,
      description: "Desc1",
      logo_url: "http://c1.img",
      jobs: [
        { id: testJobIds[0], title: "Job1", salary: 100, equity: "0.1" },
        { id: testJobIds[1], title: "Job2", salary: 200, equity: "0.2" },
        { id: testJobIds[2], title: "Job3", salary: 300, equity: "0" },
        { id: testJobIds[3], title: "Job4", salary: null, equity: null },
      ],
    });
  });

  test("fails", async function () {
    expect.assertions(1);
    try {
      await Company.get("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe("create", function () {
  test("succeeds", async function () {
    let company = await Company.create({
      handle: "test",
      name: "Test",
      num_employees: 1,
      description: "Test Description",
      logo_url: "http://test.img",
    });
    expect(company).toEqual({
      handle: "test",
      name: "Test",
      num_employees: 1,
      description: "Test Description",
      logo_url: "http://test.img",
    });
    const result = await db.query(`SELECT *
                                   FROM companies
                                   WHERE handle = 'test'`);
    expect(result.rows).toEqual([
      {
        handle: "test",
        name: "Test",
        num_employees: 1,
        description: "Test Description",
        logo_url: "http://test.img",
      },
    ]);
  });

  test("fails with dupe", async function () {
    expect.assertions(1);
    try {
      await Company.create({
        handle: "c1",
        name: "Test",
        num_employees: 1,
        description: "Test Description",
        logo_url: "http://test.img",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("succeeds", async function () {
    let company = await Company.update("c1", {
      name: "New",
    });
    expect(company).toEqual({
      handle: "c1",
      name: "New",
      num_employees: 1,
      description: "Desc1",
      logo_url: "http://c1.img",
    });

    const result = await db.query(`SELECT *
                                   FROM companies
                                   WHERE handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        handle: "c1",
        name: "New",
        num_employees: 1,
        description: "Desc1",
        logo_url: "http://c1.img",
      },
    ]);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Company.update("nope", {
        name: "New",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with no data", async function () {
    expect.assertions(1);
    try {
      await Company.update("c1", {});
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("succeeds", async function () {
    await Company.remove("c1");
    const res = await db.query(
        "SELECT * FROM companies WHERE handle=$1", ["c1"]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Company.remove("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
