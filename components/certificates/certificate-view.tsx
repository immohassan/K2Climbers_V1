import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mountain, Calendar, CheckCircle, Download, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Certificate {
  id: string
  expeditionTitle: string
  peakName: string
  altitude: number
  summitDate: Date
  verificationCode: string
  qrCodeUrl: string | null
  pdfUrl: string | null
  user: {
    name: string | null
  }
}

export function CertificateView({ certificate }: { certificate: Certificate }) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-glacier-500/20">
        <CardContent className="p-12">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-glacier-500/10">
                <Mountain className="h-16 w-16 text-glacier-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Summit Certificate</h1>
            <p className="text-muted-foreground">This certifies that</p>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-glacier-400 mb-4">
              {certificate.user.name || "Climber"}
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              has successfully summited
            </p>
            <h3 className="text-4xl font-bold mb-6">{certificate.peakName}</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="text-center p-6 bg-card rounded-lg">
              <Mountain className="h-8 w-8 mx-auto mb-2 text-glacier-400" />
              <p className="text-sm text-muted-foreground mb-1">Altitude</p>
              <p className="text-2xl font-bold">{certificate.altitude}m</p>
            </div>
            <div className="text-center p-6 bg-card rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-summit" />
              <p className="text-sm text-muted-foreground mb-1">Summit Date</p>
              <p className="text-2xl font-bold">{formatDate(certificate.summitDate)}</p>
            </div>
          </div>

          <div className="text-center mb-8 p-6 bg-card rounded-lg">
            <p className="text-muted-foreground mb-2">Expedition</p>
            <p className="text-lg font-semibold">{certificate.expeditionTitle}</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm text-muted-foreground">
              Verified Certificate
            </span>
            <Badge variant="outline" className="ml-2">
              Code: {certificate.verificationCode.slice(0, 8)}...
            </Badge>
          </div>

          {certificate.qrCodeUrl && (
            <div className="text-center mb-8">
              <div className="relative w-32 h-32 mx-auto bg-white p-2 rounded-lg">
                <Image
                  src={certificate.qrCodeUrl}
                  alt="QR Code"
                  fill
                  className="object-contain"
                  sizes="128px"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scan to verify this certificate
              </p>
            </div>
          )}

          <div className="flex justify-center gap-4">
            {certificate.pdfUrl && (
              <a href={certificate.pdfUrl} download>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </a>
            )}
            <Button variant="summit">
              <Share2 className="h-4 w-4 mr-2" />
              Share Certificate
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
