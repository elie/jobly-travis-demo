"use strict";

const db = require("../db.js");
const Job = require("./job.js");
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
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      { id: testJobIds[0], title: "Job1", company_handle: "c1" },
      { id: testJobIds[1], title: "Job2", company_handle: "c1" },
      { id: testJobIds[2], title: "Job3", company_handle: "c1" },
      { id: testJobIds[3], title: "Job4", company_handle: "c1" },
    ]);
  });

  test("by min salary", async function () {
    let jobs = await Job.findAll({ minSalary: 250 });
    expect(jobs).toEqual([
      { id: testJobIds[2], title: "Job3", company_handle: "c1" },
    ]);
  });

  test("by equity", async function () {
    let jobs = await Job.findAll({ hasEquity: true });
    expect(jobs).toEqual([
      { id: testJobIds[0], title: "Job1", company_handle: "c1" },
      { id: testJobIds[1], title: "Job2", company_handle: "c1" },
    ]);
  });

  test("by min salary & equity", async function () {
    let jobs = await Job.findAll({ minSalary: 150, hasEquity: true });
    expect(jobs).toEqual([
      { id: testJobIds[1], title: "Job2", company_handle: "c1" },
    ]);
  });

  test("by name", async function () {
    let jobs = await Job.findAll({ title: "ob1" });
    expect(jobs).toEqual([
      { id: testJobIds[0], title: "Job1", company_handle: "c1" },
    ]);
  });
});


describe("get", function () {
  test("succeeds", async function () {
    let job = await Job.get(testJobIds[0]);
    expect(job).toEqual({
      id: testJobIds[0],
      title: "Job1",
      salary: 100,
      equity: "0.1",
      company: {
        name: "C1",
        handle: "c1",
        num_employees: 1,
        description: "Desc1",
        logo_url: "http://c1.img",
      },
    });
  });

  test("fails", async function () {
    expect.assertions(1);
    try {
      await Job.get(0);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("create", function () {
  test("succeeds", async function () {
    let job = await Job.create({
      company_handle: "c1",
      title: "Test",
      salary: 100,
      equity: "0.1",
    });
    expect(job).toEqual({
      company_handle: "c1",
      title: "Test",
      salary: 100,
      equity: "0.1",
      id: expect.any(Number),
    });
  });
});


describe("update", function () {
  test("succeeds", async function () {
    let job = await Job.update(testJobIds[0], {
      title: "Job1-New",
    });
    expect(job).toEqual({
      id: testJobIds[0],
      title: "Job1-New",
      salary: 100,
      equity: "0.1",
      company_handle: "c1",
    });
  });

  test("fails on handle change attempt", async function () {
    expect.assertions(1);
    try {
      await Job.update(testJobIds[0], {
        company_handle: "nope",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Job.update(0, {
        title: "test",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with no data", async function () {
    expect.assertions(1);
    try {
      await Job.update(testJobIds[0], {});
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("succeeds", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        "SELECT * FROM jobs WHERE id=$1", [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Job.remove("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
