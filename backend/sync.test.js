const { test } = require("node:test");
const assert = require("node:assert").strict;
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const { createServer } = require("./index");

async function closeServer(server) {
  await new Promise((resolve) => server.close(resolve));
}

test("backend /health and /sync endpoints work", async () => {
  const tmp = await mkdtemp(join(tmpdir(), "trapp-test-"));
  const dbFile = join(tmp, "db.json");

  const server = await createServer({ port: 0, dbFile });
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}`;

  const healthRes = await fetch(`${base}/health`);
  const healthJson = await healthRes.json();
  assert.strictEqual(healthJson.ok, true);

  const username = "testuser";
  const passwordHash = require("crypto")
    .createHash("sha256")
    .update("secret", "utf8")
    .digest("hex");

  const payload = { entries: [] };
  const syncRes = await fetch(`${base}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      passwordHash,
      deviceId: "test-device",
      payload,
    }),
  });

  const syncJson = await syncRes.json();
  assert.strictEqual(syncJson.ok, true);
  assert.strictEqual(syncJson.device.id, "test-device");
  assert.deepStrictEqual(syncJson.device.payload, payload);

  const fetchRes = await fetch(
    `${base}/sync?username=${encodeURIComponent(username)}&passwordHash=${encodeURIComponent(passwordHash)}&deviceId=test-device`,
  );
  const fetchJson = await fetchRes.json();
  assert.strictEqual(fetchJson.ok, true);
  assert.deepStrictEqual(fetchJson.device.payload, payload);

  await closeServer(server);
  await rm(tmp, { recursive: true, force: true });
});
