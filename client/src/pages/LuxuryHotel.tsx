import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Slide } from "@shared/schema";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Clock, TrendingUp, FileText, Eye, Edit2, Save, X, Plus, Trash2, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started", cls: "status-not-started" },
  { value: "in_progress", label: "In Progress", cls: "status-in-progress" },
  { value: "review",      label: "Under Review", cls: "status-review" },
  { value: "completed",   label: "Completed",    cls: "status-completed" },
];

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_OPTIONS.find(s => s.value === status) ?? STATUS_OPTIONS[0];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap", cfg.cls)}>
      {cfg.label}
    </span>
  );
}

function EditableCell({
  value, onSave, className, multiline
}: { value: string; onSave: (v: string) => void; className?: string; multiline?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  if (editing) {
    return (
      <div className="flex items-start gap-1 min-w-0">
        {multiline ? (
          <textarea
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            className="text-xs w-full border border-primary/40 rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[60px]"
          />
        ) : (
          <input
            autoFocus
            value={val}
            onChange={e => setVal(e.target.value)}
            className="text-xs w-full border border-primary/40 rounded px-1.5 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        )}
        <button onClick={() => { onSave(val); setEditing(false); }} className="text-emerald-600 hover:text-emerald-700 mt-0.5 shrink-0"><Save size={13} /></button>
        <button onClick={() => { setVal(value); setEditing(false); }} className="text-muted-foreground hover:text-foreground mt-0.5 shrink-0"><X size={13} /></button>
      </div>
    );
  }

  return (
    <div
      className={cn("group flex items-start gap-1 cursor-pointer min-w-0", className)}
      onClick={() => setEditing(true)}
      data-testid="editable-cell"
    >
      <span className="flex-1 break-words">{value || <span className="text-muted-foreground/40 italic">—</span>}</span>
      <Edit2 size={11} className="opacity-0 group-hover:opacity-50 shrink-0 mt-0.5 transition-opacity" />
    </div>
  );
}

function StatusSelect({ status, onChange }: { status: string; onChange: (v: string) => void }) {
  return (
    <select
      value={status}
      onChange={e => onChange(e.target.value)}
      className={cn(
        "text-xs font-medium rounded-full px-2 py-0.5 border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary appearance-none",
        STATUS_OPTIONS.find(s => s.value === status)?.cls ?? "status-not-started"
      )}
      data-testid="status-select"
    >
      {STATUS_OPTIONS.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
}

export default function LuxuryHotel() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: slides = [], isLoading } = useQuery<Slide[]>({
    queryKey: ["/api/slides"],
  });

  const seedSlides = useMutation({
    mutationFn: () => apiRequest("POST", "/api/slides/seed"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/slides"] }),
  });

  useEffect(() => { seedSlides.mutate(); }, []);

  const updateSlide = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Slide> }) =>
      apiRequest("PATCH", `/api/slides/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/slides"] }),
  });

  const deleteSlide = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/slides/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/slides"] });
      toast({ title: "Slide deleted" });
    },
  });

  const addSlide = useMutation({
    mutationFn: () => apiRequest("POST", "/api/slides", {
      sn: "", title: "New Slide", subheader: "", purpose: "", personInCharge: "", deadline: "", status: "not_started", notes: ""
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/slides"] });
      toast({ title: "Slide added" });
    },
  });

  // Stats
  const total = slides.length;
  const completed = slides.filter(s => s.status === "completed").length;
  const inProgress = slides.filter(s => s.status === "in_progress").length;
  const review = slides.filter(s => s.status === "review").length;
  const notStarted = slides.filter(s => s.status === "not_started").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Luxury Hotel</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Vaitape Ultra-Luxury Hotel — Strategic Positioning Study</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Slides", value: total, icon: FileText, color: "text-primary" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "In Progress", value: inProgress, icon: TrendingUp, color: "text-blue-500" },
          { label: "Not Started", value: notStarted, icon: Clock, color: "text-muted-foreground" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} data-testid={`kpi-slides-${label.toLowerCase().replace(/ /g, "-")}`}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className={cn("text-2xl font-bold tabular-nums mt-0.5", color)}>{value}</p>
                </div>
                <Icon size={18} className={cn("mt-0.5", color)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Slide Deck Completion</span>
            <span className="text-sm font-bold text-primary tabular-nums">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2.5" />
          <div className="flex gap-4 mt-2.5 text-xs text-muted-foreground">
            <span><span className="text-emerald-500 font-semibold">{completed}</span> done</span>
            <span><span className="text-blue-500 font-semibold">{inProgress}</span> in progress</span>
            <span><span className="text-amber-500 font-semibold">{review}</span> under review</span>
            <span><span className="text-muted-foreground font-semibold">{notStarted}</span> not started</span>
          </div>
        </CardContent>
      </Card>

      {/* Slide Tracking Table */}
      <Card>
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText size={15} className="text-primary" />
              Slide Tracker
            </CardTitle>
            <Button
              size="sm"
              variant="outline"
              className="text-xs gap-1.5"
              onClick={() => addSlide.mutate()}
              disabled={addSlide.isPending}
              data-testid="add-slide-btn"
            >
              <Plus size={13} />
              Add Slide
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">Loading slides…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left">
                    {["S/N", "Title", "Sub-header", "Purpose of Slide", "Person-in-Charge", "Deadline", "Status", "Notes", ""].map(h => (
                      <th key={h} className="px-3 py-2.5 font-semibold text-muted-foreground whitespace-nowrap first:pl-5 last:pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {slides.map((slide, idx) => (
                    <tr
                      key={slide.id}
                      data-testid={`slide-row-${slide.id}`}
                      className={cn(
                        "border-b border-border/50 hover:bg-muted/30 transition-colors",
                        idx % 2 === 0 ? "" : "bg-muted/10"
                      )}
                    >
                      {/* S/N */}
                      <td className="px-3 py-2.5 pl-5 font-mono font-semibold text-primary whitespace-nowrap w-24">
                        <EditableCell
                          value={slide.sn}
                          onSave={v => updateSlide.mutate({ id: slide.id, data: { sn: v } })}
                        />
                      </td>
                      {/* Title */}
                      <td className="px-3 py-2.5 font-medium text-foreground max-w-[160px]">
                        <EditableCell
                          value={slide.title}
                          onSave={v => updateSlide.mutate({ id: slide.id, data: { title: v } })}
                        />
                      </td>
                      {/* Subheader */}
                      <td className="px-3 py-2.5 text-muted-foreground max-w-[180px]">
                        <EditableCell
                          value={slide.subheader}
                          onSave={v => updateSlide.mutate({ id: slide.id, data: { subheader: v } })}
                        />
                      </td>
                      {/* Purpose */}
                      <td className="px-3 py-2.5 text-muted-foreground max-w-[200px]">
                        <EditableCell
                          value={slide.purpose}
                          onSave={v => updateSlide.mutate({ id: slide.id, data: { purpose: v } })}
                          multiline
                        />
                      </td>
                      {/* Person */}
                      <td className="px-3 py-2.5 w-32">
                        <EditableCell
                          value={slide.personInCharge}
                          onSave={v => updateSlide.mutate({ id: slide.id, data: { personInCharge: v } })}
                        />
                      </td>
                      {/* Deadline */}
                      <td className="px-3 py-2.5 w-28">
                        <input
                          type="date"
                          value={slide.deadline}
                          onChange={e => updateSlide.mutate({ id: slide.id, data: { deadline: e.target.value } })}
                          className="text-xs bg-transparent border-b border-border/0 hover:border-border focus:border-primary focus:outline-none w-full cursor-pointer text-muted-foreground"
                          data-testid={`deadline-${slide.id}`}
                        />
                      </td>
                      {/* Status */}
                      <td className="px-3 py-2.5 w-36">
                        <StatusSelect
                          status={slide.status}
                          onChange={v => updateSlide.mutate({ id: slide.id, data: { status: v } })}
                        />
                      </td>
                      {/* Notes */}
                      <td className="px-3 py-2.5 text-muted-foreground max-w-[160px]">
                        <EditableCell
                          value={slide.notes}
                          onSave={v => updateSlide.mutate({ id: slide.id, data: { notes: v } })}
                          multiline
                        />
                      </td>
                      {/* Delete */}
                      <td className="px-3 py-2.5 pr-5 w-8">
                        <button
                          onClick={() => deleteSlide.mutate(slide.id)}
                          className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                          data-testid={`delete-slide-${slide.id}`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hint */}
      <p className="text-xs text-muted-foreground/60 text-center">
        Click any cell to edit inline · Select a status to update · Add or delete rows as needed
      </p>
    </div>
  );
}
