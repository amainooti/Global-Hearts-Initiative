import { NextRequest, NextResponse } from "next/server";
import { sendDonationReceipt } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { donorName, donorEmail, amount, currency, txHash, campaignTitle, campaignSlug, isRecurring } = body;

  // Basic validation
  if (!donorEmail || !amount || !currency || !txHash) {
    return NextResponse.json(
      { error: "donorEmail, amount, currency, and txHash are required." },
      { status: 400 }
    );
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  try {
    await sendDonationReceipt({
      donorName:    donorName ?? null,
      donorEmail,
      amount:       parsedAmount,
      currency,
      txHash,
      campaignTitle: campaignTitle ?? null,
      campaignSlug:  campaignSlug  ?? null,
      isRecurring:   isRecurring   ?? false,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[create-receipt]", err);
    const message = err instanceof Error ? err.message : "Failed to send receipt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}