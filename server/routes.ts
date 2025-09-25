import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, login } from "./auth";
import { sendEmail, generatePasswordResetEmailHtml } from "./emailService";
import { logLogin, logLogout, logCreateUser, logDeleteUser, logPasswordChange } from "./loggingService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await login(email, password);
      
      if (result.success && result.user) {
        req.session.userId = result.user.id;
        
        // Log successful login
        await logLogin(result.user.id, result.user.email, req);
        
        res.json({ success: true, user: result.user });
      } else {
        res.status(401).json({ success: false, message: result.message });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Login failed" });
    }
  });

  app.post('/api/logout', async (req: any, res) => {
    const userId = req.session?.userId;
    if (userId) {
      try {
        const user = await storage.getUser(userId);
        if (user) {
          await logLogout(userId, user.email, req);
        }
      } catch (error) {
        console.error("Error logging logout:", error);
      }
    }
    
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Shipments routes
  app.get('/api/shipments', isAuthenticated, async (req, res) => {
    try {
      const shipments = await storage.getShipments();
      res.json(shipments);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      res.status(500).json({ message: "Failed to fetch shipments" });
    }
  });

  app.post('/api/shipments', isAuthenticated, async (req, res) => {
    try {
      const shipment = await storage.createShipment(req.body);
      res.json(shipment);
    } catch (error) {
      console.error("Error creating shipment:", error);
      res.status(500).json({ message: "Failed to create shipment" });
    }
  });

  // Activities routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const activity = await storage.createActivity(req.body);
      res.json(activity);
    } catch (error) {
      console.error("Error creating activity:", error);
      res.status(500).json({ message: "Failed to create activity" });
    }
  });

  // Shipping prices routes
  app.get('/api/shipping-prices', async (req, res) => {
    try {
      const prices = await storage.getShippingPrices();
      res.json(prices);
    } catch (error) {
      console.error("Error fetching shipping prices:", error);
      res.status(500).json({ message: "Failed to fetch shipping prices" });
    }
  });

  app.put('/api/shipping-prices/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { id } = req.params;
      const { price } = req.body;
      
      if (!price) {
        return res.status(400).json({ message: "Price is required" });
      }

      const updatedPrice = await storage.updateShippingPrice(id, price);
      
      // Log the action
      const user = await storage.getUser(userId);
      await storage.createUserLog({
        userId,
        action: 'update_shipping_price',
        description: `Prijs bijgewerkt voor ${updatedPrice.type} ${updatedPrice.size || ''} ${updatedPrice.destination}: ${price}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedPrice);
    } catch (error) {
      console.error("Error updating shipping price:", error);
      res.status(500).json({ message: "Failed to update shipping price" });
    }
  });

  // Shipping schedules routes
  app.get('/api/shipping-schedules', async (req, res) => {
    try {
      const schedules = await storage.getShippingSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching shipping schedules:", error);
      res.status(500).json({ message: "Failed to fetch shipping schedules" });
    }
  });

  app.put('/api/shipping-schedules/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session?.userId;
      const { id } = req.params;
      const scheduleData = req.body;

      const updatedSchedule = await storage.updateShippingSchedule(id, scheduleData);
      
      // Log the action
      await storage.createUserLog({
        userId,
        action: 'update_shipping_schedule',
        description: `Afvaartschema bijgewerkt voor ${updatedSchedule.type} ${updatedSchedule.destination}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedSchedule);
    } catch (error) {
      console.error("Error updating shipping schedule:", error);
      res.status(500).json({ message: "Failed to update shipping schedule" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to LogiFlow notifications'
    }));
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  // Store WebSocket server reference for broadcasting
  app.set('wss', wss);
  
  // Add shipment update endpoint that triggers notifications
  app.post('/api/shipments/:id/update', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, eta } = req.body;
      
      // Create activity log
      await storage.createActivity({
        type: 'update',
        description: `Zending #${id} status bijgewerkt naar ${status}`,
        shipmentId: id,
      });
      
      // Broadcast notification to all connected clients
      const wss = app.get('wss') as WebSocketServer;
      const notification = {
        type: 'shipment_update',
        data: {
          shipmentId: id,
          status,
          eta,
          message: `Zending status bijgewerkt naar ${status}`,
          timestamp: new Date().toISOString()
        }
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(notification));
        }
      });
      
      res.json({ success: true, message: 'Shipment updated and notification sent' });
    } catch (error) {
      console.error("Error updating shipment:", error);
      res.status(500).json({ message: "Failed to update shipment" });
    }
  });

  // User management endpoints (Admin only)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session?.userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session?.userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const { email, password, firstName, lastName, role } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      const { phoneNumber } = req.body;
      
      const user = await storage.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        role,
      });
      
      // Log user creation
      await logCreateUser(currentUserId, email, req);
      
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session?.userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const { id } = req.params;
      
      // Don't allow deleting yourself
      if (id === currentUserId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Get user info before deleting for logging
      const userToDelete = await storage.getUser(id);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.deleteUser(id);
      
      // Log user deletion
      await logDeleteUser(currentUserId, userToDelete.email, req);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch('/api/users/:id/password', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session?.userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const { id } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Get user before updating
      const targetUser = await storage.getUser(id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update password
      const updatedUser = await storage.updateUserPassword(id, password);
      
      // Log password change
      await logPasswordChange(currentUserId, targetUser.email, req);
      
      // Send email notification
      if (targetUser.email) {
        try {
          await sendEmail({
            to: targetUser.email,
            subject: "Wachtwoord Gewijzigd - Koemar Shipping Pakket Portaal",
            html: generatePasswordResetEmailHtml(password)
          });
        } catch (emailError) {
          console.error("Failed to send password reset email:", emailError);
          console.log("Note: Make sure your SMTP configuration at suripost.nl/mail.php is correct");
          // Don't fail the request if email fails
        }
      }
      
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // User logs endpoint (Admin only)
  app.get('/api/logs', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session?.userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getUserLogs(limit);
      
      // Get user information for each log entry
      const logsWithUsers = await Promise.all(
        logs.map(async (log) => {
          let user = null;
          if (log.userId) {
            user = await storage.getUser(log.userId);
          }
          return {
            ...log,
            user: user ? { 
              id: user.id, 
              email: user.email, 
              firstName: user.firstName, 
              lastName: user.lastName 
            } : null
          };
        })
      );
      
      res.json(logsWithUsers);
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Clear all logs for admin
  app.delete('/api/logs', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.session?.userId;
      const currentUser = await storage.getUser(currentUserId);
      
      if (!currentUser || currentUser.role !== 'Admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
      }

      await storage.clearLogs();
      
      // Log the clear action
      await storage.logUserActivity(currentUserId, 'clear_logs', 'Admin heeft alle logs gewist', req.ip, req.get('User-Agent'));
      
      res.json({ message: "Logs cleared successfully" });
    } catch (error) {
      console.error("Error clearing logs:", error);
      res.status(500).json({ message: "Failed to clear logs" });
    }
  });

  // Package routes
  app.post('/api/generate-package-number', isAuthenticated, async (req: any, res) => {
    try {
      const { destination, transportType } = req.body;
      const userId = req.user?.claims?.sub;
      
      if (!destination || !transportType) {
        return res.status(400).json({ message: "Destination and transport type are required" });
      }
      
      const packageNumber = await storage.generatePackageNumber(destination, transportType);
      const reservation = await storage.reservePackageNumber(packageNumber, userId);
      
      // Log the action
      await storage.createUserLog({
        userId,
        action: 'generate_package_number',
        description: `Pakketnummer ${packageNumber} gegenereerd voor ${destination} (${transportType})`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({ packageNumber, expiresAt: reservation.expiresAt });
    } catch (error) {
      console.error("Error generating package number:", error);
      res.status(500).json({ message: "Failed to generate package number" });
    }
  });

  app.post('/api/packages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const packageData = req.body;
      
      // Add userId to package data
      packageData.userId = userId;
      
      // Map new fields to old fields for backward compatibility
      if (packageData.senderFirstName && packageData.senderLastName) {
        packageData.senderName = `${packageData.senderFirstName} ${packageData.senderLastName}`;
      }
      if (packageData.receiverFirstName && packageData.receiverLastName) {
        packageData.receiverName = `${packageData.receiverFirstName} ${packageData.receiverLastName}`;
      }
      
      const newPackage = await storage.createPackage(packageData);
      
      // Log the action
      await storage.createUserLog({
        userId,
        action: 'register_package',
        description: `Pakket ${newPackage.packageNumber} geregistreerd voor ${packageData.receiverFirstName} ${packageData.receiverLastName}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json(newPackage);
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Failed to create package" });
    }
  });

  app.get('/api/packages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const packages = await storage.getPackages(userId);
      res.json(packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
      res.status(500).json({ message: "Failed to fetch packages" });
    }
  });

  app.get('/api/packages/:packageNumber', isAuthenticated, async (req: any, res) => {
    try {
      const { packageNumber } = req.params;
      const foundPackage = await storage.getPackageByNumber(packageNumber);
      
      if (!foundPackage) {
        return res.status(404).json({ message: "Package not found" });
      }
      
      res.json(foundPackage);
    } catch (error) {
      console.error("Error fetching package:", error);
      res.status(500).json({ message: "Failed to fetch package" });
    }
  });

  app.get('/api/package-statistics', isAuthenticated, async (req: any, res) => {
    try {
      const statistics = await storage.getPackageStatistics();
      res.json(statistics);
    } catch (error) {
      console.error("Error fetching package statistics:", error);
      res.status(500).json({ message: "Failed to fetch package statistics" });
    }
  });

  app.patch('/api/packages/:packageNumber/status', isAuthenticated, async (req: any, res) => {
    try {
      const { packageNumber } = req.params;
      const { status } = req.body;
      const userId = req.user?.claims?.sub;

      if (!['aangemeld', 'vertrokken', 'aangekomen', 'afgeleverd'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedPackage = await storage.updatePackageStatus(packageNumber, status);
      
      // Log the action
      await storage.createUserLog({
        userId,
        action: 'update_package_status',
        description: `Status van pakket ${packageNumber} gewijzigd naar ${status}`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(updatedPackage);
    } catch (error) {
      console.error("Error updating package status:", error);
      res.status(500).json({ message: "Failed to update package status" });
    }
  });
  
  return httpServer;
}
