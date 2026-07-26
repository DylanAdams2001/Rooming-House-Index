// Shared branded HTML template for every transactional email this app sends —
// keeps a consistent look (and avoids re-writing the same inline-styled markup
// in every webhook route) instead of the bare plain-text emails these started
// as. Email clients need inline styles and table-based layout, hence the
// slightly old-school markup here rather than normal CSS classes.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailBlock =
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export function renderEmailHtml({
  heading,
  blocks,
  cta,
}: {
  heading: string;
  blocks: EmailBlock[];
  cta?: { label: string; url: string };
}): string {
  const blockHtml = blocks
    .map((block) => {
      if (block.type === "quote") {
        return `<div style="margin:16px 0;padding:16px 20px;background-color:#f5f5f5;border-left:3px solid #1a1a1a;border-radius:4px;font-size:15px;line-height:1.6;color:#1a1a1a;">${escapeHtml(
          block.text
        ).replace(/\n/g, "<br />")}</div>`;
      }
      if (block.type === "list") {
        return `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.7;color:#555555;">${block.items
          .map((item) => `<li>${escapeHtml(item)}</li>`)
          .join("")}</ul>`;
      }
      return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#555555;">${escapeHtml(
        block.text
      ).replace(/\n/g, "<br />")}</p>`;
    })
    .join("");

  const ctaHtml = cta
    ? `<div style="margin-top:8px;"><a href="${cta.url}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:4px;font-size:14px;font-weight:600;letter-spacing:0.02em;">${escapeHtml(
        cta.label
      )}</a></div>`
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px;max-width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background-color:#1a1a1a;padding:22px 32px;">
                <span style="font-family:Georgia,Cambria,'Times New Roman',serif;font-size:18px;color:#ffffff;letter-spacing:0.01em;">Rooming House Index</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 18px;font-family:Georgia,Cambria,'Times New Roman',serif;font-size:21px;color:#1a1a1a;">${escapeHtml(
                  heading
                )}</h1>
                ${blockHtml}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e5e7eb;">
                <span style="font-size:12px;color:#999999;">Rooming House Index &middot; Victoria, Australia</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// Plain-text fallback for clients that don't render HTML — Resend recommends
// sending both.
export function renderEmailText(blocks: EmailBlock[], cta?: { label: string; url: string }): string {
  const parts = blocks.map((block) => {
    if (block.type === "quote") return `"${block.text}"`;
    if (block.type === "list") return block.items.map((item) => `- ${item}`).join("\n");
    return block.text;
  });
  if (cta) parts.push(`${cta.label}: ${cta.url}`);
  return parts.join("\n\n");
}
