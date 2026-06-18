# Pet Asset System

## Asset Strategy

หลักการสำคัญ: Asset ต้องถูกสร้างตาม Product Validation ไม่ใช่สร้างตาม Feature Roadmap

เป้าหมายแรกคือพิสูจน์ว่า Task → EXP → Slime Growth สนุกจริงหรือไม่

ดังนั้น Asset ที่สร้างก่อนต้องเป็น Asset ที่ช่วยแสดง Progression ไม่ใช่ Asset สำหรับ Customization

---

## Phase 1 — MVP

Goal: พิสูจน์ Pet Progression Loop

### Body Evolution

```
body/
├── egg.png
├── baby_slime.png
├── teen_slime.png
└── adult_slime.png
```

รวม 4 Assets

---

### Facial Expressions

```
expression/
├── normal.png
├── happy.png
├── sad.png
└── sleep.png
```

รวม 4 Assets

---

### Emotes

```
emote/
├── heart.png
├── level_up.png
├── sleep.png
└── sad.png
```

รวม 4 Assets

---

### Animations

```
idle/
├── idle_01
├── idle_02
├── idle_03
└── idle_04

happy/
├── happy_01
├── happy_02
├── happy_03
└── happy_04
```

รวม 2 Animation Sets

---

### Background

```
background/
└── grassland.png
```

รวม 1 Scene

---

### Total MVP Assets

| Category       | Count |
|----------------|-------|
| Body           | 4     |
| Expression     | 4     |
| Emote          | 4     |
| Background     | 1     |
| Animation Sets | 2     |
| **Total**      | **ประมาณ 15–20 Assets** |

---

## Phase 2 — Engagement

Goal: เพิ่ม Emotional Attachment

**New Animations**

```
celebrate/
sleep/
study/
excited/
```

**New Expressions**

- cool
- thinking
- crying

**New Backgrounds**

- bedroom.png

**Result:** Slime เริ่มมี Personality

---

## Phase 3 — Customization

Goal: Ownership

### Head Slot

```
head/
├── hat
├── crown
└── wizard_hat
```

### Face Slot

```
face/
├── glasses
└── mask
```

### Back Slot

```
back/
├── cape
└── wings
```

**Important:** ทุกชิ้นต้องออกแบบจาก Anchor Point เดียวกัน เพื่อให้ Frontend Overlay ได้ง่าย

| Slot | x | y |
|------|---|---|
| Head | 50% | 20% |
| Face | 50% | 40% |
| Back | 50% | 50% |

---

## Phase 4 — Evolution Branch

Goal: Long-Term Progression

**Adult Variants**

- adult_wizard
- adult_knight
- adult_scholar

**Reuse Assets:** ใช้ Adult Slime ตัวเดิม เพิ่ม Layer (Hat · Aura · Effects) ก่อน — ห้ามวาด Body ใหม่ทันที

---

## Folder Structure

```
assets/
├── body/
│   ├── egg.png
│   ├── baby.png
│   ├── teen.png
│   └── adult.png
├── expression/
│   ├── normal.png
│   ├── happy.png
│   ├── sad.png
│   └── sleep.png
├── emote/
│   ├── heart.png
│   ├── level_up.png
│   ├── sleep.png
│   └── sad.png
├── background/
│   ├── grassland.png
│   └── bedroom.png
├── head/
│   ├── hat.png
│   ├── crown.png
│   └── wizard_hat.png
├── face/
│   ├── glasses.png
│   └── mask.png
├── back/
│   ├── cape.png
│   └── wings.png
└── effect/
    ├── sparkle.png
    ├── aura_blue.png
    └── aura_gold.png
```

---

## Technical Recommendation

ทุก Asset ควรเป็น **SVG** ถ้าเป็นไปได้

เหตุผล

- ขนาดไฟล์เล็ก
- Scale ได้ทุก Resolution
- เปลี่ยนสีได้ง่าย
- รองรับ Layer System ดี

ใช้ **PNG** เฉพาะกรณี

- เอฟเฟกต์ซับซ้อน
- งานวาดละเอียด
- Animation Export จาก Spine/Rive

---

## Priority Order

1. Body Evolution
2. Expressions
3. Emotes
4. Idle Animation
5. Happy Animation
6. Grassland Background

หลังจากนั้นค่อยเริ่ม

- Bedroom
- Costumes
- Inventory
- Evolution Branch

เพราะทั้งหมดนั้นไม่ช่วยพิสูจน์ Product Loop หลัก
