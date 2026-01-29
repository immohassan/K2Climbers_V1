import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Expedition {
  description: string
  difficulty: string
  category: string
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
      </CardContent>
    </Card>
  )
}
