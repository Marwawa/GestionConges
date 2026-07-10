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
  nomAr?: string;
  prenomAr?: string;
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
  (doc as any).setR2L(true);
  const ar = (text: string) => (doc as any).processArabic(text);
  const editionDate = new Date().toLocaleDateString('ar-MA');
  const dateDebut = new Date(conge.dateDebut).toLocaleDateString('ar-MA');
  const dateFin = new Date(conge.dateFin).toLocaleDateString('ar-MA');
  const dateDemande = new Date(conge.dateDemande).toLocaleDateString('ar-MA');
  const nomComplet = `${user.prenomAr || user.prenom} ${user.nomAr || user.nom}`;
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
  doc.text(ar('منصة تدبير الرخص'), 105, 24, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(ar('شهادة إدارية خاصة بالرخصة'), 105, 33, { align: 'center' });

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(ar('شهادة الرخصة'), 105, 62, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(ar(`المرجع: ${reference}`), 190, 78, { align: 'right' });
  doc.text(ar(`تاريخ الإصدار: ${editionDate}`), 85, 78, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.line(20, 86, 190, 86);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(ar('معلومات الموظف'), 190, 100, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(ar(`الاسم الكامل: ${nomComplet}`), 186, 112, { align: 'right' });
  doc.text(ar(`البريد الإلكتروني: ${user.email}`), 186, 121, { align: 'right' });
  doc.text(ar(`الصفة: ${traduireRolePdf(user.role)}`), 186, 130, { align: 'right' });
  doc.text(ar(`المصلحة: ${user.service || '-'}`), 186, 139, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(ar('معلومات الرخصة'), 190, 158, { align: 'right' });

  autoTable(doc, {
    startY: 166,
    theme: 'grid',
    head: [[ar('القيمة'), ar('البيان')]],
    body: [
      [ar(traduireTypeCongePdf(conge.typeConge)), ar('نوع الرخصة')],
      [ar(dateDebut), ar('تاريخ البداية')],
      [ar(dateFin), ar('تاريخ النهاية')],
      [ar(`${conge.nombreJours} يوم عمل`), ar('عدد أيام العمل')],
      [ar(traduireStatutPdf(conge.statut)), ar('الحالة')],
      [ar(conge.motif || '-'), ar('السبب')],
      [ar(dateDemande), ar('تاريخ الطلب')],
    ],
    styles: { fontSize: 10, cellPadding: 3, halign: 'right' },
    headStyles: { fillColor: [15, 118, 110], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 110 },
      1: { fontStyle: 'bold', cellWidth: 60 },
    },
  });

  const y = (doc as any).lastAutoTable.finalY + 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    ar('تشهد هذه الوثيقة أن الرخصة المبينة أعلاه تمت المصادقة عليها من طرف الإدارة، وأن عدد الأيام المحتسبة لا يشمل أيام نهاية الأسبوع ولا أيام العطل الرسمية.'),
    190,
    y,
    { align: 'right', maxWidth: 170 }
  );

  doc.setDrawColor(15, 118, 110);
  doc.roundedRect(26, y + 24, 56, 34, 2, 2, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(ar('توقيع الإدارة'), 54, y + 35, { align: 'center' });
  doc.setFontSize(8);
  doc.text(ar('الخاتم الرسمي'), 54, y + 48, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(ar('تم إنشاء هذه الوثيقة تلقائيا بواسطة منصة تدبير الرخص.'), 105, 276, { align: 'center' });

  doc.save(`attestation_conge_${user.nom}_${user.prenom}_${reference}.pdf`);
};

const traduireTypeCongePdf = (type: string): string => {
  switch (type) {
    case 'Annuel': return 'رخصة سنوية';
    case 'Maladie': return 'رخصة مرضية';
    case 'Exceptionnel': return 'رخصة استثنائية';
    case 'SansSolde': return 'رخصة بدون أجر';
    default: return type;
  }
};

const traduireStatutPdf = (statut: string): string => {
  switch (statut) {
    case 'En attente': return 'في الانتظار';
    case 'ApprouvÃ©':
    case 'Approuvé': return 'موافق عليها';
    case 'RejetÃ©':
    case 'Rejeté': return 'مرفوضة';
    case 'AnnulÃ©':
    case 'Annulé': return 'ملغاة';
    case 'Changement demandÃ©':
    case 'Changement demandé': return 'طلب تغيير';
    default: return statut;
  }
};

const traduireRolePdf = (role: string): string => {
  switch (role) {
    case 'Admin': return 'مدير';
    case 'PrÃ©sidenteGreffe':
    case 'PrésidenteGreffe': return 'رئيسة كتابة الضبط';
    case 'Fonctionnaire': return 'موظف';
    default: return role;
  }
};
