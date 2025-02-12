function calculateWP(criteria, alternatives) {
  const weighted = alternatives.map(alt => ({
    ...alt,
    score: criteria.reduce((product, crit) => product * Math.pow(alt[crit.name], crit.weight), 1),
  }));
  return weighted.sort((a, b) => b.score - a.score);
}

module.exports = { calculateWP };
