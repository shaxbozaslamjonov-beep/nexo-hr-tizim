# Nexo HR — Kunduzgi va Kechki rejim (Light/Dark Mode) instruksiyasi — Dual Theme Specification

> **Maqsad:** har bir element — tugma, panel, oyna (modal), sidebar, forma, badge, grafik — kunduzgi va kechki rejimda **aniq qanday ko'rinishi kerakligini** bir joyda belgilash. Yangi komponent yozayotganda yoki mavjudini tekshirayotganda shu jadvallarga qarang.
>
> **Bajarilgan ish yozuvi** (nima tuzatildi, nima qoldi) — alohida faylda: [`walkthrough.md`](walkthrough.md).
>
> **Asosiy tamoyil:** Nexo HR'da kunduzgi/kechki rejim **qo'lda ikkita alohida stil yozish orqali emas**, balki **CSS o'zgaruvchilar (custom properties)** orqali ishlaydi. `src/app/globals.css`da har bir token ikki marta e'lon qilingan — bir marta `:root` ichida (kunduzgi, standart), bir marta `:root[data-theme="dark"]` ichida (kechki, ustunlik qiluvchi). Komponent kodi **hech qachon** `#FFFFFF` yoki `#000000` kabi qattiq rang yozmaydi — faqat `var(--token-nomi)` yozadi. Rejim `src/contexts/ThemeContext.tsx` orqali `<html data-theme="light">` yoki `data-theme="dark"` atributini almashtirib boshqariladi; foydalanuvchi tanlovi `localStorage`da saqlanadi, birinchi tashrifda esa qurilma tizim sozlamasi (`prefers-color-scheme`) ishlatiladi.
>
> **Amaliy natija:** agar komponent to'g'ri yozilgan bo'lsa (faqat token orqali), u **avtomatik ravishda** ikkala rejimda ham to'g'ri ko'rinadi — alohida "dark mode kodi" yozish shart emas.

---

## 1. CSS Semantik Tokenlar Matritsasi (qat'iy qoida)

Hech qachon komponentlarda qattiq (hardcoded) hex qiymatlar (`#ffffff`, `#0f172a`, `#000000`, `#f8fafc` va h.k.) inline yoki CSS modullarda yozilmasin. Barcha fonlar, matnlar va chegara chiziqlari doim CSS o'zgaruvchilar orqali boshqarilsin:

| Rol | Token | Kunduzgi | Kechki |
|---|---|---|---|
| Sahifa foni | `var(--background)` | `#FFFFFF` | `#0f172a` |
| Kartochka/panel/modal/dropdown foni | `var(--surface)` | `#FFFFFF` | `#1e293b` |
| Ikkinchi darajali blok foni | `var(--bg-muted)` / `var(--gray-100)` | `#F3F4F6` | `#1e293b` |
| Asosiy matn | `var(--text-primary)` | `#000000` | `#f1f5f9` |
| Ikkinchi darajali matn | `var(--text-secondary)` | `#374151` | `#94a3b8` |
| Placeholder / eng past ustuvorlik | `var(--text-light)` | `#9CA3AF` | `#64748b` |
| Chegara | `var(--border)` | `#E5E7EB` | `#334155` |
| Asosiy urg'u rang | `var(--primary)` | `#2E56E6` | `#2E56E6` (o'zgarmaydi) |

---

## 2. UI Komponentlar va Rejimlar Moslashuvi

### 2.1 Kartochkalar va Modallar

| Xususiyat | Kunduzgi | Kechki |
|---|---|---|
| Fon | `var(--surface)` → oq | `var(--surface)` → `#1e293b` |
| Border | `1px solid var(--border)` | `1px solid var(--border)` (`#334155`) |
| Soya (default) | `var(--card-shadow)` → `0 1px 3px rgba(0,0,0,0.05)` (nozik) | `var(--card-shadow)` → `0 10px 40px -10px rgba(0,0,0,0.5)` (kattaroq/quyuqroq — qorong'i fonda nozik soya ko'rinmaydi) |
| Soya (hover, interaktiv) | `var(--card-hover-shadow)` → `0 20px 40px -10px rgba(46,86,230,0.2)` (ko'k, Nexo signature) | `var(--card-hover-shadow)` → `0 20px 60px -10px rgba(46,86,230,0.4)` |
| **Modal backdrop** | `rgba(15, 23, 42, 0.6)` + `backdrop-filter: blur(8px)` | bir xil (o'zgarmaydi — funktsiyasi ikkala rejimda bir xil: orqa fonni bostirish) |
| Modal kontent fon | `var(--surface)` | `var(--surface)` |

Amalga oshirilgan namuna: [`src/components/ui/dialog.tsx`](src/components/ui/dialog.tsx) — loyihadagi yagona umumiy modal komponenti, shu spetsifikatsiya bo'yicha to'liq qayta yozilgan (overlay, kontent fon, sarlavha/tavsif matni, yopish ikonkasi — barchasi token orqali).

### 2.2 Tugmalar

| Tur | Kunduzgi/Kechki formula |
|---|---|
| **Primary** | fon `var(--primary)` (`#2E56E6`, o'zgarmaydi), matn oq, hover `var(--blue-700)` |
| **Secondary** | fon `var(--surface)` + border `1px solid var(--border)`, matn `var(--text-primary)` |
| **Ghost** | fon `transparent`, matn `var(--text-secondary)`, hover fon `var(--gray-100)`/`rgba(148,163,184,0.08)` |
| **Destructive** | fon `var(--red-500)` (o'zgarmaydi), matn oq, hover `var(--red-600)` |

To'liq to'yingan fonli tugmalar (Primary, Destructive) ikkala rejimda **bir xil** — bu brendning "doim tanilishi kerak" elementi.

### 2.3 Forma Inputlari

| Holat | Kunduzgi | Kechki |
|---|---|---|
| Fon | oq/`var(--surface)` yoki `var(--gray-50)` (kontekstga qarab) | `#1e293b` (`var(--surface)`) |
| Border | `var(--border)`/`var(--input)` | `#334155` |
| Placeholder | `var(--text-light)` | avtomatik moslashadi |
| Fokus ring | `0 0 0 3px rgba(46,86,230,0.12)` — `var(--primary)` | bir xil (ko'k ring qorong'i fonda ham ishlaydi) |

Amalga oshirilgan namuna: [`src/components/ui/input.module.css`](src/components/ui/input.module.css) — placeholder rangi token'ga o'tkazildi.

### 2.4 Status Badge'lar (WCAG 4.5:1 kontrast)

| Status | Fon | Matn | Kontrast tekshiruvi |
|---|---|---|---|
| Open / Hired | `var(--emerald-50/100)` | `var(--emerald-700/800)` | ✅ AA |
| Pending / Interview | `var(--amber-50)` | `var(--amber-600)` | ⚠️ chegaraga yaqin (3.07:1 — pastdagi 4-bandga qarang, tanilgan bo'shliq) |
| Rejected / Error | `var(--red-50/100)` | `var(--red-700)` | ✅ AA |

### 2.5 Recharts Grafiklari — Tooltip va Legend

**Muammo:** Recharts standart holatda `Tooltip`ning `contentStyle`sida `backgroundColor` ko'rsatilmasa, kutubxona o'zining ichki standart oq fonini qo'llaydi — bu kechki rejimda ham oq quti sifatida qolib ketadi.

**Qoida — har bir `<Tooltip>` shunday yozilsin:**
```jsx
<Tooltip
  contentStyle={{
    borderRadius: '12px',
    border: '1px solid var(--border)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text-primary)',   // ← matn rangi ham majburiy, aks holda ba'zi render'larda standart qora qoladi
  }}
/>
```

**`<Legend>` uchun ham xuddi shunday** — `wrapperStyle={{ ..., color: 'var(--text-primary)' }}` yoki `var(--text-secondary)`.

**`<CartesianGrid>`, `<XAxis>`, `<YAxis>` tick ranglari** — hech qachon standart qoldirilmasin, doim aniq belgilansin: `stroke="var(--border)"`, `tick={{ fill: 'var(--text-secondary)' }}`.

---

## 3. Kategorik (ko'p seriyali) ranglar qoidasi — YANGI, muhim qo'shimcha

Ba'zi grafik/statistik elementlar (masalan 5 bosqichli funnel diagramma, 4 ta statistik ikonka, ko'p toifali pie-chart) bir vaqtning o'zida **bir nechta bir-biridan ajralib turadigan** rang talab qiladi. Bunday holatda:

**✅ To'g'ri yondashuv:**
- Mavjud brend shkalasining **turli pog'onalaridan** foydalanish: `--blue-500 → 600 → 700 → 800` (monoton progressiya, masalan funnel "torayishi" uchun)
- Ikkinchi brend rangidan (feruza — `--turquoise-*`) foydalanish, agar ko'k shkаласи yetarli bo'lmasa
- Semantik ranglarni (`--success`/`--warning`/`--error`) **faqat haqiqiy semantik ma'noga ega** kategoriyalar uchun ishlatish (masalan "Ishga qabul qilingan" = muvaffaqiyat = `--success`; lekin "Trening" kabi neytral bosqichga amber/qizil **bermang** — bu noto'g'ri "e'tibor talab qiladi" signali beradi)

**✕ Noto'g'ri yondashuv:** yangi, brenddan tashqari rang (indigo `#6366f1`, binafsha `#8b5cf6`, pushti `#ec4899`, to'q sariq `#f97316`) qo'shish — bu "faqat 2 ta accent rang" qoidasini buzadi va yangi, boshqarib bo'lmaydigan rang manbai yaratadi.

**Amalga oshirilgan namunalar:**
- [`HRDashboardContent.tsx`](src/app/dashboard/hr/HRDashboardContent.tsx) — 5 bosqichli rekrutment funnel: `--blue-500 → 600 → 700 → 800 → --success`
- [`StatsCards.tsx`](src/components/analytics/StatsCards.tsx) — 4 ta statistik ikonka: ko'k, emerald, amber, **feruza** (avval binafsha edi)
- [`RecruitmentFunnelChart.tsx`](src/components/analytics/RecruitmentFunnelChart.tsx) — 5 ta gradient (ko'k→feruza, ko'k→ko'k, amber→amber, feruza→feruza, emerald→emerald) — bu fayl allaqachon to'g'ri yozilgan edi, o'zgartirilmadi, faqat referens sifatida ko'rsatiladi

---

## 4. Fon va sirt qatlamlari — chuqurlik mantiqi

Uchta "chuqurlik qatlami": **sahifa foni** (eng orqada) → **kartochka/panel sirti** (ustida) → **modal/dropdown** (eng ustida). Kunduzgi rejimda `background` va `surface` bir xil ko'rinadi (farq faqat nozik soya orqali), kechki rejimda esa ular **ko'zga aniq farqli** (`#0f172a` vs `#1e293b`) — bu rang farqi orqali chuqurlik hissini beradi (qorong'i muhitda soya deyarli ko'rinmasligi sababli).

## 5. Sidebar — yagona ataylab qilingan istisno

Faol menyu bandi rangi kunduzgi rejimda **ko'k** (`var(--blue-600)`), kechki rejimda **feruza**ga (`var(--turquoise-300)`) almashadi. Sabab: qorong'i navy fonda asosiy brend ko'ki "singib ketadi", feruza esa yorqin va aniq ko'rinadi. Bu — boshqa hech qayerda takrorlanmaydigan yagona holat.

## 6. Ataylab bir xil qoladigan elementlar

- Primary/Destructive tugmalar, avatar gradienti (`var(--grad-primary)`), toast fonlar (success/error), overlay/backdrop qora rangi, skrollbar (texnik sabab, `::-webkit-scrollbar` psevdo-elementi uchun 2 ta alohida qattiq qiymat `globals.css`da qoldirilgan).
- Glassmorphism tugmalar doim-qorong'i fonda (masalan navy hero banner ustidagi "Фильтр"/"Экспорт" tugmalari, [`AnalyticsToolbar.tsx`](src/components/analytics/AnalyticsToolbar.tsx)) — oq matn, rejimdan mustaqil, chunki fon o'zi doim navy.

## 7. Bilinadigan kamchiliklar (halol ro'yxat, 2026-08-01 holatiga ko'ra)

1. **`--blue-50/100`, `--emerald-50`, `--amber-50`, `--red-50` kabi eng och pog'onalar** faqat kunduzgi qiymatga ega — kechki rejimda ham och rang qoladi (badge fon, outline tugma hover foni). Tavsiya: `rgba(...,0.15)` shaffof versiyalar qo'shish.
2. **`--gray-50/100` disabled/hover fonlari** kechki rejimda moslashmagan.
3. **`--amber-600` / `--amber-50` juftligi** matn uchun faqat 3.07:1 kontrast beradi (WCAG AA 4.5:1'dan past) — `globals.css`dagi `.badge-pending` va shu kabi joylarda tizim darajasidagi bo'shliq, alohida ticket talab qiladi.
4. **`SettingsContent.tsx`dagi ikkita rang** (`#f87171`, `#92400e`) **ataylab** o'zgartirilmagan — brend tokeniga almashtirilsa kontrast standartidan pastga tushib qoladi (batafsil: kod ichidagi izohlarga qarang).
5. **~50 ta faylda** hali qattiq kodlangan hex qolgan — to'liq ro'yxat va ustuvorlik tartibi [`walkthrough.md`](walkthrough.md)da.
6. **`landing.module.css`** — alohida, lekin ishlaydigan dark-mode arxitekturasi (`:global([data-theme="dark"])` bilan dublikat qiymatlar) — token tizimiga o'tkazish alohida refaktoring.
7. **~30 ta faylda** eski indigo `rgba(99,102,241,...)`/`rgba(79,70,229,...)` rang qoldig'i — alohida fon jarayonida (`task_a4332158`) tozalanmoqda, bu hujjatdan mustaqil.

## 8. Tez tekshirish checklist (yangi komponent yozgandan keyin)

- [ ] Fon uchun `var(--surface)` yoki `var(--background)` ishlatildimi (`white`/`#fff` emas)?
- [ ] Matn uchun `var(--text-primary)`/`var(--text-secondary)` ishlatildimi?
- [ ] Border uchun `var(--border)` ishlatildimi?
- [ ] Recharts ishlatilsa — `Tooltip.contentStyle.backgroundColor`+`color`, `Legend.wrapperStyle.color`, `CartesianGrid`/`XAxis`/`YAxis` tick/stroke ranglari aniq belgilanganmi?
- [ ] Ko'p kategoriyali rang kerak bo'lsa — 3-banddagi qoidaga rioya qilindimi (yangi hex emas, mavjud shkala pog'onalari)?
- [ ] Brauzerda `<html data-theme="dark">` bilan (yoki header'dagi tugma orqali) ikkala rejimda ham tekshirildimi?
- [ ] `npx tsc --noEmit` — 0 xato?

---

## Manbalar

- Token qiymatlari: [`src/app/globals.css`](src/app/globals.css) (`:root` — kunduzgi, `:root[data-theme="dark"]` — kechki)
- Rejim almashtirish mantiqi: [`src/contexts/ThemeContext.tsx`](src/contexts/ThemeContext.tsx)
- Umumiy brend qoidalari: [`NEXO_HR_DESIGN_GUIDE.md`](NEXO_HR_DESIGN_GUIDE.md)
- Bajarilgan ish yozuvi (nima tuzatildi/qoldi): [`walkthrough.md`](walkthrough.md)
