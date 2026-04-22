import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Slides (Luxury Hotel section) ──────────────────────────────────────────
export const slides = sqliteTable("slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sn: text("sn").notNull(),                 // e.g. "1", "1.1", "S1: 1.1"
  title: text("title").notNull(),
  subheader: text("subheader").notNull().default(""),
  purpose: text("purpose").notNull().default(""),
  personInCharge: text("person_in_charge").notNull().default(""),
  deadline: text("deadline").notNull().default(""),
  status: text("status").notNull().default("not_started"), // not_started | in_progress | completed | review
  notes: text("notes").notNull().default(""),
});

export const insertSlideSchema = createInsertSchema(slides).omit({ id: true });
export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type Slide = typeof slides.$inferSelect;

// ── Team Members ───────────────────────────────────────────────────────────
export const teamMembers = sqliteTable("team_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  role: text("role").notNull(),
  section: text("section").notNull().default(""), // Luxury Hotel | Designer Village | Yacht Club | All
  avatarInitials: text("avatar_initials").notNull().default(""),
  tasksTotal: integer("tasks_total").notNull().default(0),
  tasksCompleted: integer("tasks_completed").notNull().default(0),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({ id: true });
export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// ── Project Milestones ─────────────────────────────────────────────────────
export const milestones = sqliteTable("milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  section: text("section").notNull(), // Dashboard | Luxury Hotel | Designer Village | Yacht Club
  title: text("title").notNull(),
  dueDate: text("due_date").notNull().default(""),
  status: text("status").notNull().default("pending"), // pending | in_progress | completed | delayed
  progressPct: integer("progress_pct").notNull().default(0),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({ id: true });
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Milestone = typeof milestones.$inferSelect;
