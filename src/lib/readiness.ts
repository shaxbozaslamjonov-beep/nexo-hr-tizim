export interface Skill {
  name: string;
  level: number; // 1-5
  type: 'technical' | 'behavioral' | 'leadership';
}

export interface ReadinessComponents {
  skills: number;
  kpi: number;
  assessments: number;
  behavioral: number;
  learning: number;
  manager: number;
}

/**
 * Calculates the readiness score for an employee towards a target position.
 * Final score = (skills * 0.4) + (kpi * 0.2) + (assessments * 0.15) + (behavioral * 0.1) + (learning * 0.1) + (manager * 0.05)
 */
export function calculateReadinessScore(components: ReadinessComponents): number {
  const score = 
    (components.skills * 0.4) +
    (components.kpi * 0.2) +
    (components.assessments * 0.15) +
    (components.behavioral * 0.1) +
    (components.learning * 0.1) +
    (components.manager * 0.05);
  
  return Math.min(Math.max(score * 100, 0), 100);
}

export function getReadinessCategory(score: number): 'ready_now' | 'ready_6m' | 'ready_1y' | 'not_ready' {
  if (score >= 85) return 'ready_now';
  if (score >= 70) return 'ready_6m';
  if (score >= 50) return 'ready_1y';
  return 'not_ready';
}

export function calculateSkillMatch(actualSkills: any[], requiredSkills: any[]): number {
  if (!requiredSkills || requiredSkills.length === 0) return 1.0;
  
  let totalMatch = 0;
  requiredSkills.forEach(req => {
    const actual = actualSkills.find(s => s.name === req.name);
    if (actual) {
      totalMatch += Math.min(actual.level / req.level, 1.0);
    }
  });
  
  return totalMatch / requiredSkills.length;
}
