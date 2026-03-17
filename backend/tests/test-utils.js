import { pbkdf2Sync } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { URL } from "node:url";

/**
 * Test utilities for backend tests
 */

/**
 * Close server gracefully
 */
export async function closeServer(server) {
  return new Promise((resolve) => {
    if (server && typeof server.close === "function") {
      server.close(resolve);
    } else {
      resolve();
    }
  });
}

/**
 * Create temporary database file path
 */
export async function createTempDb() {
  const tmpDir = await mkdtemp(join(tmpdir(), "trapp-test-"));
  const dbFile = join(tmpDir, "db.json");
  return { tmpDir, dbFile };
}

/**
 * Clean up temporary files
 */
export async function cleanupTemp(tmpDir) {
  await rm(tmpDir, { recursive: true, force: true });
}

/**
 * Hash password for testing (PBKDF2)
 */
export function hashPassword(password, salt = "trapp-test-salt-2026") {
  const iterations = 1000; // Reduced for test speed
  const keyLength = 32;
  const digest = "sha256";
  return pbkdf2Sync(password, salt, iterations, keyLength, digest).toString(
    "hex",
  );
}

/**
 * Make POST request to sync endpoint
 */
export async function postSync(base, data) {
  return fetch(`${base}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

/**
 * Make GET request to sync endpoint
 */
export async function getSync(base, params) {
  const url = new URL(`${base}/sync`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });
  return fetch(url.toString());
}

/**
 * Make authenticated request with JWT token
 */
export function authHeader(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function authenticatedRequest(
  base,
  endpoint,
  token,
  options = {},
) {
  return fetch(`${base}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

/**
 * Convert Map to object for assertions
 */
export function mapToObject(map) {
  if (!(map instanceof Map)) return map;
  const obj = {};
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

/**
 * Generate unique test identifier
 */
export function testId(prefix = "test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
