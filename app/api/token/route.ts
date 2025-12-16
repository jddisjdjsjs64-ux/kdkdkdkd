import { NextResponse } from "next/server";

export const revalidate = 10;

const TOKEN_ADDRESS = "KX2qhwFo2Lc6X6xqsE4VpkmZqZr22DKuFHCK8t7pump";

export async function GET() {
  const url = `https://api.dexscreener.com/tokens/v1/solana/${TOKEN_ADDRESS}`;

  const res = await fetch(url, {
    // Cache at the Next.js layer via `revalidate` above.
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Dexscreener request failed: ${res.status}` },
      { status: 502 },
    );
  }

  const data = (await res.json()) as unknown;
  return NextResponse.json(data);
}
