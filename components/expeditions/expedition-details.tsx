import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Expedition {
  description: string
  difficulty: string
  category: string
  guides: Array<{
    id: string
    name: string | null
    image: string | null
  }>
}

export function ExpeditionDetails({ expedition }: { expedition: Expedition }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Expedition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div>
          <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-line leading-relaxed">
            {expedition.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs sm:text-sm">{expedition.category}</Badge>
          <Badge variant="outline" className="text-xs sm:text-sm">{expedition.difficulty}</Badge>
        </div>

        {expedition.guides.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Lead Guides</h3>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {expedition.guides.map((guide) => (
                <div key={guide.id} className="flex items-center space-x-2">
                  {guide.image && (
                    <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={guide.image}
                        alt={guide.name || "Guide"}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}
                  <span className="text-sm sm:text-base">{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
