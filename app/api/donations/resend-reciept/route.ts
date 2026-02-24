import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendDonationReceipt } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { donationId } = await req.json();
  if (!donationId) {
    return NextResponse.json({ error: "donationId is required." }, { status: 400 });
  }

  const service = createServiceClient();
  const { data: donation, error } = await service
    .from("donations")
    .select("*, campaigns(title, slug)")
    .eq("id", donationId)
    .single();

  if (error || !donation) {
    return NextResponse.json({ error: "Donation not found." }, { status: 404 });
  }

  if (!donation.donor_email) {
    return NextResponse.json({ error: "No email on file for this donor." }, { status: 400 });
  }

  try {
    await sendDonationReceipt({
      donorName:     donation.donor_name,
      donorEmail:    donation.donor_email,
      amount:        donation.amount,
      currency:      donation.currency,
      txHash:        donation.paystack_ref,
      campaignTitle: donation.campaigns?.title ?? null,
      campaignSlug:  donation.campaigns?.slug  ?? null,
      isRecurring:   donation.is_recurring,
    });

    // Mark receipt as sent
    await service
      .from("donations")
      .update({ receipt_sent: true })
      .eq("id", donationId);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[resend-receipt]", err);
    const message = err instanceof Error ? err.message : "Failed to send receipt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}