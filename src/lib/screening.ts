/**
 * Automated screening scoring engine (rule-based).
 * 
 * Score breakdown (100 points total):
 *   - Experience:           0–25 pts  (based on months of experience)
 *   - Shift readiness:      0–20 pts  (full or 0)
 *   - Manufacturing exp:    0–25 pts  (based on relevant keywords)
 *   - Region match:         0–15 pts  (if location tag matches)
 *   - Computer skill:       0–15 pts  (basic/advanced)
 */

export interface ScreeningInput {
  experienceMonths: number;       // months of relevant experience
  shiftReady: boolean;            // can work in shifts
  hasManufacturingExp: boolean;   // previous production/manufacturing background
  locCity?: string;               // candidate's city
  vacancyCity?: string;           // vacancy's target city
  computerSkill?: string;         // 'none' | 'basic' | 'advanced'
  hasRequiredDocs: boolean;       // has all necessary documents
  ageYears?: number;              // optional age
  ageMin?: number;                // min required age
  ageMax?: number;                // max allowed age
}

export interface ScreeningResult {
  totalScore: number;
  breakdown: Record<string, number>;
  status: 'rejected' | 'reserve_pool' | 'screening_passed' | 'mini_interview';
  flags: string[];
}

export function runScreening(input: ScreeningInput): ScreeningResult {
  const breakdown: Record<string, number> = {};
  const flags: string[] = [];

  // --- Hard filters (disqualifiers) ---
  if (!input.hasRequiredDocs) {
    flags.push('Missing required documents');
    return { totalScore: 0, breakdown, status: 'rejected', flags };
  }

  if (input.ageMin != null && input.ageYears != null && input.ageYears < input.ageMin) {
    flags.push(`Age ${input.ageYears} below minimum ${input.ageMin}`);
    return { totalScore: 0, breakdown, status: 'rejected', flags };
  }

  if (input.ageMax != null && input.ageYears != null && input.ageYears > input.ageMax) {
    flags.push(`Age ${input.ageYears} exceeds maximum ${input.ageMax}`);
    return { totalScore: 0, breakdown, status: 'rejected', flags };
  }

  // --- Scored criteria ---

  // Experience (0–25)
  let expScore = 0;
  if (input.experienceMonths >= 36) expScore = 25;
  else if (input.experienceMonths >= 24) expScore = 20;
  else if (input.experienceMonths >= 12) expScore = 15;
  else if (input.experienceMonths >= 6) expScore = 10;
  else if (input.experienceMonths >= 1) expScore = 5;
  breakdown.experience = expScore;

  // Shift readiness (0–20)
  const shiftScore = input.shiftReady ? 20 : 0;
  if (!input.shiftReady) flags.push('Not shift-ready (partial suitability)');
  breakdown.shiftReadiness = shiftScore;

  // Manufacturing experience (0–25)
  const mfgScore = input.hasManufacturingExp ? 25 : 0;
  breakdown.manufacturingExperience = mfgScore;

  // Location match (0–15)
  let locationScore = 0;
  if (!input.vacancyCity) {
    locationScore = 10; // flexible requirement
  } else if (input.locCity?.toLowerCase() === input.vacancyCity.toLowerCase()) {
    locationScore = 15;
  } else {
    locationScore = 5;
    flags.push('Location mismatch – may need relocation');
  }
  breakdown.locationMatch = locationScore;

  // Computer skill (0–15)
  let compScore = 0;
  if (input.computerSkill === 'advanced') compScore = 15;
  else if (input.computerSkill === 'basic') compScore = 10;
  else compScore = 0;
  breakdown.computerSkill = compScore;

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  // --- Determine status ---
  let status: ScreeningResult['status'];
  if (totalScore >= 75) {
    status = 'mini_interview';
  } else if (totalScore >= 50) {
    status = 'screening_passed';
  } else if (totalScore >= 30) {
    status = 'reserve_pool';
  } else {
    status = 'rejected';
  }

  return { totalScore, breakdown, status, flags };
}
