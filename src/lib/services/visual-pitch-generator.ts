import type { Lead } from '../types/lead';

export interface VisualPitchAsset {
  slug: string;
  previewUrl: string;
  htmlContent: string;
  markdownContent: string;
  plainText: string;
}

export class VisualPitchGenerator {
  static generateAsset(lead: Lead): VisualPitchAsset {
    const rawSlug = lead.websiteConfig?.previewSlug || lead.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || lead.id;
    const slug = rawSlug.toLowerCase();
    const previewUrl = `https://freshmints.io/preview/${slug}`;
    const licenseNumber = lead.licenseNumber || 'PENDING';
    const cityState = `${lead.city}, ${lead.state}`;
    const services = lead.websiteConfig?.services?.slice(0, 3).map((s) => s.title) || [
      'New Client Consultations',
      'Digital Intake & Booking',
      'Dedicated Patient Vault',
    ];

    const htmlContent = `
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;margin:16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <tr>
    <td style="border:1px solid #10b981;border-radius:18px;overflow:hidden;background-color:#090e17;box-shadow:0 14px 30px rgba(0,0,0,0.35);">
      <!-- Browser Top Bar -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f172a;padding:10px 16px;border-bottom:1px solid #1e293b;">
        <tr>
          <td width="55" align="left" style="font-size:14px;line-height:1;letter-spacing:3px;">
            <span style="color:#ef4444;">●</span>
            <span style="color:#f59e0b;">●</span>
            <span style="color:#10b981;">●</span>
          </td>
          <td align="center">
            <span style="background-color:#090e17;color:#94a3b8;padding:4px 14px;border-radius:8px;font-size:11px;font-family:monospace;border:1px solid #334155;display:inline-block;">
              https://${slug}.mycompass.io
            </span>
          </td>
          <td width="55" align="right">
            <span style="background-color:#10b981;color:#ffffff;font-size:9px;font-weight:bold;padding:2px 8px;border-radius:6px;text-transform:uppercase;">
              LIVE
            </span>
          </td>
        </tr>
      </table>

      <!-- Pre-Built Website Preview Card -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:24px 22px;">
        <tr>
          <td>
            <div style="color:#10b981;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
              ★ Verified State Board Pass • Lic #${licenseNumber}
            </div>
            <h2 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 4px 0;line-height:1.2;">
              ${lead.fullName}
            </h2>
            <div style="color:#38bdf8;font-size:13px;font-weight:600;margin-bottom:14px;">
              ${lead.professionTitle} • ${cityState}
            </div>

            <!-- Features Pill Box -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:12px 14px;margin-bottom:20px;">
              <tr>
                <td>
                  <div style="color:#94a3b8;font-size:11px;font-weight:bold;text-transform:uppercase;margin-bottom:6px;">
                    Included Client Portal &amp; Services:
                  </div>
                  ${services
                    .map(
                      (svc) => `
                    <div style="color:#e2e8f0;font-size:12px;margin:3px 0;">
                      <span style="color:#10b981;font-weight:bold;">✓</span> ${svc}
                    </div>`
                    )
                    .join('')}
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td align="center">
                  <a href="${previewUrl}" target="_blank" rel="noopener noreferrer" style="background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:13px;font-weight:bold;display:inline-block;box-shadow:0 4px 14px rgba(16,185,129,0.4);">
                    View Your Interactive Live Website Demo →
                  </a>
                </td>
              </tr>
            </table>

            <div style="color:#64748b;font-size:10px;text-align:center;margin-top:14px;line-height:1.4;">
              Pre-rendered by Fresh Mints. Turnkey 24-month sovereign cloud hosting, static IP, and 10 custom mailboxes included.
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

    const markdownContent = `
### 🌐 Interactive Website Preview Ready: ${lead.fullName}
* **Status**: State Board Accredited (Lic #${licenseNumber})
* **Profession**: ${lead.professionTitle} (${cityState})
* **Pre-Built Services**: ${services.join(', ')}

👉 **[View Your Live Interactive Demo Here](${previewUrl})**
*(Turnkey sovereign cloud hosting, client intake portal, and dedicated static IP included)*
`.trim();

    const plainText = `Website Preview Ready for ${lead.fullName} (Lic #${licenseNumber})\nView Interactive Demo: ${previewUrl}`;

    return {
      slug,
      previewUrl,
      htmlContent,
      markdownContent,
      plainText,
    };
  }
}
