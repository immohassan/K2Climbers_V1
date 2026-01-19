import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mountain, Award, TrendingUp, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Climber {
  id: string
  name: string | null
  bio: string | null
  image: string | null
  summitRecords: Array<{
    id: string
    status: string
    summitDate: Date | null
    altitude: number
    expedition: {
      id: string
      title: string
      slug: string
      altitude: number
      heroImage: string | null
    }
  }>
  certificates: Array<{
    id: string
    peakName: string
    altitude: number
    summitDate: Date
    verificationCode: string
  }>
  communityPosts: Array<{
    id: string
    title: string
    createdAt: Date
  }>
}

export function ClimberProfile({
  climber,
  successfulSummits,
  highestAltitude,
}: {
  climber: Climber
  successfulSummits: number
  highestAltitude: number
}) {
  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={climber.image || undefined} />
              <AvatarFallback className="text-3xl">
                {climber.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{climber.name || "Climber"}</h1>
              {climber.bio && (
                <p className="text-muted-foreground text-lg mb-4">{climber.bio}</p>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Mountain className="h-5 w-5 mr-2 text-glacier-400" />
                  <span className="font-semibold">{successfulSummits}</span>
                  <span className="text-muted-foreground ml-1">summits</span>
                </div>
                {highestAltitude > 0 && (
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-summit" />
                    <span className="font-semibold">{highestAltitude}m</span>
                    <span className="text-muted-foreground ml-1">highest</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-glacier-300" />
                  <span className="font-semibold">{climber.certificates.length}</span>
                  <span className="text-muted-foreground ml-1">certificates</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summit Records */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Summit Records</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {climber.summitRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/expeditions/${record.expedition.slug}`}>
                      <CardTitle className="hover:text-glacier-400 transition cursor-pointer">
                        {record.expedition.title}
                      </CardTitle>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {record.expedition.altitude}m
                    </p>
                  </div>
                  <Badge
                    variant={record.status === "SUCCESSFUL" ? "default" : "destructive"}
                  >
                    {record.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {record.summitDate && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(record.summitDate)}
                  </div>
                )}
                <div className="mt-2 text-sm">
                  Highest altitude reached: <span className="font-semibold">{record.altitude}m</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Certificates */}
      {climber.certificates.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Certificates</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {climber.certificates.map((cert) => (
              <Link key={cert.id} href={`/certificates/${cert.verificationCode}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{cert.peakName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mountain className="h-4 w-4 mr-2" />
                        {cert.altitude}m
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(cert.summitDate)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Posts */}
      {climber.communityPosts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Posts</h2>
          <div className="space-y-2">
            {climber.communityPosts.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold hover:text-glacier-400 transition">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(post.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
