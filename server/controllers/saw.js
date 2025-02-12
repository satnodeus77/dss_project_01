function calculateSAW(criteria, alternatives) {
  const normalized = alternatives.map(alt => {
    const scores = criteria.map(crit => alt[crit.name] / Math.max(...alternatives.map(a => a[crit.name])));
    return { ...alt, score: scores.reduce((sum, s, i) => sum + s * criteria[i].weight, 0) };
  });
  return normalized.sort((a, b) => b.score - a.score);
}

module.exports = { calculateSAW };
