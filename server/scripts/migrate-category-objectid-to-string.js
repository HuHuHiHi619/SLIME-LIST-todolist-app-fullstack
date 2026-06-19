/**
 * One-shot migration: Tasks.category ObjectId refs -> category name strings.
 *
 * Context: `Tasks.category` was changed from ObjectId ref to `{ type: String }`
 * in Phase 3. Tasks created before that change still hold a BSON ObjectId in
 * the `category` field, which causes the summary aggregate to group them under
 * their raw ObjectId instead of a readable name. This resolves each ObjectId to
 * the corresponding Category.categoryName and writes it back as a plain string.
 *
 * Tasks already storing a string (new format) are skipped — idempotent.
 * Tasks with an ObjectId that no longer has a matching Category doc are set to null.
 *
 * Usage (from server/):
 *   node scripts/migrate-category-objectid-to-string.js --dry     # report only, no writes
 *   node scripts/migrate-category-objectid-to-string.js           # apply
 *   NODE_ENV=production node scripts/migrate-category-objectid-to-string.js --dry
 */
const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "..", `.env.${(process.env.NODE_ENV || "development").trim()}`),
});

const mongoose = require("mongoose");

const DRY_RUN = process.argv.includes("--dry");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is undefined — check .env.<NODE_ENV>");

  const env = (process.env.NODE_ENV || "development").trim();
  console.log(`\n[migrate-category-objectid-to-string] env=${env} dry=${DRY_RUN}`);
  await mongoose.connect(uri);
  console.log("connected.\n");

  const db = mongoose.connection.db;
  const tasksCol = db.collection("tasks");
  const categoriesCol = db.collection("categories");

  const categoryDocs = await categoriesCol.find({}).toArray();
  const categoryName = new Map(categoryDocs.map((c) => [String(c._id), c.categoryName]));
  console.log(`loaded ${categoryDocs.length} category doc(s).`);

  const counts = { scanned: 0, remapped: 0, nulled: 0, skipped: 0 };

  // Only tasks where category is a BSON ObjectId (type 7)
  const cursor = tasksCol.find({ category: { $type: "objectId" } });
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    counts.scanned += 1;

    const resolved = categoryName.get(String(doc.category));
    const newValue = resolved ?? null;

    if (!DRY_RUN) {
      await tasksCol.updateOne({ _id: doc._id }, { $set: { category: newValue } });
    }

    if (resolved) counts.remapped += 1;
    else counts.nulled += 1;
  }

  counts.skipped = (await tasksCol.countDocuments()) - counts.scanned;

  console.log("\n--- summary ---");
  console.log(`scanned:  ${counts.scanned}  (ObjectId category tasks)`);
  console.log(`remapped: ${counts.remapped}  (set to categoryName string)`);
  console.log(`nulled:   ${counts.nulled}  (category doc not found — set to null)`);
  console.log(`skipped:  ${counts.skipped}  (already string or no category — untouched)`);
  console.log(DRY_RUN ? "\nDRY RUN — no documents were modified.\n" : "\nDone.\n");
}

run()
  .catch((err) => {
    console.error("\nMigration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
