const url = "http://localhost:4000/sync";

async function main() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: "test-device",
        payload: { entries: [] },
      }),
    });
    const body = await res.text();
    console.log("status", res.status);
    console.log("body", body);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
