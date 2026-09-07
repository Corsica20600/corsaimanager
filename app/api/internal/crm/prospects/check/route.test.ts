import { beforeEach, describe, expect, it, vi } from "vitest";

const checkInternalCrmProspect = vi.fn();
vi.mock("@/lib/crm/repository", () => ({ checkInternalCrmProspect }));

describe("POST /api/internal/crm/prospects/check", () => {
  beforeEach(() => {
    vi.resetModules();
    checkInternalCrmProspect.mockReset();
    process.env.CORSAIMANAGER_API_KEY = "test-internal-key";
  });

  async function post(body: unknown, key = "test-internal-key") {
    const { POST } = await import("./route");
    return POST(new Request("http://localhost/api/internal/crm/prospects/check", { method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" }, body: JSON.stringify(body) }) as never);
  }

  it("refuse une clé absente ou erronée", async () => {
    const response = await post({ companyName: "Acme" }, "wrong");
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Non autorisé." });
  });

  it("retourne un client CRM sans exposer de secret", async () => {
    checkInternalCrmProspect.mockResolvedValue({ status: "CLIENT", prospectId: 7, clientId: 7, lastContactAt: "2026-09-01T10:00:00.000Z", lastOutcome: "client", refused: false, alreadyExported: true });
    const response = await post({ companyName: "Acme", email: "contact@acme.test" });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ status: "CLIENT", prospectId: 7, clientId: 7 });
  });

  it("retourne prospect ou unknown selon le lookup", async () => {
    checkInternalCrmProspect.mockResolvedValueOnce({ status: "PROSPECT", prospectId: 8, lastOutcome: "contacté", refused: false, alreadyExported: false });
    expect(await (await post({ website: "acme.test" })).json()).toMatchObject({ status: "PROSPECT" });
    checkInternalCrmProspect.mockResolvedValueOnce({ status: "UNKNOWN" });
    expect(await (await post({ phone: "+33 6 00 00 00 00" })).json()).toEqual({ status: "UNKNOWN" });
  });
});
