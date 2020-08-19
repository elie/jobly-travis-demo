const request = require("supertest");

const app = require("./app");
const db = require("./db");
const { NotFoundError } = require("./expressError");

test("404 handler", async function () {
  expect.assertions = 1;
  try {
    await request(app).get("/no-such-path");
  } catch (err) {
    expect(err instanceof NotFoundError).toBeTruthy();
  }
});

afterAll(function () {
  db.end();
});
