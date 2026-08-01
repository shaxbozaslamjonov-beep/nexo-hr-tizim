# Nexo HR — Dizayn Tizimi Qo'llanmasi

> **Hujjat maqsadi:** platforma ustida ishlayotgan har bir dasturchi/dizayner uchun **bir qarashda** javob beruvchi qo'llanma — logo qayerda qaysi variantda ishlatiladi, tugmalar qanday, fon rangi qachon navy, qachon oq, qachon gradient. Yangi sahifa yasashdan avval shu hujjatga qarang — o'ylab topmasdan olib qo'llang.
>
> Manba: `nexo hr logotip brend book/nexo hr logotip.zip` (aslida PDF, v1.0, 2026), `src/app/globals.css`, mavjud komponent CSS'lari.

---

## 1. Brend qisqacha

- **Nom:** Nexo HR — Raqamli HR Platformasi
- **Missiya:** xodimlarni boshqarishni qog'oz va qo'lda ishlashdan yagona raqamli tizimga o'tkazish
- **Uchta qadriyat (matn urg'usi uchun):** Ishonch · Aniqlik · Rivojlanish
- **Uchta so'z bilan ohang:** professional, ishonchli, sodda
- **Odam-markazli, kompaniya-markazli emas** — "Xodimlarni boshqaringiz" ✓, "Biz eng yaxshi platformamiz" ✕

---

## 2. Logo

### 2.1 Fayllar (public/)

| Fayl | Qachon ishlatiladi |
|---|---|
| `nexo-hr-logo.svg` (520×150) | To'liq lock-up: `"Nexo HR"` matni + belgi + tagline. **Marketing sahifalar, email header, hujjat sarlavhalari, invoice, PDF eksport**. Faqat 200px kenglikdan katta joyda. |
| `nexo-hr-logo.png` | SVG ishlamaydigan muhitlar (masalan eski email mijozlar). Aks holda SVG'ni afzal ko'ring. |
| `nexo-hr-icon.svg` (120×120) | Faqat belgi (matnsiz). **Sidebar collapse holati, favicon, mobil app icon, avatar-o'lchamli joylar, ijtimoiy tarmoq profil rasmi**. |
| `nexo-hr-icon.png` | Piksel talab qiladigan joylar (favicon fallback, notification badge). |

### 2.2 Belgi ma'nosi (matnda tushuntirish kerak bo'lsa)

"N" harfi o'zaro **ulangan tugunlardan** yasalgan. Uch nuqta — xodimlar tarmog'i (oq nuqta = boshlanish, feruza nuqtalar = o'sish) va pastdan yuqoriga karyera o'sishi. Buni matnda tez-tez tilga olmang — belgi o'zi gapiradi.

### 2.3 Logo variantlari (qachon qaysini ishlatish)

Brend book 4 ta rasmiy variant belgilaydi:

1. **Oq fonda (default)** — asosiy variant: ko'k `#2E56E6` blok + oq/feruza chiziqlar. Butun ichki dashboard, hujjatlar, marketing sayti.
2. **Brend rangda** — ko'k fonda oq/feruza. Faqat brand badge/sticker sifatida.
3. **Qorong'i fonda** — navy `#16215A` fonda oq matn + feruza urg'u. **Landing hero, login sahifa, aboutSection, DashboardWelcomeCard, sidebar collapse dark mode**.
4. **Monoxrom** — bitta rangda (qora yoki oq). **Faqat bitta rang bosiladigan joylar** (bosma faks, muhr, gravyura). Digital'da ishlatmang.

### 2.4 Xavfsizlik zonasi va minimal o'lcham

- Logo atrofida **kamida 20px** bo'sh joy qoldiring. Menyu, matn yoki tugma bu zonaga kirmasin.
- Minimal balandlik: **40px** (matnli logo), **24px** (faqat icon). Kichikroq qilmang — o'qib bo'lmaydi.
- Sidebar collapse holatida — icon 38×38px, alohida `logoIcon` konteynerda.

### 2.5 TAQIQLANADI (qat'iy)

- ✕ Logoni cho'zmang / siqmang / burmang
- ✕ Rangini brend palitrasidan tashqariga o'zgartirmang (yashil Nexo, qizil Nexo — yo'q)
- ✕ Shrift almashtirmang (Arial fallback saqlanadi — o'zgartirmang)
- ✕ Band/shovqinli fon ustiga qo'ymang — soya yoki `logoIcon` blok ichida bering
- ✕ Sifatsiz PNG ishlatmang — SVG bor bo'lsa har doim SVG

---

## 3. Rang tizimi

### 3.1 Asosiy 4 rang (yodda tuting — hamma narsa shulardan quriladi)

| Nom | Hex | CSS o'zgaruvchi | Nima uchun |
|---|---|---|---|
| **Accent Ko'k** | `#2E56E6` | `--blue-600` / `--primary` | Logo, asosiy tugma, faol havolalar, urg'u |
| **Feruza** | `#5CE1E6` | `--turquoise-500` / `--secondary` | Dinamika/urg'u, gradient oxiri, dark hero'da urg'u |
| **Oq** | `#FFFFFF` | `--background` / `--brand-paper` | Ichki dashboard foni, kartochka foni |
| **Qora** | `#000000` | `--foreground` / `--brand-ink` | Asosiy sarlavha va matn |

### 3.2 Semantik ranglar (holatlar uchun)

| Nom | Hex | CSS | Qachon |
|---|---|---|---|
| Muvaffaqiyat | `#10B981` | `--emerald-500` / `--success` | OPEN, HIRED, PASSED, ijobiy toast |
| Ogohlantirish | `#F59E0B` | `--amber-500` / `--warning` | PENDING, INTERVIEW, e'tibor kerak |
| Xato | `#EF4444` | `--red-500` / `--error` | REJECTED, delete tugmasi, xato toast |
| Och kulrang | `#F3F4F6` | `--gray-100` / `--muted` | Kartochka bo'sh fon, disabled input |
| Quyuq kulrang | `#374151` | `--gray-700` / `--text-secondary` | Ikkinchi darajali matn, meta |

### 3.3 Ko'k va Feruza pog'onalari (nozik holatlar uchun)

Har bir asosiy rang uchun to'liq shkala bor — `50 → 800`. **Bevosita hex yozmang**, doim CSS o'zgaruvchi ishlating:

- `--blue-50 #EEF2FE` — mayda badge/chip fon
- `--blue-100 #DCE4FD` — sidebar faol havola fon, badge chegarasi
- `--blue-300 #8FA6F5` — disabled primary tugma
- `--blue-500 #4A6EEA` — hover holati
- **`--blue-600 #2E56E6`** — ← **DEFAULT PRIMARY**
- `--blue-700 #2445BA` — pressed/active holat, dark tekst on light bg
- `--blue-800 #1B3489` — juda kuchli urg'u, deep navy accents

Feruza xuddi shunday `50 → 600`. Amber, red, emerald bir xil struktura.

### 3.4 Deep Navy (dark hero ranglari)

- `--navy-deep #16215A` — hero gradient start
- `--navy-black #0B1120` — hero gradient end, footer

**Qachon:** landing hero, login sahifa foni, `aboutSection`, `DashboardWelcomeCard`, sidebar (dark mode), on-brand marketing bannerlar. **Ichki dashboard'da ishlatmang** — u yerda oq fon qoladi.

### 3.5 Brend gradient (fizhka signature)

```css
--grad-primary: linear-gradient(135deg, #2E56E6 0%, #5CE1E6 100%);
```

Bu **brend imzosi**. Faqat quyidagi joylarda:
- Sidebar collapse tugma `.toggleBtn` (kichik urg'u)
- Header profil avatari fon (`header.module.css:166`)
- Katta marketing banner (landing hero avatar, aboutCard urg'u)
- Loading spinner
- Chart'lardagi asosiy chiziq

**Har joyda ishlatmang** — gradientlar arzon ko'rinishga olib keladi. Bitta sahifada 1-2 martadan ko'p emas.

### 3.6 Rang qoidalari

- ✓ Doim CSS o'zgaruvchi (`var(--primary)`) — hech qachon inline hex
- ✓ Bir sahifada 2 ta accent rangdan ortiq bo'lmasin (blue + turquoise + neytral kulrang)
- ✓ Semantik ranglar (emerald/amber/red) faqat status'da — dekor uchun emas
- ✕ Yashil tugma "Save", ko'k tugma "Send" — yo'q. Save = primary blue, delete = red. Bir kategoriya, bir rang.
- ✕ Boshqa rang qo'shmang. Yangi rang kerak bo'lsa — avval mavjud shkaladan (blue-50, gray-300 va h.k.) qidiring.

---

## 4. Tipografiya

### 4.1 Ikkita shrift — ko'p emas

| Shrift | Rol | CSS | Weightlar |
|---|---|---|---|
| **Poppins** | Sarlavhalar (H1-H4), logo matni, kata raqamlar, CTA tugma | `--font-heading` | 400, 500, 600, 700, 800 |
| **Inter** | Body matn, form, tugma matni, badge, jadval | `--font-sans` | 300, 400, 500, 600, 700, 800 |

Ikkalasi Google Fonts orqali `globals.css`ning 1-qatorida import qilingan.

Uchinchi shrift qo'shmang. `logoSub` uchun `monospace` — bu maxsus istisno (blueprint hissiyoti), boshqa joyda takrorlamang.

### 4.2 Tipografik shkala (brend book §04)

| Rol | Poppins/Inter | Kattalik | Line-height | Ishlatish |
|---|---|---|---|---|
| H1 | Poppins Bold | 48px (3rem) | 1.2 | Landing hero, sahifa top title |
| H2 | Poppins Bold | 32px (2rem) | 1.3 | Bo'lim sarlavhasi (`.page-title`) |
| H3 | Poppins Medium | 24px (1.5rem) | 1.4 | Kartochka sarlavhasi |
| H4 | Poppins Medium | 18px (1.125rem) | 1.4 | Form legend |
| Body | Inter Regular | 16px (1rem) | 1.6 | Asosiy matn |
| Small | Inter Regular | 14px (0.875rem) | 1.5 | Meta, yordamchi |
| Caption | Inter Medium | 12px (0.75rem) | 1.4 | Badge, tag, timestamp |

### 4.3 Amaliy qoidalar

- Sarlavhaga `letter-spacing: -0.02em` — Poppins zichroq ko'rinadi (`.page-title` da mavjud)
- H1/H2 uchun `font-weight: 800` (Extra Bold) — bu brend chegarasidagi eng qalin
- Uppercase yorliqlar (badge, section eyebrow) — `letter-spacing: 0.05-0.18em`, `font-weight: 700`
- Body matnda `line-height: 1.6-1.7` — o'qish uchun havo bering
- Raqamlar (KPI, stats) — Poppins Bold + katta kegl (2-3rem) + tabular-nums yoqing

---

## 5. Tugmalar (Buttons)

Loyihada 4 ta tugma turi bor. Har biri o'z **maqsadi** bor — o'zboshimcha aralashtirilmasin.

### 5.1 Primary tugma (`btnPrimary` / `bg-primary`)

**Vazifasi:** sahifadagi asosiy harakat — 1 tadan ko'p bo'lmasin.

```css
padding: 0.75rem 1.5rem;      /* balandroq forma: 0.9rem 1.75rem */
border-radius: 8px;             /* --radius-sm */
background: var(--primary);     /* #2E56E6 */
color: #ffffff;
font-family: var(--font-sans);
font-weight: 600;
font-size: 0.9rem;
transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
box-shadow: 0 4px 14px -4px rgba(46, 86, 230, 0.4);
```

Hover: `transform: translateY(-2px)`, `background: var(--blue-700)`, `box-shadow` kuchayadi.
Active: `transform: translateY(0)`.
Disabled: `background: var(--blue-300)`, `cursor: not-allowed`, kursor tegmasdan turadi.

**Ishlatish:** `Ariza topshirish`, `Saqlash`, `Yaratish`, `Tasdiqlash`, `Kirish`.

### 5.2 Secondary tugma (outline)

**Vazifasi:** ikkinchi darajali harakat — bekor qilish, orqaga qaytish.

```css
padding: 0.75rem 1.5rem;
border-radius: 8px;
background: transparent;
color: var(--primary);
border: 1.5px solid var(--primary);
font-weight: 600;
```

Hover: `background: var(--blue-50)`.

**Ishlatish:** `Bekor qilish`, `Orqaga`, `Ko'proq ma'lumot`.

### 5.3 Ghost tugma (matnsimon)

**Vazifasi:** kam vazndagi harakat — jadval satri ichida, filtr, ikonli tugma.

```css
padding: 0.5rem 0.85rem;
border-radius: 8px;
background: transparent;
color: var(--text-secondary);
border: 1px solid transparent;
```

Hover: `background: var(--gray-100)`, `color: var(--text-primary)`.

**Ishlatish:** `Tahrirlash`, `Yopish (X)`, filter chip'lar, dropdown ochish.

### 5.4 Destructive tugma

**Vazifasi:** qaytarib bo'lmaydigan buzg'unchi harakat — o'chirish.

```css
background: var(--red-500);
color: #ffffff;
```

Hover: `background: var(--red-600)`.

**Muhim:** confirm dialog'siz destructive tugma **ishlatilmaydi**. Bosgach — "Rostdanmi?" so'rang.

### 5.5 Landing/marketing tugmalar (dark fon uchun)

Landing sahifada `applyBtn`:

```css
background: var(--brand-ink);   /* qora */
color: var(--brand-paper);       /* oq */
```

Hover: `background: var(--brand-amber)` (feruza), `color: var(--brand-ink)`, va `gap` kengayadi (arrow animatsiya).

**Bu ichki dashboard'da ishlatilmaydi** — u yerda `--primary` (ko'k) qoladi.

### 5.6 Tugma qoidalari

- ✓ Bir formada 1 primary + 1 secondary. Ikkita primary bo'lmasin.
- ✓ Tugma matnida **fe'l ishlatiladi**: "Saqlash" ✓, "Tayyor" ✗ (ambigu).
- ✓ Ikonli tugma — icon 16-18px, matn oldida, `gap: 0.5rem`.
- ✕ 4 xil o'lchamdagi tugma bir sahifada — max 2 o'lcham (default + small).
- ✕ Kichkina primary tugma ("ha") + katta secondary ("yo'q") — vizual og'irlik teng bo'lsin.

---

## 6. Fonlar (backgrounds) — qaysi kontekstda qaysi fon

Bu eng ko'p adashtiriladigan qism. Aniq qoida:

| Kontekst | Fon | Sabab |
|---|---|---|
| **Ichki dashboard (barcha `/dashboard/*` sahifalar)** | Oq `#FFFFFF` (`--background`) | Ma'lumot zich, ish davomida ko'zga tinch bo'lishi kerak. Diqqatni ma'lumotga qaratadi. |
| Kartochkalar dashboard ichida | Oq `--surface` + `--card-shadow` (juda yumshoq soya) | Yassilikni ushlab turadi. |
| Muted bloklar (empty state, disabled) | `--gray-50` yoki `--gray-100` | Ikkinchi darajali maydonlar. |
| **Landing hero** | Navy gradient `--grad-hero-network` (network SVG + navy 160°) | Brend, ishonch, "ilg'or texnologiya" hissi. |
| **Login/Register sahifalar** | Xuddi shu navy gradient | Landing bilan bir hissiyot — user tizimga kiryapti degan tuyg'u. |
| **Landing `aboutSection`** | Navy gradient + network pattern SVG | Missiyani ta'kidlash bloki, oq fonda "singib" ketmasin. |
| **DashboardWelcomeCard (yuqoridagi salomlashuv)** | `--grad-welcome` (navy gradient) | Dashboardga kirganda 1 ta brendlangan hissiy hujum, keyin oq fon. |
| Sidebar (light) | Oq `--sidebar-bg` + o'ng chegara | Kontent bilan bir uslub, urg'u — faol havola fonida `--blue-100`. |
| Sidebar (dark mode) | Deep slate `#0f172a` | Kontent fonining dark versiyasi bilan sinxron. |
| Modal/Dialog | Oq + `backdrop: rgba(0,0,0,0.5)` blur | Fokus modaldagi harakatga. |
| Toast | Semantic ranglar (emerald/amber/red 500) + oq matn | Diqqatni tortish. |

### Muhim qoida

**Navy gradient ichki dashboard sahifalarida ishlatilmaydi.** Faqat "kirish nuqtasi" bloklarda (WelcomeCard, hero) — bir marta ta'sirlantirish, keyin ma'lumot oq fon ustida ochiladi. Aks holda ma'lumot ko'zga urib, o'qib bo'lmaydigan bo'ladi.

---

## 7. Kartochkalar (Cards)

### 7.1 Standart card

```css
background: var(--surface);          /* oq */
border: 1px solid var(--border);     /* --gray-200 */
border-radius: var(--radius-lg);     /* 16px */
padding: 1.5rem;
box-shadow: var(--card-shadow);      /* 0 1px 3px rgba(0,0,0,0.05) — juda nozik */
transition: transform 0.2s, box-shadow 0.2s;
```

Hover (agar interaktiv bo'lsa): `transform: translateY(-5px)`, `box-shadow: var(--card-hover-shadow)` (ko'k rangli soya — `0 20px 40px -10px rgba(46,86,230,0.2)`).

**Yordamchi klass:** `.hover-lift` — hoverda ko'tarilish uchun.

### 7.2 Glassmorphism card

Faqat navy/dark fon ustida ishlatiladi (landing, hero, modal overlay):

```css
background: var(--glass-bg);         /* rgba(255,255,255,0.25) */
backdrop-filter: blur(10px);
border: 1px solid var(--glass-border);
box-shadow: var(--glass-shadow);
```

Yordamchi klass: `.glass` (light card on dark), `.glass-dark` (dark card on darker).

### 7.3 Border-radius shkalasi

Aralashtirmang — bitta card bir xil radius'da bo'lsin:

- `--radius-sm 8px` — tugma, kichik input, chip
- `--radius-md 12px` — o'rta card, dropdown
- `--radius-lg 16px` — asosiy dashboard card
- `--radius-xl 24px` — hero blok, modal
- `--radius-2xl 32px` — juda katta feature card (kam ishlatiladi)

Pill/badge — `9999px` (to'liq yumaloq).

---

## 8. Forma va inputlar

```css
/* input, select, textarea */
padding: 0.75rem 1rem;
border-radius: 8px;
border: 1px solid var(--input);   /* --gray-200 */
background: var(--surface);        /* oq */
color: var(--text-primary);
font-family: var(--font-sans);
font-size: 0.95rem;
transition: border-color 0.2s, box-shadow 0.2s;
```

Focus: `border-color: var(--primary)`, `box-shadow: 0 0 0 3px rgba(46,86,230,0.12)` (ring).
Error: `border-color: var(--red-500)`, xato matn qizil, 12px, ostidan.
Disabled: `background: var(--gray-100)`, `color: var(--text-light)`.

Label — Inter Medium 14px, `--text-secondary`, input ustida 0.5rem gap bilan.

Placeholder — Inter Regular, `--text-light` (kulrang, matn rangidan nozikroq).

Checkbox/Radio — o'zbek variantida `accent-color: var(--primary)` — brauzer o'zi ko'k belgi qo'yadi.

---

## 9. Badge (status marker)

Global klass `.badge` + status-suffix. Har status uchun fon-50 + matn-700 kombinatsiyasi.

| Klass | Ma'no | Rang |
|---|---|---|
| `.badge-open` | Ochiq vakansiya, faol | emerald |
| `.badge-pending` `.badge-pending_approval` | Kutmoqda, tasdiq talab | amber |
| `.badge-passed` `.badge-screening` | O'tdi, screening'da | blue |
| `.badge-interview` | Suhbat bosqichida | amber |
| `.badge-training` | O'quv bosqichida | amber |
| `.badge-offer` | Taklif berilgan | emerald |
| `.badge-hired` | Ishga qabul qilingan (**qalin border**) | emerald-800 + 2px border |
| `.badge-rejected` `.badge-error` | Rad etilgan, xato | red |
| `.badge-closed` | Yopilgan, arxiv | muted (kulrang) |

Struktura: `padding: 0.35rem 0.85rem`, `border-radius: 9999px`, `font-size: 0.75rem`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.05em`.

Yangi status kerak bo'lsa — mavjud rangdan foydalaning, yangi rang qo'shmang.

---

## 10. Ikonlar (Lucide-react)

Kutubxona: `lucide-react` (allaqachon o'rnatilgan).

- Default o'lcham: **20px** (`size={20}`)
- Kichik (jadval satri, ichki chip): **16px**
- Katta (empty state, hero): **48-64px**
- Rang: `currentColor` (o'zi ota-matn rangini oladi)
- **Border-width: 2** (Lucide default 2 — o'zgartirmang, o'zbek variantida boshqa kutubxona ishlatmang)

Icon-only tugma uchun aria-label majburiy:
```jsx
<button aria-label="Yopish"><X size={20}/></button>
```

---

## 11. Interval va spacing (bo'sh joy)

4/8 shkalasiga rioya qiling. Global spacing (tailwind-mos):

| Klass | rem | px |
|---|---|---|
| `p-1 / gap-1` | 0.25rem | 4px |
| `p-2 / gap-2` | 0.5rem | 8px |
| `p-4 / gap-4` | 1rem | 16px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |

**Sahifa qoidasi:**
- Card ichida `padding: 1.5rem` (24px) — default
- Card'lar orasida `gap: 1rem` (16px) — grid'da
- Sahifaning tashqi paddingi `.page-container: padding: 2rem` (32px)
- Sarlavha va tarkib orasida `.page-header: margin-bottom: 2.5rem`

Vertikal ritm — Inter body 1.6 line-height + paragraflar orasida `margin-top: 1rem`.

---

## 12. Soyalar (shadow) va chegaralar

Ikki xil holat — nozik va urg'u.

```css
/* Nozik — default card */
--card-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);      /* .shadow-sm */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);    /* .shadow-md */

/* Brend urg'u — hover interactive card */
--card-hover-shadow: 0 20px 40px -10px rgba(46, 86, 230, 0.2);
```

Muhim: hover shadow'i **ko'k rangli** (primary rgba) — bu Nexo signature. Kulrang shadow ishlatmang.

Border rangi doim `--border` (`--gray-200`). Xatoda `--red-500`. Boshqa rang qo'shmang.

---

## 13. Animatsiyalar

Uchta reusable animatsiya `globals.css`da tayyor:

- `.animate-fade-in` — 0.5s fade + 10px yuqoriga surilish (sahifaga kirish)
- `.animate-slide-in` — 0.3s chapdan sirg'alish (sidebar item, dropdown)
- `.animate-pulse-slow` — 2s takrorlanuvchi opacity (notification badge)

Interaktiv:
- `.hover-lift` — `translateY(-5px)` + hover shadow (card)
- `.hover-glow` — soya nurlanadi

**Framer Motion** murakkab kompozit animatsiyalar uchun ishlatiladi (`src/lib/motion.ts` da `springSnappy` preset). Yangi animatsiya yozishdan avval shu presetlarni qidiring.

**Qoidalar:**
- Har bir sahifada 1 ta "signature" animatsiya bas — ortiqcha shimmerdan qoching
- `transition-duration` 150-300ms — 500ms dan uzun bo'lsa foydalanuvchi kutadi
- `prefers-reduced-motion: reduce` uchun animatsiyani o'chirish (accessibility)

---

## 14. Layout va grid

- `--sidebar-width: 280px` (collapse: 80px)
- `--header-height: 72px`
- Sahifa max-width: 1600px (`.page-container`)
- Content grid: `grid-cols-1` (mobile) → `sm:grid-cols-2` (≥640px) → `lg:grid-cols-3` yoki `lg:grid-cols-4` (≥1024px)

Sidebar `position: fixed` + `z-index: 1001`. Modal `z-index: 2000+`. Toast `z-index: 3000+`. Header `z-index: 20` (landing) / kontent bilan mos.

Responsive breakpointlar: `640px` (sm), `768px` (md), `1024px` (lg), `1280px` (xl).

---

## 15. Dark mode

Dark mode `:root[data-theme="dark"]` selektori orqali ishlaydi (ThemeContext bilan boshqariladi).

**Muhim tokenlar:**
- `--background: #0f172a` (deep slate) — dashboard fon
- `--surface: #1e293b` (slate-800) — kartochka
- `--foreground: #e2e8f0` — asosiy matn
- `--sidebar-accent: var(--turquoise-300)` — dark'da feruza (ko'k singib ketmasin)
- Card hover shadow — indigo (`rgba(79,70,229,0.4)`) chunki ko'k dark'da singib ketadi

**Qoida:** yangi komponent yozganda **hard-coded hex ishlatmang** — semantik token orqali dark mode avtomatik ishlaydi.

Testlash: `<html data-theme="dark">` qo'yib har sahifani ko'rib chiqing.

---

## 16. Amaliy misollar — real vaziyatlar

### 16.1 "Yangi vakansiya yaratish" formasi

- Fon: oq (`--background`), sahifa `.page-container` ichida
- Card: oq + `--card-shadow` + `border-radius: 16px` + padding 1.5rem
- Sarlavha: H2, Poppins Bold 32px, `--text-primary`
- Label: Inter Medium 14px, `--text-secondary`, ostida 8px gap
- Input: oq, gray-200 border, focus'da blue ring
- Actions (form ostida): `Bekor qilish` (secondary/outline) chapda, `Saqlash` (primary blue) o'ngda, gap 12px
- Logo: yo'q (ichki sahifa, sidebar'da bor)

### 16.2 Landing hero

- Fon: navy gradient (`--grad-hero-network`) + network SVG pattern
- Logo: to'liq lock-up `nexo-hr-logo.svg`, yuqori chapda + langSwitch/loginBtn yuqori o'ngda
- Sarlavha: H1, Poppins Bold 48px, **oq matn**, `letter-spacing: -0.02em`
- CTA: `Ariza topshirish` — `applyBtn` (qora fon, oq matn, hover'da feruza)
- Subtitle: 1.1rem, `rgba(255,255,255,0.72)` — yarim shaffof oq

### 16.3 Nomzod kartochkasi (jadval satri)

- Card: oq, radius 12px, padding 16px, `--card-shadow`
- Ism: Inter SemiBold 16px, `--text-primary`
- Meta (lavozim, sana): Inter Regular 13px, `--text-secondary`
- Status: `.badge` + status-suffix (masalan `.badge-interview`)
- Actions: ikkita ghost tugma (Ko'rish, Tahrirlash) — icon + matn
- Hover: `translateY(-2px)` + kuchayadigan shadow

### 16.4 Empty state (bo'sh sahifa)

- Fon: `--gray-50` yoki `--gray-100` bilan qadoqlangan blok, dashed border `--border`
- Icon: 64px, `--text-light` (kulrang)
- Sarlavha: H3, Poppins Medium
- Tavsif: Inter Regular 14px, `--text-secondary`
- CTA: primary tugma — "Birinchi X'ni yarating"

### 16.5 Toast bildirishnoma

- Muvaffaqiyat: emerald-500 fon, oq matn, check icon
- Xato: red-500 fon, oq matn, X icon
- Ogohlantirish: amber-500 fon, ink matn, alert icon
- Radius 8px, padding 12-16px, 4s avtomatik yopilish

---

## 17. Yig'ib qo'yiladigan qat'iy 10 qoida

1. **Rang faqat CSS o'zgaruvchi orqali** — `var(--primary)`, hech qachon `#2E56E6`
2. **Bir sahifa = 1 primary tugma** — ikkinchi harakat outline
3. **Sarlavha Poppins, matn Inter** — uchinchi shrift yo'q
4. **Ichki dashboard = oq fon** — navy faqat landing/login/hero
5. **Logo lock-up 200px'dan katta joyda, icon shundan kichigida**
6. **Border-radius: 8/12/16/24 — bir card bir radius**
7. **Semantik rang faqat status'da** — dekor uchun emerald yashil yo'q
8. **Gradient sahifada 1-2 martadan ko'p emas**
9. **Hover shadow — ko'k rangli** (Nexo signature)
10. **Har o'zgarish CSS o'zgaruvchida** — dark mode, brend rangi kelajakda o'zgarsa 1 joyda

---

## 18. Xatolik demolari (nima qilmang)

| Xato | To'g'ri |
|---|---|
| Save tugmasi yashil, chunki "muvaffaqiyat rangi" | Save = **primary blue**. Emerald faqat *bo'lgan* muvaffaqiyat holati (badge, toast) |
| Header'da gradient, hero'da gradient, sidebar'da gradient | Gradient 1-2 marta max. Boshqasi flat rangda |
| Yangi qizilroq red, chunki dizayner boshqacha xohladi | `--red-500` #EF4444 dan tashqari red yo'q. O'zgartirish kerak bo'lsa — CSS o'zgaruvchi qiymatini yangilang |
| Bosh sahifa Roboto, boshqa sahifa Poppins | Poppins + Inter — hammayerda. Roboto yo'q |
| Delete tugma ghost, ko'rinmayapti | Delete = **destructive red**, doim ko'rinsin |
| Kartochka border-radius 20px, tugmasi 5px | Bitta blok — mos radius. 8 → 12 → 16 → 24 shkalasi ichida |
| Dashboard fon navy, "chiroyli ko'rinadi" | Dashboard = oq. Navy'da uzoq ishlash mumkin emas |

---

## 19. Yangi komponent qanday yaratiladi (checklist)

Yangi UI element qo'shishdan avval:

1. `globals.css` va bu hujjatni ochib — mavjud tugma/card/badge klassi bormi?
2. Rang — `--primary/--secondary/--gray-*/--emerald-*` shkalasidan tanla, yangi hex yo'q
3. Radius — 8/12/16/24 shkalasidan
4. Shrift — Poppins (sarlavha) yoki Inter (matn), boshqa shrift yo'q
5. Interaction — hover holati, focus ring, disabled ko'rinishi hammasi bor bo'lsin
6. Dark mode — semantik token'lar orqali avtomatik ishlaydi, tekshiring
7. Accessibility — `aria-label`, kontrast 4.5:1 (matn), focus ko'rinadi
8. Responsive — mobile birinchi, keyin sm/lg breakpointlar

---

## 20. Manbalar

- **Brend book PDF:** `nexo hr logotip brend book/nexo hr logotip.zip` (aslida PDF, 8 sahifa, v1.0/2026)
- **Rang va token'lar:** [`src/app/globals.css`](src/app/globals.css) — barcha CSS o'zgaruvchi
- **Logo fayllar:** `public/nexo-hr-logo.svg`, `public/nexo-hr-icon.svg`
- **Landing:** [`src/app/landing.module.css`](src/app/landing.module.css) — dark hero misoli
- **Login:** [`src/app/login/login.module.css`](src/app/login/login.module.css)
- **Sidebar:** [`src/components/layout/sidebar.module.css`](src/components/layout/sidebar.module.css)
- **Motion:** [`src/lib/motion.ts`](src/lib/motion.ts) — Framer Motion preset'lari

---

Bu hujjatni **yangi dasturchi qo'shilganda birinchi 30 daqiqada o'qib chiqadi**. Har o'zgarish bo'lganda (yangi component, yangi rang, yangi Framer preset) shu yerga qo'shing — bitta manba tamoyili.
