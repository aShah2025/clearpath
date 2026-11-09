import { beforeEach, describe, expect, it, vi } from "vitest";
import { UnauthorizedError } from "@/lib/errors";

const requireUser = vi.fn();
const analyzeDocument = vi.fn();
vi.mock("@/lib/auth", () => ({ requireUser }));
vi.mock("@/lib/ai/analyze-document", () => ({ analyzeDocument }));

const { POST } = await import("./route");

const DOC_ID = "6f1d2c1e-8f4b-4a57-9a51-2c9e0f6b7d10";
const ctx = { params: Promise.resolve({ id: DOC_ID }) } as Parameters<typeof POST>[1];

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`http://test/api/documents/${DOC_ID}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

describe("POST /api/documents/[id]/analyze", () => {
  beforeEach(() => {
    requireUser.mockReset().mockResolvedValue({ id: "user-1", email: "a@test.local", name: null });
    analyzeDocument.mockReset().mockResolvedValue({ id: DOC_ID, status: "COMPLETED" });
  });

  it("analyzes for the signed-in user only", async () => {
    const response = await POST(post({ rawText: "A notice with enough text to analyze." }), ctx);
    expect(response.status).toBe(200);
    expect(analyzeDocument).toHaveBeenCalledWith("user-1", DOC_ID, "A notice with enough text to analyze.");
  });

  it("returns 401 when signed out, before reading the body", async () => {
    requireUser.mockRejectedValue(new UnauthorizedError());
    const response = await POST(post({ rawText: "A notice with enough text to analyze." }), ctx);
    expect(response.status).toBe(401);
    expect(analyzeDocument).not.toHaveBeenCalled();
  });

  it.each([
    ["missing rawText", {}],
    ["too-short text", { rawText: "short" }],
    ["wrong type", { rawText: 42 }],
  ])("returns 400 for %s", async (_name, body) => {
    const response = await POST(post(body), ctx);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("INVALID_REQUEST");
    expect(analyzeDocument).not.toHaveBeenCalled();
  });

  it("returns 400 for malformed JSON", async () => {
    const response = await POST(post("{not json"), ctx);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("INVALID_JSON");
  });

  it("returns 413 for oversized bodies", async () => {
    const response = await POST(post({ rawText: "x".repeat(1_100_000) }), ctx);
    expect(response.status).toBe(413);
  });

  it("hides unexpected errors behind a generic 500", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    analyzeDocument.mockRejectedValue(new Error("connection string postgres://secret"));
    const response = await POST(post({ rawText: "A notice with enough text to analyze." }), ctx);
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain("secret");
  });
});
