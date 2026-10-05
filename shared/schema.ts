import { pgTable, text, serial, integer, numeric, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Shared configuration constants for form inputs
export const SOIL_TYPES = ['Clay', 'Loam', 'Sandy', 'Silt', 'Peat', 'Chalk', 'Saline'] as const;
export const IRRIGATION_TYPES = ['Rainfed', 'Drip', 'Sprinkler', 'Canal/Flood', 'Sub-irrigation'] as const;
export const BUDGET_LEVELS = ['Low (Resource-Constrained)', 'Moderate (Standard Inputs)', 'High (Commercial High-Yield)'] as const;
export const FARM_SIZES = ['Micro (< 1 Acre)', 'Small (1 - 5 Acres)', 'Medium (5 - 20 Acres)', 'Large (> 20 Acres)'] as const;
export const AGRO_CLIMATIC_ZONES = ['Arid', 'Semi-Arid', 'Tropical Humid', 'Sub-Tropical', 'Temperate', 'Highland'] as const;
export const CROP_CATEGORIES = ['Cereals & Grains', 'Pulses/Legumes', 'Oilseeds', 'Cash Crops', 'Horticultural/Vegetables', 'Fruits', 'Spices'] as const;
export const DIAGNOSTIC_SEVERITIES = ['Low', 'Medium', 'High', 'Critical'] as const;

// 1. Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 150 }).notNull(),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 2. Farm Profiles table
export const farmProfiles = pgTable("farm_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  farmName: varchar("farm_name", { length: 150 }).notNull(),
  locationRegion: varchar("location_region", { length: 150 }).notNull(),
  farmSizeAcres: numeric("farm_size_acres", { precision: 8, scale: 2 }).notNull(),
  soilType: varchar("soil_type", { length: 50 }).notNull(),
  soilPh: numeric("soil_ph", { precision: 3, scale: 1 }),
  primaryIrrigation: varchar("primary_irrigation", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 3. Advisory Requests table
export const advisoryRequests = pgTable("advisory_requests", {
  id: serial("id").primaryKey(),
  farmProfileId: integer("farm_profile_id").references(() => farmProfiles.id, { onDelete: "cascade" }).notNull(),
  targetSeason: varchar("target_season", { length: 50 }).notNull(),
  budgetLevel: varchar("budget_level", { length: 50 }).notNull(),
  nitrogenLevelPpm: numeric("nitrogen_level_ppm", { precision: 6, scale: 2 }),
  phosphorusLevelPpm: numeric("phosphorus_level_ppm", { precision: 6, scale: 2 }),
  potassiumLevelPpm: numeric("potassium_level_ppm", { precision: 6, scale: 2 }),
  rawUserNotes: text("raw_user_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 4. Advisory Outputs table
export const advisoryOutputs = pgTable("advisory_outputs", {
  id: serial("id").primaryKey(),
  advisoryRequestId: integer("advisory_request_id").references(() => advisoryRequests.id, { onDelete: "cascade" }).notNull().unique(),
  recommendedCrop: varchar("recommended_crop", { length: 100 }).notNull(),
  reasoningSummary: text("reasoning_summary"),
  secondaryCropOptions: jsonb("secondary_crop_options").notNull(),
  suitabilityScore: integer("suitability_score").notNull(),
  fertilizerSchedule: jsonb("fertilizer_schedule").notNull(),
  irrigationPlan: jsonb("irrigation_plan").notNull(),
  pestDiseaseRisks: jsonb("pest_disease_risks").notNull(),
  financialProjections: jsonb("financial_projections").notNull(),
  rawAiResponse: jsonb("raw_ai_response").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// 5. Diagnostic Records table
export const diagnosticRecords = pgTable("diagnostic_records", {
  id: serial("id").primaryKey(),
  farmProfileId: integer("farm_profile_id").references(() => farmProfiles.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  detectedIssue: varchar("detected_issue", { length: 200 }).notNull(),
  severityLevel: varchar("severity_level", { length: 20 }).notNull(),
  treatmentPlan: jsonb("treatment_plan").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// TypeScript interfaces for structured AI outputs
export interface FertilizerStep {
  stage: string;
  timingWeeks: string;
  fertilizerType: string;
  applicationRatePerAcre: string;
  method: string;
}

export interface IrrigationPlan {
  frequency: string;
  criticalGrowthStages: string[];
  waterConservationTip: string;
}

export interface PestDiseaseRisk {
  pathogenOrPest: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' | string;
  preventativeAction: string;
}

export interface FinancialProjections {
  estimatedCostPerAcre: string;
  projectedYieldRange: string;
  estimatedRevenuePerAcre: string;
}

export interface AdvisoryResponse {
  recommendedCrop: string;
  suitabilityScore: number;
  reasoningSummary: string;
  secondaryCropOptions: string[];
  fertilizerSchedule: FertilizerStep[];
  irrigationPlan: IrrigationPlan;
  pestDiseaseRisks: PestDiseaseRisk[];
  financialProjections: FinancialProjections;
}

export interface DiagnosticTreatmentPlan {
  cropAffected?: string;
  pathogenOrIssue: string;
  confidenceScore: number;
  symptoms: string[];
  immediateRemedies: string[];
  organicAlternatives: string[];
  chemicalInterventions: string[];
  preventativeMeasures: string[];
}

// Zod Validation Schemas
export const createFarmSchema = z.object({
  farmName: z.string().min(2, "Farm name must be at least 2 characters"),
  locationRegion: z.string().min(2, "Region is required"),
  farmSizeAcres: z.coerce.number().positive("Farm size must be positive"),
  soilType: z.enum(SOIL_TYPES),
  soilPh: z.coerce.number().min(3.0, "pH must be at least 3.0").max(11.0, "pH must be at most 11.0").optional().nullable(),
  primaryIrrigation: z.enum(IRRIGATION_TYPES),
});

export const createAdvisorySchema = z.object({
  farmProfileId: z.coerce.number().int().positive("Please select a farm profile"),
  targetSeason: z.string().min(1, "Target season is required"),
  budgetLevel: z.enum(BUDGET_LEVELS),
  nitrogenLevelPpm: z.coerce.number().nonnegative().optional().nullable(),
  phosphorusLevelPpm: z.coerce.number().nonnegative().optional().nullable(),
  potassiumLevelPpm: z.coerce.number().nonnegative().optional().nullable(),
  rawUserNotes: z.string().max(1000).optional().nullable(),
});

export const diagnosticUploadSchema = z.object({
  farmProfileId: z.coerce.number().int().positive().optional().nullable(),
  cropType: z.string().optional(),
  observedSymptoms: z.string().optional(),
  language: z.string().default("en"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type FarmProfile = typeof farmProfiles.$inferSelect;
export type InsertFarmProfile = typeof farmProfiles.$inferInsert;
export type AdvisoryRequest = typeof advisoryRequests.$inferSelect;
export type InsertAdvisoryRequest = typeof advisoryRequests.$inferInsert;
export type AdvisoryOutput = typeof advisoryOutputs.$inferSelect;
export type InsertAdvisoryOutput = typeof advisoryOutputs.$inferInsert;
export type DiagnosticRecord = typeof diagnosticRecords.$inferSelect;
export type InsertDiagnosticRecord = typeof diagnosticRecords.$inferInsert;

export type CreateFarmInput = z.infer<typeof createFarmSchema>;
export type CreateAdvisoryInput = z.infer<typeof createAdvisorySchema>;
export type DiagnosticUploadInput = z.infer<typeof diagnosticUploadSchema>;

// Detailed joined Advisory model for API responses
export type AdvisoryWithDetails = AdvisoryOutput & {
  request: AdvisoryRequest;
  farm: FarmProfile;
};
