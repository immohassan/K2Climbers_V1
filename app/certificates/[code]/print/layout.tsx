export default function CertificatePrintLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          @page { size: A4 portrait; margin: 0mm; }
          html, body {
            background: #0a0a0a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        `}</style>
      </head>
      <body style={{ background: "#0a0a0a", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  )
}
