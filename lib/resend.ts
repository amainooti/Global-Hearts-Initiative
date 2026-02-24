import { Resend } from "resend";

// ── Resend instance ───────────────────────────────────────────────
export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "donate@globalheartsinitiative.org";

// ── Types ──────────────────────────────────────────────────────────
export interface DonationReceiptParams {
  donorName: string | null;
  donorEmail: string;
  amount: number;
  currency: string;
  txHash: string;
  campaignTitle?: string | null;
  isRecurring?: boolean;
}

// ── Receipt ID ─────────────────────────────────────────────────────
function receiptId() {
  return `GHI-${Date.now()}`;
}

// ── Table Row Helper (Email-Safe) ─────────────────────────────────
function row(label: string, value: string) {
  return `
    <tr>
      <td style="
        padding:12px 0;
        color:#6b7280;
        font-size:14px;
      ">
        ${label}
      </td>
      <td style="
        padding:12px 0;
        font-size:14px;
        font-weight:600;
        color:#111827;
        text-align:right;
        word-break:break-word;
      ">
        ${value}
      </td>
    </tr>
  `;
}

// ── Send Donation Receipt ─────────────────────────────────────────
export async function sendDonationReceipt(params: DonationReceiptParams) {
  const {
    donorName,
    donorEmail,
    amount,
    currency,
    txHash,
    campaignTitle,
    isRecurring = false,
  } = params;

  const id = receiptId();

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);

  const html = `
<!DOCTYPE html>
<html>
<body style="
  margin:0;
  padding:0;
  background:#f3f4f6;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0" style="
          background:#ffffff;
          border-radius:18px;
          padding:36px;
          box-shadow:0 20px 45px rgba(0,0,0,0.05);
        ">
          <tr>
            <td align="center">

              <!-- Success Circle -->
              <div style="
                width:64px;
                height:64px;
                border-radius:50%;
                background:#e8f5e9;
                color:#16a34a;
                font-size:28px;
                font-weight:700;
                line-height:64px;
                text-align:center;
                margin:0 auto 18px auto;
              ">
                ✓
              </div>

              <!-- Title -->
              <div style="
                font-size:20px;
                font-weight:600;
                color:#111827;
                margin-bottom:6px;
              ">
                Payment Successful
              </div>

              <!-- Amount -->
              <div style="
                font-size:30px;
                font-weight:700;
                color:#111827;
                margin-bottom:28px;
              ">
                ${formattedAmount}
              </div>

            </td>
          </tr>

          <tr>
            <td>
              <hr style="border:none;border-top:1px dashed #e5e7eb;margin:0 0 24px 0;" />
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                ${row("Receipt ID", id)}
                ${row("Date", date)}
                ${donorName ? row("Donor", donorName) : ""}
                ${row("Reference Number", txHash)}
                ${campaignTitle ? row("Campaign", campaignTitle) : ""}
                ${row("Payment Method", "Direct Contribution")}
                ${isRecurring ? row("Type", "Recurring Donation") : ""}
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              font-size:13px;
              color:#6b7280;
              line-height:1.6;
            ">
              This email serves as your official donation receipt.
              No goods or services were provided in exchange for this contribution.
              Please retain this for your records.
              <br/><br/>
              Global Hearts Initiative<br/>
              <a href="mailto:${FROM}" style="color:#16a34a;text-decoration:none;">
                ${FROM}
              </a>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;

  return resend.emails.send({
    from: `Global Hearts Initiative <${FROM}>`,
    to: donorEmail,
    subject: `Payment Successful — ${formattedAmount}`,
    html,
  });
}


// ── Send newsletter broadcast ─────────────────────────────────────────────────
export async function sendNewsletter(params: {
  to:      string[];
  subject: string;
  html:    string;
}) {
  const chunks = chunkArray(params.to, 100);
  const results = [];

  for (const chunk of chunks) {
    const result = await resend.emails.send({
      from:    `Global Hearts Initiative <${FROM}>`,
      to:      chunk,
      subject: params.subject,
      html:    params.html,
    });
    results.push(result);
  }

  return results;
}

// ── Helper ────────────────────────────────────────────────────────────────────
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}