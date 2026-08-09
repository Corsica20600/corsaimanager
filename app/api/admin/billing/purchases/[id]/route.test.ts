import { beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE } from "./route";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { deleteImportedPurchaseInvoice } from "@/lib/billing/purchases";
import { revalidatePath } from "next/cache";

vi.mock("@/lib/admin-auth", () => ({
  isAdminAuthenticated: vi.fn(),
}));

vi.mock("@/lib/billing/purchases", () => ({
  deleteImportedPurchaseInvoice: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const authMock = vi.mocked(isAdminAuthenticated);
const deleteMock = vi.mocked(deleteImportedPurchaseInvoice);
const revalidatePathMock = vi.mocked(revalidatePath);

describe("DELETE /api/admin/billing/purchases/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("supprime un achat importé et revalide la liste et la fiche", async () => {
    authMock.mockResolvedValueOnce(true);
    deleteMock.mockResolvedValueOnce({ id: 42, blobCleanupWarnings: 0 });

    const response = await DELETE(
      new Request("http://localhost/api/admin/billing/purchases/42", {
        method: "DELETE",
        body: JSON.stringify({ reason: "Volotea importée par erreur" }),
      }),
      { params: Promise.resolve({ id: "42" }) },
    );

    await expect(response.json()).resolves.toEqual({ ok: true, id: 42, blobCleanupWarnings: 0 });
    expect(response.status).toBe(200);
    expect(deleteMock).toHaveBeenCalledWith(42, "Volotea importée par erreur");
    expect(revalidatePathMock).toHaveBeenCalledWith("/ventes/achats");
    expect(revalidatePathMock).toHaveBeenCalledWith("/ventes/achats/42");
  });

  it("refuse une suppression sans session admin", async () => {
    authMock.mockResolvedValueOnce(false);

    const response = await DELETE(new Request("http://localhost/api/admin/billing/purchases/42", { method: "DELETE" }), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(response.status).toBe(401);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("refuse un identifiant invalide avant de toucher au service", async () => {
    authMock.mockResolvedValueOnce(true);

    const response = await DELETE(new Request("http://localhost/api/admin/billing/purchases/042", { method: "DELETE" }), {
      params: Promise.resolve({ id: "042" }),
    });

    expect(response.status).toBe(400);
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
