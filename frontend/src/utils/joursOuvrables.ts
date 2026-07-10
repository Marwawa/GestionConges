const joursReligieuxParAnnee: Record<number, string[]> = {
  2026: ['2026-03-20', '2026-03-21', '2026-05-27', '2026-05-28', '2026-08-25', '2026-08-26'],
  2027: ['2027-03-09', '2027-03-10', '2027-05-17', '2027-05-18', '2027-08-14', '2027-08-15'],
  2028: ['2028-02-26', '2028-02-27', '2028-05-05', '2028-05-06', '2028-08-02', '2028-08-03'],
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getJoursFeriesMaroc = (annee: number): Set<string> => new Set([
  `${annee}-01-01`,
  `${annee}-01-11`,
  `${annee}-01-14`,
  `${annee}-05-01`,
  `${annee}-07-30`,
  `${annee}-08-14`,
  `${annee}-08-20`,
  `${annee}-08-21`,
  `${annee}-11-06`,
  `${annee}-11-18`,
  ...(joursReligieuxParAnnee[annee] || []),
]);

export const estJourOuvrableMaroc = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6 && !getJoursFeriesMaroc(date.getFullYear()).has(toDateKey(date));
};

export const prochainJourOuvrableMaroc = (date: Date): Date => {
  const next = new Date(date);
  do {
    next.setDate(next.getDate() + 1);
  } while (!estJourOuvrableMaroc(next));
  return next;
};
