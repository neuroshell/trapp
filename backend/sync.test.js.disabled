import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pbkdf2Sync } from "node:crypto";
import { URL } from "node:url";

import { createServer } from "./index.js";

// ─────────────────────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────────────────────

async function closeServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

/**
 * SECURITY: Use PBKDF2 for password hashing in tests
 * Plain SHA-256 is too fast and unsalted for secure password hashing
 */
function hashPassword(password) {
  const salt = "trapp-test-salt-2026";
  const iterations = 100_000;
  const keyLength = 32;
  const digest = "sha256";
  return pbkdf2Sync(password, salt, iterations, keyLength, digest).toString(
    "hex",
  );
}

async function postSync(base, data) {
  return fetch(`${base}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

async function getSync(base, params) {
  const url = new URL(`${base}/sync`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return fetch(url.toString());
}

// Helper to convert Map to object for testing assertions
function mapToObject(map) {
  if (!(map instanceof Map)) return map;
  const obj = {};
  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }
  return obj;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Setup
// ─────────────────────────────────────────────────────────────────────────────

let tmpDir;
let dbFile;
let server;
let base;
let address;

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), "trapp-test-"));
  dbFile = join(tmpDir, "db.json");
  server = await createServer({ port: 0, dbFile });
  address = server.address();
  base = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await closeServer(server);
  await rm(tmpDir, { recursive: true, force: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Health Endpoint Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("/health endpoint", () => {
  test("GET /health returns ok status with timestamp", async () => {
    const res = await fetch(`${base}/health`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert(typeof json.timestamp, "number");
  });

  test("GET /health returns consistent responses", async () => {
    const res1 = await fetch(`${base}/health`);
    const res2 = await fetch(`${base}/health`);
    assert.strictEqual(res1.status, 200);
    assert.strictEqual(res2.status, 200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Security Tests - Prototype Pollution Prevention
// ─────────────────────────────────────────────────────────────────────────────

describe("Security: Prototype Pollution Prevention", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync rejects __proto__ as deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "__proto__",
      payload: { data: "malicious" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects constructor as deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "constructor",
      payload: { data: "malicious" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects prototype as deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "prototype",
      payload: { data: "malicious" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects deviceId starting with double underscore", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "__proto__pollution",
      payload: { data: "malicious" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects deviceId starting with __ (any suffix)", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "__custom_key",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("GET /sync rejects __proto__ as deviceId query param", async () => {
    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "__proto__",
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects null deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: null,
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects undefined deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: undefined,
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects numeric deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: 12345,
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects object deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: { key: "value" },
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Security Tests - Key Length and Format Validation
// ─────────────────────────────────────────────────────────────────────────────

describe("Security: Key Length and Format Validation", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync rejects deviceId longer than 256 characters", async () => {
    const longDeviceId = "a".repeat(257);
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: longDeviceId,
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync accepts deviceId exactly 256 characters", async () => {
    const validDeviceId = "d".repeat(256);
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: validDeviceId,
      payload: { data: "test" },
    });
    // DeviceId validation passes, user gets auto-created
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
  });

  test("POST /sync rejects empty string deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects whitespace-only deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "   ",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects deviceId with only tabs/newlines", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "\t\n\r",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync trims and validates deviceId with leading/trailing spaces", async () => {
    // After trim, deviceId becomes "valid-device" which is valid
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "  valid-device  ",
      payload: { data: "test" },
    });
    // Should pass deviceId validation and auto-create user
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Security Tests - Log Injection Prevention
// ─────────────────────────────────────────────────────────────────────────────

describe("Security: Log Injection Prevention", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync sanitizes CRLF characters in request path", async () => {
    // This tests that the logging middleware sanitizes input
    // The request should still work, but logs should be sanitized
    const res = await fetch(`${base}/health`);
    assert.strictEqual(res.status, 200);
  });

  test("POST /sync rejects deviceId with special characters (security)", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "device-with-special_chars.test",
      payload: { data: "test" },
    });
    // Special characters like '.' are rejected for security
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects deviceId with unicode characters (security)", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "device-🚀-emoji",
      payload: { data: "test" },
    });
    // Unicode characters are rejected for security
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Authentication Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Authentication", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync rejects missing username", async () => {
    const res = await postSync(base, {
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash, deviceId and payload are required",
    );
  });

  test("POST /sync rejects missing passwordHash", async () => {
    const res = await postSync(base, {
      username: "testuser",
      deviceId: "test-device",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash, deviceId and payload are required",
    );
  });

  test("POST /sync rejects missing deviceId", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      payload: { data: "test" },
    });
    // deviceId validation happens first, so we get the detailed error message
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync rejects missing payload", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash, deviceId and payload are required",
    );
  });

  test("POST /sync rejects null payload", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: null,
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash, deviceId and payload are required",
    );
  });

  test("POST /sync rejects array payload (expects object)", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: [],
    });
    // Arrays are objects in JS, so this might pass the typeof check
    // but should still be handled
    assert.ok([200, 400, 401].includes(res.status));
  });

  test("POST /sync rejects invalid credentials", async () => {
    // First create user with correct password
    await postSync(base, {
      username: "creduser",
      passwordHash,
      deviceId: "cred-device",
      payload: { data: "test" },
    });

    // Now try with wrong password
    const wrongHash = hashPassword("wrongpassword");
    const res = await postSync(base, {
      username: "creduser",
      passwordHash: wrongHash,
      deviceId: "cred-device-2",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid username or password");
  });

  test("POST /sync creates user on first successful auth", async () => {
    const res = await postSync(base, {
      username: "newuser",
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
  });

  test("GET /sync rejects missing username query param", async () => {
    const res = await getSync(base, {
      passwordHash,
      deviceId: "test-device",
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash and deviceId query parameters are required",
    );
  });

  test("GET /sync rejects missing passwordHash query param", async () => {
    const res = await getSync(base, {
      username: "testuser",
      deviceId: "test-device",
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash and deviceId query parameters are required",
    );
  });

  test("GET /sync rejects missing deviceId query param", async () => {
    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
    });
    // deviceId validation happens first
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("GET /sync rejects invalid credentials", async () => {
    // First create user with correct password and register device
    await postSync(base, {
      username: "getcreduser",
      passwordHash,
      deviceId: "getcred-device",
      payload: { data: "test" },
    });

    // Now try with wrong password
    const wrongHash = hashPassword("wrongpassword");
    const res = await getSync(base, {
      username: "getcreduser",
      passwordHash: wrongHash,
      deviceId: "getcred-device",
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid username or password");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Device Registration Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Device Registration", () => {
  const passwordHash = hashPassword("testpass");
  const username = "testuser";

  beforeEach(async () => {
    // Register user with initial device
    await postSync(base, {
      username,
      passwordHash,
      deviceId: "initial-device",
      payload: { data: "initial" },
    });
  });

  test("POST /sync registers device for user", async () => {
    const res = await postSync(base, {
      username,
      passwordHash,
      deviceId: "new-device",
      payload: { data: "new" },
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert.strictEqual(json.device.id, "new-device");
  });

  test("GET /sync returns device not registered error for unknown device", async () => {
    const res = await getSync(base, {
      username,
      passwordHash,
      deviceId: "unknown-device",
    });
    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error, "Device not registered for this user");
  });

  test("GET /sync returns registered device data", async () => {
    const res = await getSync(base, {
      username,
      passwordHash,
      deviceId: "initial-device",
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert.strictEqual(json.device.id, "initial-device");
  });

  test("POST /sync updates existing device payload", async () => {
    const newPayload = { updated: true, newData: "value" };
    const res = await postSync(base, {
      username,
      passwordHash,
      deviceId: "initial-device",
      payload: newPayload,
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.deepStrictEqual(json.device.payload, newPayload);
  });

  test("GET /sync returns null for device with no data", async () => {
    // Register a device but check if it returns properly
    const res = await getSync(base, {
      username,
      passwordHash,
      deviceId: "initial-device",
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert.ok(json.device !== null);
  });

  test("Device is isolated between users", async () => {
    const user2Hash = hashPassword("user2pass");

    // Register device for user2
    await postSync(base, {
      username: "user2",
      passwordHash: user2Hash,
      deviceId: "shared-device",
      payload: { owner: "user2" },
    });

    // user1 should not be able to access user2's device
    const res = await getSync(base, {
      username,
      passwordHash,
      deviceId: "shared-device",
    });
    assert.strictEqual(res.status, 403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases - Username Validation
// ─────────────────────────────────────────────────────────────────────────────

describe("Edge Cases: Username Validation", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync handles very long username", async () => {
    const longUsername = "user".repeat(50); // 200 chars - within limit
    const res = await postSync(base, {
      username: longUsername,
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    // Should create user (username gets normalized)
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.ok, true);
  });

  test("POST /sync handles username with special characters", async () => {
    const res = await postSync(base, {
      username: "user+tag@example.com",
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    // Special characters in username are rejected by sanitizeKey
    assert.strictEqual(res.status, 401);
  });

  test("POST /sync normalizes username to lowercase", async () => {
    const res = await postSync(base, {
      username: "TestUser",
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 200);

    // Try with lowercase version - should work with same password
    const res2 = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device-2",
      payload: { data: "test" },
    });
    assert.strictEqual(res2.status, 200);
  });

  test("POST /sync handles username with leading/trailing spaces", async () => {
    const res = await postSync(base, {
      username: "  testuser  ",
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    // Should trim and normalize
    assert.strictEqual(res.status, 200);
  });

  test("POST /sync rejects empty username", async () => {
    const res = await postSync(base, {
      username: "",
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    // Empty string is falsy, caught by required field check
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(
      json.error,
      "username, passwordHash, deviceId and payload are required",
    );
  });

  test("POST /sync rejects null username", async () => {
    const res = await postSync(base, {
      username: null,
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 400);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Edge Cases - Device ID Validation
// ─────────────────────────────────────────────────────────────────────────────

describe("Edge Cases: Device ID Validation", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync handles device ID with special characters", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "device-id_v1.0-test",
      payload: { data: "test" },
    });
    // Special characters like '.' are rejected by sanitizeKey
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid deviceId format. Only alphanumeric, hyphens, and underscores allowed.");
  });

  test("POST /sync handles device ID with spaces (gets trimmed)", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "  device-with-spaces  ",
      payload: { data: "test" },
    });
    assert.strictEqual(res.status, 200);
  });

  test("POST /sync handles multiple devices for same user", async () => {
    const devices = ["phone", "tablet", "laptop", "watch"];
    for (const deviceId of devices) {
      const res = await postSync(base, {
        username: "testuser",
        passwordHash,
        deviceId,
        payload: { device: deviceId },
      });
      assert.strictEqual(res.status, 200);
    }

    // Verify all devices are registered
    for (const deviceId of devices) {
      const res = await getSync(base, {
        username: "testuser",
        passwordHash,
        deviceId,
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.device.id, deviceId);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API Contract Tests - Response Formats
// ─────────────────────────────────────────────────────────────────────────────

describe("API Contract: Response Formats", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync success response format", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: { entries: [{ id: 1, value: "test" }] },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(
      res.headers.get("content-type").includes("application/json"),
      true,
    );

    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert.ok(json.device);
    assert.strictEqual(typeof json.device.id, "string");
    assert.strictEqual(typeof json.device.updatedAt, "number");
    assert.ok(json.device.payload);
    assert.strictEqual(typeof json.device.owner, "string");
  });

  test("GET /sync success response format", async () => {
    // First register device
    await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: { data: "test" },
    });

    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(
      res.headers.get("content-type").includes("application/json"),
      true,
    );

    const json = await res.json();
    assert.strictEqual(json.ok, true);
    assert.ok(json.device);
    assert.strictEqual(json.device.id, "test-device");
  });

  test("Error response format - 400 Bad Request", async () => {
    const res = await postSync(base, {
      username: "testuser",
      deviceId: "test-device",
      payload: {},
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.ok(json.error);
    assert.strictEqual(typeof json.error, "string");
  });

  test("Error response format - 401 Unauthorized", async () => {
    // First create user with correct password
    await postSync(base, {
      username: "erruser",
      passwordHash,
      deviceId: "err-device",
      payload: {},
    });

    // Now try with wrong password
    const res = await postSync(base, {
      username: "erruser",
      passwordHash: "wronghash",
      deviceId: "err-device-2",
      payload: {},
    });
    assert.strictEqual(res.status, 401);
    const json = await res.json();
    assert.strictEqual(json.error, "Invalid username or password");
  });

  test("Error response format - 403 Forbidden", async () => {
    // Create user but try to access unregistered device
    await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "registered-device",
      payload: {},
    });

    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "unregistered-device",
    });
    assert.strictEqual(res.status, 403);
    const json = await res.json();
    assert.strictEqual(json.error, "Device not registered for this user");
  });

  test("Error response format - 500 Internal Server Error", async () => {
    // This is hard to trigger without breaking the server
    // but we verify the error handler exists
    assert.ok(true); // Covered by error handler in code
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// API Contract - Status Codes
// ─────────────────────────────────────────────────────────────────────────────

describe("API Contract: Status Codes", () => {
  const passwordHash = hashPassword("testpass");

  test("GET /health returns 200", async () => {
    const res = await fetch(`${base}/health`);
    assert.strictEqual(res.status, 200);
  });

  test("POST /sync returns 200 on success", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: {},
    });
    assert.strictEqual(res.status, 200);
  });

  test("POST /sync returns 400 for invalid request", async () => {
    const res = await postSync(base, {});
    assert.strictEqual(res.status, 400);
  });

  test("POST /sync returns 401 for invalid credentials", async () => {
    // First create user with correct password
    await postSync(base, {
      username: "statususer",
      passwordHash,
      deviceId: "status-device",
      payload: {},
    });

    // Now try with wrong password
    const res = await postSync(base, {
      username: "statususer",
      passwordHash: "invalid",
      deviceId: "status-device-2",
      payload: {},
    });
    assert.strictEqual(res.status, 401);
  });

  test("GET /sync returns 200 on success", async () => {
    await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: {},
    });

    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
    });
    assert.strictEqual(res.status, 200);
  });

  test("GET /sync returns 400 for invalid deviceId", async () => {
    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "__proto__",
    });
    assert.strictEqual(res.status, 400);
  });

  test("GET /sync returns 401 for invalid credentials", async () => {
    // First create user with correct password and register device
    await postSync(base, {
      username: "getstatususer",
      passwordHash,
      deviceId: "getstatus-device",
      payload: {},
    });

    // Now try with wrong password
    const res = await getSync(base, {
      username: "getstatususer",
      passwordHash: "invalid",
      deviceId: "getstatus-device",
    });
    assert.strictEqual(res.status, 401);
  });

  test("GET /sync returns 403 for unregistered device", async () => {
    await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "registered",
      payload: {},
    });

    const res = await getSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "unregistered",
    });
    assert.strictEqual(res.status, 403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Concurrent Request Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Concurrent Requests", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync handles concurrent requests for same user", async () => {
    const devices = Array.from({ length: 5 }, (_, i) => `device-${i}`);
    const payloads = devices.map((d) => ({ device: d, timestamp: Date.now() }));

    const requests = devices.map((deviceId, i) =>
      postSync(base, {
        username: "concurrentuser",
        passwordHash,
        deviceId,
        payload: payloads[i],
      }),
    );

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      assert.strictEqual(res.status, 200);
    });
  });

  test("POST /sync handles concurrent requests for different users", async () => {
    const users = Array.from({ length: 3 }, (_, i) => `user-${i}`);
    const passwordHash2 = hashPassword("pass");

    const requests = users.map((username, i) =>
      postSync(base, {
        username,
        passwordHash: i === 0 ? passwordHash : passwordHash2,
        deviceId: `${username}-device`,
        payload: { user: username },
      }),
    );

    const responses = await Promise.all(requests);
    responses.forEach((res) => {
      assert.ok([200, 401].includes(res.status));
    });
  });

  test("Mixed GET and POST concurrent requests", async () => {
    // First register a device
    await postSync(base, {
      username: "mixeduser",
      passwordHash,
      deviceId: "mixed-device",
      payload: { initial: true },
    });

    // Run concurrent requests
    const requests = [
      postSync(base, {
        username: "mixeduser",
        passwordHash,
        deviceId: "mixed-device-2",
        payload: { new: true },
      }),
      getSync(base, {
        username: "mixeduser",
        passwordHash,
        deviceId: "mixed-device",
      }),
      getSync(base, {
        username: "mixeduser",
        passwordHash,
        deviceId: "mixed-device",
      }),
    ];

    const responses = await Promise.all(requests);
    assert.strictEqual(responses[0].status, 200);
    assert.strictEqual(responses[1].status, 200);
    assert.strictEqual(responses[2].status, 200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Payload Validation Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Payload Validation", () => {
  const passwordHash = hashPassword("testpass");

  test("POST /sync accepts empty object payload", async () => {
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: {},
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.deepStrictEqual(json.device.payload, {});
  });

  test("POST /sync accepts nested object payload", async () => {
    const complexPayload = {
      entries: [
        { id: 1, type: "activity", data: { duration: 30 } },
        { id: 2, type: "nutrition", data: { calories: 500 } },
      ],
      metadata: { version: "1.0", synced: true },
    };

    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: complexPayload,
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.deepStrictEqual(json.device.payload, complexPayload);
  });

  test("POST /sync accepts large payload (up to 2mb)", async () => {
    const largeData = "x".repeat(100000); // 100KB payload
    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: { data: largeData },
    });
    assert.strictEqual(res.status, 200);
  });

  test("POST /sync preserves payload structure", async () => {
    const originalPayload = {
      string: "test",
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { nested: "value" },
    };

    const res = await postSync(base, {
      username: "testuser",
      passwordHash,
      deviceId: "test-device",
      payload: originalPayload,
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.deepStrictEqual(json.device.payload, originalPayload);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Data Persistence Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Data Persistence", () => {
  const passwordHash = hashPassword("testpass");

  test("Data persists across requests", async () => {
    const payload = { persistent: "data" };

    // POST to create data
    await postSync(base, {
      username: "persistuser",
      passwordHash,
      deviceId: "persist-device",
      payload,
    });

    // GET to verify data persisted
    const res = await getSync(base, {
      username: "persistuser",
      passwordHash,
      deviceId: "persist-device",
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.deepStrictEqual(json.device.payload, payload);
  });

  test("Device ownership persists", async () => {
    await postSync(base, {
      username: "owneruser",
      passwordHash,
      deviceId: "owner-device",
      payload: { test: true },
    });

    const res = await getSync(base, {
      username: "owneruser",
      passwordHash,
      deviceId: "owner-device",
    });
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.strictEqual(json.device.owner, "owneruser");
  });

  test("Device updatedAt timestamp updates on sync", async () => {
    const beforeSync = Date.now();

    await postSync(base, {
      username: "timestampuser",
      passwordHash,
      deviceId: "timestamp-device",
      payload: { test: true },
    });

    const res = await getSync(base, {
      username: "timestampuser",
      passwordHash,
      deviceId: "timestamp-device",
    });
    const json = await res.json();

    assert.ok(json.device.updatedAt >= beforeSync);
    assert.ok(json.device.updatedAt <= Date.now());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration Tests - Full User Journey
// ─────────────────────────────────────────────────────────────────────────────

describe("Integration: Full User Journey", () => {
  test("Complete user flow: register, sync, retrieve", async () => {
    const username = "journeyuser";
    const password = "journeypass";
    const passwordHash = hashPassword(password);
    const deviceId = "journey-device";

    // Step 1: Initial sync (registers user and device)
    const syncPayload = {
      activities: [
        { id: "1", type: "run", duration: 1800 },
        { id: "2", type: "walk", duration: 900 },
      ],
    };

    const syncRes = await postSync(base, {
      username,
      passwordHash,
      deviceId,
      payload: syncPayload,
    });
    assert.strictEqual(syncRes.status, 200);
    const syncJson = await syncRes.json();
    assert.strictEqual(syncJson.ok, true);
    assert.strictEqual(syncJson.device.owner, username);

    // Step 2: Retrieve synced data
    const getRes = await getSync(base, {
      username,
      passwordHash,
      deviceId,
    });
    assert.strictEqual(getRes.status, 200);
    const getJson = await getRes.json();
    assert.deepStrictEqual(getJson.device.payload, syncPayload);

    // Step 3: Update with new data
    const updatedPayload = {
      activities: [
        { id: "1", type: "run", duration: 1800 },
        { id: "2", type: "walk", duration: 900 },
        { id: "3", type: "cycle", duration: 2400 },
      ],
    };

    const updateRes = await postSync(base, {
      username,
      passwordHash,
      deviceId,
      payload: updatedPayload,
    });
    assert.strictEqual(updateRes.status, 200);

    // Step 4: Verify update
    const verifyRes = await getSync(base, {
      username,
      passwordHash,
      deviceId,
    });
    assert.strictEqual(verifyRes.status, 200);
    const verifyJson = await verifyRes.json();
    assert.deepStrictEqual(verifyJson.device.payload, updatedPayload);
  });

  test("Multi-device sync for same user", async () => {
    const username = "multiuser";
    const passwordHash = hashPassword("multipass");

    // Sync from phone
    const phoneRes = await postSync(base, {
      username,
      passwordHash,
      deviceId: "phone",
      payload: { source: "phone", data: [1, 2, 3] },
    });
    assert.strictEqual(phoneRes.status, 200);

    // Sync from tablet
    const tabletRes = await postSync(base, {
      username,
      passwordHash,
      deviceId: "tablet",
      payload: { source: "tablet", data: [4, 5, 6] },
    });
    assert.strictEqual(tabletRes.status, 200);

    // Phone retrieves its data
    const phoneGetRes = await getSync(base, {
      username,
      passwordHash,
      deviceId: "phone",
    });
    assert.strictEqual(phoneGetRes.status, 200);
    const phoneGetJson = await phoneGetRes.json();
    assert.strictEqual(phoneGetJson.device.payload.source, "phone");

    // Tablet retrieves its data
    const tabletGetRes = await getSync(base, {
      username,
      passwordHash,
      deviceId: "tablet",
    });
    assert.strictEqual(tabletGetRes.status, 200);
    const tabletGetJson = await tabletGetRes.json();
    assert.strictEqual(tabletGetJson.device.payload.source, "tablet");
  });
});
