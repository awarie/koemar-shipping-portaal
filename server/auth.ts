import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    store: sessionStore,
    resave: true,
    saveUninitialized: true,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Create test user if it doesn't exist
  await createTestUser();
}

async function createTestUser() {
  try {
    const existingUser = await storage.getUserByEmail("aniel@poeran.nl");
    if (!existingUser) {
      await storage.createUser({
        email: "aniel@poeran.nl",
        password: "welkom01", // In production, this should be hashed
        firstName: "Aniel",
        lastName: "Poeran",
      });
      console.log("Test user created: aniel@poeran.nl");
    }
  } catch (error) {
    console.error("Error creating test user:", error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function login(email: string, password: string): Promise<{success: boolean, user?: any, message?: string}> {
  try {
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return { success: false, message: "Invalid email or password" };
    }

    // In production, you should use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return { success: false, message: "Invalid email or password" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Login failed" };
  }
}