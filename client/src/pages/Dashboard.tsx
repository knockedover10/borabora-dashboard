import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Milestone, TeamMember } from "@shared/schema";
import { useEffect } from "react";
import { Building2, Store, Anchor, Users, TrendingUp, CheckCircle2, Clock, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  pending:     { label: "Pending",     cls: "status-pending",     icon: Clock },
  in_progress: { label: "In Progress", cls: "status-in-progress", icon: TrendingUp },
  completed:   { label: "Completed",   cls: "status-completed",   icon: CheckCircle2 },
  delayed:     { label: "Delayed",     cls: "status-delayed",     icon: AlertCircle },
};

const sectionConfig: Record<string, { color: string; icon: any }> = {
  "Luxury Hotel":    { color: "text-teal-600 dark:text-teal-400",  icon: Building2 },
  "Designer Village":{ color: "text-amber-600 dark:text-amber-400", icon: Store },
  "Yacht Club":      { color: "text-blue-600 dark:text-blue-400",   icon: Anchor },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", cfg.cls)}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function KpiCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <Card data-testid={`kpi-${label.toLowerCase().replace(/ /g, "-")}`}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className={cn("text-2xl font-bold tabular-nums mt-1", color)}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn("p-2 rounded-lg bg-muted/60", color)}>
            <Icon size={18} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: milestones = [], isLoading: mlLoading } = useQuery<Milestone[]>({
    queryKey: ["/api/milestones"],
  });

  const { data: team = [], isLoading: teamLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team"],
  });

  // Seed on first load
  const seedMs = useMutation({ mutationFn: () => apiRequest("POST", "/api/milestones/seed"), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/milestones"] }) });
  const seedTeam = useMutation({ mutationFn: () => apiRequest("POST", "/api/team/seed"), onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/team"] }) });

  useEffect(() => {
    seedMs.mutate();
    seedTeam.mutate();
  }, []);

  const updateMilestone = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Milestone> }) =>
      apiRequest("PATCH", `/api/milestones/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/milestones"] }),
  });

  const updateTeam = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TeamMember> }) =>
      apiRequest("PATCH", `/api/team/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/team"] }),
  });

  // KPI computations
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const inProgress = milestones.filter(m => m.status === "in_progress").length;
  const delayed = milestones.filter(m => m.status === "delayed").length;
  const overallPct = totalMilestones > 0
    ? Math.round(milestones.reduce((s, m) => s + m.progressPct, 0) / totalMilestones)
    : 0;

  const totalTasks = team.reduce((s, m) => s + m.tasksTotal, 0);
  const doneTasks = team.reduce((s, m) => s + m.tasksCompleted, 0);

  // Group milestones by section
  const sections = ["Luxury Hotel", "Designer Village", "Yacht Club"];

  return (
    <div className="space-y-7">

      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Project Overview</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Vaitape Luxury Integrated Hub — Municipality of Bora Bora</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Overall Progress" value={`${overallPct}%`} sub={`avg. across ${totalMilestones} milestones`} icon={TrendingUp} color="text-primary" />
        <KpiCard label="In Progress" value={inProgress} sub="active milestones" icon={Clock} color="text-blue-500" />
        <KpiCard label="Completed" value={completedMilestones} sub="milestones done" icon={CheckCircle2} color="text-emerald-500" />
        <KpiCard label="Team Tasks" value={`${doneTasks}/${totalTasks}`} sub="tasks completed" icon={Users} color="text-amber-500" />
      </div>

      {/* Overall progress bar */}
      <Card>
        <CardHeader className="pb-2 pt-5">
          <CardTitle className="text-sm font-semibold">Overall Project Progress</CardTitle>
        </CardHeader>
        <CardContent className="pb-5">
          <div className="flex items-center gap-4">
            <Progress value={overallPct} className="flex-1 h-3" />
            <span className="text-sm font-bold tabular-nums text-primary w-10 text-right">{overallPct}%</span>
          </div>
          <div className="flex gap-5 mt-3">
            {sections.map(sec => {
              const secMs = milestones.filter(m => m.section === sec);
              const secPct = secMs.length ? Math.round(secMs.reduce((s, m) => s + m.progressPct, 0) / secMs.length) : 0;
              const { color, icon: Icon } = sectionConfig[sec] ?? { color: "text-muted-foreground", icon: Building2 };
              return (
                <div key={sec} className="flex items-center gap-1.5 text-xs">
                  <Icon size={13} className={color} />
                  <span className="text-muted-foreground">{sec}:</span>
                  <span className={cn("font-semibold tabular-nums", color)}>{secPct}%</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Milestone tracker by section */}
      <div className="grid lg:grid-cols-3 gap-5">
        {sections.map(sec => {
          const secMs = milestones.filter(m => m.section === sec);
          const { color, icon: Icon } = sectionConfig[sec] ?? { color: "text-muted-foreground", icon: Building2 };
          return (
            <Card key={sec}>
              <CardHeader className="pb-3 pt-5">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <Icon size={15} className={color} />
                  {sec}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-5">
                {secMs.length === 0 && <p className="text-xs text-muted-foreground">No milestones yet.</p>}
                {secMs.map(m => (
                  <div key={m.id} data-testid={`milestone-${m.id}`} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-foreground leading-tight">{m.title}</span>
                      <select
                        className="text-xs bg-transparent border-none outline-none cursor-pointer text-muted-foreground shrink-0"
                        value={m.status}
                        onChange={e => updateMilestone.mutate({ id: m.id, data: { status: e.target.value } })}
                        data-testid={`milestone-status-${m.id}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={m.progressPct} className="flex-1 h-1.5" />
                      <input
                        type="number"
                        min={0} max={100}
                        value={m.progressPct}
                        onChange={e => updateMilestone.mutate({ id: m.id, data: { progressPct: parseInt(e.target.value) || 0 } })}
                        className="w-10 text-xs tabular-nums text-right bg-transparent border-b border-border focus:outline-none text-muted-foreground"
                        data-testid={`milestone-pct-${m.id}`}
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                    {m.dueDate && (
                      <p className="text-xs text-muted-foreground/70">Due {new Date(m.dueDate).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" })}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Team progress */}
      <Card>
        <CardHeader className="pb-3 pt-5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Users size={15} className="text-primary" />
              Team Progress
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-5">
          {teamLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
          <div className="space-y-4">
            {team.map(member => {
              const pct = member.tasksTotal > 0
                ? Math.round((member.tasksCompleted / member.tasksTotal) * 100)
                : 0;
              return (
                <div key={member.id} data-testid={`team-member-${member.id}`} className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {member.avatarInitials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <span className="text-sm font-medium text-foreground">{member.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{member.role}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-muted-foreground tabular-nums">
                          <input
                            type="number" min={0} max={member.tasksTotal}
                            value={member.tasksCompleted}
                            onChange={e => updateTeam.mutate({ id: member.id, data: { tasksCompleted: parseInt(e.target.value) || 0 } })}
                            className="w-8 text-xs tabular-nums text-right bg-transparent border-b border-border focus:outline-none"
                            data-testid={`team-done-${member.id}`}
                          />
                          /
                          <input
                            type="number" min={0}
                            value={member.tasksTotal}
                            onChange={e => updateTeam.mutate({ id: member.id, data: { tasksTotal: parseInt(e.target.value) || 0 } })}
                            className="w-8 text-xs tabular-nums bg-transparent border-b border-border focus:outline-none"
                            data-testid={`team-total-${member.id}`}
                          />
                          tasks
                        </span>
                        <span className="text-xs font-semibold tabular-nums text-primary w-9 text-right">{pct}%</span>
                      </div>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  {/* Section tag */}
                  <Badge variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">{member.section}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
