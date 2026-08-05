# Dual Theme (Light/Dark) — Walkthrough

> Ushbu sessiyada bajarilgan ish yozuvi. `NEXO_HR_LIGHT_DARK_MODE_GUIDE.md` — qanday bo'lishi kerakligi haqidagi **qoidalar**; bu fayl — **nima qilingani va nima qolgani**ning haqiqiy holati.

## 1. Qamrov va yondashuv

Vazifa: barcha UI komponentlarini (tugma, panel, modal, forma, badge, grafik) kunduzgi/kechki rejimga 100% moslashtirish, qattiq kodlangan hex ranglarni CSS o'zgaruvchilarga o'tkazish.

Har bir tuzatish quyidagi tsiklda amalga oshirildi: `grep` orqali qattiq kodlangan rang topish → mavjud CSS token bilan mos qiymatni tanlash (`globals.css`dagi shkaladan) → almashtirish → `npx tsc --noEmit` → brauzerda kunduzgi **va** kechki rejimda vizual tasdiqlash.

## 2. Tugallangan va tasdiqlangan qismlar

### 2.1 Umumiy token tizimidagi xato (`globals.css`)
- Kechki rejimdagi `--card-hover-shadow` eski indigo rangda (`rgba(79,70,229,...)`) qolib ketgan edi → brend ko'kiga (`rgba(46,86,230,...)`) tuzatildi.

### 2.2 Header (`header.module.css`)
- Qidiruv-fokus halqasi va avatar soyasi eski indigo rangda edi → brend ko'kiga tuzatildi.

### 2.3 Umumiy `Dialog` komponenti (`src/components/ui/dialog.tsx`) — **eng muhim tuzatish**
Bu — loyihadagi yagona qayta ishlatiladigan modal/oyna komponenti (Radix-based). Rejimga **umuman** moslashtirilmagan edi:
- Overlay: `rgba(0,0,0,0.6)` → `rgba(15, 23, 42, 0.6)` + `backdrop-filter: blur(8px)` (talab qilingan spetsifikatsiya bo'yicha)
- Kontent fon: qattiq `white` → `var(--surface)` + `var(--border)` chegara qo'shildi
- Sarlavha matni: qattiq `#000000` → `var(--text-primary)`
- Tavsif matni: qattiq `#64748b` → `var(--text-secondary)`
- Yopish (X) ikonkasi: qattiq `#94a3b8` → `var(--text-secondary)`
- **Brauzerda tasdiqlandi**: Analitika sahifasidagi "Redaktirovat'" modali orqali — avval oq modal + qattiq qora overlay edi, endi ikkala rejimda ham to'g'ri (kechki: `#1e293b` fon + shaffof-qora blur overlay; kunduzgi: oq fon + xuddi shu overlay).

### 2.4 Umumiy `Input` primitive (`input.module.css`)
- Placeholder rangi qattiq `#94a3b8` → `var(--text-light)`.

### 2.5 Statistik kartochkalar (`src/components/analytics/StatsCards.tsx`)
- 4 ta gradient ikonka: ko'k, emerald, amber — endi brend shkаласидан; 4-band (avval binafsha `#a855f7`) endi **feruza** (`var(--turquoise-500/600)`) — brend palitrasidan tashqariga chiqmasdan, hali ham ajratilib turadi.
- Barcha fon/matn/chegara/badge ranglari token orqali.
- **Brauzerda tasdiqlandi**: Analitika sahifasida uchta kartochka (ko'k/emerald/amber) to'g'ri render bo'lishi ko'rildi.

### 2.6 Recharts grafik komponentlari
| Fayl | Nima qilindi |
|---|---|
| `AnalyticsInsights.tsx` | 3 ta xulosa-kartochka (o'sish/foydalanuvchi/ogohlantirish) to'liq token'ga o'tkazildi |
| `CandidateSkillsChart.tsx` | 3 toifali `SKILL_COLORS` (yo'q/asosiy/ilg'or) brend ko'k shkalasiga, Tooltip fon+matn dark-aware qilindi, ikonka gradienti (avval binafsha) brend gradientiga |
| `EmployeeDynamicsChart.tsx` | Ikki qatorli (Qabul/Ketgan) area chart — Qabul=ko'k, Ketgan=qizil (semantik jihatdan to'g'ri: o'sish/yo'qotish), Tooltip+Legend matn rangi qo'shildi |
| `HRDashboardContent.tsx` (2 ta grafik) | Tooltip'larda mavjud bo'lmagan `var(--shadow-lg)` (aslida hech qayerda e'lon qilinmagan, soya umuman ko'rinmas edi) — haqiqiy soya + `backgroundColor`/`color` token bilan almashtirildi |
| `TestsContent.tsx` | Bar chart + statistik raqamlar to'liq token'ga o'tkazildi |
| `vacancies/[id]/page.tsx` | 5 toifali funnel-diagramma (avval binafsha bilan) ko'k shkala progressiyasiga o'tkazildi, Tooltip/eksa matnlari qo'shildi |
| `RecruitmentFunnelChart.tsx`, `VacancyStatusChart.tsx` | Tekshirildi — **allaqachon to'liq token asosida** edi, faqat bitta zaxira (`fallback`) rang tuzatildi |

**Muhim qaror (kategorik ranglar bo'yicha):** ba'zi grafiklarda (funnel, statistik ikonkalar) bir nechta **bir-biridan ajralib turadigan** rang kerak edi — bunday holatlarda yangi (brenddan tashqari) rang qo'shish o'rniga, mavjud shkаланинг turli pog'onalari (masalan `--blue-500/600/700/800`) yoki ikkinchi brend rangi (feruza) ishlatildi. Bu `NEXO_HR_LIGHT_DARK_MODE_GUIDE.md`ga alohida yozib qo'yilishi kerak bo'lgan qoida (hozircha asosiy hujjatda yo'q — quyidagi 4-bandga qarang).

### 2.7 CSS-modul fayllaridagi "muted panel" fonlari
Quyidagi 9 ta faylda `background: #f8fafc` (hech qanday dark-mode moslashuvisiz) `var(--gray-50)`ga o'tkazildi: `analytics.module.css`, `candidate-detail.module.css`, `interviews.module.css`, `reserve.module.css`, `tests.module.css`, `create-path.module.css`, `training.module.css` (shu jumladan skeleton-loading gradienti), `path-detail.module.css`, `lessons.module.css` (components).

### 2.8 Boshqa
- `AnalyticsContent.tsx`dagi qoldiq `background: 'white'` → `var(--surface)`.
- `LandingPage.tsx`dagi "Kompaniya Yangiliklari" kartochkasi (fon/matn/chegara) to'liq token'ga o'tkazildi.
- `AnalyticsToolbar.tsx`dagi `color: '#ffffff'` — **tekshirildi va to'g'ri deb topildi** (bu doim navy gradient hero fonida turadigan glass-tugma matni, dizayn qo'llanma §7.2 ga muvofiq ataylab oq).
- `src/components/layout/sidebar.module.css`dagi avatar `color: #FFFFFF` — **tekshirildi va to'g'ri deb topildi** (doim `var(--grad-primary)` fonida, Header avatari kabi rejimdan mustaqil).

## 3. Tekshiruv natijalari

- `npx tsc --noEmit` — har bir tuzatish bosqichidan keyin ishga tushirildi, **doim 0 xato**.
- Brauzerda tasdiqlangan sahifalar (ikkala rejimda ham): Login, Dashboard, KPI, Settings, Lessons/review, Interviews/create, Onboarding, Trial-period, Analytics (shu jumladan Dialog modal), Candidates ro'yxati, Candidate detail sahifasi.

## 4. Yangilanish (2026-08-05) — `.tsx` qatlami deyarli to'liq tugallandi

Davomiy sessiyalarda barcha `.tsx` fayllar bo'ylab yana bir necha o'nlab fayl tuzatildi: `employees/[id]/page.tsx` (shu jumladan butun sahifa "doim qorong'i fon" deb noto'g'ri qattiq kodlangan edi — kunduzgi rejimda oq matn oq fonda ko'rinmas edi, to'liq qayta yozildi), `candidates/[id]/page.tsx`, `career-maps/page.tsx`, `CandidatesContent.tsx`, `InterviewsContent.tsx`, `applications/page.tsx`, `vacancies/page.tsx`, `vacancies/create/page.tsx`, `PositionCard.tsx`, `StatsCard.tsx` (career), `tests/[id]/edit/page.tsx`, `hr/profile/page.tsx`, `TabsNavigation.tsx`, `PositionFormModal.tsx`, `CareerHealthFormModal.tsx`, `ToastContext.tsx`, `not-found.tsx` (qisman — pastga qarang), `LessonCard.tsx`, `MultiStepApplicationForm.tsx`, `TrainingContent.tsx`, `ReserveContent.tsx`, `ReservePoolContent.tsx`, `interviews/[id]/page.tsx`, `employee/profile`, `employee/kpi`, `employee/training`, `employee/career`, `apply/page.tsx`, `unauthorized/page.tsx`, `lessons/page.tsx`, `lessons/[id]/page.tsx`, `ai-assistant/AiAssistantContent.tsx`, `ChangePasswordForm.tsx`, `LandingPage.tsx`, `sidebar.module.css`, `lessons_premium.module.css`.

**Yo'l-yo'lakay topilgan, mendan oldingi (aloqasiz) xato:** `employees/[id]/page.tsx` har qanday xodim uchun crash bo'lardi (`employee.user.firstName` — noto'g'ri maydon yo'li). Kod o'zgartirmasdan alohida vazifa (`task_14a17ef3`) sifatida belgilandi — foydalanuvchi uni alohida sessiyada ishga tushirdi va tuzatildi, brauzerda tasdiqlandi.

**`.tsx` qatlamida qolgan hex — barchasi asosli, ataylab:**
- `SettingsContent.tsx`: `#f87171`, `#92400e` — kontrast sababli (izohlangan)
- `not-found.tsx`, `AnalyticsToolbar.tsx`: doim-qorong'i/doim-glass kontekst (landing hero bilan bir xil istisno turkumi)
- `CareerHealthFormModal.tsx`, `PositionFormModal.tsx`, `TabsNavigation.tsx`: `var(--token, #fallback)` sintaksisi — zararsiz, token asosiy manba

**Endi asosiy qolgan ish — CSS-modul fayllari (`.module.css`, ~16 ta, ~150 ta rang):** `apply.module.css` (43), `landing.module.css` (29, **alohida holat**, pastga qarang), `lessons.module.css` (13), `vacancies.module.css` (11), `interviews.module.css` (8), `analytics.module.css` (8), `create-path.module.css` (7), `path-detail.module.css` (6), `candidate-detail.module.css` (6), `reserve.module.css` (5), `training.module.css` (4), `tests.module.css` (4), `login.module.css` (1, doim-qorong'i sahifa, o'zgartirish shart emas), `candidates.module.css` (1, ataylab-doim-qorong'i floating bulk-action bar, o'zgartirilmadi).

**Alohida izoh — `landing.module.css`:** bu fayl boshqalardan farqli, **o'zining ishlaydigan dark-mode tizimiga ega** — har bir kunduzgi qiymat (`#FFFFFF`) uchun pastda alohida `:global([data-theme="dark"]) .card { background: #1e293b; ... }` qoidasi yozilgan. Ya'ni **funktsional jihatdan ikkala rejim ham to'g'ri ishlaydi**, faqat CSS-o'zgaruvchi tokenidan foydalanmaydi (dublikat qiymatlar). Bu qoidabuzarlik emas, balki eski/parallel arxitektura — token tizimiga o'tkazish kattaroq, alohida refaktoring ishi (98 ta selektor, 16 ta dark-override blok).

**Alohida jarayon:** shu bilan bir vaqtda foydalanuvchi tomonidan alohida fon jarayoni (`task_a4332158`) ishga tushirilgan — u ~30 ta faylda qolgan eski indigo `rgba(99,102,241,...)`/`rgba(79,70,229,...)` ranglarni tozalamoqda. Bu ish ushbu sessiyadan **mustaqil** boradi, natijasi alohida keladi.

## 5. Tavsiya etilgan keyingi qadam

Qolgan ~50 fayl bir xil naqsh bilan (grep → token moslashtirish → tsc → brauzer tekshiruvi) davom ettirilishi mumkin. Eng yuqori ustuvorlik: `SettingsContent.tsx`, `CandidatesContent.tsx`, `InterviewsContent.tsx`, `vacancies/page.tsx` — bular eng ko'p ishlatiladigan ro'yxat sahifalari.
