import * as XLSX from 'xlsx';

interface Conge {
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif: string;
  statut: string;
  dateDemande: string;
}

interface User {
  nom: string;
  prenom: string;
  email: string;
  role: string;
  service: string;
}

export const generateCongesExcel = (conges: Conge[], user: User) => {
  const wb = XLSX.utils.book_new();

  // Feuille 1 — Liste des congés
  const data = [
    ['PLATEFORME DE GESTION DES CONGÉS'],
    [`Employé : ${user.prenom} ${user.nom}`],
    [`Email : ${user.email}`],
    [`Rôle : ${user.role} — Service : ${user.service}`],
    [`Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`],
    [],
    ['Type', 'Date début', 'Date fin', 'Durée', 'Motif', 'Statut', 'Demandé le'],
    ...conges.map(c => [
      c.typeConge,
      new Date(c.dateDebut).toLocaleDateString('fr-FR'),
      new Date(c.dateFin).toLocaleDateString('fr-FR'),
      `${c.nombreJours} jour(s)`,
      c.motif || '—',
      c.statut,
      new Date(c.dateDemande).toLocaleDateString('fr-FR'),
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Largeur des colonnes
  ws['!cols'] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Mes Congés');

  // Feuille 2 — Statistiques
  const total = conges.length;
  const approuves = conges.filter(c => c.statut === 'Approuvé').length;
  const enAttente = conges.filter(c => c.statut === 'En attente').length;
  const rejetes = conges.filter(c => c.statut === 'Rejeté').length;
  const annules = conges.filter(c => c.statut === 'Annulé').length;

  const stats = [
    ['Statistiques des congés'],
    [],
    ['Statut', 'Nombre'],
    ['Total', total],
    ['Approuvés', approuves],
    ['En attente', enAttente],
    ['Rejetés', rejetes],
    ['Annulés', annules],
  ];

  const ws2 = XLSX.utils.aoa_to_sheet(stats);
  ws2['!cols'] = [{ wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Statistiques');

  // Téléchargement
  XLSX.writeFile(wb, `conges_${user.nom}_${user.prenom}_${new Date().getFullYear()}.xlsx`);
};