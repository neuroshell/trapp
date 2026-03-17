import jwt from "jsonwebtoken";

import { getUserById } from "../db/index.js";
import { errors } from "../utils/errors.js";
import { sanitizeForLog } from "./security.js";

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

    // SECURITY: Do NOT log auth header before validation - prevents log injection

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[AuthMiddleware] No Bearer token found");
      throw errors.unauthorized("No authentication token provided");
    }

    const token = authHeader.substring(7);

    // SECURITY: Validate token is not empty or too short to prevent bypass attempts
    if (!token || token.trim().length === 0) {
      console.log("[AuthMiddleware] Empty token provided");
      throw errors.unauthorized("No authentication token provided");
    }

    // SECURITY: Validate token has minimum JWT length (header.payload.signature)
    // Minimum valid JWT is ~20 chars (e.g., "eyJhbGciOiJIUzI1NiJ9.e30.signature")
    if (token.length < 20) {
      console.log("[AuthMiddleware] Token too short: " + token.length + " chars");
      throw errors.unauthorized("Invalid token format");
    }

    const decoded = verifyToken(token);

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

    // SECURITY: Log AFTER validation using sanitizeForLog()
    const safeUserId = sanitizeForLog(decoded.userId);
    console.log(
      "[AuthMiddleware] Authentication successful for user:",
      safeUserId,
    );
    next();
  } catch (error) {
    // SECURITY: Sanitize error messages before logging
    console.error("[AuthMiddleware] Error:", sanitizeForLog(error.message));
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

    // SECURITY: Validate token is not empty or too short to prevent bypass attempts
    if (!token || token.trim().length === 0 || token.length < 20) {
      return next(); // Silently skip - user remains unauthenticated
    }

    const decoded = verifyToken(token);
    req.user = decoded;
  } catch (error) {
    // Silent fail - user remains unauthenticated
  }
  next();
};
