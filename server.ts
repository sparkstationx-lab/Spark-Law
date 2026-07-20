import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies for API requests
  app.use(express.json());

  // API Route: Get public auth configurations (e.g. configured admin email)
  app.get("/api/auth/config", (req, res) => {
    const adminEmail = process.env.ADMIN_EMAIL || "avd.akram@law.in";
    res.json({ adminEmail });
  });

  // API Route: Secure Server-Side Login Verification
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;

    const expectedEmail = (process.env.ADMIN_EMAIL || "avd.akram@law.in").trim().toLowerCase();
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin.akram";

    if (
      email &&
      password &&
      email.trim().toLowerCase() === expectedEmail &&
      password === expectedPassword
    ) {
      return res.json({
        success: true,
        user: {
          id: "admin-env",
          name: "Advocate Akram",
          email: expectedEmail,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  });

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
