const baseUrl = "http://localhost:4000";
const apiKey = process.env.BOT_API_KEY ?? "replace-with-a-long-random-string";

type Check = {
  name: string;
  path: string;
  init?: RequestInit;
  expectedStatus: number;
  assert: (body: unknown) => boolean;
};

async function runCheck(check: Check) {
  const response = await fetch(`${baseUrl}${check.path}`, check.init);
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();
  const passed =
    response.status === check.expectedStatus && check.assert(body);

  console.log(`${passed ? "PASS" : "FAIL"} ${check.name} -> ${response.status}`);

  if (!passed) {
    console.log(body);
  }

  return passed;
}

async function main() {
  const checks: Check[] = [
    {
      name: "health",
      path: "/health",
      expectedStatus: 200,
      assert: (body) => typeof body === "object" && body !== null && "status" in body,
    },
    {
      name: "rooms",
      path: "/api/rooms",
      expectedStatus: 200,
      assert: (body) => Array.isArray(body),
    },
    {
      name: "room work1",
      path: "/api/rooms/work1",
      expectedStatus: 200,
      assert: (body) => typeof body === "object" && body !== null && "devices" in body,
    },
    {
      name: "room missing",
      path: "/api/rooms/does-not-exist",
      expectedStatus: 404,
      assert: (body) => typeof body === "object" && body !== null && "error" in body,
    },
    {
      name: "devices",
      path: "/api/devices",
      expectedStatus: 200,
      assert: (body) => Array.isArray(body),
    },
    {
      name: "usage",
      path: "/api/usage",
      expectedStatus: 200,
      assert: (body) => typeof body === "object" && body !== null && "totalWattsNow" in body,
    },
    {
      name: "alerts",
      path: "/api/alerts",
      expectedStatus: 200,
      assert: (body) => Array.isArray(body),
    },
    {
      name: "bot status",
      path: "/api/bot/status",
      init: {
        headers: {
          "x-api-key": apiKey,
        },
      },
      expectedStatus: 200,
      assert: (body) => typeof body === "object" && body !== null && "text" in body,
    },
  ];

  const results = await Promise.all(checks.map(runCheck));

  if (results.every(Boolean)) {
    console.log("Smoke test passed");
    return;
  }

  process.exit(1);
}

void main();
