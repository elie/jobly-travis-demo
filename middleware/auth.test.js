"use strict";

const jwt = require("jsonwebtoken");
const {
  authenticateJWT,
  _ensureLoggedIn,
  _ensureAdmin,
  _ensureCorrectUserOrAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", is_admin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", is_admin: false }, "wrong");

describe("authenticateJWT", function () {
  test("success via body", async function () {
    const req = { body: { _token: testJwt } };
    const res = { locals: {} };
    const next = function () {
    };
    await authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        is_admin: false,
      },
    });
  });

  test("no token", async function () {
    const req = { body: {} };
    const res = { locals: {} };
    const next = function () {
    };
    await authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("invalid token", async function () {
    const req = { body: { _token: badJwt } };
    const res = { locals: {} };
    const next = function () {
    };
    await authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("_ensureLoggedIn", function () {
  test("success", function () {
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    _ensureLoggedIn(req, res);
  });

  test("failure", function () {
    expect.assertions = 1;
    const req = {};
    const res = { locals: {} };
    try {
      _ensureLoggedIn(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("_ensureAdmin", function () {
  test("success", function () {
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: true } } };
    _ensureAdmin(req, res);
  });

  test("failure: not admin", function () {
    expect.assertions = 1;
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    try {
      _ensureAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("failure: not auth", function () {
    expect.assertions = 1;
    const req = {};
    const res = { locals: {} };
    try {
      _ensureAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("_ensureCorrectUserOrAdmin", function () {
  test("success: admin", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "admin", is_admin: true } } };
    _ensureCorrectUserOrAdmin(req, res);
  });

  test("success: same user", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", is_admin: false } } };
    _ensureCorrectUserOrAdmin(req, res);
  });

  test("failure: mismatch", function () {
    expect.assertions = 1;
    const req = { params: { username: "wrong" } };
    const res = { locals: { user: { username: "test", is_admin: false } } };
    try {
      _ensureCorrectUserOrAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("failure: not auth", function () {
    expect.assertions = 1;
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    try {
      _ensureAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});