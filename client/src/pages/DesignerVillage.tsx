import { Store, Construction, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DesignerVillage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Designer Village</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Vaitape Designer Village — Concept & Development</p>
      </div>

      <Card className="border-dashed border-2 border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Store size={24} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Designer Village</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Project planning for the Designer Village section is underway. Milestones and tracking details will appear here once the concept brief is issued.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {[
              { icon: Construction, label: "Concept Brief", sub: "Pending" },
              { icon: Clock, label: "Timeline", sub: "Q3 2026" },
              { icon: MapPin, label: "Location", sub: "Vaitape Town Centre" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-xs">
                <Icon size={13} className="text-muted-foreground" />
                <span className="font-medium text-foreground">{label}:</span>
                <span className="text-muted-foreground">{sub}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
