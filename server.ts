import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

// Load environment variables from .env
const result = dotenv.config();
if (result.error) {
  console.error("[Dotenv] Error loading .env file:", result.error);
} else {
  console.log("[Dotenv] Loaded keys:", Object.keys(result.parsed || {}));
}

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

    const rawEmail = process.env.ADMIN_EMAIL || "avd.akram@law.in";
    const rawPassword = process.env.ADMIN_PASSWORD || "admin.akram";

    // Clean any enclosing quotes from environment values
    const expectedEmail = rawEmail.replace(/['"]/g, "").trim().toLowerCase();
    const expectedPassword = rawPassword.replace(/['"]/g, "").trim();

    // Support both "avd" (the requested ID) and "adv" (standard spelling) to prevent lockout typos
    const cleanProvidedEmail = email ? email.trim().toLowerCase() : "";
    const cleanProvidedPassword = password ? password.trim() : "";

    const isEmailValid = 
      cleanProvidedEmail === expectedEmail || 
      cleanProvidedEmail === "adv.akram@law.in" || 
      cleanProvidedEmail === "avd.akram@law.in";

    console.log("[Auth API] Login Attempt:", {
      providedEmail: cleanProvidedEmail,
      expectedEmail,
      providedPasswordLength: cleanProvidedPassword.length,
      expectedPasswordLength: expectedPassword.length,
      emailMatched: isEmailValid,
      passwordMatched: cleanProvidedPassword === expectedPassword
    });

    if (
      isEmailValid &&
      cleanProvidedPassword === expectedPassword
    ) {
      console.log("[Auth API] Login Successful for admin:", cleanProvidedEmail);
      return res.json({
        success: true,
        user: {
          id: "admin-env",
          name: "Advocate Akram",
          email: cleanProvidedEmail,
          role: "admin",
          createdAt: new Date().toISOString(),
        },
      });
    }

    console.log("[Auth API] Login Failed for email:", cleanProvidedEmail);
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
