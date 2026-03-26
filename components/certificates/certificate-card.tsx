import Image from "next/image"
import { formatDate } from "@/lib/utils"

interface CertificateCardProps {
  certificate: {
    expeditionTitle: string
    peakName: string
    altitude: number
    summitDate: Date
    verificationCode: string
    qrCodeUrl: string | null
    user: { name: string | null }
  }
}

export function CertificateCard({ certificate }: CertificateCardProps) {
  return (
    <div
      id="certificate-card"
      style={{
        background: "#ffffff",
        border: "1px solid #e5e5e5",
        fontFamily: "'Georgia', serif",
        position: "relative",
        padding: "60px 56px 48px",
        textAlign: "center",
      }}
    >
      {/* Top thin gold line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#c9a86c" }} />

      {/* Org name */}
      <div style={{
        fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase",
        color: "#c9a86c", marginBottom: 6,
      }}>
        K2 Climbers Pakistan
      </div>

      {/* Title */}
      <div style={{
        fontSize: 28, fontWeight: "bold", color: "#111111",
        letterSpacing: "0.04em", marginBottom: 4,
      }}>
        Certificate of Achievement
      </div>

      {/* Thin divider */}
      <div style={{ width: 48, height: 1, background: "#c9a86c", margin: "16px auto 20px" }} />

      {/* Certifies */}
      <div style={{ fontSize: 12, color: "#888888", letterSpacing: "0.08em", marginBottom: 10 }}>
        This certifies that
      </div>

      {/* Name */}
      <div style={{
        fontSize: 32, fontWeight: "bold", color: "#111111",
        fontStyle: "italic", letterSpacing: "0.02em", marginBottom: 16,
      }}>
        {certificate.user.name || "Climber"}
      </div>

      <div style={{ fontSize: 12, color: "#888888", letterSpacing: "0.08em", marginBottom: 10 }}>
        has successfully summited
      </div>

      {/* Peak name */}
      <div style={{
        fontSize: 26, fontWeight: "bold", color: "#111111",
        letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4,
      }}>
        {certificate.peakName}
      </div>

      {/* Expedition */}
      <div style={{
        fontSize: 10, color: "#aaaaaa", letterSpacing: "0.18em",
        textTransform: "uppercase", marginBottom: 36,
      }}>
        {certificate.expeditionTitle}
      </div>

      {/* Stats row */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 0,
        borderTop: "1px solid #eeeeee", borderBottom: "1px solid #eeeeee",
        margin: "0 0 36px",
      }}>
        <div style={{ flex: 1, padding: "16px 8px", borderRight: "1px solid #eeeeee" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#aaaaaa", marginBottom: 4 }}>
            Altitude
          </div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#111111" }}>
            {certificate.altitude.toLocaleString()}<span style={{ fontSize: 12, color: "#888888", marginLeft: 1 }}>m</span>
          </div>
        </div>
        <div style={{ flex: 1, padding: "16px 8px", borderRight: "1px solid #eeeeee" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#aaaaaa", marginBottom: 4 }}>
            Summit Date
          </div>
          <div style={{ fontSize: 14, fontWeight: "bold", color: "#111111" }}>
            {formatDate(certificate.summitDate)}
          </div>
        </div>
        <div style={{ flex: 1, padding: "16px 8px" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.25em", textTransform: "uppercase", color: "#aaaaaa", marginBottom: 4 }}>
            Verified
          </div>
          <div style={{ fontSize: 14, fontWeight: "bold", color: "#111111" }}>
            K2 Climbers
          </div>
        </div>
      </div>

      {/* Footer row */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        {/* Signature */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 120, height: 1, background: "#cccccc", marginBottom: 5 }} />
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#888888" }}>
            Operations Director
          </div>
          <div style={{ fontSize: 8, color: "#bbbbbb", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
            K2 Climbers
          </div>
        </div>

        {/* Verification code */}
        <div style={{ textAlign: "center" }}>
          {certificate.qrCodeUrl ? (
            <div style={{ position: "relative", width: 60, height: 60, margin: "0 auto 4px", border: "1px solid #eeeeee", padding: 2 }}>
              <Image src={certificate.qrCodeUrl} alt="QR" fill className="object-contain" sizes="60px" />
            </div>
          ) : null}
          <div style={{ fontSize: 7, letterSpacing: "0.15em", color: "#cccccc", fontFamily: "monospace", textTransform: "uppercase" }}>
            {certificate.verificationCode.slice(0, 16)}
          </div>
        </div>

        {/* Issued date */}
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 120, height: 1, background: "#cccccc", marginBottom: 5 }} />
          <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#888888" }}>
            Date Issued
          </div>
          <div style={{ fontSize: 8, color: "#bbbbbb", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
            {formatDate(certificate.summitDate)}
          </div>
        </div>
      </div>

      {/* Bottom gold line */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "#c9a86c" }} />
    </div>
  )
}
