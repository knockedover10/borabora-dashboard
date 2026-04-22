import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertSlideSchema, insertTeamMemberSchema, insertMilestoneSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express) {

  // ── Slides ──────────────────────────────────────────────────────────────
  app.get("/api/slides", (_req, res) => {
    res.json(storage.getAllSlides());
  });

  app.post("/api/slides", (req, res) => {
    const parsed = insertSlideSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createSlide(parsed.data));
  });

  app.patch("/api/slides/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const partial = insertSlideSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error });
    const updated = storage.updateSlide(id, partial.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/slides/:id", (req, res) => {
    storage.deleteSlide(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // ── Seed slides if empty ────────────────────────────────────────────────
  app.post("/api/slides/seed", (_req, res) => {
    const existing = storage.getAllSlides();
    if (existing.length > 0) return res.json({ seeded: false, count: existing.length });

    const seedData = [
      { sn: "1", title: "Title Slide", subheader: "—", purpose: "Establish the study identity, client, and classification", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "1.1", title: "Study Framework Overview", subheader: "A Six-Section Evidence-Based Framework", purpose: "Orient the audience to the analytical structure and logical flow of the study", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "1.2", title: "Three Source Pillars", subheader: "Analytical Foundations: Three Pillars of Authority", purpose: "Establish the credibility and institutional grounding of the methodology", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S1: 1.1", title: "Global Luxury Travel Market", subheader: "A USD 181.7B Market by 2033", purpose: "Size the total addressable market and justify the ultra-luxury demand tier", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S1: 1.2", title: "Bora Bora Destination Demand", subheader: "Structurally Supply-Constrained, High-Value Destination", purpose: "Profile destination-level demand and establish Vaitape's structural opportunity", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S1: 1.3", title: "Demand Seasonality & Feeder Markets", subheader: "Peak Seasons and Key Source Markets", purpose: "Outline demand patterns and the primary feeder markets driving occupancy", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S2: 2.1", title: "The STP Model in Luxury Hospitality", subheader: "Segmentation, Targeting & Positioning Framework", purpose: "Introduce the STP methodology and validate its use in luxury hotel strategy", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S2: 2.2", title: "UHNWI Guest Intelligence", subheader: "Moving Beyond Demographics", purpose: "Define the psychographic and behavioural dimensions of the ultra-luxury guest", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S2: 2.3", title: "Target Segment Analysis", subheader: "Who We Are Building For", purpose: "Detail the primary, secondary, and tertiary guest segments", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S3: 3.1", title: "Competitive Set Overview", subheader: "The Bora Bora Competitive Landscape", purpose: "Map the existing supply, ADR ranges, and each competitor's key strength", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S3: 3.2", title: "Competitive Benchmarking", subheader: "Perceptual Mapping Methodology", purpose: "Explain the dual-axis perceptual mapping approach and its validity", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S3: 3.3", title: "Perceptual Map & Strategic Whitespace", subheader: "The Unoccupied Position: Cultural Immersion × Town-Centre Setting", purpose: "Visualise the competitive gap and justify the hotel's positioning strategy", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S4: 4.1", title: "The 7-Component Hotel Concept Framework", subheader: "Translating Positioning into a Defined Concept (EHL Framework)", purpose: "Show how strategic positioning translates into a coherent hotel concept", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S4: 4.2", title: "Unique Selling Proposition", subheader: "The USP: Structurally Unreplicable", purpose: "Articulate the hotel's core differentiator and the three positioning axes", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S4: 4.3", title: "Space Utilisation Methodology & Programme Summary", subheader: "Total GFA: 6,706 sqm Across Four Functional Zones", purpose: "Present the four-layer programming methodology and zone-level GFA breakdown", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S4: 4.4", title: "Proposed Offerings Architecture", subheader: "Accommodation, F&B, Wellness & Cultural Programming", purpose: "Detail every guest-facing offering across all product categories", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S5: 5.1", title: "Feasibility Overview", subheader: "Financial Viability: Indicative Performance at 35 Keys", purpose: "Present revenue projections, development cost benchmarks, and return corridor", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "S5: 5.2", title: "Operator Shortlist & Coherence Audit", subheader: "Recommended Brand Partners & Concept Quality Check", purpose: "Rank operator brands by alignment and validate internal concept consistency", personInCharge: "", deadline: "", status: "not_started", notes: "" },
      { sn: "Close", title: "Recommended Next Steps & Disclaimer", subheader: "Six Priority Actions Before Design Lock-Down", purpose: "Define the immediate workplan and set expectations on data limitations", personInCharge: "", deadline: "", status: "not_started", notes: "" },
    ];

    seedData.forEach(d => storage.createSlide(d));
    res.json({ seeded: true, count: seedData.length });
  });

  // ── Team Members ────────────────────────────────────────────────────────
  app.get("/api/team", (_req, res) => {
    res.json(storage.getAllTeamMembers());
  });

  // Dynamically derive team from slides personInCharge field
  app.get("/api/team/derived", (_req, res) => {
    const slides = storage.getAllSlides();
    const nameMap: Record<string, { total: number; completed: number; inProgress: number }> = {};

    for (const slide of slides) {
      const raw = slide.personInCharge?.trim();
      if (!raw) continue;
      // Support comma-separated names on one slide
      const names = raw.split(/[,/&]+/).map(n => n.trim()).filter(Boolean);
      for (const name of names) {
        if (!nameMap[name]) nameMap[name] = { total: 0, completed: 0, inProgress: 0 };
        nameMap[name].total++;
        if (slide.status === "completed") nameMap[name].completed++;
        if (slide.status === "in_progress") nameMap[name].inProgress++;
      }
    }

    const team = Object.entries(nameMap).map(([name, stats], idx) => ({
      id: idx + 1,
      name,
      avatarInitials: name.slice(0, 2).toUpperCase(),
      tasksTotal: stats.total,
      tasksCompleted: stats.completed,
      tasksInProgress: stats.inProgress,
      section: "Luxury Hotel",
    }));

    res.json(team);
  });

  app.post("/api/team", (req, res) => {
    const parsed = insertTeamMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createTeamMember(parsed.data));
  });

  app.patch("/api/team/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const partial = insertTeamMemberSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error });
    const updated = storage.updateTeamMember(id, partial.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/team/:id", (req, res) => {
    storage.deleteTeamMember(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/team/seed", (_req, res) => {
    const existing = storage.getAllTeamMembers();
    if (existing.length > 0) return res.json({ seeded: false });
    const members = [
      { name: "Team Member A", role: "Project Lead", section: "All", avatarInitials: "TMA", tasksTotal: 8, tasksCompleted: 2 },
      { name: "Team Member B", role: "Hospitality Analyst", section: "Luxury Hotel", avatarInitials: "TMB", tasksTotal: 6, tasksCompleted: 1 },
      { name: "Team Member C", role: "Design Consultant", section: "Designer Village", avatarInitials: "TMC", tasksTotal: 5, tasksCompleted: 0 },
      { name: "Team Member D", role: "Marina Specialist", section: "Yacht Club", avatarInitials: "TMD", tasksTotal: 4, tasksCompleted: 0 },
    ];
    members.forEach(m => storage.createTeamMember(m));
    res.json({ seeded: true });
  });

  // ── Milestones ──────────────────────────────────────────────────────────
  app.get("/api/milestones", (_req, res) => {
    res.json(storage.getAllMilestones());
  });

  app.post("/api/milestones", (req, res) => {
    const parsed = insertMilestoneSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error });
    res.json(storage.createMilestone(parsed.data));
  });

  app.patch("/api/milestones/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const partial = insertMilestoneSchema.partial().safeParse(req.body);
    if (!partial.success) return res.status(400).json({ error: partial.error });
    const updated = storage.updateMilestone(id, partial.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });

  app.delete("/api/milestones/:id", (req, res) => {
    storage.deleteMilestone(parseInt(req.params.id));
    res.json({ ok: true });
  });

  app.post("/api/milestones/seed", (_req, res) => {
    const existing = storage.getAllMilestones();
    if (existing.length > 0) return res.json({ seeded: false });
    const ms = [
      { section: "Luxury Hotel", title: "Strategic Positioning Study", dueDate: "2026-05-15", status: "in_progress", progressPct: 65 },
      { section: "Luxury Hotel", title: "Slide Deck Completion", dueDate: "2026-06-01", status: "in_progress", progressPct: 10 },
      { section: "Luxury Hotel", title: "Operator RFP Issuance", dueDate: "2026-06-30", status: "pending", progressPct: 0 },
      { section: "Designer Village", title: "Concept Briefing", dueDate: "2026-07-01", status: "pending", progressPct: 0 },
      { section: "Yacht Club", title: "Marina Feasibility Study", dueDate: "2026-07-15", status: "pending", progressPct: 0 },
    ];
    ms.forEach(m => storage.createMilestone(m));
    res.json({ seeded: true });
  });

  return httpServer;
}
