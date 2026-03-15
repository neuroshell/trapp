import { test } from "node:test";
import assert from "node:assert";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

import { createServer } from "./index.js";

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
  const passwordHash = createHash("sha256")
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
