/**
 * Duplicate Detection Helper for CivicEye AI
 * Checks category match and mock geospatial proximity (within ~200 meters)
 */

export const checkForDuplicates = (newIssueCategory, newLocation, existingComplaints = []) => {
  if (!existingComplaints || existingComplaints.length === 0) {
    return { hasDuplicates: false, count: 0, matches: [] };
  }

  // Filter matching category or high spatial proximity keywords
  const locationNormalized = (newLocation || '').toLowerCase();
  const categoryNormalized = (newIssueCategory || '').toLowerCase();

  const matches = existingComplaints.filter(item => {
    const itemCat = item.category.toLowerCase();
    const itemLoc = item.location.toLowerCase();
    
    // Category match
    const isCatMatch = itemCat === categoryNormalized || categoryNormalized === 'auto detect';

    // Location keyword similarity (e.g., both mention "Main Road", "Market", "Bus Stop")
    const commonKeywords = ['main road', 'market', 'bus stop', 'station', 'college', 'park', 'sector', 'highway'];
    const hasLocationMatch = commonKeywords.some(kw => locationNormalized.includes(kw) && itemLoc.includes(kw));

    return isCatMatch && (hasLocationMatch || itemLoc.slice(0, 8) === locationNormalized.slice(0, 8));
  });

  return {
    hasDuplicates: matches.length > 0,
    count: matches.length,
    matches: matches.slice(0, 4),
    message: matches.length > 0
      ? `This report appears similar to ${matches.length} existing report${matches.length > 1 ? 's' : ''} within 200 meters.`
      : 'No duplicate complaints detected nearby.'
  };
};
