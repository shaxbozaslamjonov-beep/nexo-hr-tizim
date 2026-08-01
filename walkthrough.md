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

## 4. Hali TO'LIQ tugallanmagan qism (halol hisobot)

Vazifa hajmi katta bo'lgani sababli, quyidagi fayllarda hali qattiq kodlangan hex ranglar bor (`grep -rlo "#[0-9a-fA-F]{6,8}" src` bilan tekshirilgan, 2026-08-01 holatiga ko'ra):

**`.tsx` fayllar (36 ta):** `LandingPage.tsx` (qolgan qismlar), `apply/page.tsx`, `ChangePasswordForm.tsx`, `employee/career`, `employee/kpi`, `employee/profile`, `employee/training`, `ai-assistant/AiAssistantContent.tsx`, `applications/page.tsx`, `CandidatesContent.tsx`, `candidates/[id]/page.tsx`, `career-maps/page.tsx`, `employees/[id]/page.tsx`, `InterviewsContent.tsx`, `interviews/[id]/page.tsx`, `lessons/[id]/page.tsx`, `lessons/page.tsx`, `hr/profile/page.tsx`, `ReserveContent.tsx`, `ReservePoolContent.tsx`, `SettingsContent.tsx` (qolgan `#92400e`/`#f87171` — **ataylab**, kontrast sababli, bandga qarang), `tests/[id]/edit/page.tsx`, `TrainingContent.tsx`, `vacancies/create/page.tsx`, `vacancies/page.tsx`, `not-found.tsx`, `unauthorized/page.tsx`, `MultiStepApplicationForm.tsx`, `CareerHealthFormModal.tsx`, `PositionCard.tsx`, `PositionFormModal.tsx`, `StatsCard.tsx` (career), `TabsNavigation.tsx`, `LessonCard.tsx`, `ToastContext.tsx`.

**`.module.css` fayllar (16 ta):** `apply.module.css`, `analytics.module.css` (qolgan boshqa qatorlar), `candidate-detail.module.css` (qolgan), `candidates.module.css`, `interviews.module.css` (qolgan), `lessons_premium.module.css`, `reserve.module.css` (qolgan), `tests.module.css` (qolgan), `path-detail.module.css` (qolgan), `create-path.module.css` (qolgan), `training.module.css` (qolgan), `vacancies.module.css`, `landing.module.css` (**alohida holat** — 3-bandga qarang), `login.module.css`, `sidebar.module.css` (qolgan), `lessons.module.css` (qolgan).

**Alohida izoh — `landing.module.css`:** bu fayl boshqalardan farqli, **o'zining ishlaydigan dark-mode tizimiga ega** — har bir kunduzgi qiymat (`#FFFFFF`) uchun pastda alohida `:global([data-theme="dark"]) .card { background: #1e293b; ... }` qoidasi yozilgan. Ya'ni **funktsional jihatdan ikkala rejim ham to'g'ri ishlaydi**, faqat CSS-o'zgaruvchi tokenidan foydalanmaydi (dublikat qiymatlar). Bu qoidabuzarlik emas, balki eski/parallel arxitektura — token tizimiga o'tkazish kattaroq, alohida refaktoring ishi (98 ta selektor, 16 ta dark-override blok).

**Alohida jarayon:** shu bilan bir vaqtda foydalanuvchi tomonidan alohida fon jarayoni (`task_a4332158`) ishga tushirilgan — u ~30 ta faylda qolgan eski indigo `rgba(99,102,241,...)`/`rgba(79,70,229,...)` ranglarni tozalamoqda. Bu ish ushbu sessiyadan **mustaqil** boradi, natijasi alohida keladi.

## 5. Tavsiya etilgan keyingi qadam

Qolgan ~50 fayl bir xil naqsh bilan (grep → token moslashtirish → tsc → brauzer tekshiruvi) davom ettirilishi mumkin. Eng yuqori ustuvorlik: `SettingsContent.tsx`, `CandidatesContent.tsx`, `InterviewsContent.tsx`, `vacancies/page.tsx` — bular eng ko'p ishlatiladigan ro'yxat sahifalari.
