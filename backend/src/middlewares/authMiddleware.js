const admin = require("firebase-admin");
const { response } = require("../utils/response");

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.unauthorized(res, "No token provided");
    }
    const token = authHeader.split(" ")[1];

    // Verify token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);
    // Attach user info to request
    req.user = decoded;
    next();
  } catch (error) {
    return response.unauthorized(res, "Invalid or expired token");
  }
};

module.exports = verifyFirebaseToken;
