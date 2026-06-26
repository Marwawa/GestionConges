import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Conge {
  id?: number;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
  motif?: string;
  statut: string;
  dateDemande: string;
  dateTraitement?: string;
  commentaire?: string;
}

interface User {
  nom: string;
  prenom: string;
  email: string;
  role: string;
  service: string;
}

export const generateCongesPDF = (conges: Conge[], user: User) => {
  const doc = new jsPDF();

  doc.setFillColor(25, 118, 210);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PLATEFORME DE GESTION DES CONGÉS', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Récapitulatif des demandes de congé', 105, 25, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("Informations de l'employé", 14, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Nom complet : ${user.prenom} ${user.nom}`, 14, 56);
  doc.text(`Email : ${user.email}`, 14, 63);
  doc.text(`Rôle : ${user.role}`, 14, 70);
  doc.text(`Service : ${user.service}`, 14, 77);
  doc.text(`Date d'édition : ${new Date().toLocaleDateString('fr-FR')}`, 14, 84);

  const total = conges.length;
  const approuves = conges.filter(c => c.statut === 'Approuvé').length;
  const enAttente = conges.filter(c => c.statut === 'En attente').length;
  const rejetes = conges.filter(c => c.statut === 'Rejeté').length;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Statistiques', 14, 96);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total : ${total}  |  Approuvés : ${approuves}  |  En attente : ${enAttente}  |  Rejetés : ${rejetes}`, 14, 104);

  autoTable(doc, {
    startY: 112,
    head: [['Type', 'Date début', 'Date fin', 'Durée', 'Motif', 'Statut', 'Demandé le']],
    body: conges.map(c => [
      c.typeConge,
      new Date(c.dateDebut).toLocaleDateString('fr-FR'),
      new Date(c.dateFin).toLocaleDateString('fr-FR'),
      `${c.nombreJours} jour(s)`,
      c.motif || '—',
      c.statut,
      new Date(c.dateDemande).toLocaleDateString('fr-FR'),
    ]),
    headStyles: {
      fillColor: [25, 118, 210],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [240, 247, 255],
    },
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} / ${pageCount} — Généré le ${new Date().toLocaleDateString('fr-FR')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`conges_${user.nom}_${user.prenom}_${new Date().getFullYear()}.pdf`);
};

export const generateAttestationCongePDF = (conge: Conge, user: User) => {
  const doc = new jsPDF();
  const editionDate = new Date().toLocaleDateString('fr-FR');
  const dateDebut = new Date(conge.dateDebut).toLocaleDateString('fr-FR');
  const dateFin = new Date(conge.dateFin).toLocaleDateString('fr-FR');
  const reference = `ATT-${new Date().getFullYear()}-${String(conge.id ?? Date.now()).padStart(5, '0')}`;

  doc.setDrawColor(15, 118, 110);
  doc.setLineWidth(1.2);
  doc.rect(12, 12, 186, 273);

  doc.setFillColor(15, 118, 110);
  doc.rect(12, 12, 186, 30, 'F');

  doc.setFillColor(255, 255, 255);
  doc.circle(28, 27, 9, 'F');
  doc.setTextColor(15, 118, 110);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('GC', 28, 31, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.text('PLATEFORME DE GESTION DES CONGES', 105, 24, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Attestation officielle de conge', 105, 33, { align: 'center' });

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ATTESTATION DE CONGE', 105, 62, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Reference : ${reference}`, 20, 78);
  doc.text(`Date d'edition : ${editionDate}`, 150, 78);

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 86, 190, 86);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text("Informations de l'employe", 20, 100);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Nom complet : ${user.prenom} ${user.nom}`, 24, 112);
  doc.text(`Email : ${user.email}`, 24, 121);
  doc.text(`Role : ${user.role}`, 24, 130);
  doc.text(`Service : ${user.service || '-'}`, 24, 139);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Informations du conge', 20, 158);

  autoTable(doc, {
    startY: 166,
    theme: 'grid',
    head: [['Champ', 'Valeur']],
    body: [
      ['Type de conge', conge.typeConge],
      ['Date de debut', dateDebut],
      ['Date de fin', dateFin],
      ['Nombre de jours ouvrables', `${conge.nombreJours} jour(s)`],
      ['Statut', conge.statut],
      ['Motif', conge.motif || '-'],
      ['Date de demande', new Date(conge.dateDemande).toLocaleDateString('fr-FR')],
    ],
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 110 },
    },
  });

  const y = (doc as any).lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    "La presente attestation certifie que le conge ci-dessus a ete valide par l'administration.",
    20,
    y,
    { maxWidth: 170 }
  );

  doc.setDrawColor(15, 118, 110);
  doc.roundedRect(128, y + 24, 56, 34, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Signature de l'admin", 156, y + 35, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Cachet officiel', 156, y + 48, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Document genere automatiquement par la plateforme de gestion des conges.', 105, 276, { align: 'center' });

  doc.save(`attestation_conge_${user.nom}_${user.prenom}_${reference}.pdf`);
};
