import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import type { Slide, InsertSlide, TeamMember, InsertTeamMember, Milestone, InsertMilestone } from "@shared/schema";

const sqlite = new Database("borabora.db");
export const db = drizzle(sqlite, { schema });

// Create tables
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS slides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sn TEXT NOT NULL,
    title TEXT NOT NULL,
    subheader TEXT NOT NULL DEFAULT '',
    purpose TEXT NOT NULL DEFAULT '',
    person_in_charge TEXT NOT NULL DEFAULT '',
    deadline TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'not_started',
    notes TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    section TEXT NOT NULL DEFAULT '',
    avatar_initials TEXT NOT NULL DEFAULT '',
    tasks_total INTEGER NOT NULL DEFAULT 0,
    tasks_completed INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    progress_pct INTEGER NOT NULL DEFAULT 0
  );
`);

export interface IStorage {
  // Slides
  getAllSlides(): Slide[];
  getSlide(id: number): Slide | undefined;
  createSlide(data: InsertSlide): Slide;
  updateSlide(id: number, data: Partial<InsertSlide>): Slide | undefined;
  deleteSlide(id: number): void;

  // Team Members
  getAllTeamMembers(): TeamMember[];
  getTeamMember(id: number): TeamMember | undefined;
  createTeamMember(data: InsertTeamMember): TeamMember;
  updateTeamMember(id: number, data: Partial<InsertTeamMember>): TeamMember | undefined;
  deleteTeamMember(id: number): void;

  // Milestones
  getAllMilestones(): Milestone[];
  getMilestone(id: number): Milestone | undefined;
  createMilestone(data: InsertMilestone): Milestone;
  updateMilestone(id: number, data: Partial<InsertMilestone>): Milestone | undefined;
  deleteMilestone(id: number): void;
}

export const storage: IStorage = {
  // Slides
  getAllSlides() { return db.select().from(schema.slides).all(); },
  getSlide(id) { return db.select().from(schema.slides).where(eq(schema.slides.id, id)).get(); },
  createSlide(data) { return db.insert(schema.slides).values(data).returning().get(); },
  updateSlide(id, data) {
    return db.update(schema.slides).set(data).where(eq(schema.slides.id, id)).returning().get();
  },
  deleteSlide(id) { db.delete(schema.slides).where(eq(schema.slides.id, id)).run(); },

  // Team Members
  getAllTeamMembers() { return db.select().from(schema.teamMembers).all(); },
  getTeamMember(id) { return db.select().from(schema.teamMembers).where(eq(schema.teamMembers.id, id)).get(); },
  createTeamMember(data) { return db.insert(schema.teamMembers).values(data).returning().get(); },
  updateTeamMember(id, data) {
    return db.update(schema.teamMembers).set(data).where(eq(schema.teamMembers.id, id)).returning().get();
  },
  deleteTeamMember(id) { db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id)).run(); },

  // Milestones
  getAllMilestones() { return db.select().from(schema.milestones).all(); },
  getMilestone(id) { return db.select().from(schema.milestones).where(eq(schema.milestones.id, id)).get(); },
  createMilestone(data) { return db.insert(schema.milestones).values(data).returning().get(); },
  updateMilestone(id, data) {
    return db.update(schema.milestones).set(data).where(eq(schema.milestones.id, id)).returning().get();
  },
  deleteMilestone(id) { db.delete(schema.milestones).where(eq(schema.milestones.id, id)).run(); },
};
