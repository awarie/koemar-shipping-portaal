import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
} from "drizzle-orm/pg-core";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // Optional for OIDC users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  phoneNumber: varchar("phone_number"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("Verkoper"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User activity logs table for tracking all user actions
export const userLogs = pgTable("user_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // 'login', 'logout', 'create_user', 'delete_user', 'change_password', etc.
  description: varchar("description").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: varchar("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shipments table for logistics data
export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shipmentNumber: varchar("shipment_number").notNull().unique(),
  customer: varchar("customer").notNull(),
  destination: varchar("destination").notNull(),
  status: varchar("status").notNull(),
  eta: varchar("eta"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activities table for tracking logistics operations
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(),
  description: text("description").notNull(),
  shipmentId: varchar("shipment_id"),
  vehicleId: varchar("vehicle_id"),
  routeId: varchar("route_id"),
  warehouseId: varchar("warehouse_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;
export type Shipment = typeof shipments.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Activity = typeof activities.$inferSelect;
// Shipping prices table for managing zeevracht and luchtvracht prices
export const shippingPrices = pgTable("shipping_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'zeevracht' or 'luchtvracht'
  size: varchar("size"), // For zeevracht: '60L', '80L', '120L', '160L', '240L'. For luchtvracht: null
  destination: varchar("destination").notNull(), // 'suriname', 'aruba', 'curacao', 'bonaire', 'st_maarten'
  price: varchar("price").notNull(),
  unit: varchar("unit").notNull(), // 'per_box' or 'per_kilo'
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shipping schedules table for managing closing dates
export const shippingSchedules = pgTable("shipping_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type").notNull(), // 'zeevracht' or 'luchtvracht'
  destination: varchar("destination").notNull(),
  closingDate: varchar("closing_date").notNull(),
  departureDate: varchar("departure_date"),
  arrivalDate: varchar("arrival_date"), // Aankomstdatum (optional)
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type InsertUserLog = typeof userLogs.$inferInsert;
export type UserLog = typeof userLogs.$inferSelect;
export type InsertShippingPrice = typeof shippingPrices.$inferInsert;
export type ShippingPrice = typeof shippingPrices.$inferSelect;

// Package registrations table
export const packages = pgTable("packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageNumber: varchar("package_number").notNull().unique(),
  transportType: varchar("transport_type").notNull(), // 'sea' or 'air'
  destination: varchar("destination").notNull(), // 'suriname', 'curacao', 'aruba', 'bonaire', 'st_maarten'
  weight: varchar("weight").notNull(),
  calculatedPrice: varchar("calculated_price").notNull(),
  manualPrice: varchar("manual_price"), // Handmatig aangepaste prijs
  finalPrice: varchar("final_price").notNull(), // Uiteindelijke prijs (berekend of handmatig)
  
  // Package details
  packageContent: varchar("package_content"), // Inhoud van het pakket
  packageValue: varchar("package_value"), // Waarde van het pakket
  
  // Payment method
  paymentCash: boolean("payment_cash").default(false),
  paymentPin: boolean("payment_pin").default(false),
  paymentAccount: boolean("payment_account").default(false),
  
  // Sender details - uitgebreide NAW gegevens
  senderFirstName: varchar("sender_first_name").notNull(),
  senderLastName: varchar("sender_last_name").notNull(),
  senderAddress: varchar("sender_address").notNull(),
  senderCity: varchar("sender_city").notNull(),
  senderCountry: varchar("sender_country"),
  senderPhone: varchar("sender_phone"),
  senderMobile: varchar("sender_mobile"),
  senderEmail: varchar("sender_email"),
  
  // Receiver details - uitgebreide NAW gegevens  
  receiverFirstName: varchar("receiver_first_name").notNull(),
  receiverLastName: varchar("receiver_last_name").notNull(),
  receiverAddress: varchar("receiver_address").notNull(),
  receiverCity: varchar("receiver_city").notNull(),
  receiverCountry: varchar("receiver_country"),
  receiverPhone: varchar("receiver_phone"),
  receiverMobile: varchar("receiver_mobile"),
  receiverEmail: varchar("receiver_email"),
  
  // System fields
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status").notNull().default("aangemeld"), // 'aangemeld', 'vertrokken', 'aangekomen', 'afgeleverd'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Package number reservations table (for 30-minute reservation system)
export const packageNumberReservations = pgTable("package_number_reservations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  packageNumber: varchar("package_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type InsertPackage = typeof packages.$inferInsert;
export type Package = typeof packages.$inferSelect;
export type InsertPackageNumberReservation = typeof packageNumberReservations.$inferInsert;
export type PackageNumberReservation = typeof packageNumberReservations.$inferSelect;
export type InsertShippingSchedule = typeof shippingSchedules.$inferInsert;
export type ShippingSchedule = typeof shippingSchedules.$inferSelect;
