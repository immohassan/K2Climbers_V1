import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Expedition {
  description: string
  difficulty: string
  category: string
}

export function ExpeditionDetails({ expedition }: { expedition: Expedition }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg md:text-xl">About This Expedition</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line break-words sm:text-base">
            {expedition.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs sm:text-sm">{expedition.category}</Badge>
          <Badge variant="outline" className="text-xs sm:text-sm">{expedition.difficulty}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
