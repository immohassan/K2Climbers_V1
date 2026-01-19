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
      <CardContent className="space-y-6">
        <div>
          <p className="text-muted-foreground whitespace-pre-line">
            {expedition.description}
          </p>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline">{expedition.category}</Badge>
          <Badge variant="outline">{expedition.difficulty}</Badge>
        </div>

        {expedition.guides.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Lead Guides</h3>
            <div className="flex flex-wrap gap-4">
              {expedition.guides.map((guide) => (
                <div key={guide.id} className="flex items-center space-x-2">
                  {guide.image && (
                    <img
                      src={guide.image}
                      alt={guide.name || "Guide"}
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <span>{guide.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
