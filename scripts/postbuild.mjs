import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const adminDir = path.join(distDir, "admin");

fs.mkdirSync(adminDir, { recursive: true });
fs.copyFileSync(path.join(distDir, "index.html"), path.join(adminDir, "index.html"));

console.log("Postbuild complete: dist/admin/index.html");
