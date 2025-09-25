import { storage } from "./storage";
import type { Request } from "express";

interface LogUserActionOptions {
  userId?: string;
  action: string;
  description: string;
  req: Request;
}

export async function logUserAction({ userId, action, description, req }: LogUserActionOptions): Promise<void> {
  try {
    const ipAddress = req.ip || 
      req.connection.remoteAddress || 
      req.socket.remoteAddress || 
      (req.connection as any)?.socket?.remoteAddress ||
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      'unknown';

    const userAgent = req.headers['user-agent'] || 'unknown';

    await storage.createUserLog({
      userId: userId || null,
      action,
      description,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent,
    });
  } catch (error) {
    console.error('Failed to log user action:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

// Helper functions for common log actions
export const logLogin = (userId: string, email: string, req: Request) => 
  logUserAction({
    userId,
    action: 'login',
    description: `Gebruiker ${email} is ingelogd`,
    req
  });

export const logLogout = (userId: string, email: string, req: Request) => 
  logUserAction({
    userId,
    action: 'logout', 
    description: `Gebruiker ${email} is uitgelogd`,
    req
  });

export const logCreateUser = (adminId: string, newUserEmail: string, req: Request) =>
  logUserAction({
    userId: adminId,
    action: 'create_user',
    description: `Admin heeft nieuwe gebruiker aangemaakt: ${newUserEmail}`,
    req
  });

export const logDeleteUser = (adminId: string, deletedUserEmail: string, req: Request) =>
  logUserAction({
    userId: adminId,
    action: 'delete_user',
    description: `Admin heeft gebruiker verwijderd: ${deletedUserEmail}`,
    req
  });

export const logPasswordChange = (adminId: string, targetUserEmail: string, req: Request) =>
  logUserAction({
    userId: adminId,
    action: 'change_password',
    description: `Admin heeft wachtwoord gewijzigd voor gebruiker: ${targetUserEmail}`,
    req
  });