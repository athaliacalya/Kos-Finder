import { pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const fasilitasTable = pgTable("fasilitas", {
  id: serial("id").primaryKey(),
  nama: text("nama").notNull(),
  icon: text("icon").notNull(),
});

export const insertFasilitasSchema = createInsertSchema(fasilitasTable).omit({
  id: true,
});
export type InsertFasilitas = z.infer<typeof insertFasilitasSchema>;
export type Fasilitas = typeof fasilitasTable.$inferSelect;
