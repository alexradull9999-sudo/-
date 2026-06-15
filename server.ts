import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(compression());
app.use(express.json());

// Health check
app.get("/api/health", (_, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Раздача публичных файлов (картинки, favicon и т.д.)
const publicPath = path.join(process.cwd(), "public");
app.use(express.static(publicPath));

// Раздача React-статики из dist/
const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath, {
  maxAge: "1y",
  etag: true,
}));

// SPA fallback
app.get("*", (_, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
