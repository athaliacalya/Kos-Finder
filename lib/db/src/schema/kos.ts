import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const kosTable = pgTable("kos", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  alamat: text("alamat").notNull(),
  harga: integer("harga").notNull(), // harga per bulan dalam rupiah
  deskripsi: text("deskripsi"),
  jamOperasional: text("jam_operasional"), // e.g. "06:00-22:00"
  aturan: text("aturan"),
  lat: numeric("lat", { precision: 10, scale: 7 }),
  lng: numeric("lng", { precision: 10, scale: 7 }),
  noWa: text("no_wa"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertKosSchema = createInsertSchema(kosTable).omit({
  id: true,
  createdAt: true,
});
export type InsertKos = z.infer<typeof insertKosSchema>;
export type Kos = typeof kosTable.$inferSelect;
