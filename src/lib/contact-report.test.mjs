import { describe, expect, it } from "bun:test";

import { contactReportKeyMatches, contactRowsToCsv } from "./contact-report.ts";

describe("private contact report", () => {
  it("accepts only the configured access code", async () => {
    expect(await contactReportKeyMatches("reader-code", "reader-code")).toBe(true);
    expect(await contactReportKeyMatches("wrong-code", "reader-code")).toBe(false);
    expect(await contactReportKeyMatches("reader-code", undefined)).toBe(false);
    expect(await contactReportKeyMatches("x".repeat(513), "reader-code")).toBe(false);
  });

  it("quotes fields and neutralizes spreadsheet formulas", () => {
    expect(
      contactRowsToCsv([
        {
          created_at: "2026-11-10T03:00:00.000Z",
          name: '=1+1,"Reader"',
          email: "reader@example.com",
          message: "Hello, Shubhang!",
        },
      ]),
    ).toBe(
      'Submitted at,Name,Email,Message\n"2026-11-10 03:00:00 UTC","\'=1+1,""Reader""","reader@example.com","Hello, Shubhang!"',
    );
  });
});