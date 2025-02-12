function calculateTOPSIS(criteria, alternatives) {
  const ideal = criteria.map(crit => Math.max(...alternatives.map(a => a[crit.name])));
  const worst = criteria.map(crit => Math.min(...alternatives.map(a => a[crit.name])));

  return alternatives.map(alt => ({
    ...alt,
    score: Math.sqrt(criteria.reduce((sum, crit, i) => sum + Math.pow(alt[crit.name] - worst[i], 2), 0)) /
           Math.sqrt(criteria.reduce((sum, crit, i) => sum + Math.pow(alt[crit.name] - ideal[i], 2), 0)),
  })).sort((a, b) => b.score - a.score);
}

module.exports = { calculateTOPSIS };
