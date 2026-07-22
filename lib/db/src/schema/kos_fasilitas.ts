import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { kosTable } from "./kos";
import { fasilitasTable } from "./fasilitas";

export const kosFasilitasTable = pgTable(
  "kos_fasilitas",
  {
    kosId: integer("kos_id")
      .notNull()
      .references(() => kosTable.id, { onDelete: "cascade" }),
    fasilitasId: integer("fasilitas_id")
      .notNull()
      .references(() => fasilitasTable.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.kosId, table.fasilitasId] })],
);

export type KosFasilitas = typeof kosFasilitasTable.$inferSelect;
