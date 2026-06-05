/**
 * One-shot migration: Tag-collection refs -> `priority` string-enum field on Tasks.
 *
 * Cluster B #2. Context: `tag` was a (mostly unused) ObjectId ref into a `Tag`
 * collection whose docs hold tagName low|medium|high. We dissolved that into a
 * plain `priority` field on Tasks (Models/Tasks.js). This backfills existing docs.
 *
 * For each task:
 *   - if it already has a valid `priority` and no legacy `tag`, skip (idempotent);
 *   - otherwise set `priority` from the referenced Tag's tagName when resolvable,
 *     else default to "low"; and `$unset` the legacy `tag` field.
 *
 * Runs against the raw driver collection: `tag` is no longer in the Mongoose
 * schema, so strict mode would hide it on read and drop a $unset on write.
 *
 * Usage (from server/):
 *   node scripts/migrate-tag-to-priority.js --dry     # report only, no writes
 *   node scripts/migrate-tag-to-priority.js           # apply
 *   NODE_ENV=production node scripts/migrate-tag-to-priority.js --dry
 */
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", `.env.${(process.env.NODE_ENV || "development").trim()}`),
});

const mongoose = require("mongoose");
const { PRIORITIES } = require("../shared/utils/taskConstants");

const DRY_RUN = process.argv.includes("--dry");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is undefined — check .env.<NODE_ENV>");

  const env = (process.env.NODE_ENV || "development").trim();
  console.log(`\n[migrate-tag-to-priority] env=${env} dry=${DRY_RUN}`);
  await mongoose.connect(uri);
  console.log("connected.\n");

  const db = mongoose.connection.db;
  const tasksCol = db.collection("tasks"); // raw driver collection — bypasses schema
  const tagsCol = db.collection("tags");

  // Build tagId -> tagName lookup (collection survives the Tag model deletion).
  const tagDocs = await tagsCol.find({}).toArray();
  const tagName = new Map(tagDocs.map((t) => [String(t._id), t.tagName]));
  console.log(`loaded ${tagDocs.length} legacy tag doc(s).`);

  const counts = { scanned: 0, remapped: 0, defaulted: 0, tagUnset: 0, skipped: 0 };

  const cursor = tasksCol.find({});
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    counts.scanned += 1;

    const hasValidPriority = PRIORITIES.includes(doc.priority);
    const hasTag = doc.tag !== undefined && doc.tag !== null;

    if (hasValidPriority && !hasTag) {
      counts.skipped += 1;
      continue;
    }

    const update = {};

    if (!hasValidPriority) {
      const resolved = hasTag ? tagName.get(String(doc.tag)) : null;
      const newPriority = PRIORITIES.includes(resolved) ? resolved : "low";
      update.$set = { priority: newPriority };
      if (resolved && PRIORITIES.includes(resolved)) counts.remapped += 1;
      else counts.defaulted += 1;
    }

    if (hasTag) {
      update.$unset = { tag: "" };
      counts.tagUnset += 1;
    }

    if (!DRY_RUN) {
      await tasksCol.updateOne({ _id: doc._id }, update);
    }
  }

  console.log("\n--- summary ---");
  console.log(`scanned:   ${counts.scanned}`);
  console.log(`remapped:  ${counts.remapped}  (priority taken from referenced Tag)`);
  console.log(`defaulted: ${counts.defaulted}  (priority set to "low")`);
  console.log(`tag unset: ${counts.tagUnset}  (legacy tag field removed)`);
  console.log(`skipped:   ${counts.skipped}  (already migrated)`);
  console.log(DRY_RUN ? "\nDRY RUN — no documents were modified.\n" : "\nDone.\n");
}

run()
  .catch((err) => {
    console.error("\nMigration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
