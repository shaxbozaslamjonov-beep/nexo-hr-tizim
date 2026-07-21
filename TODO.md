# Nexo HR — Ikki tomonlama platforma rejasi (TODO)

> Ushbu fayl — kelishilgan ish rejasi. Amalga oshirishdan oldin har bir bosqichni ko'rib chiqing va tasdiqlang. Status belgilari: `[ ]` bajarilmagan, `[~]` jarayonda, `[x]` bajarilgan.

## 0. Joriy holat (audit natijasi)

Kod bazasini tekshirganda quyidagi holat aniqlandi:

- **Rollar**: `ADMIN`, `HR_MANAGER`, `DIRECTOR`, `DEPARTMENT_HEAD`, `EMPLOYEE`, `CANDIDATE` — lekin `CANDIDATE` faqat DB/middleware'da bor, `src/types/index.ts` dagi `UserRole` turida yo'q (nomuvofiqlik).
- **Marshrutlash**: `src/middleware.ts` da `roleAccessMap` orqali `/dashboard/hr`, `/dashboard/employee`, `/dashboard/candidate` kabi yo'llar rolga qarab cheklangan — lekin **`/dashboard/candidate` sahifasi hali yaratilmagan**, faqat murojaat qilinadi.
- **Ochiq sahifa yo'q**: `src/app/page.tsx` — faqat rolga qarab redirect qiladi, login qilmagan foydalanuvchi uchun hech qanday marketing/vakansiya sahifasi ko'rsatmaydi.
- **`apply/page.tsx`** — ariza topshirish formasi allaqachon ochiq (login talab qilmaydi), lekin vakansiyalarni ko'rib chiqish uchun umumiy ro'yxat sahifasi yo'q, faqat `?vacancy=` parametri orqali to'g'ridan-to'g'ri havola bilan ishlaydi.
- **RBAC abstraktsiyasi yo'q**: hamma joyda `role === 'ADMIN'` kabi tekshiruvlar qo'lda yozilgan, markazlashgan `can()`/`hasPermission()` funksiyasi yo'q.
- **Nomzod yo'li uchun DB maydonlari allaqachon mavjud** (yangi narsa o'ylab topish shart emas, mavjudlaridan foydalanish kerak):
  `Application.stage` (APPLIED → ...) → `Interview.result` → `TrainingAssignment.status` / `TestResult.status` → `EmployeeProfile.status` (ONBOARDING → ...) → `ProbationEvaluation.result` → `CareerPath`/`CareerMilestone` va h.k.

---

## 1-bosqich: Ochiq (login talab qilmaydigan) veb-sayt ✅ BAJARILDI

- [x] `src/app/page.tsx` ikkiga ajratildi: login qilmagan foydalanuvchi uchun **jamoat (public) landing sahifasi** ([LandingPage.tsx](src/app/LandingPage.tsx)), login qilgan foydalanuvchi uchun joriy rolga-qarab-redirect mantiqi saqlanib qoldi
- [x] Public landing sahifa tarkibi:
  - [x] Ochiq vakansiyalar ro'yxati (faqat `status: OPEN`, `/api/public/vacancies` orqali)
  - [x] Har bir vakansiyadan "Ariza topshirish" tugmasi → `apply?vacancy=...` formasiga olib boradi
  - [x] "Tizimga kirish" tugmasi header'da
  - [ ] Yangiliklar bloki — **hozircha qo'shilmadi**, chunki bunday ma'lumotni saqlash uchun DB'da model yo'q (News/Announcement). Alohida vazifa sifatida kelishib olish kerak.
- [x] Yangi public API endpoint: [`GET /api/public/vacancies`](src/app/api/public/vacancies/route.ts) — faqat OPEN statusdagi vakansiyalarni qaytaradi, autentifikatsiya talab qilmaydi
- [x] `middleware.ts` yangilandi: `/apply` sahifasi va `/api/candidates` (faqat POST) endi haqiqatan ham ochiq — **muhim topilma**: bu ilgari ham "ochiq" deb rejalashtirilgan edi, lekin middleware'da ro'yxatga kiritilmagani sababli anonim foydalanuvchilar `/apply` sahifasiga umuman kira olmas edi (avtomatik `/login`ga qaytarilardi). Endi tuzatildi.
- [x] Qo'shimcha topilgan xato: `AuthContext.tsx` da mijoz tomonidagi (client-side) alohida auth-guard bor edi, u root sahifani "public" deb bilmasdan, sessiya yo'q foydalanuvchilarni har doim `/login`ga qaytarardi — shu sabab landing sahifa umuman ko'rinmasdi. Tuzatildi (`pathname !== '/'` sharti qo'shildi).
- [x] `UserRole` TS turiga `CANDIDATE` qo'shildi (audit'da topilgan nomuvofiqlik)
- [ ] SEO uchun asosiy meta teglar (title/description) public sahifalarga qo'shish — keyingi safar

## 2-bosqich: RBAC (Role-Based Access Control) tizimini markazlashtirish ✅ BAJARILDI

- [x] `src/types/index.ts` dagi `UserRole` turiga `CANDIDATE` qo'shildi (1-bosqichda bajarilgan)
- [x] Yangi [`src/lib/rbac.ts`](src/lib/rbac.ts) moduli yaratildi:
  - [x] Har bir rol uchun ruxsatlar ro'yxati (`PERMISSIONS` — `view_hr_dashboard`, `manage_vacancies`, `approve_vacancies`, `manage_employees`, `manage_candidates`, `manage_settings`, `view_analytics` va h.k.)
  - [x] `can(user, action)` yordamchi funksiyasi
  - [x] `hasRole(user, ...roles)` yordamchi funksiyasi
  - [x] `rolesWithPermission(action)` — middleware uchun
- [x] `middleware.ts` qayta yozildi: qo'lda yozilgan `roleAccessMap` o'rniga `routePermissions` (route → action) va `rolesWithPermission()` orqali markazlashgan RBAC'dan foydalanadi
- [x] `/api/vacancies` POST'dagi qo'lda yozilgan `allowedRoles` massivi `can(session, 'manage_vacancies')` ga almashtirildi
- [x] Vakansiya sahifalaridagi (`page.tsx`, `create/page.tsx`, `[id]/edit/page.tsx`, `[id]/page.tsx`) 4 ta `user?.role?.toUpperCase() === 'ADMIN'` tekshiruvi `can(user, 'manage_vacancies')` ga almashtirildi
- [x] **Muhim topilma va tuzatish**: `AuthContext.tsx` sahifa yangilanganda (full reload) sessiyani `auth_token` (httpOnly cookie) orqali tekshirishga harakat qilardi — lekin httpOnly cookie JS orqali umuman o'qib bo'lmaydi, shu sabab **har qanday sahifa yangilanishida (F5) foydalanuvchi login qilgan bo'lsa ham avtomatik `/login`ga chiqarib yuborilardi**. Bu productionda ham ta'sir qilgan jiddiy xato edi. Endi client sessiyasi `localStorage`dagi `auth_user`ga tayanadi, haqiqiy autentifikatsiya tekshiruvi esa serverdagi `middleware.ts` zimmasida qoladi.
- [x] **Qo'shimcha xato**: `logout()` funksiyasi serverga so'rov yubormasdan faqat client holatini tozalardi — `auth_token` cookie (httpOnly) haqiqatda o'chmasdan qolardi. Endi `logout()` `/api/auth/logout`ga so'rov yuboradi.
- Brauzerda tekshirildi: login → sahifani to'liq qayta yuklash (F5) → foydalanuvchi tizimda qoladi, admin tugmalari (`Создать вакансию`) to'g'ri ko'rinadi.

## 3-bosqich: Ikki tomonlama interfeys — Foydalanuvchi (Employee/Candidate) vs Admin/HR ✅ BAJARILDI

- [x] `dashboard/candidate/*` — **yangi yaratildi**:
  - [x] [`/dashboard/candidate`](src/app/dashboard/candidate/page.tsx) — ariza holati, bosqich (stage), skorlar va suhbatlar ro'yxati ko'rsatiladi (haqiqiy `Application`/`Interview` ma'lumotlaridan)
  - [x] [`/dashboard/candidate/profile`](src/app/dashboard/candidate/profile/page.tsx) — shaxsiy ma'lumotlar
  - [x] [`/api/candidates`](src/app/api/candidates/route.ts) GET endi `CANDIDATE` roli uchun faqat o'z profilini qaytaradi
- [x] **Muhim xavfsizlik topilmasi**: `GET /api/candidates` ilgari **har qanday login qilgan foydalanuvchiga** (jumladan oddiy `EMPLOYEE` yoki `CANDIDATE` rolidagilarga ham) **barcha nomzodlar va ularning arizalari haqidagi ma'lumotni** qaytarardi — hech qanday rol tekshiruvi yo'q edi. Endi `can(session, 'manage_candidates')` orqali faqat HR rollariga ochiq, oddiy `CANDIDATE` esa faqat o'zinikini ko'radi.
- [x] `Sidebar.tsx` **to'liq qayta yozildi** — ilgari barcha rollarga (shu jumladan oddiy `EMPLOYEE`ga ham) bir xil to'liq HR-admin menyusi ko'rsatilardi. Endi 3 xil menyu: `hrNavSections` (ADMIN/HR_MANAGER/DIRECTOR/DEPARTMENT_HEAD), `employeeNavSections` (oddiy xodim: KPI, Training, Career, Profile), `candidateNavSections` (nomzod: Mening arizam, Profil) — `can(role, 'view_hr_dashboard')` orqali tanlanadi.
- [x] **Muhim topilgan xato**: `AuthContext.tsx`dagi `login()` funksiyasi rolidan qat'i nazar **har doim `/dashboard/hr`ga yo'naltirardi** — shuning uchun oddiy xodim yoki nomzod tizimga kirganda "Access Denied" xatosiga duch kelardi (middleware ularni HR panelidan bloklardi). Endi rolga qarab to'g'ri yo'naltiradi (`ADMIN/HR_MANAGER/DIRECTOR/DEPARTMENT_HEAD` → `/dashboard/hr`, `CANDIDATE` → `/dashboard/candidate`, qolganlari → `/dashboard/employee`).
- Brauzerda to'liq tekshirildi: test nomzod yaratib, tizimga kirish → to'g'ri `/dashboard/candidate`ga yo'naltirilishi, sidebar faqat 2 ta havola ko'rsatishi, ariza holati va skorlari to'g'ri chiqishi tasdiqlandi. HR_MANAGER bilan kirish hali ham to'g'ri `/dashboard/hr`ga borishi tekshirildi.
- [ ] **Kelgusi uchun ochiq masala**: nomzod hisobi `/apply` orqali avtomatik yaratilganda tasodifiy parol beriladi va nomzodga hech qanday kanal orqali yuborilmaydi — hozircha nomzod o'z hisobiga birinchi marta kira olmaydi (parolni tiklash email oqimi kerak). Bu alohida vazifa sifatida kelishib olinishi kerak.

## 4-bosqich: Bosqichma-bosqich ochiladigan (progressive unlock) nomzod yo'li ✅ BAJARILDI

- [x] **Ariza topshirildi** (`Application.stage`) → [`/dashboard/candidate`](src/app/dashboard/candidate/page.tsx) da ariza holati, bosqich va skorlar ko'rsatiladi
- [x] **Suhbat** bo'limi — `Interview` yozuvlari mavjud bo'lsa ko'rsatiladi (sana, natija, ball)
- [x] **O'quv/Test bo'limi progressive unlock bilan** — `trainingUnlocked()` funksiyasi: agar hech bo'lmasa bitta suhbat natijasi `PASSED` bo'lsa yoki HR tomonidan `TrainingAssignment` biriktirilgan bo'lsa, bo'lim ochiladi va haqiqiy modul/test ma'lumotlari ko'rsatiladi; aks holda 🔒 tushunarli xabar bilan qulflangan holda ko'rsatiladi
- [x] **Muhim topilgan va tuzatilgan muammo**: `/apply` orqali avtomatik yaratilgan nomzod hisobi tasodifiy parol bilan yaratilar edi, lekin bu parol hech qayerda ko'rsatilmasdi — nomzod birinchi marta hisobiga umuman kira olmasdi. Endi: (1) ariza muvaffaqiyatli topshirilgach parol va login havolasi to'g'ridan-to'g'ri ekranda ko'rsatiladi, (2) yangi [`/api/auth/change-password`](src/app/api/auth/change-password/route.ts) endpointi va [`ChangePasswordForm`](src/app/dashboard/candidate/profile/ChangePasswordForm.tsx) orqali nomzod profilida parolni o'zi almashtira oladi. Brauzerda to'liq tekshirildi: ariza → temp parol bilan kirish → parolni yangilash → yangi parol bilan qayta kirish.
- [ ] **O'quvni yakunlash → ishga qabul** avtomatik o'tishi (`EmployeeProfile` yaratish) — hali qo'lda (HR tomonidan) amalga oshiriladi, avtomatlashtirilmagan. Bu HR jarayoniga qat'iy tegishli biznes qaror talab qiladi (masalan kim tasdiqlaydi, qanday shartlar bilan) — alohida kelishib olinishi kerak.
- [ ] Har bir bosqich o'zgarishida real vaqtda bildirishnoma (email/push) — hozircha yo'q, pastga qarang

## 5-bosqich: Qo'shimcha takliflar

- [x] **Vakansiya uchun avtomatik moderatsiya** — tasdiqlangan: public API (`/api/public/vacancies`) faqat `OPEN` statusni qaytaradi, `PENDING_APPROVAL` va boshqalar ko'rinmaydi
- [x] **Ikki tilli (UZ/RU) public sahifalar** — landing va `/apply` sahifalari `LanguageContext` orqali ishlaydi, tekshirildi
- [x] **Nomzod parolini o'zi boshqarishi** — yuqorida (4-bosqich) bajarildi
- [ ] **Audit log** — amalga oshirilmadi. Sabab: bu yangi Prisma modeli va migratsiya talab qiladi (production DB'ga schema o'zgarishi) — bunday o'zgarishni tasdiqlashsiz kiritish xavfli, alohida kelishib olinishi kerak.
- [ ] **Email/SMS xabarnoma** — amalga oshirilmadi. Sabab: loyihada hech qanday email/SMS provayder (SMTP, Twilio va h.k.) ulanmagan — qaysi xizmatdan foydalanish kerakligini avval kelishib olish kerak.
- [ ] **Rol boshqaruvi UI (`Settings → Users`)** — **muhim topilma**: bu bo'lim to'liq soxta (mock) ma'lumotlar bilan ishlaydi — `adminUserService.ts` haqiqiy Prisma User jadvaliga emas, balki brauzer `localStorage`ga yozadi/o'qiydi. Bundan tashqari UI `firstName`, `lastName`, `isActive`, `lastLogin` maydonlarini kutadi, lekin haqiqiy `User` modelida ular **umuman yo'q** (faqat `id`, `email`, `password`, `role` bor). Buni to'g'ri ishlatish uchun avval Prisma schema'ga yangi ustunlar qo'shish (migratsiya) va ism manbasini aniqlash (CandidateProfile/EmployeeProfile'dan) kerak bo'ladi — bu database migratsiyasi talab qiladigan qaror bo'lgani uchun tasdiqlashsiz amalga oshirilmadi.
- [ ] **Nomzod uchun profil to'ldirish foizi** — kichik, past ustuvorlikdagi vazifa, keyingi safar qo'shish mumkin

## 6-bosqich: Login dizayni, ichki interfeys tartibga solish va AI integratsiyasi

> Ishlab chiqilgan reja, tasdiqlashni kutmoqda. Har bir kichik bo'lim mustaqil bajarilishi mumkin.

### 6.1 Login sahifasi dizaynini yangilash ✅ BAJARILDI
- [x] `login/page.tsx` va `login.module.css` landing sahifadagi industrial-professional uslubga (to'q ko'k fon, safety-amber urg'u, Space Grotesk/JetBrains Mono, blueprint panjara, skanerlash chizig'i animatsiyasi) moslashtirildi
- [x] Framer Motion bilan kirish animatsiyasi qo'shildi (`src/lib/motion.ts` dagi `springSnappy`)
- [x] `register` sahifasi xuddi shu `login.module.css`ni ishlatgani sababli avtomatik yangi uslubga o'tdi (logo qatori qo'shildi)
- [x] **Muhim topilgan xato**: `/login/forgot` havolasi mavjud bo'lsa-da, sahifaning o'zi hech qachon yaratilmagan edi (404) — endi yaratildi (HR-administratorga murojaat qilish haqida tushuntirish, chunki loyihada email yuborish infratuzilmasi yo'q)
- [x] **Yana bir topilgan xato**: yangi `/login/forgot` sahifasi yaratilgandan so'ng u middleware'da "ochiq" deb belgilanmagani aniqlandi — anonim foydalanuvchi bu sahifaga kira olmasdi (avtomatik `/login`ga qaytarilardi). `middleware.ts`dagi `publicRoutePrefixes`ga `/login` qo'shib tuzatildi.
- Brauzerda tekshirildi: login, register, /login/forgot sahifalari to'g'ri render bo'lishi va login funksionalligi (kirish → `/dashboard/hr`) buzilmaganligi tasdiqlandi.

### 6.2 Ichki interfeys (dashboard) tartibga solish va menyu qulaylashtirish ~ QISMAN BAJARILDI
- [x] Sidebar menyusi 5 bo'limdan 4 taga tushirildi — kam elementli "Rivojlanish yo'llari" (2 band) va "Darslar" (1-3 band) guruhlari bitta "O'qitish" guruhiga birlashtirildi (bir xil mavzu — training/tests/lessons)
- [x] Sidebar'dagi faol havola urg'u rangi (`--nexo-cyan`) landing/login'dagi safety-amber (`#F5A623`) rangiga almashtirildi — ichki va tashqi interfeys o'rtasida vizual bog'liqlik yaratildi (asosiy binafsha-siyoh gradient sidebar identitikasi saqlanib qoldi, faqat urg'u rangi mos qilindi)
- [ ] Global qidiruv (`Header.tsx` dagi "Поиск по платформе") — hozir faqat input, natija ko'rsatmaydi (tekshirilmadi, alohida vazifa)
- [ ] Barcha `dashboard/hr/*` sahifalarida (~25 ta sahifa) qattiq kodlangan inline style'larni komponentlashtirish — **katta hajmli, alohida bosqichma-bosqich reja talab qiladigan ish**, bitta o'tirishda xavfsiz bajarib bo'lmaydi. Asosiy Dashboard (`HRDashboardContent.tsx`) sahifasi tekshirildi — u allaqachon Framer Motion bilan yaxshi animatsiyalangan, qayta qurish shart emas.

### 6.3 AI agent — jarayonlarni nazorat qilish uchun (DeepSeek API) ✅ ASOSIY QISM BAJARILDI
- [x] `DEEPSEEK_API_KEY` `.env` fayliga qo'shildi (git'ga tushmaydi, `.gitignore`da)
- [x] Yangi [`src/lib/ai/deepseek.ts`](src/lib/ai/deepseek.ts) — DeepSeek chat completion API klienti
- [x] Yangi [`src/lib/ai/context.ts`](src/lib/ai/context.ts) — Prisma'dan haqiqiy HR pipeline ma'lumotlarini (vakansiyalar/arizalar/nomzodlar statusi, yaqin suhbatlar, 7 kundan ortiq harakatsiz arizalar) yig'ib, AI uchun kontekst tayyorlaydi — bu AI javoblarining haqiqiy ma'lumotlarga asoslanishini ta'minlaydi
- [x] "Ikkalasi ham" (chat + fon nazorati) qarori bo'yicha: hozircha **on-demand** (admin tugma bosganda) ishlaydigan tarzda amalga oshirildi — [`/api/ai/monitor`](src/app/api/ai/monitor/route.ts) endpointi joriy pipeline'ni tahlil qilib, aniq muammolarni (masalan tasdiqlanmagan vakansiyalar, harakatsiz arizalar) topadi
- [ ] **To'liq avtomatik fon jarayoni** (masalan kunlik Vercel Cron orqali, natijasi adminlarga bildirishnoma sifatida yetib borishi) hali qo'shilmadi — sabab: loyihada haqiqiy bildirishnoma tizimi yo'q (Header'dagi qo'ng'iroq belgisi hozircha qattiq kodlangan "3" raqami, real backend'ga ulanmagan). Avval bildirishnoma tizimini haqiqiy qilish kerak, aks holda AI kunlik tekshiruv natijasini hech kim ko'rmaydi.

### 6.4 Adminlar uchun alohida AI yordamchi sahifasi ✅ BAJARILDI
- [x] Yangi [`/dashboard/hr/ai-assistant`](src/app/dashboard/hr/ai-assistant/page.tsx) sahifasi — chat interfeysi + "Jarayon nazorati" paneli (Tekshirishni boshlash tugmasi)
- [x] RBAC: yangi `use_ai_assistant` permission qo'shildi (`ADMIN`, `DIRECTOR`, `HR_MANAGER` uchun; `DEPARTMENT_HEAD`ga berilmadi), sahifa va API'lar shu bilan cheklangan, sidebar'da ham shu ruxsatga ega bo'lmaganlarga link ko'rinmaydi
- [x] Brauzerda to'liq tekshirildi: real savol so'rab ("hozir nechta ochiq vakansiya bor?") to'g'ri javob oldi (2 ta — DB bilan mos), "Tekshirishni boshlash" tugmasi real muammolarni topib berdi (1 ta PENDING_APPROVAL vakansiya, suhbat rejalashtirilmagan nomzodlar), noaniq savolga ("qaysi vakansiyaga eng ko'p ariza tushgan") AI to'g'ri ravishda "bu ma'lumot yo'q" deb javob berdi — o'ylab topmadi
- [ ] Suhbat tarixi hozircha saqlanmaydi (faqat joriy sessiya davomida xotirada) — agar doimiy saqlash kerak bo'lsa, yangi Prisma modeli va migratsiya talab qiladi

### 6.5 Oddiy foydalanuvchilar (xodim/nomzod) uchun support AI ✅ BAJARILDI
- [x] Yangi [`SupportChatWidget`](src/components/ai/SupportChatWidget.tsx) — suzuvchi chat komponenti, `DashboardLayout`ga qo'shildi, faqat `EMPLOYEE`/`CANDIDATE` rollarida ko'rinadi (HR/Admin uchun ko'rinmaydi, ular alohida to'liq AI Assistant sahifasidan foydalanadi)
- [x] Yangi [`/api/ai/support`](src/app/api/ai/support/route.ts) — nomzod uchun `buildCandidateSelfContext()`, xodim uchun `buildEmployeeSelfContext()` orqali **faqat o'z ma'lumotlarini** ko'radi. Boshqa foydalanuvchi (masalan ADMIN) bu endpointga so'rov yuborsa `403 Forbidden` qaytaradi — brauzerda tekshirildi.
- Brauzerda to'liq tekshirildi: nomzod sifatida kirib "Mening arizam qaysi bosqichda?" deb so'raganda to'g'ri, shaxsiy ma'lumotga asoslangan javob oldi.

### 6.6 AI orqali platformaga qo'shimcha ma'lumot generatsiya qilish ~ BOSHLANDI
- [x] **Vakansiya tavsifi/talablarini AI yordamida avtomatik yozib berish** — birinchi va eng foydali variant tanlab amalga oshirildi: yangi [`/api/ai/generate-vacancy`](src/app/api/ai/generate-vacancy/route.ts), vakansiya yaratish formasida "AI bilan yozdirish" tugmasi — HR lavozim nomi/bo'lim/smenani kiritadi, AI tavsif va talablarni yozib beradi (HR keyin tahrirlashi mumkin). Brauzerda to'liq tekshirildi (Warehouse Supervisor misolida ishladi).
- [ ] Nomzod rezyumesidan avtomatik skill/tajriba xulosasi chiqarish — hali qilinmadi
- [ ] Suhbat savollarini lavozimga qarab AI generatsiya qilishi — hali qilinmadi
- Qolgan ikkitasi alohida, kichikroq vazifalar — talab bo'lsa keyingi safar qo'shish mumkin

## 7-bosqich: Dizayn tizimini "senior daraja"ga olib chiqish ✅ ASOSIY QISM BAJARILDI

Foydalanuvchi taklif qilgan ikkita dizayn spec'ini ko'rib chiqib, "AI qilgan"dek emas, professional ko'rinish uchun 4 ta ustuvorlik aniqlandi va bajarildi:

- [x] **Bitta manba (single source of truth)**: `globals.css`dagi 7 ta ishlatilmagan `--nexo-*` rang alias'i (bittasidan tashqari hech qayerda ishlatilmagan edi) olib tashlandi, qolgan bitta ishlatilishi aniq nomlandi (`--stat-accent`). Landing/login sahifalaridagi 43 ta qattiq kodlangan hex qiymat (`#0A101C`, `#F5A623`, `#F7F5EF`, `#14181F`) yangi `--brand-navy`, `--brand-amber`, `--brand-paper`, `--brand-ink` o'zgaruvchilariga o'tkazildi — endi brend rangini bitta joydan boshqarish mumkin.
- [x] **Rang sonini kamaytirish**: audit qilindi, hozirgi tizimda ortiqcha rang aniqlanmadi (taklif qilingan spec'lardagi qo'shimcha "accent-yashil" kabi keraksiz ranglar hech qachon amalga oshirilmagan edi).
- [x] **Til izchilligi**: vakansiya yaratish/tahrirlash formalarida ingliz tilida qolib ketgan matnlar (`"Fill in the details..."`, `"Linked Position"`, `"Work Shift"`, `"Min/Max Salary"`, placeholder'lar va h.k.) barchasi RU/UZ tarjimaga o'tkazildi. **Muhim topilma**: `backToCandidates` tarjima kaliti faqat RU blokida bor edi, UZ blokida yo'q edi — UZ tilidagi foydalanuvchilar "Назад" tugmasi o'rniga ingliz "Back" so'zini ko'rar edi (fallback orqali). Tuzatildi.
- [ ] **Bitta signature animatsiya**: taklif qilingan spec'lardagi ortiqcha shimmer/pulse effektlari hech qachon amalga oshirilmagani sababli bu yerda tuzatish shart bo'lmadi — lekin kelajakda shunday effektlar so'ralsa, faqat bitta joyda (masalan card hover) qo'llash tavsiya etiladi.
- [ ] Qolgan sahifalarda (interviews, KPI, lessons, training, trial-period) xuddi shunday ingliz placeholder'lar topildi, lekin vaqt tufayli faqat eng ko'p ishlatiladigan vakansiya formalari tuzatildi — qolganlari alohida, kichik vazifa sifatida qoladi.

---

## Ishlash tartibi

1. Ushbu rejani ko'rib chiqing, kerakli o'zgartirish/qo'shimchalarni ayting
2. Tasdiqlangandan so'ng bosqichlar ketma-ket amalga oshiriladi (avval 1-bosqich, keyin 2, va h.k.), har bosqichdan keyin sinovdan o'tkaziladi
3. Katta bosqichlar (RBAC, progressive unlock) alohida commit'lar bilan amalga oshiriladi
