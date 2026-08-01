# Darslar (O'qitish) tizimini rivojlantirish va AI orqali avtomatlashtirish — Strategik reja

> Ushbu fayl faqat **tahlil va tavsiya** hujjati. Kod o'zgartirilmagan — amalga oshirish oldidan bosqichlarni ko'rib chiqing va qaysi biridan boshlash kerakligini tanlang.
>
> Diqqat: savolda "tulib platformani ishlatish" deyilgan — buni **"to'liq platformani ishlatish"** deb tushundim (ya'ni mavjud Darslar/Training modulidan to'liq unumli foydalanish). Agar nazarda tutilgan narsa boshqa (masalan tashqi "Tulib" nomli platforma/servis) bo'lsa, ayting — tahlilni shunga moslab qayta yozib beraman.

---

## 1. Joriy holat (kod bazasi tahlili)

Hozirgi "Darslar" (Lesson) moduli juda sodda va **bitta yassi yozuv** shaklida:

- `Lesson` modeli (`prisma/schema.prisma:559`): sarlavha (RU/UZ), tavsif (RU/UZ), bitta video URL, bitta fayl, bitta topshiriq matni (RU/UZ).
- `LessonAssignment` (`prisma/schema.prisma:581`): xodimga dars biriktirish, holat (PENDING/IN_PROGRESS/SUBMITTED/CHECKED/OVERDUE), ball, matnli javob, fayl.
- Yaratish formasi (`src/app/dashboard/hr/lessons/create/page.tsx`) — HR qo'lda har bir maydonni to'ldiradi, na modul/bo'lim, na test (quiz), na progress-bar tuzilmasi yo'q.
- `TrainingTrack` → `TrainingModule` → `TrainingAssignment` degan **alohida, parallel** model ham bor (`prisma/schema.prisma:145-178`) — bu "kurs/trek" tushunchasini beradi, lekin u `Lesson` bilan bog'lanmagan. Ya'ni hozir **ikkita bir-biriga bog'liq bo'lmagan o'qitish tizimi** paralel ishlayapti:
  - `TrainingTrack/TrainingModule` — kurs strukturasi bor, lekin UI/AI integratsiyasi kam ishlatiladi.
  - `Lesson` — UI to'liq ishlaydi (`/dashboard/hr/lessons/*`), lekin strukturasi yo'q (kurs/modul/bosqich degan narsa yo'q, faqat alohida-alohida darslar ro'yxati).
- Nomzod/xodim tomonida o'qitish **progressive unlock** orqali ochiladi (`TODO.md`dagi 4-bosqich) — bu yaxshi asos, lekin faqat `TrainingAssignment` statusiga bog'liq, `LessonAssignment`ga emas.
- AI infratuzilma allaqachon mavjud va ishlaydi: `src/lib/ai/deepseek.ts` (DeepSeek API klienti) + `/api/ai/generate-vacancy`, `/api/ai/analyze-candidate`, `/api/ai/generate-questions`, `/api/ai/monitor`, `/api/ai/support`. Bu — dars generatsiyasini qo'shish uchun **tayyor andoza**.

**Xulosa:** Eng katta arxitektura muammosi — `Lesson` va `TrainingTrack/Module` ikki xil, bog'lanmagan tizim. Buni birlashtirmasdan turib "kurs" tushunchasini to'g'ri qurib bo'lmaydi.

---

## 2. Darslarni HR tizimga to'liq ulash uchun kerakli ishlar

### 2.1 Ma'lumotlar strukturasini "kurs → modul → dars → test" ierarxiyasiga o'tkazish
Hozir har bir `Lesson` mustaqil, tartibsiz yozuv. Amaliy o'qitish tizimi bo'lishi uchun kerak:
- `Course` (yoki mavjud `TrainingTrack`ni qayta ishlatish) → bir nechta `Lesson` ni **tartib raqami (order)** bilan o'zida saqlashi.
- Har bir kurs qaysi `Position` (lavozim) yoki `CareerPath` bosqichi uchun mo'ljallanganini ko'rsatish (`requiredForPositionId`) — shunda yangi xodim ishga kirganda unga mos kurslar **avtomatik** biriktiriladi (hozir bu qo'lda qilinadi).
- Darsni "yakunlash sharti"ni aniqlashtirish: video ko'rilganmi + topshiriq topshirilganmi + testdan o'tilganmi — hozir faqat "topshiriq holati" bor, "video ko'rildi" degan belgi yo'q.

### 2.2 Har bir darsga mini-test (quiz) qo'shish
Hozir faqat ochiq matnli topshiriq bor (HR qo'lda tekshiradi). Tavsiya:
- Mavjud `Test`/`Question` modelidan foydalanib, har bir `Lesson`ga bitta ixtiyoriy `Test` biriktirish mumkin (bog'lanish allaqachon Prisma darajasida oson, faqat `Lesson.testId` maydoni yetishmayapti).
- Bu HR'ning qo'lda tekshirish yukini kamaytiradi — testlar avtomatik baholanadi, faqat amaliy topshiriqlar qo'lda tekshiriladi.

### 2.3 Progress va bildirishnoma
- Xodim dashboardida "Mening o'quv yo'lim" — necha foiz kurs tugagani, keyingi dars nima — hozir bunday umumlashtirilgan ko'rinish yo'q, faqat alohida dars kartalari bor (`LessonCard.tsx`).
- Muddati o'tgan (`OVERDUE`) topshiriqlar uchun HR'ga signal — hozir status maydoni bor, lekin uni faol kuzatuvchi (masalan AI Monitor) tekshirmaydi. `/api/ai/monitor` allaqachon "harakatsiz arizalar"ni topadi — xuddi shu mantiqni "muddati o'tgan darslar"ga ham kengaytirish arzon va tez qo'shiladigan narsa.

### 2.4 Kurs → karyera bog'lanishi
`Position.trainingRoadmap` maydoni allaqachon bor (JSON `{title, url}` massivi), lekin haqiqiy `Lesson`/`Course` ID'lariga bog'lanmagan — hozir shunchaki matn/havola. Buni haqiqiy `Course` ID'lariga bog'lash orqali: xodim ma'lum lavozimga o'tishni xohlasa, tizim aynan qaysi kurslarni bosqichma-bosqich o'tishi kerakligini avtomatik ko'rsata oladi (`CareerMapTree.tsx`, `SkillGapAnalysis.tsx` bilan tabiiy bog'lanadi — bu komponentlar allaqachon bor).

---

## 3. Platformadan to'liq foydalanish uchun umumiy tavsiyalar (faqat qulaylashtirish, minimal xavf)

Bularning barchasi mavjud kodni buzmasdan, faqat **rivojlantirish/qulaylik** uchun:

1. **Bitta "O'qitish markazi" sahifasi** — hozir Lessons, Training, Career alohida-alohida bo'limlarda (`TODO.md` 6.2'da sidebar allaqachon "O'qitish" nomida birlashtirilgan, lekin sahifalarning o'zi hali alohida). Xodim uchun bitta joyda: "Sizga tayinlangan kurslar", "Davom etayotgan", "Yakunlangan" — uch ustunli oddiy ko'rinish yetarli.
2. **Shablon (template) darslar** — tez-tez takrorlanadigan onboarding darslarini (masalan "Xavfsizlik qoidalari", "Kompaniya siyosati") bir marta yaratib, "nusxa olish" tugmasi bilan yangi lavozim/bo'lim uchun tez moslashtirish.
3. **Ommaviy biriktirish (bulk assign)** — hozir dars bitta xodimga biriktiriladigandek ko'rinadi; butun bo'lim yoki lavozimdagilarga bir bosishda biriktirish katta vaqt tejaydi.
4. **Video progress** — YouTube linkini shunchaki ko'rsatish o'rniga, "ko'rildi" belgisini avtomatik player hodisasi orqali belgilash (hozirda buni xodim o'zi "belgilaydi" yoki umuman yo'q).
5. **Til bo'yicha to'liqlik tekshiruvi** — RU/UZ ikkalasi ham majburiy maydon qilib qo'yilgan, lekin real hayotda ko'pincha bittasi to'ldirilib, ikkinchisi bo'sh qoladi. Forma darajasida ogohlantirish ("UZ matni kiritilmadi") foydali bo'ladi.

---

## 4. AI agent orqali darslarni avtomatik yaratish — **ha, texnik jihatdan to'liq mumkin**

Savolingizga qisqa javob: **ha**, dars haqidagi barcha ma'lumotlar va rejani (mavzu, maqsad, kimlar uchun, qancha davom etishi kerak) AI agentga bersangiz, u:
- Sarlavha va tavsifni ikkala tilda (RU/UZ) yozib beradi,
- Darsni mantiqiy qismlarga (modullarga) bo'lib beradi,
- Har bir qism uchun topshiriq va nazorat savollarini (quiz) tuza oladi,
- Va agar API orqali ishga tushirilsa — **to'g'ridan-to'g'ri bazaga (`Lesson`/`Test` yozuvi sifatida) joylay oladi**, HR faqat ko'rib tasdiqlaydi.

Buning texnik asosi loyihada **allaqachon bor va ishlab turibdi** — `/api/ai/generate-vacancy` xuddi shu naqshda ishlaydi (HR qisqa ma'lumot kiritadi → DeepSeek to'liq matn qaytaradi → forma avtomatik to'ladi → HR tahrirlab saqlaydi). Darslar uchun ham aynan shu naqshni takrorlash kifoya:

### Taklif qilinadigan oqim
1. HR/menejer forma orqali kiritadi: mavzu, maqsadli auditoriya (lavozim/bo'lim), asosiy nuqtalar yoki mavjud material (matn/fayl), kerakli davomiylik.
2. Yangi endpoint, masalan `/api/ai/generate-lesson`, xuddi `generate-vacancy` kabi DeepSeek'ga so'rov yuboradi va quyidagilarni structured JSON holida qaytaradi: `titleRu/titleUz`, `descRu/descUz`, taklif qilingan modul/bo'lim tuzilmasi, `assignmentRu/assignmentUz`, va (ixtiyoriy) 5-10 ta test savoli variantlari bilan.
3. Natija to'g'ridan-to'g'ri "Dars yaratish" formasini to'ldiradi (hozirgi `create/page.tsx` formasi) — HR ko'rib chiqib, kerak bo'lsa tahrirlab, "Saqlash"ni bosadi. **AI hech qachon HR tasdig'isiz to'g'ridan-to'g'ri e'lon qilmaydi** — bu xuddi vakansiya oqimidagi kabi xavfsiz naqsh.
4. Kelajakda: agar HR fayl (masalan mavjud PDF/PPT ta'lim materiali) yuklasa, AI o'sha fayl matnidan darsni avtomatik tuzib bera oladi — buning uchun fayldan matn ajratib olish (parsing) qatlami qo'shish kerak bo'ladi, bu alohida, keyingi qadam.

### Nima uchun bu ishonchli va xavfli emas
- Mavjud AI integratsiya naqshlari (vakansiya, savollar, nomzod tahlili) barchasi "AI taklif qiladi → odam tasdiqlaydi" tamoyiliga qurilgan — dars generatsiyasi ham xuddi shu tamoyilga amal qiladi, yangi xavf turi qo'shilmaydi.
- `companyId` izolyatsiyasi allaqachon o'rnatilgan (10-bosqich, `TODO.md`) — AI orqali yaratilgan darslar ham avtomatik ravishda faqat o'sha kompaniyaga tegishli bo'ladi.

---

## 5. Tavsiya etilgan ustuvorlik tartibi

| # | Ish | Nega birinchi/oxirgi | Murakkablik |
|---|-----|----------------------|-------------|
| 1 | AI orqali dars generatsiyasi (`/api/ai/generate-lesson` + forma integratsiyasi) | Mavjud naqsh bo'yicha tez qo'shiladi, HR'ning eng katta og'rig'ini (dars yozish vaqti) darhol yechadi | Kichik-o'rta |
| 2 | Darsga mini-test (`Lesson.testId`) biriktirish | Mavjud `Test` modelidan foydalanadi, yangi infratuzilma kerak emas | Kichik |
| 3 | `Lesson` va `TrainingTrack/Module` tizimlarini birlashtirish (kurs strukturasi) | Boshqa hamma narsa (progress, karyera bog'lanishi) shunga tayanadi — lekin migratsiya talab qiladi, ehtiyotkorlik kerak | O'rta-katta |
| 4 | Xodim uchun yagona "O'qitish markazi" ko'rinishi + progress-bar | 3-band tugagach ma'noga ega bo'ladi | O'rta |
| 5 | Position.trainingRoadmap → haqiqiy Course ID bog'lanishi (karyera bilan integratsiya) | 3-band ustiga quriladi | O'rta |
| 6 | Fayldan (PDF/PPT) avtomatik dars generatsiyasi | Eng qiziqarli, lekin eng murakkab (parsing infratuzilmasi kerak) — oxiriga qoldiriladi | Katta |

---

## Keyingi qadam

Ushbu ro'yxatdan qaysi band(lar) bilan boshlashni tanlang — men shu asosda batafsil implementatsiya rejasini (fayllar, API, UI o'zgarishlari) tuzib, keyin amalga oshirishga o'tamiz. Eng tez natija va eng kam xavf uchun **1-band (AI dars generatsiyasi)**dan boshlashni tavsiya qilaman.
