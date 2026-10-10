/**
 * CivicEye AI Priority Calculation Engine
 * Formula:
 * - Severity Weight: max 40 points
 * - Number of Reports Weight: max 25 points
 * - Public Impact Weight: max 20 points
 * - Location Factor Weight: max 15 points
 * Total Score: 0 to 100
 */

export const calculatePriorityScore = ({ severity, duplicateCount = 0, publicImpact = 'Medium', isHighTraffic = false }) => {
  // 1. Severity Points (max 40)
  let severityPoints = 15;
  if (severity === 'High' || severity === 'CRITICAL') severityPoints = 35;
  else if (severity === 'Medium') severityPoints = 25;
  else if (severity === 'Low') severityPoints = 15;

  // 2. Duplicate Reports Points (max 25)
  // Each report adds 5 points up to 25 max
  const reportPoints = Math.min(25, (duplicateCount + 1) * 5);

  // 3. Public Impact Points (max 20)
  let impactPoints = 10;
  if (publicImpact === 'High') impactPoints = 18;
  else if (publicImpact === 'Medium') impactPoints = 12;
  else impactPoints = 6;

  // 4. Location Factor Points (max 15)
  // Main roads, near school/hospital/bus stop get higher scores
  const locationPoints = isHighTraffic ? 14 : 8;

  const total = Math.min(100, severityPoints + reportPoints + impactPoints + locationPoints);

  let level = 'Low';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  
  if (total >= 70) {
    level = 'High';
    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
  } else if (total >= 40) {
    level = 'Medium';
    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
  }

  return {
    total,
    level,
    badgeColor,
    breakdown: {
      severityPoints,
      reportPoints,
      impactPoints,
      locationPoints,
      maxSeverity: 40,
      maxReports: 25,
      maxImpact: 20,
      maxLocation: 15
    }
  };
};
