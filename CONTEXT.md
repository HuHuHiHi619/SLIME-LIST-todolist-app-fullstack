# CONTEXT.md — SlimeList Domain Glossary

Pure domain language. No implementation details, no open questions.
When a term is used in planning or code, it means exactly what is defined here.

---

## Entities

**User**
A person with an account. Owns a Pet, Tasks, and an Inventory. Authenticated via email/password (JWT). Has a Streak counter.

**Guest**
An unauthenticated visitor. Has full access to Tasks, Pet, Dashboard, and Pomodoro. Pet progress is stored in MongoDB (same as guest tasks), tied to the `guestId` cookie. Prompted to register to sync progress across devices. Becomes a User on signup — the Pet document is reassigned to the new User.

**Pet**
The virtual companion owned by a User or Guest. Has Level, EXP, Happiness, and an Evolution Stage. The Pet is the primary visual representation of the user's productivity progress.

**Task**
A unit of work created by a User or Guest. Has a title, Priority, Category, Status, optional deadline, and optional subtask steps. Completing a Task awards the Pet EXP and the User Coins.

**Category**
A label that groups Tasks. Defaults: Work, Study, Health, Personal. Auto-created when a User types a new name — no pre-creation required.

**Pomodoro Session**
A timed focus block chosen by the User. Completing a session awards the Pet Happiness and EXP. Does not require a Task to be linked.

**Inventory**
The collection of cosmetic items owned by a User. Items are purchased with Coins. Cosmetics affect Pet appearance only — no gameplay effect.

---

## Pet Stats

**EXP (Experience Points)**
Accumulated by completing Tasks and Pomodoro Sessions. Determines the Pet's Level. EXP is always additive — it never decreases.

**Level**
The Pet's progression marker. Each level N costs `N × 100` EXP to complete — escalating cost makes early levels fast and rewarding, higher levels genuinely earned.
- Total EXP to reach Level 5 (Baby): 1,500
- Total EXP to reach Level 15 (Teen gate): 12,000
- Total EXP to reach Level 30 (Adult gate): 46,500

Unlocks visual rewards at specific levels (animation, color, accessory, evolution).

**Happiness**
A 0–100 stat on the Pet. Increased by completing Tasks (Easy +1, Medium +2, Hard +3) and Pomodoro Sessions (+8). Decays by 1 per day. Ranges: 0–30 = Sad, 31–70 = Normal, 71–100 = Happy.

**Badge**
Removed. The prior `iron → bronze → silver → gold` badge system on the User model is replaced entirely by Evolution Stages. The Pet is the sole long-term progression reward.

**Evolution Stage**
The Pet's current form. Four stages with gates. Happiness gates apply in **both directions** — a pet that drops below the threshold reverts to the previous stage. Evolution is not permanent until the happiness floor is maintained.
- **Egg** — starting stage
- **Baby** — reached at Level 5 (no happiness gate; cannot revert)
- **Teen** — requires Level 15 AND Happiness ≥ 50; reverts to Baby if Happiness drops below 50
- **Adult** — requires Level 30 AND Happiness ≥ 80; reverts to Teen if Happiness drops below 80

---

## Reward Mechanics

**Priority**
The effort level of a Task. Determines EXP and Coin reward on completion.
Data model values: `low` / `medium` / `high`. UI display labels: "Easy" / "Medium" / "Hard".
- **Low (Easy)** — 10 EXP, 5 Coins
- **Medium (Medium)** — 25 EXP, 10 Coins
- **High (Hard)** — 50 EXP, 20 Coins

**Coin**
Currency earned by completing Tasks. Spent in the cosmetic shop to unlock Inventory items. Has no effect on gameplay. The shop is locked until the Pet reaches Level 5 — content unlocks progressively as the Pet grows.

**Happy Buff**
A passive bonus active when Pet Happiness ≥ 71. Increases all Task EXP rewards by 20%.

**Streak**
The count of consecutive days on which a User completed at least one Task. Breaking the Streak removes the Streak Bonus but does not affect EXP already earned.

**Streak Bonus**
An EXP multiplier applied to Task rewards based on current Streak length:
- 3 days → +5%
- 7 days → +10%
- 14 days → +15%
- 30 days → +20%
