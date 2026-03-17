import jwt from "jsonwebtoken";

import { getUserById } from "../db/index.js";
import { errors } from "../utils/errors.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production-min-32-chars";

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(userId, email) {
  return jwt.sign({ userId, email }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || "30d",
  });
}

/**
 * Verify JWT token and return decoded payload
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Authentication middleware
 * Validates JWT token from Authorization header
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    const safeAuthHeaderSnippet = authHeader
      ? authHeader.replace(/[\r\n]/g, "").substring(0, 30) + "..."
      : "none";

    console.log("[AuthMiddleware] Auth header:", safeAuthHeaderSnippet);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AuthMiddleware] No Bearer token found");
      throw errors.unauthorized("No authentication token provided");
    }

    const token = authHeader.substring(7);
    console.log(
      "[AuthMiddleware] Token extracted:",
      token.substring(0, 30) + "...",
    );

    const decoded = verifyToken(token);
    console.log("[AuthMiddleware] Token decoded:", JSON.stringify(decoded));

    if (!decoded.userId) {
      console.error("[AuthMiddleware] userId missing from decoded token!");
      console.error("[AuthMiddleware] Decoded:", JSON.stringify(decoded));
    }

    // Verify user exists in database
    const user = getUserById(decoded.userId);
    if (!user) {
      throw errors.unauthorized("User not found");
    }

    req.user = decoded;
    console.log(
      "[AuthMiddleware] Authentication successful for user:",
      decoded.userId,
    );
    next();
  } catch (error) {
    console.error("[AuthMiddleware] Error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid token",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token expired",
      });
    }
    next(error);
  }
};

/**
 * Optional authentication - attaches user if token valid, continues otherwise
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (error) {
    // Silent fail - user remains unauthenticated
  }
  next();
};
