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

---

## Ishlash tartibi

1. Ushbu rejani ko'rib chiqing, kerakli o'zgartirish/qo'shimchalarni ayting
2. Tasdiqlangandan so'ng bosqichlar ketma-ket amalga oshiriladi (avval 1-bosqich, keyin 2, va h.k.), har bosqichdan keyin sinovdan o'tkaziladi
3. Katta bosqichlar (RBAC, progressive unlock) alohida commit'lar bilan amalga oshiriladi
