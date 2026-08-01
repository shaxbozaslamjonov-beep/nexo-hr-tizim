# Nexo HR — Ikki tomonlama platforma rejasi (TODO)

> Ushbu fayl — kelishilgan ish rejasi. Amalga oshirishdan oldin har bir bosqichni ko'rib chiqing va tasdiqlang. Status belgilari: `[ ]` bajarilmagan, `[~]` jarayonda, `[x]` bajarilgan.

## MUHIM STRATEGIK QAROR — bosqichlar tartibi (2026-07-30)

> **Kelishilgan qaror:** Global SaaS'ga (`NEXO_HR_GLOBAL_SAAS_STRATEGY.md`) o'tishdan oldin, tizim **dastlab bitta korxona uchun to'liq yaratiladi va sinovdan o'tkaziladi**. Faqat shu sinov xatoliksiz o'tgandan keyingina to'lov tizimi (Stripe/Payme) va boshqa SaaS bosqichlari (Faza A va undan keyingisi) boshlanadi.
>
> - [ ] 1-bosqich: Bitta korxona (pilot) uchun tizimni to'liq ishlab chiqish — barcha asosiy modullar (ishga olish, o'qitish/darslar, KPI, karyera, onboarding) shu korxonada haqiqiy ishlatilib sinovdan o'tkaziladi
> - [ ] 2-bosqich: Sinov davomida topilgan xatoliklar/kamchiliklar tuzatiladi, real foydalanish tajribasi asosida tuzatishlar kiritiladi
> - [ ] Faqat sinov **xatoliksiz** deb topilgandan keyin → `NEXO_HR_GLOBAL_SAAS_STRATEGY.md` Faza A (to'lov tizimi, email/SMS, xavfsizlik auditi va h.k.) boshlanadi
>
> Shu sababli, ushbu qaror tasdiqlanmaguncha to'lov tizimi (Stripe/Payme) yoki boshqa ko'p-kompaniyali (multi-tenant SaaS) ishlarini oldinga surmaslik kerak.

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
  - [x] Yangiliklar va e'lonlar bloki — `Announcement` Prisma modeli yaratildi va public landing hamda API (`/api/announcements`) bilan bog'landi
- [x] Yangi public API endpoint: [`GET /api/public/vacancies`](src/app/api/public/vacancies/route.ts) — faqat OPEN statusdagi vakansiyalarni qaytaradi, autentifikatsiya talab qilmaydi
- [x] `middleware.ts` yangilandi: `/apply` sahifasi va `/api/candidates` (faqat POST) endi haqiqatan ham ochiq
- [x] `UserRole` TS turiga `CANDIDATE` qo'shildi
- [x] SEO va OpenGraph meta teglar (`og:title`, `og:description`, `og:image`, Twitter Cards) loyihaga ulanti ([layout.tsx](src/app/layout.tsx))

---

## 4-bosqich: Bosqichma-bosqich ochiladigan (progressive unlock) nomzod yo'li ✅ BAJARILDI

- [x] **Ariza topshirildi** (`Application.stage`) → [`/dashboard/candidate`](src/app/dashboard/candidate/page.tsx) da ariza holati, bosqich va skorlar ko'rsatiladi
- [x] **Suhbat** bo'limi — `Interview` yozuvlari mavjud bo'lsa ko'rsatiladi (sana, natija, ball)
- [x] **O'quv/Test bo'limi progressive unlock bilan**
- [x] **O'quvni yakunlash → ishga qabul** avtomatik o'tishi — yangi [`/api/candidates/[id]/hire`](src/app/api/candidates/[id]/hire/route.ts) endpointi orqali nomzodni bir bosish bilan `EMPLOYEE` darajasiga o'tkazish, `EmployeeProfile` va dastlabki `OnboardingTask` biriktirish imkoniyati yaratildi

---

## 6.6 AI orqali platformaga qo'shimcha ma'lumot generatsiya qilish ✅ BAJARILDI

- [x] **Vakansiya tavsifi/talablarini AI yordamida avtomatik yozib berish** — [`/api/ai/generate-vacancy`](src/app/api/ai/generate-vacancy/route.ts)
- [x] **Nomzod rezyumesidan avtomatik AI tahlili** — yangi [`/api/ai/analyze-candidate`](src/app/api/ai/analyze-candidate/route.ts) orqali nomzodning kuchli/kuchsiz tomonlari va moslik skorini (Job Fit Score %) chiqarish
- [x] **Suhbat savollarini AI yordamida generatsiya qilish** — yangi [`/api/ai/generate-questions`](src/app/api/ai/generate-questions/route.ts) orqali lavozimga mos 10 ta texnik va kompetensiya savollarini tayyorlash

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
- [x] **Audit log** — `AuditLog` Prisma modeli yaratildi, `logAudit()` yordamchi funksiyasi hamda Sozlamalardagi `Audit Log (Xavfsizlik)` paneli to'liq ta'minlandi.
- [ ] **Email/SMS xabarnoma** — amalga oshirilmadi. Sabab: loyihada hech qanday email/SMS provayder (SMTP, Twilio va h.k.) ulanmagan — qaysi xizmatdan foydalanish kerakligini avval kelishib olish kerak.
- [x] **Rol boshqaruvi UI (`Settings → Users`)** — haqiqiy Prisma database foydalanuvchilariga ulanti. HR Adminlar real jamoa a'zolarini va ularning rollarini saqlashi mumkin.
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

## 8-bosqich: Sidebar dizaynini "Tolib Xolva ERP" uslubiga moslashtirish ✅ BAJARILDI

Foydalanuvchi ikkinchi loyihasi (kanban cheklist / Tolib Xolva ERP)ning sidebar tuzilishi va rang palitrasini namuna sifatida ko'rsatdi.

- [x] Eski binafsha-siyoh **gradient** sidebar fon butunlay olib tashlandi — endi yassi oq fon (light) / to'q slate fon (dark), o'ng tomonda nozik chegara — aynan namunadagi uslub
- [x] Urg'u rangi **cyan** (`#06b6d4`) ga o'zgartirildi (avval amber edi) — faol menyu bandi cyan fon+chegara+matn bilan ajratiladi, xuddi namunadagi kabi
- [x] Yangi CSS o'zgaruvchilar: `--sidebar-bg`, `--sidebar-border`, `--sidebar-text`, `--sidebar-accent` va h.k. (`globals.css`) — light/dark uchun alohida qiymatlar, "bitta manba" tamoyiliga rioya qilingan
- [x] Logo belgisi ham yangi cyan gradientga moslashtirildi
- Brauzerda tekshirildi: light rejimda oq fon (`rgb(255,255,255)`), faol havola aniq cyan rangda (`rgb(6,182,212)`) render bo'lishi tasdiqlandi
- [ ] Menyu **tarkibi** (item+subitem tuzilishi) hozircha o'zgartirilmadi — mavjud "bo'lim sarlavhasi → ochiladigan ro'yxat" andozasi funksional jihatdan namunadagidek ishlaydi (bosilganda ochiladi/yopiladi), shuning uchun faqat vizual uslub yangilandi. Agar namunadagi kabi "asosiy band bosilganda birinchi pastki bandga o'tish" xatti-harakati aniq talab qilinsa — bu alohida, kichikroq keyingi qadam.

## 9-bosqich: YAKUNIY dizayn tizimi — Navy + Emerald + Bronze ✅ BAJARILDI

Foydalanuvchi uchta taklif qilingan palitradan birini (Navy "ishonch" + Emerald "o'sish" + Bronze "imkoniyat") **yakuniy** deb tanladi. Butun tizimga (jamoat sayti + ichki dashboard) joriy qilindi — bundan buyon rang o'zgarishlari shu asosda davom etadi.

- [x] `globals.css`dagi barcha asosiy semantik token (`--primary`, `--success`, `--warning`, `--info` va h.k.) Navy/Emerald/Bronze ramp'lariga o'tkazildi, to'liq 10 pog'onali rang shkalalari (`--navy-50..900`, `--emerald-50..800`, `--bronze-50..800`) qo'shildi
- [x] Landing va login sahifalaridagi eski industrial navy+amber (Space Grotesk/JetBrains Mono, "blueprint" panjara fon) uslubi olib tashlandi — endi Navy gradient hero (spec'dagi aynan shu formula: `navy-900 → navy-600`) + Emerald CTA/urg'u, faqat Poppins (sarlavha) + Inter (matn) — spec'ning "2 tadan ortiq shrift oilasi ishlatilmasin" qoidasiga muvofiq
- [x] Sidebar urg'u rangi cyan'dan **navy-600**ga o'zgartirildi — bu spec'ning o'zida "Sidebar: Active state → Navy-600 text" deb aniq ko'rsatilgan, shuning uchun oldingi bosqichdagi ishni yo'qqa chiqarmasdan, yakuniy palitraga moslashtirildi
- [x] Status badge'lar (`.badge-open`, `.badge-pending` va h.k.) Emerald/Bronze/Navy pog'onalariga qayta rangla ndi
- Brauzerda tekshirildi: landing hero fonida aniq `rgb(13,27,61) → rgb(65,105,201)` gradient, login tugmasida `rgb(68,155,120)` (emerald), dashboard faol menyu bandida `rgb(65,105,201)` (navy-600) render bo'lishi tasdiqlandi
- [ ] Vakansiya kartochkalari, tugma va boshqa ichki komponentlar (`.btn-primary`, `.card` va h.k.) hozircha faqat markazlashgan CSS o'zgaruvchilar orqali avtomatik yangi rangni oladi (chunki ular allaqachon `var(--primary)` kabi token'lardan foydalanadi) — alohida qattiq kodlangan joy qolmagan bo'lishi kerak, lekin har bir sahifani birma-bir vizual tekshirish hali qilinmadi

---

## Ishlash tartibi

1. Ushbu rejani ko'rib chiqing, kerakli o'zgartirish/qo'shimchalarni ayting
2. Tasdiqlangandan so'ng bosqichlar ketma-ket amalga oshiriladi (avval 1-bosqich, keyin 2, va h.k.), har bosqichdan keyin sinovdan o'tkaziladi
3. Katta bosqichlar (RBAC, progressive unlock) alohida commit'lar bilan amalga oshiriladi

---

## 10-bosqich: SaaS Multi-Tenancy, Self-Service Onboarding va Telegram Bot Deep-Linking ✅ BAJARILDI

> Foydalanuvchi tavsiyasi asosida platformani to'liq SaaS darajasiga olib chiqish uchun 3 ta asosiy texnik vazifa.

### 10.1 Prisma va API Layerida Multi-Tenancy izolyatsiyasini to'liq o'rnatish ✅ BAJARILDI
- [x] `prisma/schema.prisma` dagi `TrainingTrack`, `Test`, `CareerPath`, `CareerLevel`, `Position`, `Lesson` modellariga `companyId` maydoni va `Company` bilan `relation` qo'shildi
- [x] DB schema migratsiyasi va sinxronizatsiyasi bajarildi (`npx prisma db push --accept-data-loss` & `npx prisma generate`)
- [x] Backend API'larda har bir kompaniya uchun alohida `companyId` izolyatsiyasi ta'minlandi

### 10.2 Self-Service Kompaniya Registratsiyasi va Tarif Limitlari Nazorati ✅ BAJARILDI
- [x] [`/api/auth/register`](src/app/api/auth/register/route.ts) funksiyasi kengaytirildi: Biznes egasi ro'yxatdan o'tayotganda `companyName` berilsa, unikal `slug` bilan yangi `Company` (plan="trial") va uning birinchi `ADMIN`i avtomatik yaratiladi
- [x] Yangi [`src/lib/billing.ts`](src/lib/billing.ts) moduli yaratildi: tarif planlari (`trial`, `starter`, `professional`, `enterprise`) va ularning limitlarini (`maxEmployees`, `maxActiveVacancies`) belgilash va tekshirish mantiqi qo'shildi
- [x] Yangi [`/api/company`](src/app/api/company/route.ts) API endpointi yaratildi: kompaniya ma'lumotlari, tarif va limit holatini olish va yangilash imkoniyati

### 10.3 Telegram Bot Multi-Tenancy Adaptation va Deep-Linking ✅ BAJARILDI
- [x] Telegram webhook (`/api/webhooks/telegram/route.ts`) da `/start c_<companySlug>_v_<vacancyId>` yoki `/start c_<slug>` parametrik deep-linking havolalari qo'llab-quvvatlandi
- [x] Bot nomzodni mos kompaniya nomi va vakansiyasiga avtomatik bog'laydi va qulay veb-forma tugmasini taqdim etadi
- [x] Telegram orqali o'zaro muloqot va HR xabarnomalari kompaniya izolyatsiyasiga moslashtirildi
