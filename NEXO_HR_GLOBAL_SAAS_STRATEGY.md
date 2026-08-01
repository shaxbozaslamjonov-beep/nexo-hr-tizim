# Nexo HR — Global SaaS'ga aylantirish strategiyasi

> **Hujjat maqsadi:** Nexo HR platformasini O'zbekistondagi bitta biznesga xizmat qiladigan ichki tizimdan xalqaro (avval MDH → keyin MENA/SEA → keyin global SMB) SaaS mahsulotiga aylantirish uchun 18-24 oylik amaliy yo'l xaritasi.
>
> Bu hujjat **tahlil va strategiya**. Har bir bosqichni tasdiqlashdan oldin ko'rib chiqing, keyin `TODO.md`ga aniq vazifalar sifatida ko'chiring.

---

## 1. Hozirgi holat — bir qarashda

Loyiha allaqachon SaaS'ga aylanishi uchun kerakli asosga ega. Sanab o'tamiz:

**Texnik tayyorlik (mustahkam poydevor):**
- Next.js 16 + Prisma + PostgreSQL — zamonaviy, vertikal masshtablanadigan stek
- 38 ta Prisma modeli — HR domeni to'liq qamrab olingan (vakansiya, nomzod, ariza, suhbat, o'qitish, testlar, KPI, karyera yo'li, sinov muddati, onboarding, xizmat rejasi, iqtidor havzasi, audit)
- **Multi-tenancy allaqachon o'rnatilgan** (10-bosqich): barcha muhim modellarda `companyId`, kompaniyalar bir-birini ko'rmaydi
- **Billing skeleti tayyor** (`src/lib/billing.ts`): 4 ta tarif (trial/starter/professional/enterprise), USD va UZS narxlari, xodim va vakansiya limitlarini nazorat qiluvchi funksiyalar
- **AI qatlami ishlaydi** (DeepSeek asosida): vakansiya generatsiyasi, nomzod tahlili, savol generatsiyasi, monitor, xodim/nomzod support chat
- **Self-service registratsiya**: biznes egasi `/register` orqali kompaniyasini o'zi ochib, trial plan bilan boshlaydi
- **Telegram deep-linking**: `/start c_<slug>_v_<id>` orqali kompaniya-nomzod bog'lanishi
- **RBAC markazlashgan** (`src/lib/rbac.ts`)
- **Audit log** to'liq (`AuditLog` modeli + UI)
- **2 til** (UZ/RU) `LanguageContext` orqali

**Zaif joylar (global SaaS uchun bloklovchi):**
- To'lov tizimi ulanmagan (Stripe/Paddle/Payme yo'q — plan yangilash qo'lda)
- Email/SMS provayder yo'q (parol tiklash, bildirishnoma ishlamaydi)
- Ingliz tili yo'q (global bozor uchun majburiy)
- Public API va webhook'lar yo'q (integratsiyalar mumkin emas)
- SSO/SAML yo'q (enterprise mijozlar talab qiladi)
- Compliance hujjatlari yo'q (GDPR, DPA, ToS, Privacy Policy)
- Observability yo'q (Sentry, PostHog, monitoring)
- Cross-tenant izolyatsiya testlari yozilmagan (xatarli — bitta xato butun ishonchni buzadi)
- Marketing sayti yo'q (LandingPage bor, lekin u ichki mahsulotning sahifasi, alohida marketing sayti emas)
- Ma'lumotlar rezidentligi (data residency) — hozir hammasi bitta bazada, EU mijozlar uchun bu bloklovchi

---

## 2. Bozor imkoniyati va joylashuv

**Global bozor hajmi:** HR SaaS bozori 2026 yilda taxminan **$37-50 mlrd** (tor ta'rif) — $460+ mlrd gacha (keng ta'rif); 10-13% CAGR bilan o'sib boradi. AI recruiting quyi segmenti 2024'da $1.8 mlrd → 2034'gacha $5.4 mlrd (11.6% CAGR).

**Bo'sh joy (positioning):** Katta o'yinchilar bozorni **narx** va **murakkablik** bo'yicha ajratadi:

| Segment | Namunalar | Narx (PEPM) | Zaif joyi |
|---|---|---|---|
| Enterprise | Workday, SuccessFactors | $30-100+ | Juda qimmat, sekin joriy qilinadi |
| Mid-market | BambooHR, Rippling | $10-25 + add-on'lar | Kichik bozorlarda vakolatxona yo'q, lokal integratsiya yo'q |
| Global payroll | Deel, Remote | $19-49 EOR | Faqat to'lov/kadr, ishga olish va o'qitish yo'q |
| Emerging markets | Regionaldagi turli mahalliy CRM'lar | O'zgaruvchan | AI yo'q, zamonaviy UX yo'q |

**Nexo HR'ning noyob joylashuvi:**

> **"AI-native, ishga olishdan ishga tayyor kadrgacha bo'lgan yagona pipeline — dastlab MDH, so'ng butun rivojlanayotgan bozorlarga."**

Tafovutlash uchun 3 ta ustun (dastlabki 12 oy):
1. **Vertikal chuqurlik** — faqat ishga olish emas, balki *nomzod → o'qitish → test → sinov muddati → xodim → karyera* butun sikli. Bu Deel yoki BambooHR'da chala.
2. **AI faoliyatga singdirilgan** — HR "AI qo'shilgan" tool emas, u AI orqali *ishlaydi* (vakansiya generatsiyasi, nomzod tahlili, dars generatsiyasi, jarayon monitoringi allaqachon bor).
3. **Regionga xos** — Telegram integratsiyasi, mahalliy til, UZS to'lovlari, mahalliy soliq/mehnat qonunchiligiga moslashuv. G'arbiy raqobatchilar buni qilmaydi.

**Beachhead (dastlabki bozor):** O'zbekistondagi 50-500 xodimli ishlab chiqarish/sotuv/xizmat kompaniyalari. Sizning loyiha ta'rifi shu segmentga aynan mos. Bu yerda mahsulot-bozor mosligini (PMF) topib, keyin Qozog'iston → Rossiya → Turkiya → MENA'ga chiqasiz.

---

## 3. Mahsulot yo'l xaritasi (technical roadmap)

Uch fazaga bo'lamiz. Har bir faza mustaqil ravishda ishga tushirilib, mijozlarga qiymat beradi.

### Faza A — SaaS asoslari (0-3 oy) — "Sotila oladigan mahsulot"

Maqsad: bugun tashqi mijozga sotib, o'zi to'lay oladigan va o'zini boshqara oladigan holatga keltirish.

**A1. To'lov tizimi (2 hafta)**
- Global uchun **Stripe** (avtomatik, kartochka, obuna, invoice) — Stripe Billing metered obuna
- MDH uchun **Paddle** (VAT/soliqni o'zi ushlab qoladi) yoki mahalliy uchun **Payme/Click** — trial → paid o'tish
- `Company.plan` bilan Webhook orqali sinxronizatsiya (`checkout.session.completed`, `customer.subscription.updated`)
- Yangi `Subscription` va `Invoice` Prisma modellari
- Billing sozlamalari sahifasi (`/dashboard/hr/settings/billing`) — plan yangilash, kartochka almashtirish, invoice tarixi

**A2. Email/SMS infratuzilma (1 hafta)**
- **Resend** (email — soddaligi va narxi bilan) yoki **AWS SES** (masshtabga)
- **Twilio** yoki **Vonage** (SMS, ixtiyoriy)
- Transaction email'lari: parolni tiklash, vakansiya taklifi, sinov muddati eslatmalari, invoice, plan tugash ogohlantirishlari
- Har bir email template ikki tilda (dastlab UZ/RU, 3-fazada +EN)

**A3. Cross-tenant xavfsizlik auditi (1 hafta — bloklovchi)**
- Har bir API endpoint uchun avtomatik test: A kompaniya foydalanuvchisi B kompaniyasi resursini so'raganda `403/404` qaytishi kerak
- PostgreSQL **Row Level Security (RLS)** yoqish — Prisma darajasidagi xatolar ham (masalan `where.companyId` unutish) sizib chiqmasin
- Penetration test skripti (`scripts/pentest-tenancy.ts`) — CI'da har commit'da ishlaydi

**A4. Observability (3-4 kun)**
- **Sentry** (xatolar) — frontend + backend
- **PostHog** yoki **Plausible** (mahsulot analitikasi + funnel)
- **BetterStack** yoki **UptimeRobot** (uptime)
- Structured logging (`pino`) → **Axiom** yoki **Datadog**

**A5. Compliance hujjatlari (parallel, 1-2 hafta yurist bilan)**
- Terms of Service, Privacy Policy, DPA (Data Processing Agreement) — GDPR-mos
- Cookie consent banner (EU mijozlar uchun)
- "Delete my data" oqim (GDPR Article 17)
- Backup va disaster recovery hujjati

**Faza A yakuni:** to'liq begona bir kompaniya `/register` → to'lov qildi → 30 kun ichida hech qanday sizning aralashuvingizsiz o'zining HR jarayonini boshqara oldi.

---

### Faza B — Kengaytirish (3-9 oy) — "Ko'p mijozli mahsulot"

**B1. Ingliz tili + i18n arxitekturasi (3 hafta)**
- `LanguageContext`ni `next-intl` yoki `react-i18next` bilan almashtirish (masshtablanadigan)
- EN, UZ, RU — dastlabki 3 til; keyin TR, KZ (Qozoq), AR
- Sana/vaqt/valyuta formatlash locale bo'yicha
- AI system prompt'larini foydalanuvchi tiliga moslashtirish

**B2. Public API + Webhook'lar (3-4 hafta)**
- REST API (`/api/v1/*`) — vakansiya, nomzod, ariza, xodim, KPI CRUD
- API kalitlari boshqaruvi (`Settings → API`) — har bir kalit uchun scoped permissions
- Rate limiting (**Upstash Redis** yoki `@vercel/kv`)
- Webhook'lar: `candidate.hired`, `application.stage_changed`, `vacancy.opened` — mijozlar o'z tizimlariga integratsiya qilishi uchun
- OpenAPI spec + Swagger UI (`/api/docs`)

**B3. Integratsiyalar marketpleysi (davomiy)**
- **Google Workspace / Microsoft 365** — kalendar (suhbatlar), Drive (fayllar)
- **Slack / Telegram / WhatsApp Business** — bildirishnoma va bot integratsiyalari (Telegram allaqachon bor)
- **LinkedIn / HeadHunter / OLX Job** — vakansiyani avtomatik joylash (bir marta yaratib, ko'p platformaga tarqatish)
- **Zapier / Make** — o'z-o'ziga xizmat qiluvchi long-tail integratsiyalar
- **1C / SAP / Payme** — mahalliy hisob-kitob va to'lov tizimlariga eksport

**B4. Advanced AI (differensiator)**
- **AI Interviewer** — nomzod bilan avtomatik ovozli/matnli suhbat (o'z-o'ziga xizmat, HR keyin natijani ko'radi)
- **Skill-gap AI** — xodimning karyera maqsadi + hozirgi skillari → aynan qaysi darslarni o'qishi kerakligini avtomatik generatsiya qiladi (asos allaqachon bor: `CareerPath`, `EmployeeSkillProgress`)
- **AI Coach** — xodimga har haftalik qisqa refleksiya so'raydi, KPI'ni tahlil qilib, aniq keyingi qadamlarni taklif qiladi
- **Bias detector** — AI vakansiya matni va suhbat savollaridagi diskriminatsion iboralarni aniqlaydi (EU/US bozori uchun muhim)
- Foydalanuvchi o'z **LLM kalitini** ulash imkoniyati (BYOK — Bring Your Own Key) — enterprise mijozlar o'z ma'lumotini OpenAI'ga yubormasligini xohlaydi

**B5. Enterprise xususiyatlar (professional/enterprise plan'lar uchun)**
- **SSO / SAML 2.0** — Okta, Azure AD, Google Workspace
- **SCIM** — foydalanuvchi provisioning avtomatik
- **Custom domain** (`hr.mijoz.com`) va **white-label** (logo, ranglar)
- **Audit log eksporti** (SIEM'ga uzatish uchun)
- **Data residency** — EU mijozlar uchun alohida Frankfurt bazasi (`vercel/postgres` yoki `neon.tech` — region tanlash)

**B6. Mobil ilova (React Native yoki PWA)**
- Xodim uchun: KPI kiritish, dars ko'rish, ariza holati, push bildirishnoma
- Nomzod uchun: ariza topshirish, suhbat vaqti tasdiqlash
- HR uchun MVP'da shart emas — desktop kifoya

---

### Faza C — Global (9-24 oy) — "Ko'p regionli mahsulot"

**C1. Regionlarga moslashuv (har bir yangi bozor uchun)**
- Mehnat qonunchiligi shabloni (mehnat shartnomasi, sinov muddati qoidasi) — Uzbekistan → Kazakhstan → Turkey → UAE → Poland → India
- Local payroll integratsiyalari (mahalliy provayderlar)
- Local job board integratsiyalari
- Local to'lov usullari (SEPA, Ideal, PIX)

**C2. Marketplace ekotizimi**
- 3-tomon dasturchilar uchun App Store — plagin va integratsiyalar
- Har bir sotuvdan 15-30% Nexo'ga
- HR maslahatchilar uchun **Partner Program** (Deel'ning `Deel Partners` modeli)

**C3. AI-native rekruter marketplace (imkoniyat, agar bozor talab qilsa)**
- Nomzod loyiha ta'rifidagi kabi: "topib, o'qitib, tayyor kadr sifatida yetkazib beradi" — buni **cross-company marketplace** ga aylantirish
- Bitta kompaniyada rad etilgan lekin skoril yuqori nomzod boshqa kompaniyaga tavsiya qilinadi (nomzod roziligi bilan)
- Bu **noyob differensiator** — hech bir global HR SaaS'da bunday network effect yo'q. Loyiha ta'rifi buni to'g'ridan-to'g'ri taklif qiladi.

---

## 4. Bozorga chiqish strategiyasi (GTM)

### 4.1 ICP (Ideal Customer Profile) — bosqichma-bosqich

| Bosqich | Segment | Kanallar | Muddat |
|---|---|---|---|
| PMF | O'zbekistondagi 50-500 xodimli IShCh/sotuv/xizmat firmalari | Aloqalar, Telegram guruhlar, konferentsiyalar | 0-6 oy |
| Regional | +Qozog'iston, Qirg'iziston, Tojikiston (bir xil ish madaniyati) | Mahalliy partner'lar, HR uyushmalari | 6-12 oy |
| MDH | Rossiya, Belarus, Ozarbayjon (til bir xil — RU) | Kontent marketing, SEO, partner CRM'lar | 12-18 oy |
| Global emerging | Turkiya, MENA, Janubiy-Sharqiy Osiyo, Hindiston | Product Hunt, LinkedIn ads, YC/500 Global tarmog'i | 18-24 oy |

### 4.2 Distribyutsiya taktikasi

**Product-led growth (asosiy)**
- 14-kunlik free trial, kredit karta so'ramasdan
- Trial ichida "onboarding score" (0-100%) — foydalanuvchi ochilgan xususiyatlarga qarab progress ko'radi
- "Convert" moment: birinchi haqiqiy vakansiya joylanganda yoki 5+ nomzod qo'shilganda upsell
- Referral program: har bir referral +1 oy bepul

**Kontent marketing (SEO)**
- HR kalit iboralari uchun 100+ maqola (2 tilda, keyin EN): "mehnat shartnomasi shabloni", "sinov muddati qanday", "AI orqali xodim yollash"
- Har bir maqolada mahsulotga aniq CTA
- Bepul HR shablonlar (shartnoma, KPI, sinov muddati baholash) — email berish evaziga

**Outbound (dastlabki 20 mijoz uchun)**
- Founder-led sales — o'zingiz LinkedIn/Telegram orqali 100 ta HR direktor bilan bog'laning
- "Warm intro" HR uyushmalari orqali
- Har bir dastlabki mijozdan 15-daqiqalik case study (video)

**Partnerlik**
- HR consultancy firmalari — 20% revenue share
- Universitetlar (Xodim yetkazib berish loyiha ta'rifiga mos) — kadr etkazib berish quvuri
- 1C hamda mahalliy ERP integratorlari — cross-sell

### 4.3 Metrikalar (ishlab chiqmasdan turib, o'lchashni yo'lga qo'ying)

North Star Metric: **Weekly Active Companies (WAC)** — trial'dan chinni foydalanuvchiga aylanganlar

Sinov moslamasi (leading indicators):
- Trial → Paid konvertatsiya (target: 15-25% starter, 5% professional)
- MRR (Monthly Recurring Revenue) — oyiga
- Net Revenue Retention (NRR) — 110%+ maqsad
- CAC (Customer Acquisition Cost) — < 3 oylik ARPU (dastlab)
- Churn — < 3%/oy SMB uchun

---

## 5. Narxlash strategiyasi (revision)

Hozirgi tarif ko'rinishi yaxshi, lekin **global bozor uchun quyidagi tuzatishlar** kerak:

**Muammo:** Hozirgi narxlar ($29/$79/$299) — bular *butun kompaniya narxi*, per-employee emas. Bu ikki tomonlama:
- SMB uchun jozibador (arzon)
- 200 xodimli kompaniya uchun **juda arzon** — sizning yo'qotgan foydangiz

**Yangi strukturaga o'tish (Faza A oxirida):**

| Plan | Narx | Kim uchun | Nima kiradi |
|---|---|---|---|
| **Free (Forever)** | $0 — 5 xodim | Freelancer, mikro biznes | Asosiy HR + 1 vakansiya |
| **Starter** | $6/employee/oy (min $49) | 10-49 xodim | + AI generatsiya, testlar, o'qitish |
| **Professional** | $12/employee/oy (min $199) | 50-249 xodim | + KPI, karyera, custom brending, integratsiyalar |
| **Enterprise** | Kelishuv ($20+/employee) | 250+ xodim | + SSO, SCIM, custom domain, data residency, SLA |

**Add-on'lar (har qanday plan ustiga):**
- AI Interviewer — $2/interview
- SMS bildirishnoma — $0.05/SMS
- Extra AI generation credit'lari (BYOK bepul)

**Muhim printsip:** *Foydali xususiyatlarni pastki plandan olib tashlamang.* Foydalanuvchi masshtabga muhtoj bo'lganda plan'ini yangilaydi, funksiyalar kerak bo'lganda emas.

---

## 6. Jamoa va operatsiyalar

**Hozirgi holat:** 1 kishi (siz) — texnik va strateji.

**Faza A oxirigacha kim kerak (minimal jamoa):**
- 1 x Full-stack dev (siz'ga yordamchi) — API, integratsiyalar
- 1 x Designer (part-time yoki agentlik) — marketing sayti, product UI polish
- 1 x Growth/marketing (siz o'zingiz + freelance kontent yozuvchi)

**Faza B kishi qo'shilishi:**
- 1 x AI/ML muhandis — advanced AI xususiyatlari
- 1 x Customer Success — dastlabki mijozlarni saqlash
- 1 x Sales (mid-market) — outbound

**Faza C:**
- Country manager har bir yangi bozorga (Qozog'iston, Turkiya)
- Compliance/legal counsel (part-time)

**Muhim tavsiya:** Faza A davomida sales'ni founder o'zi qiladi. Birinchi 20 mijoz bilan har haftalik gaplashish — bu **PMF'ning eng qimmatli signali**. Sales team faqat repeatable playbook aniqlanganda quriladi.

---

## 7. Moliyalashtirish

### Bootstrap (tavsiya) — Faza A

Ushbu mahsulotning texnik holati (allaqachon ishga tayyor) va O'zbekiston bozori (past CAC, TG orqali erishish oson) — **bootstrap qilib $30-50K MRR gacha borish real**. Bu sizga:
- To'liq nazorat
- Product-market fit'ni sekin, chuqur topish imkoniyati
- Keyinchalik venture bilan gaplashganda kuchli poziciya (traction ko'rsatib)

### Angel/Pre-seed — Faza B (agar tezlik kerak bo'lsa)

- **$300-500K** — 12 oylik runway, 2-3 kishi qo'shish, ingliz tili marketingi
- Target investorlar: Central Asia venture'lari (**Uzum Ventures**, **Sturgeon Capital**, **Fongo Ventures**), Ukraina/Rossiya HR SaaS angel'lari (bu segmentni tushunadigan)
- Yoki YC/500 Global — global validation uchun

### Seed — Faza C (product-led growth ishlagach)

- **$2-4M** — global expansion, sales team, regional offislar
- Metrikalar: $50-100K MRR, 15%+ oylik o'sish, NRR > 110%, LTV/CAC > 3

---

## 8. Xatarlar va yumshatish

| Xatar | Ehtimoli | Yumshatish |
|---|---|---|
| Cross-tenant ma'lumot sizib chiqishi | O'rta | Faza A3 (RLS + avtomatik pentest), tarnsprentlik sanoati (SOC 2) 12 oy ichida |
| BambooHR/Rippling mahalliy bozorga kirishi | Past-o'rta | Chuqur mahalliy integratsiyalar (Telegram, Payme, mahalliy qonun) — ular buni qilmaydi |
| AI xatolari (noto'g'ri nomzod tahlili → mijoz sudi) | O'rta | "AI taklif qiladi, HR tasdiqlaydi" naqshini saqlash. AI hech qachon avtomatik qaror qabul qilmaydi. Bias detector — Faza B4. |
| DeepSeek API bog'liqligi | O'rta | Ko'p provayderli abstraksiya (OpenAI, Anthropic, DeepSeek, mahalliy Yandex) — vendor lock-in oldini olish |
| Regulyator xatari (GDPR, mehnat ma'lumotlari) | Yuqori | Faza A5 (DPA, delete oqim), EU data residency Faza B5 |
| Founder burnout | Yuqori | Faza A oxirida hech bo'lmasa 1 kishi qo'shish — kritik |
| Rossiya bozoriga chiqish sanksiya ta'sirida murakkab | Yuqori | MDH'ga fokusni Qozog'iston + Turkiya orqali qilish, Rossiya opsional |

---

## 9. 24 oylik yo'l xaritasi — asosiy nishonlar

```
Oy 1-3    │ Faza A: Stripe, Email, Security audit, Observability, ToS/DPA
          │ Metric: 10 pilot mijoz (bepul), 0 → $500 MRR
          │
Oy 4-6    │ Ingliz tili UI, Public API v1, Zapier integratsiya
          │ Metric: 50 to'lovchi mijoz, $3K MRR, NPS ≥ 40
          │
Oy 7-9    │ Advanced AI (Interviewer, Skill-gap), SSO/SCIM, Custom domain
          │ Metric: 150 mijoz, $12K MRR, 3 ta enterprise pilot
          │
Oy 10-12  │ Qozog'iston bozoriga kirish, Country manager, mobile PWA
          │ Metric: 300 mijoz, $30K MRR, 15%+ oylik o'sish
          │
Oy 13-18  │ Turkiya + MENA, marketplace ekotizimi, seed raund (agar kerak)
          │ Metric: 700 mijoz, $80K MRR, NRR > 110%
          │
Oy 19-24  │ Cross-company talent marketplace (loyiha noyob G'oyasi)
          │ SEA/Hindiston pilot, SOC 2 Type II tugallash
          │ Metric: 1500 mijoz, $200K MRR, 3 regionda faol
```

---

## 10. Keyingi 30 kunda nima qilinadi (aniq harakat rejasi)

Strategiya faqat bajarilganda qiymatga ega. Ertadan boshlab quyidagilar:

**1-hafta**
- [ ] Stripe hisob ochish, test rejimida Checkout integratsiyasi
- [ ] `Subscription` va `Invoice` Prisma modellari + migratsiya
- [ ] Resend hisob + parolni tiklash email flow'ni ishga tushirish

**2-hafta**
- [ ] Cross-tenant xavfsizlik testlari (`scripts/pentest-tenancy.ts`)
- [ ] PostgreSQL RLS policy'lari yozish (backup avval)
- [ ] Sentry + PostHog ulash

**3-hafta**
- [ ] ToS, Privacy Policy, DPA (yurist bilan)
- [ ] Billing sozlamalari UI (`/dashboard/hr/settings/billing`)
- [ ] Trial expire logic + email eslatmalari

**4-hafta**
- [ ] 5 ta pilot mijoz bilan gaplashish (O'zbekistondagi mavjud tarmog'ingizdan)
- [ ] Har birining "kelib chiqishi → mahsulot ichida qiladigan birinchi 5 harakat" oqimini yozib olish
- [ ] Bu asosda onboarding wizard va docs (RU/UZ) yaratish

**Oy oxiri KPI:** Kimdir sizning aralashuvingizsiz `/register` → to'ladi → 30 kun mahsulotdan foydalandi.

---

## 11. Xulosa

Nexo HR **texnik jihatdan global SaaS'ga aylantirish uchun deyarli tayyor**. 10-bosqichdagi ish (multi-tenancy, billing skeleti, self-service registratsiya, Telegram deep-linking) — bu odatda oldingi loyihalarda 6-12 oy vaqt oladigan asos. Sizda u allaqachon bor.

Muhim bloklovchi 3 narsa:
1. **To'lov integratsiyasi** (2 hafta)
2. **Xavfsizlik auditi** (1 hafta — kechiktirmang)
3. **Compliance hujjatlari** (1-2 hafta yurist bilan)

Uch narsani qilib bo'lgach, mahsulot **bugundan boshlab pul topa oladigan holatga o'tadi**. Qolgani (ingliz tili, AI kengaytirilishi, integratsiyalar, global expansion) — bularning barchasi mavjud MRR ustidan quriladi va investor pul (yoki traction) bilan tezlashtiriladi.

Noyob strategik imkoniyat — loyiha ta'rifidagi **"nomzod topib, o'qitib, ishga tayyor kadr yetkazib berish"** modeli. Bu global HR SaaS'da hech kimda yo'q. 24 oy ichida bu G'oyani **cross-company talent marketplace**'ga aylantirish — Nexo'ni faqat yana bir HR tool emas, balki *yangi kategoriya yaratuvchisi*ga aylantiradi.

---

## Manbalar

- [HR SaaS Market Size 2026 — Fortune Business Insights](https://www.fortunebusinessinsights.com/hr-software-market-116228)
- [HR SaaS Market Forecast — Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/hr-saas-market)
- [AI Recruiting Tools 2026 — OneWayInterview](https://onewayinterview.com/best-practices/ai-recruiting-tools-2026/)
- [Rippling vs BambooHR pricing 2026 — Business.com](https://www.business.com/articles/rippling-vs-bamboohr/)
- [BambooHR pricing 2026 — Pin](https://www.pin.com/blog/bamboohr-pricing/)
- [Vertical SaaS Trends 2026 — HiringThing](https://blog.hiringthing.com/2026-vertical-saas-trends)
- [Uzbekistan Market Opportunities — U.S. Trade.gov](https://www.trade.gov/country-commercial-guides/uzbekistan-market-opportunities)
- [Central Asia Investment — VanEck](https://www.vaneck.com/us/en/blogs/emerging-markets-equity/before-the-crowd-central-asias-new-investment-window/)
