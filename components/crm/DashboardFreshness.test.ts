import { expect, it } from "vitest";
import { DASHBOARD_REFRESH_INTERVAL_MS } from "./DashboardFreshness";

it("rafraîchit le tableau commercial toutes les 60 secondes", () => {
  expect(DASHBOARD_REFRESH_INTERVAL_MS).toBe(60_000);
});
