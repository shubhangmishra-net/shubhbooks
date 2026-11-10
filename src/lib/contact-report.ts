type ContactReportRow = {
  created_at: string;
  name: string;
  email: string;
  message: string;
};

export async function contactReportKeyMatches(provided: string, expected: string | undefined) {
  if (!expected || provided.length > 512) return false;

  const encoder = new TextEncoder();
  const [providedDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const providedBytes = new Uint8Array(providedDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;

  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= (providedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }

  return difference === 0;
}

function escapeCsv(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function contactRowsToCsv(rows: ContactReportRow[]) {
  const lines = rows.map((row) => {
    const submittedAt = `${new Date(row.created_at).toISOString().replace("T", " ").slice(0, 19)} UTC`;
    return [submittedAt, row.name, row.email, row.message].map(escapeCsv).join(",");
  });

  return ["Submitted at,Name,Email,Message", ...lines].join("\n");
}