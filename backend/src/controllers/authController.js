const admin = require("firebase-admin");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} = require("firebase/auth");
const serviceAccount = require("../../config/firebaseServiceKey.json");
const { firebaseConfig } = require("../firebase");
const { response } = require("../utils/response");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const clientApp = initializeApp(firebaseConfig);
const clientAuth = getAuth(clientApp);

// REGISTER
const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Create user in Firebase using Client SDK
    const userCredential = await createUserWithEmailAndPassword(
      clientAuth,
      email,
      password
    );
    const user = userCredential.user;
    const token = await user.getIdToken();

    return response.ok(res, "User registered successfully", {
      user: {
        uid: user.uid,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Firebase register error:", error);
    return response.serverError(res, "User registration failed", error.message);
  }
};

// LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userCredential = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password
    );

    // Get ID token from Firebase
    const user = userCredential.user;
    const token = await user.getIdToken();

    return response.ok(res, "User logged in successfully", {
      user: {
        uid: user.uid,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    return response.unauthorized(res, error.message || "Login failed!");
  }
};

// Logout user
const logoutUser = async (req, res) => {
  try {
    return response.ok(res,"Logged out successfully");
  } catch (err) {
   return response.serverError(res, "Logout failed",err.message)
    };
  }

// GOOGLE LOGIN
const googleLoginUser = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return response.unauthorized(res, "No Google token provided");

    // Verify token with Firebase Admin
    const decoded = await admin.auth().verifyIdToken(token);

    // Build user object
    const user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || null,
      picture: decoded.picture || null,
    };

    return response.ok(res, "Google login successful", {
      user,
      token, // keep using Firebase ID token
    });
  } catch (error) {
    console.error("Google login error:", error);
    return response.unauthorized(res, "Google login failed!");
  }
};

module.exports = { registerUser, loginUser, logoutUser, googleLoginUser };
