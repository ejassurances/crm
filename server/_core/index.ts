import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const app = express();
const server = createServer(app);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerStorageProxy(app);
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);

if (process.env.NODE_ENV === "development") {
  setupVite(app, server);
} else {
  serveStatic(app);
}

export default app;

// Ne pas écouter sur Vercel
if (process.env.VERCEL !== "1") {
  async function findAvailablePort(start = 3000) {
    for (let p = start; p < start + 20; p++) {
      const ok = await new Promise(r => {
        const s = net.createServer();
        s.listen(p, () => s.close(() => r(true)));
        s.on("error", () => r(false));
      });
      if (ok) return p;
    }
    throw new Error("No available port");
  }
  findAvailablePort(parseInt(process.env.PORT || "3000")).then(port => {
    server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
  });
}
