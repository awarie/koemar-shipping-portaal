import {
  users,
  shipments,
  activities,
  userLogs,
  shippingPrices,
  shippingSchedules,
  packages,
  packageNumberReservations,
  type User,
  type UpsertUser,
  type Shipment,
  type InsertShipment,
  type Activity,
  type InsertActivity,
  type UserLog,
  type InsertUserLog,
  type ShippingPrice,
  type InsertShippingPrice,
  type ShippingSchedule,
  type InsertShippingSchedule,
  type Package,
  type InsertPackage,
  type PackageNumberReservation,
  type InsertPackageNumberReservation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lt, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Shipment operations
  getShipments(): Promise<Shipment[]>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  
  // Activity operations
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // User log operations
  getUserLogs(limit?: number): Promise<UserLog[]>;
  createUserLog(userLog: InsertUserLog): Promise<UserLog>;
  
  // Shipping price operations
  getShippingPrices(): Promise<ShippingPrice[]>;
  updateShippingPrice(id: string, price: string): Promise<ShippingPrice>;
  
  // Shipping schedule operations
  getShippingSchedules(): Promise<ShippingSchedule[]>;
  updateShippingSchedule(id: string, schedule: Partial<InsertShippingSchedule>): Promise<ShippingSchedule>;
  
  // Package operations
  generatePackageNumber(destination: string, transportType: string): Promise<string>;
  reservePackageNumber(packageNumber: string, userId: string): Promise<PackageNumberReservation>;
  releaseExpiredReservations(): Promise<void>;
  createPackage(packageData: InsertPackage): Promise<Package>;
  getPackages(userId?: string): Promise<Package[]>;
  getPackageByNumber(packageNumber: string): Promise<Package | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ password, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Shipment operations
  async getShipments(): Promise<Shipment[]> {
    return await db.select().from(shipments).orderBy(desc(shipments.createdAt));
  }

  async createShipment(shipmentData: InsertShipment): Promise<Shipment> {
    const [shipment] = await db
      .insert(shipments)
      .values(shipmentData)
      .returning();
    return shipment;
  }

  // Activity operations
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  // User log operations
  async getUserLogs(limit: number = 50): Promise<UserLog[]> {
    return await db
      .select()
      .from(userLogs)
      .orderBy(desc(userLogs.createdAt))
      .limit(limit);
  }

  async createUserLog(userLogData: InsertUserLog): Promise<UserLog> {
    const [userLog] = await db
      .insert(userLogs)
      .values(userLogData)
      .returning();
    return userLog;
  }

  async clearLogs(): Promise<void> {
    await db.delete(userLogs);
  }

  async logUserActivity(userId: string, action: string, description: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.createUserLog({
      userId,
      action,
      description,
      ipAddress,
      userAgent
    });
  }

  // Shipping price operations
  async getShippingPrices(): Promise<ShippingPrice[]> {
    return await db.select().from(shippingPrices).orderBy(shippingPrices.type, shippingPrices.destination, shippingPrices.size);
  }

  async updateShippingPrice(id: string, price: string): Promise<ShippingPrice> {
    const [updatedPrice] = await db
      .update(shippingPrices)
      .set({ price, updatedAt: new Date() })
      .where(eq(shippingPrices.id, id))
      .returning();
    return updatedPrice;
  }

  // Shipping schedule operations
  async getShippingSchedules(): Promise<ShippingSchedule[]> {
    return await db.select().from(shippingSchedules).orderBy(shippingSchedules.type, shippingSchedules.destination);
  }

  async updateShippingSchedule(id: string, scheduleData: Partial<InsertShippingSchedule>): Promise<ShippingSchedule> {
    const [updatedSchedule] = await db
      .update(shippingSchedules)
      .set({ ...scheduleData, updatedAt: new Date() })
      .where(eq(shippingSchedules.id, id))
      .returning();
    return updatedSchedule;
  }

  // Package operations
  async generatePackageNumber(destination: string, transportType: string): Promise<string> {
    // Country codes mapping
    const countryCodes = {
      'suriname': { sea: 'KZ', air: 'KL' },
      'curacao': { sea: 'CZ', air: 'CL' },
      'aruba': { sea: 'AZ', air: 'AL' },
      'bonaire': { sea: 'BZ', air: 'BL' },
      'st_maarten': { sea: 'STMZ', air: 'STML' }
    };

    const countryCode = countryCodes[destination as keyof typeof countryCodes];
    if (!countryCode) {
      throw new Error('Invalid destination');
    }

    const code = transportType === 'sea' ? countryCode.sea : countryCode.air;
    
    // Generate unique 5 digits
    let packageNumber: string;
    let isUnique = false;
    
    while (!isUnique) {
      const randomDigits = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
      packageNumber = `${code}${randomDigits}`;
      
      // Check if package number already exists
      const [existingPackage] = await db.select().from(packages).where(eq(packages.packageNumber, packageNumber));
      const [existingReservation] = await db.select().from(packageNumberReservations).where(eq(packageNumberReservations.packageNumber, packageNumber));
      
      if (!existingPackage && !existingReservation) {
        isUnique = true;
      }
    }
    
    return packageNumber!;
  }

  async reservePackageNumber(packageNumber: string, userId: string): Promise<PackageNumberReservation> {
    // First clean up expired reservations
    await this.releaseExpiredReservations();
    
    // Create 30-minute reservation
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    
    const [reservation] = await db
      .insert(packageNumberReservations)
      .values({
        packageNumber,
        userId,
        expiresAt
      })
      .returning();
    return reservation;
  }

  async releaseExpiredReservations(): Promise<void> {
    const now = new Date();
    await db
      .delete(packageNumberReservations)
      .where(lt(packageNumberReservations.expiresAt, now));
  }

  async createPackage(packageData: InsertPackage): Promise<Package> {
    // Remove any reservation for this package number
    await db
      .delete(packageNumberReservations)
      .where(eq(packageNumberReservations.packageNumber, packageData.packageNumber));
    
    const [newPackage] = await db
      .insert(packages)
      .values(packageData)
      .returning();
    return newPackage;
  }

  async getPackages(userId?: string): Promise<Package[]> {
    if (userId) {
      return await db
        .select()
        .from(packages)
        .where(eq(packages.userId, userId))
        .orderBy(desc(packages.createdAt));
    }
    return await db
      .select()
      .from(packages)
      .orderBy(desc(packages.createdAt));
  }

  async getPackageByNumber(packageNumber: string): Promise<Package | undefined> {
    const [foundPackage] = await db
      .select()
      .from(packages)
      .where(eq(packages.packageNumber, packageNumber));
    return foundPackage;
  }

  async getPackageStatistics(): Promise<{
    air: {
      aangemeld: number;
      vertrokken: number;
      aangekomen: number;
      afgeleverd: number;
      total: number;
    };
    sea: {
      aangemeld: number;
      vertrokken: number;
      aangekomen: number;
      afgeleverd: number;
      total: number;
    };
  }> {
    const results = await db
      .select({
        transportType: packages.transportType,
        status: packages.status,
        count: sql<number>`count(*)::int`.as('count')
      })
      .from(packages)
      .groupBy(packages.transportType, packages.status);

    const stats = {
      air: {
        aangemeld: 0,
        vertrokken: 0,
        aangekomen: 0,
        afgeleverd: 0,
        total: 0
      },
      sea: {
        aangemeld: 0,
        vertrokken: 0,
        aangekomen: 0,
        afgeleverd: 0,
        total: 0
      }
    };

    results.forEach((result) => {
      const transportType = result.transportType as 'air' | 'sea';
      const status = result.status as 'aangemeld' | 'vertrokken' | 'aangekomen' | 'afgeleverd';
      if (transportType in stats && status in stats[transportType]) {
        stats[transportType][status] = result.count;
        stats[transportType].total += result.count;
      }
    });

    return stats;
  }

  async updatePackageStatus(packageNumber: string, status: string): Promise<Package> {
    const [updatedPackage] = await db
      .update(packages)
      .set({ status, updatedAt: new Date() })
      .where(eq(packages.packageNumber, packageNumber))
      .returning();
    return updatedPackage;
  }
}

export const storage = new DatabaseStorage();
