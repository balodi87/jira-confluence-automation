// Prototype-only auth: simulates the OIDC/role decisions from spec/plan.md §1
// with a local login stub (no real identity provider available in this
// environment). NOT suitable for production use.
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-do-not-use-in-prod";

function login(req, res) {
  const { username, role } = req.body || {};
  if (!username || !["viewer", "actor"].includes(role)) {
    return res.status(400).json({ error: "username and role ('viewer'|'actor') are required" });
  }
  const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: "8h" });
  res.json({ token, username, role });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireActor(req, res, next) {
  if (!req.user || req.user.role !== "actor") {
    return res.status(403).json({ error: "Requires 'actor' role" });
  }
  next();
}

module.exports = { login, requireAuth, requireActor };
