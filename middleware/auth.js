"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and is_admin field.)
 *
 * It's not an error if no token was provided or if the token is invalid ---
 * this middleware is purely provided authentication, not authorization.
 *
 **/

function authenticateJWT(req, res, next) {
  try {
    const token = req.body._token;
    // The token is not needed after this middleware, so remove
    delete req.body._token;
    if (token) res.locals.user = jwt.verify(token, SECRET_KEY);
    return next();
  } catch (err) {
    console.warn("cannot authenticate token", err);
    return next();
  }
}

/** Middleware to use when they be logged in.
 *
 * If not, raises Unauthorized.
 **/

// This is written with an inner function to perform the security check or throw
// an error: this makes this easily unit-tested.

function _ensureLoggedIn(req, res) {
  if (!res.locals.user) throw new UnauthorizedError();
}

// The outer function can be integration tested when used in Express. This is
// the function that should be included as middleware.

function ensureLoggedIn(req, res, next) {
  try {
    _ensureLoggedIn(req, res);
    return next();
  } catch (err) {
    return next(err);
  }
}


/** Middleware to use when they be logged in as an admin user.
 *
 *  If not, raises Unauthorized.
 */

function _ensureAdmin(req, res) {
  if (!res.locals.user || !res.locals.user.is_admin) {
    throw new UnauthorizedError();
  }
}

function ensureAdmin(req, res, next) {
  try {
    _ensureAdmin(req, res);
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */

function _ensureCorrectUserOrAdmin(req, res) {
  const user = res.locals.user;
  if (!(user && (user.is_admin || user.username === req.params.username)))
    throw new UnauthorizedError();
}

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    _ensureCorrectUserOrAdmin(req, res);
    return next();
  } catch (err) {
    return next(err);
  }
}


module.exports = {
  authenticateJWT,
  _ensureLoggedIn,
  ensureLoggedIn,
  _ensureAdmin,
  ensureAdmin,
  _ensureCorrectUserOrAdmin,
  ensureCorrectUserOrAdmin,
};
