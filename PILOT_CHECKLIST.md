# Pilot (bitta korxona) sinov reja va topilmalar jurnali

> Maqsad: global SaaS bosqichlariga (to'lov, multi-tenant) o'tishdan oldin, tizimni bitta real korxonada (hozircha seed'dagi "Nexo Demo" kompaniyasi orqali) to'liq sinab, xatoliklarni shu yerda yozib borish. Har bir topilma tuzatilgach `[x]` qilinadi.

## 1. Muhit holati (2026-07-30 tekshiruvi)

- [x] `npx tsc --noEmit` — xatosiz
- [x] `npx prisma migrate status` — DB schema up to date (Neon Postgres)
- [x] Dev server (`next dev`, Turbopack) muammosiz ishga tushdi
- [x] Login (`admin@nexo.hr` / `admin123`) — ishlaydi

## 2. Topilgan muammolar

### 2.0 [TUZATILDI — 2026-07-30, xavfsizlik] `/api/careers` — autentifikatsiya va companyId izolyatsiyasi yo'q edi
`src/app/api/careers/route.ts` (Karyera darajalari CRUD) boshqa barcha shunga o'xshash endpointlardan farqli ravishda **`getSession()` chaqirmagan va `companyId` bo'yicha filtrlamagan** edi:
- `GET` — istalgan kishi (hatto login qilmasdan ham) barcha kompaniyalarning karyera darajalarini ko'ra olardi.
- `POST/PUT/DELETE` — istalgan kishi (login qilmasdan ham) yozuv yarata/o'zgartira/o'chira olardi, `companyId` umuman yozilmasdi.
**Tuzatildi**: `getSession()` orqali autentifikatsiya tekshiruvi, GET/POST'da `companyId: session.companyId` bilan izolyatsiya, PUT/DELETE'da avval yozuv haqiqatan shu kompaniyaga tegishli ekanini tekshirish (`existing.companyId !== session.companyId` bo'lsa 404) qo'shildi — `training/tracks/route.ts` patternidan foydalanildi.

### 2.0.1 [TUZATILDI — 2026-07-30] Seed ma'lumotlari (Darslar, O'quv treklari, Karyera darajalari) hech qanday kompaniyaga bog'lanmagan edi
`prisma/seed.ts` bu uch modelni (`Lesson`, `TrainingTrack`, `CareerLevel`) yaratishda `companyId` maydonini yozmagan (garchi 10-bosqich migratsiyasida bu maydon qo'shilgan bo'lsa ham). Natijada: HR panelida "Darslar" sahifasi **"No lessons found"** ko'rsatardi — chunki `/api/lessons` GET `where: {companyId: session.companyId}` bilan filtrlaydi, lekin seed'dagi darslar `companyId: null` bilan yaratilgan edi. Xuddi shu muammo O'quv treklari va Karyera darajalarida ham bor edi.
**Tuzatildi**: (1) `seed.ts`ga uchala joyga ham `companyId: company.id` qo'shildi (kelgusi yangi pilot/demo muhitlar uchun); (2) joriy Neon bazadagi mavjud `companyId: null` yozuvlar bir martalik `scripts/backfill-company-id.cjs` skripti orqali `nexo-demo` kompaniyasiga bog'landi (2 dars, 2 trek, 4 daraja). Brauzerda tasdiqlandi: "Darslar" sahifasi endi 2 ta dars to'g'ri ko'rsatmoqda.


### 2.1 [OCHIQ — MUHIM] Neon DB'ga ulanishda vaqti-vaqti bilan 500 xatolik
`/api/employees` (va ehtimol boshqa endpointlar) ba'zida `Can't reach database server ... P1001` xatosi bilan 500 qaytaradi, keyingi so'rov esa muvaffaqiyatli o'tadi (5.2s kutib xato, keyin 2s'da muvaffaqiyat). Sabab — Neon serverless bazaning **avtomatik uxlash (autosuspend)** xususiyati: uzoq harakatsizlikdan keyin birinchi so'rov "uyg'onish"ni kutadi va standart Prisma ulanish timeout'iga sig'may qolishi mumkin.
**Nega muhim**: pilot davomida HR har safar tizimga uzoq tanaffusdan keyin kirganda xatolik ko'rishi mumkin — bu ishonchni pasaytiradi.
**Tavsiya (keyingi safar tuzatiladi)**: (a) Neon loyihasida autosuspend'ni o'chirish yoki muddatini oshirish, yoki (b) `src/lib/prisma.ts`da ulanish uchun retry/backoff logikasi qo'shish, yoki (c) engil "warm-up" cron/health-check qo'shish.

### 2.2 [OCHIQ — kichik] Bir sahifada API'ga ortiqcha takroriy so'rovlar
`/dashboard/hr/vacancies` sahifasi ochilganda `/api/vacancies` **4 marta**, `/dashboard/hr` ochilganda `/api/employees` **5 marta** chaqirilgan (React effect/render sikli sabab bo'lishi mumkin). Bu 2.1-band ta'sirini kuchaytiradi (har bir keraksiz so'rov Neon uyg'onish oynasida yana bir muvaffaqiyatsiz urinish xavfini beradi).
**Tavsiya**: `useEffect` bog'liqliklarini va `AuthContext`/data-fetch hook'larni tekshirib, dublikat chaqiruvlarni yo'qotish.

### 2.3 [KUZATISH — tasdiqlash kerak] Xodim holati "ACTIVE" vs "ONBOARDING"
`/dashboard/hr/employees` sahifasida barcha xodimlar "ACTIVE" deb ko'rsatiladi, lekin `EmployeeProfile.status` bazada standart bo'yicha `"ONBOARDING"`. Bu shunchaki UI'dagi soddalashtirilgan belgi bo'lishi mumkin (real bug emas) — pilot davomida haqiqiy xodim qo'shib, statusni o'zgartirib tekshirish kerak.

### 2.4 [KICHIK — kodni buzmaydi] Next.js "middleware" konvensiyasi eskirgan
Server logida ogohlantirish: `The "middleware" file convention is deprecated. Please use "proxy" instead.` Hozircha ishlayapti, lekin Next.js kelajakdagi versiyasida olib tashlanishi mumkin — pilot muvaffaqiyatli tugagach, `middleware.ts` → `proxy.ts`ga o'tkazish tavsiya etiladi.

### 2.5 [KUZATISH — arxitektura, hozircha tuzatilmadi] "O'qitish" sahifasida uchinchi, alohida model ko'rinadi
`/dashboard/hr/training` sahifasi kutilganidek seed'dagi `TrainingTrack` ("Machine Operator Onboarding" va h.k.) emas, balki butunlay boshqa, `DevelopmentPlan` modeliga o'xshash "Middle React Developer Plan" degan (pilot korxona kontekstiga mos kelmaydigan, eski test) yozuvni ko'rsatmoqda. Bu `STRATEGIYA_DARSLAR_AI.md`da yozilgan "Lesson / TrainingTrack / DevelopmentPlan — uchta bog'lanmagan o'qitish tizimi" muammosini amalda tasdiqladi. Katta arxitektura ishi bo'lgani uchun bu sessiyada tuzatilmadi — alohida kelishib olinishi kerak.

### 2.6 [KUZATISH — hozircha tuzatilmadi, kichik] KPI sahifasidagi pastki blok (Efficiency Trend grafigi, Upcoming Milestones, "Rank A+", "top 10% efficiency") — qattiq kodlangan mock ma'lumot
`src/app/dashboard/hr/kpi/page.tsx`dagi KPI kartalari (masalan "Attendance Rate: 96/95%") **real** DB ma'lumoti, lekin sahifa pastidagi grafik va "Upcoming Milestones" ("Pass English Test", "Submit Q1 Report" va h.k.) haqiqiy emas — kodga qattiq yozilgan namunaviy raqamlar. Pilot HR buni chalkashtirib, "nega bu ma'lumotlar mening kompaniyamga tegishli emas" deb o'ylashi mumkin. Tavsiya: pilot boshlanishidan oldin bu blokni olib tashlash yoki aniq "demo ma'lumot" belgisi qo'yish.

## 3. Tasdiqlangan ishlaydigan qismlar

- [x] Login/auth (admin roli)
- [x] HR Dashboard umumiy ko'rinishi (statistikalar, garchi ba'zan 2.1 sabab noto'g'ri "0" ko'rsatsa ham)
- [x] Vakansiyalar ro'yxati (3 ta seed vakansiya to'g'ri ko'rinadi)
- [x] Xodimlar ro'yxati (5 ta seed xodim to'g'ri ko'rinadi)
- [x] Darslar ro'yxati (2.0.1 tuzatilgandan keyin — 2 ta seed dars to'g'ri ko'rinadi)
- [x] KPI sahifasi — ta'rif (definition) va yozuvlar (entries) to'g'ri yuklanadi va ko'rsatiladi
- [x] AI Assistant sahifasi (`/dashboard/hr/ai-assistant`) — muammosiz ochiladi, chat va "Jarayon nazorati" UI'si joyida (real chat javobi bu safar sinalmadi, oldingi sessiyada tasdiqlangan edi — `TODO.md` 6.4)
- [x] `/api/careers` xavfsizlik kamchiligi (2.0-band)

## 4. Keyingi tekshirish navbati (hali qilinmagan)

- [ ] Ariza topshirish oqimi (`/apply`) — nomzoddan ish beruvchigacha to'liq yo'l
- [ ] Suhbat (Interview) yaratish va baholash
- [ ] Darslarni xodimga biriktirish, topshiriq topshirish, baholash oqimi (faqat ro'yxat ko'rinishi tekshirildi)
- [ ] Sinov muddati (Probation) baholash
- [ ] Onboarding vazifalari
- [ ] Xodim (`EMPLOYEE`) va Nomzod (`CANDIDATE`) rollari bilan alohida kirib, ularning cheklangan ko'rinishini tekshirish
- [ ] Settings → Users, Audit Log paneli
- [ ] Telegram bot integratsiyasi (agar pilot korxonasida ishlatilsa)
- [ ] Mobil/kichik ekran ko'rinishi (responsive)
- [ ] 2.1-band (Neon ulanish barqarorligi) — hali tuzatilmadi, foydalanuvchi bilan kelishilgan navbat bo'yicha keyinroq

## 5. Ishlash tartibi

Har safar yangi bo'lim sinalganda: shu faylga topilgan muammo (yoki "OK" belgisi) qo'shiladi. Muammo tuzatilgach, checkbox `[x]` qilinadi va tuzatish tavsifi qo'shiladi. Pilot **"tayyor"** deb hisoblanadi, qachonki 4-bo'limdagi barcha band tekshirilib, 2-bo'limdagi barcha "OCHIQ" band yopilgan bo'lsa — shundan keyingina `TODO.md`dagi "MUHIM STRATEGIK QAROR"ga muvofiq to'lov tizimi va SaaS bosqichlari boshlanadi.
