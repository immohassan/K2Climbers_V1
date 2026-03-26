interface Expedition {
  description: string
  difficulty: string
  category: string
}

export function ExpeditionDetails({ expedition }: { expedition: Expedition }) {
  return (
    <div className="border border-border p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-500 mb-4">About This Expedition</p>
      <p className="text-sm sm:text-base leading-relaxed text-muted-foreground whitespace-pre-line">
        {expedition.description}
      </p>
      <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border">
        <span className="text-[10px] font-bold tracking-widest uppercase border border-border px-2.5 py-1 text-muted-foreground">
          {expedition.category}
        </span>
        <span className="text-[10px] font-bold tracking-widest uppercase border border-orange-500/30 px-2.5 py-1 text-orange-500">
          {expedition.difficulty}
        </span>
      </div>
    </div>
  )
}
