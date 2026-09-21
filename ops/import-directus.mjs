#!/usr/bin/env node
// One-way import of the public events from the previous Directus CMS into
// the Worker's D1 database and R2 bucket. Only public data is read (the same
// JSON the old site displays); registrations never existed there.
//
// Usage: node ops/import-directus.mjs --env staging|production [--dry-run]
//
// Re-running is safe: events are upserted by their Directus id and images are
// re-uploaded under the same key. Events deleted in Directus are not removed.

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIRECTUS = "https://api.terra-indomita.ca";
const ACCOUNT_ID = "3aa12f83f9d4006cfd805489b6d65eb8";
const TARGETS = {
  staging: { db: "terra-indomita-staging", bucket: "terra-indomita-images-staging" },
  production: { db: "terra-indomita-prod", bucket: "terra-indomita-images-prod" },
};
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

const args = process.argv.slice(2);
const envName = args[args.indexOf("--env") + 1];
const dryRun = args.includes("--dry-run");
const target = TARGETS[envName];
if (!args.includes("--env") || !target) {
  console.error("Usage: node ops/import-directus.mjs --env staging|production [--dry-run]");
  process.exit(1);
}

const workerDir = join(dirname(fileURLToPath(import.meta.url)), "..", "worker");

function wrangler(...wranglerArgs) {
  execFileSync("npx", ["wrangler", ...wranglerArgs], {
    cwd: workerDir,
    stdio: ["ignore", "ignore", "inherit"],
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID },
  });
}

async function getJson(path) {
  const res = await fetch(`${DIRECTUS}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()).data;
}

const sql = (value) => (value === null || value === undefined ? "NULL" : `'${String(value).replace(/'/g, "''")}'`);

// Directus returned naive local times; keep them as-is, seconds included.
const localTime = (value) => (value ? value.slice(0, 19) : null);

const events = await getJson(
  "/items/events?limit=-1&sort=start&fields=id,title,start,end,location,description,featured_image",
);
const settings = await getJson("/items/global_settings");
const showCurrentEvents = (Array.isArray(settings) ? settings[0] : settings)?.showCurrentEvents ?? true;

console.log(`${events.length} événement(s) lus dans Directus → ${envName}${dryRun ? " (essai à blanc)" : ""}`);

const workDir = mkdtempSync(join(tmpdir(), "ti-import-"));
try {
  const statements = [];

  for (const event of events) {
    let imageKey = null;

    if (event.featured_image) {
      const res = await fetch(`${DIRECTUS}/assets/${event.featured_image}`);
      if (!res.ok) throw new Error(`image ${event.featured_image}: HTTP ${res.status}`);
      const type = (res.headers.get("content-type") ?? "").split(";")[0];
      const extension = EXTENSIONS[type];
      if (!extension) throw new Error(`image ${event.featured_image}: unsupported type ${type}`);

      imageKey = `${event.featured_image}.${extension}`;
      const file = join(workDir, imageKey);
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      if (!dryRun) {
        wrangler("r2", "object", "put", `${target.bucket}/${imageKey}`, "--file", file, "--content-type", type, "--remote");
      }
    }

    statements.push(
      `INSERT INTO events (id, title, start_at, end_at, location, description, image_key)
VALUES (${sql(event.id)}, ${sql(event.title?.trim())}, ${sql(localTime(event.start))}, ${sql(localTime(event.end))}, ${sql(event.location?.trim() ?? "")}, ${sql(event.description?.trim() ?? "")}, ${sql(imageKey)})
ON CONFLICT (id) DO UPDATE SET title = excluded.title, start_at = excluded.start_at, end_at = excluded.end_at,
  location = excluded.location, description = excluded.description, image_key = excluded.image_key,
  updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now');`,
    );
    console.log(`  ${localTime(event.start)}  ${event.title}${imageKey ? "  (+ image)" : ""}`);
  }

  statements.push(`UPDATE settings SET show_current_events = ${showCurrentEvents ? 1 : 0} WHERE id = 1;`);

  const sqlFile = join(workDir, "import.sql");
  writeFileSync(sqlFile, `${statements.join("\n\n")}\n`);
  if (dryRun) {
    console.log(`\nSQL généré (non appliqué) : ${sqlFile}`);
  } else {
    wrangler("d1", "execute", target.db, "--remote", "--file", sqlFile, "--yes");
    console.log("\nImport terminé.");
  }
} finally {
  if (!dryRun) rmSync(workDir, { recursive: true, force: true });
}
