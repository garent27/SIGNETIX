// Production static server for the built app (npm run build first).
// Serves dist/ on :3000 with SPA fallback.
import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = join(__dirname, "dist");
const app = express();

app.use(express.static(dist));
app.get("*", (_req, res) => res.sendFile(join(dist, "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Signetix running at http://localhost:${port}`));
