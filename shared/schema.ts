import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, decimal, date, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// 1️⃣ USUARIOS
export const users = pgTable("USUARIOS", {
  id: serial("id").primaryKey(),
  rut: varchar("rut", { length: 12 }).notNull().unique(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  password: text("password").notNull(), // Hashed password (no está en el diagrama original pero es necesario)
  rol: text("rol").notNull(), // 'super_admin', 'admin', 'mecanico'
  // Campos adicionales
  name: varchar("name", { length: 100 }).notNull().default(""), // alias de nombre para compatibilidad
  role: text("role").notNull().default(""), // alias de rol para compatibilidad
  createdAt: timestamp("created_at").defaultNow(),
});

// 2️⃣ CATEGORIAS
export const categories = pgTable("CATEGORIAS", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 50 }).notNull(),
});

// 3️⃣ PRODUCTOS
export const products = pgTable("PRODUCTOS", {
  id: serial("id").primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  categoria_id: integer("categoria_id").notNull().references(() => categories.id),
  stock: integer("stock").notNull().default(0),
  precio_compra: decimal("precio_compra", { precision: 10, scale: 2 }).default("0"),
  precio_venta: decimal("precio_venta", { precision: 10, scale: 2 }).default("0"),
  // Campos adicionales para el frontend
  partNumber: varchar("part_number", { length: 50 }),
  quality: varchar("quality", { length: 50 }),
  compatibleBrand: varchar("compatible_brand", { length: 50 }),
  compatibleModel: varchar("compatible_model", { length: 50 }),
  provider: varchar("provider", { length: 100 }),
  disabled: boolean("disabled").default(false), // Para deshabilitar alertas de stock
});

// 4️⃣ COMPATIBILIDAD_PRODUCTO_VEHICULO
export const productVehicleCompatibility = pgTable("COMPATIBILIDAD_PRODUCTO_VEHICULO", {
  id: serial("id").primaryKey(),
  producto_id: integer("producto_id").notNull().references(() => products.id),
  marca: varchar("marca", { length: 50 }).notNull(),
  modelo: varchar("modelo", { length: 50 }).notNull(),
  anio_desde: integer("anio_desde").notNull(),
  anio_hasta: integer("anio_hasta").notNull(),
});

// 5️⃣ ORDENES_SERVICIO
export const workOrders = pgTable("ORDENES_SERVICIO", {
  id: serial("id").primaryKey(),
  usuario_id: integer("usuario_id").notNull().references(() => users.id),
  fecha: date("fecha").notNull(),
  marca: varchar("marca", { length: 50 }),
  modelo: varchar("modelo", { length: 50 }),
  patente: varchar("patente", { length: 20 }),
  km: integer("km"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  correo_cliente: varchar("correo_cliente", { length: 100 }), // opcional, para envío de PDF automático
  status: text("status").notNull().default("pending"), // pending, completed, delivered
  // Campos adicionales
  otNumber: varchar("ot_number", { length: 50 }),
  patent: varchar("patent", { length: 20 }), // alias de patente para compatibilidad
  model: varchar("model", { length: 50 }), // alias de modelo para compatibilidad
  brand: varchar("brand", { length: 50 }), // alias de marca para compatibilidad
  entryDate: timestamp("entry_date"),
});

// 6️⃣ ITEMS_SERVICIO
export const serviceItems = pgTable("ITEMS_SERVICIO", {
  id: serial("id").primaryKey(),
  orden_servicio_id: integer("orden_servicio_id").notNull().references(() => workOrders.id),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  precio: decimal("precio", { precision: 10, scale: 2 }).notNull(),
});

// 7️⃣ PRODUCTOS_USADOS_EN_SERVICIO
export const productsUsedInService = pgTable("PRODUCTOS_USADOS_EN_SERVICIO", {
  orden_servicio_id: integer("orden_servicio_id").notNull().references(() => workOrders.id),
  producto_id: integer("producto_id").notNull().references(() => products.id),
  cantidad: integer("cantidad").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.orden_servicio_id, table.producto_id] }),
  };
});

// TABLA DE COMPRAS (para mantener compatibilidad con código existente)
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow(),
  supplier: text("supplier").notNull(),
  totalCost: integer("total_cost").notNull(),
  items: json("items").notNull(), // Array of { productId, quantity, cost }
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const loginSchema = z.object({
  rut: z.string().min(1, "RUT es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertProductCompatibilitySchema = createInsertSchema(productVehicleCompatibility).omit({ id: true });
export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({ id: true });
export const insertServiceItemSchema = createInsertSchema(serviceItems).omit({ id: true });
export const insertProductUsedSchema = createInsertSchema(productsUsedInService);
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, date: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type ProductCompatibility = typeof productVehicleCompatibility.$inferSelect;
export type InsertProductCompatibility = z.infer<typeof insertProductCompatibilitySchema>;

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;

export type ServiceItem = typeof serviceItems.$inferSelect;
export type InsertServiceItem = z.infer<typeof insertServiceItemSchema>;

export type ProductUsedInService = typeof productsUsedInService.$inferSelect;
export type InsertProductUsed = z.infer<typeof insertProductUsedSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
