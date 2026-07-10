import {
  Document, Packer, Paragraph, TextRun, AlignmentType, ImageRun,
  Table, TableRow, TableCell, BorderStyle, WidthType, TableLayoutType,
  VerticalAlign, TableBorders,
} from 'docx';
import { saveAs } from 'file-saver';
import { prochainJourOuvrableMaroc } from './joursOuvrables';

interface CongeData {
  nom: string;
  prenom: string;
  nomAr?: string;
  prenomAr?: string;
  service: string;
  role: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nombreJours: number;
}

const FONT_TIFINAGH = 'Ebrima';
const FONT_AR = 'Traditional Arabic';

const TIFINAGH_HEADER = [
  'ⵜⴰⴳⵍⴷⵉⵜ ⵏ ⵍⵎⵖⵔⵉⴱ',
  'ⵜⴰⵎⴰⵡⵙⵜ ⵏ ⵜⵥⵔⴼⵜ',
  'ⵜⴰⵙⵏⴱⴹⴰⵢⵜ ⵏ ⵡⴰⵍⴰⵙ',
  'ⵜⴰⵎⵙⵙⵓⴳⵓⵔⵜ ⴷⵉ ⴼⴰⵙ',
];

const ARABIC_HEADER = [
  'المملكة المغربية',
  'وزارة العدل',
  'محكمة الاستئناف الإدارية',
  'بفاس',
];

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-FR');

const emptyLine = () => new Paragraph({ text: '', spacing: { line: 276 } });

const p = (text: string, opts?: {
  bold?: boolean; underline?: boolean; size?: number;
  center?: boolean; justify?: boolean; font?: string;
  spacingBefore?: number; spacingAfter?: number;
}) =>
  new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : opts?.justify ? AlignmentType.BOTH : AlignmentType.START,
    bidirectional: true,
    spacing: { before: opts?.spacingBefore ?? 0, after: opts?.spacingAfter ?? 0, line: 276 },
    children: [
      new TextRun({
        text,
        font: opts?.font || FONT_AR,
        size: opts?.size ?? 28,
        bold: opts?.bold ?? false,
        underline: opts?.underline ? {} : undefined,
        rightToLeft: true,
      }),
    ],
  });

const getLogoBuffer = async (): Promise<ArrayBuffer> => {
  const response = await fetch('/logo.png');
  return await response.arrayBuffer();
};

const buildEnTeteArabe = async () => {
  const logoBuffer = await getLogoBuffer();
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 0, line: 240 },
      children: [
        new ImageRun({
          type: 'png',
          data: logoBuffer,
          transformation: { width: 80, height: 80 },
        }),
      ],
    }),
    new Paragraph({ text: '', spacing: { after: 0, line: 240 } }),
    ...ARABIC_HEADER.map((line, i) =>
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        spacing: { after: 0, line: 240 },
        children: [
          new TextRun({
            text: line,
            font: FONT_AR,
            size: i === 3 ? 24 : 28,
            bold: true,
            rightToLeft: true,
          }),
        ],
      })
    ),
  ];
};

const buildEnTeteTifinaghArabe = async () => {
  const logoBuffer = await getLogoBuffer();
  const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
  const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };
  const NO_MARGINS = { top: 0, bottom: 0, left: 0, right: 0 };

  const amzCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: NO_BORDERS,
    margins: NO_MARGINS,
    children: TIFINAGH_HEADER.map(line =>
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { before: 0, after: 0, line: 276 },
        children: [new TextRun({ text: line, font: FONT_TIFINAGH, size: 20, bold: true })],
      })
    ),
  });

  const logoCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 34, type: WidthType.PERCENTAGE },
    borders: NO_BORDERS,
    margins: NO_MARGINS,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 },
        children: [
          new ImageRun({ type: 'png', data: logoBuffer, transformation: { width: 100, height: 100 } }),
        ],
      }),
    ],
  });

  const arabCell = new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 33, type: WidthType.PERCENTAGE },
    borders: NO_BORDERS,
    margins: NO_MARGINS,
    children: ARABIC_HEADER.map(line =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        bidirectional: true,
        spacing: { before: 0, after: 0, line: 240 },
        children: [new TextRun({ text: line, font: FONT_AR, size: 24, bold: true, rightToLeft: true })],
      })
    ),
  });

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
        insideVertical: { style: BorderStyle.NONE, size: 0 },
      },
      layout: TableLayoutType.AUTOFIT,
      rows: [new TableRow({ children: [amzCell, logoCell, arabCell] })],
    }),
  ];
};

export const generateAvisArret = async (conge: CongeData) => {
  const enTete = await buildEnTeteArabe();

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1361, right: 1361, bottom: 1361, left: 1361 },
        },
      },
      children: [
        ...enTete,
        emptyLine(),
        p('عـــدد: ......./.........', { size: 24 }),
        emptyLine(),
        p('عطل ورخص', { bold: true, size: 28, center: true }),
        emptyLine(),
        p('إعلام بإيقاف العمل', { bold: true, underline: true, size: 28, center: true }),
        emptyLine(),
        emptyLine(),
        p(`الاسم واللقب: ${conge.prenomAr || conge.prenom} ${conge.nomAr || conge.nom}`, { size: 28 }),
        emptyLine(),
        p(`الإطار: ${traduireRole(conge.role)}`, { size: 28 }),
        emptyLine(),
        p('رقم التأجير: .......................', { size: 28 }),
        emptyLine(),
        p(`نوع الرخصة وأمدها: ${traduireTypeConge(conge.typeConge)}   أمدها ${conge.nombreJours} يوم عمل.`, { size: 28 }),
        emptyLine(),
        p(`التاريخ الذي غادر فيه الموظف منصبه: ${formatDate(conge.dateDebut)}`, { size: 28 }),
        emptyLine(),
        emptyLine(),
        emptyLine(),
        p(`فاس في: ...../...../${new Date().getFullYear()}`, { size: 24 }),
        emptyLine(),
        p('إمضاء رئيسة كتابة الضبط', { bold: true, size: 24 }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `avis_arret_${conge.nom}_${conge.prenom}.docx`);
};

export const generateAvisReprise = async (conge: CongeData) => {
  const enTete = await buildEnTeteArabe();
  const dateReprise = prochainJourOuvrableMaroc(new Date(conge.dateFin)).toLocaleDateString('fr-FR');

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1361, right: 1361, bottom: 1361, left: 1361 },
        },
      },
      children: [
        ...enTete,
        emptyLine(),
        p('عـــدد: ......./.........', { size: 24 }),
        emptyLine(),
        p('عطل ورخص', { bold: true, size: 28, center: true }),
        emptyLine(),
        p('إعلام باستئناف العمل', { bold: true, underline: true, size: 28, center: true }),
        emptyLine(),
        emptyLine(),
        p(`الاسم واللقب: ${conge.prenomAr || conge.prenom} ${conge.nomAr || conge.nom}`, { size: 28 }),
        emptyLine(),
        p(`الإطار: ${traduireRole(conge.role)}`, { size: 28 }),
        emptyLine(),
        p('رقم التأجير: .......................', { size: 28 }),
        emptyLine(),
        p(`نوع الرخصة وأمدها: ${traduireTypeConge(conge.typeConge)}   أمدها ${conge.nombreJours} يوم عمل.`, { size: 28 }),
        emptyLine(),
        p(`التاريخ الذي استأنف فيه الموظف عمله: ${dateReprise}`, { size: 28 }),
        emptyLine(),
        emptyLine(),
        emptyLine(),
        p(`فاس في: ...../...../${new Date().getFullYear()}`, { size: 24 }),
        emptyLine(),
        p('إمضاء رئيسة كتابة الضبط', { bold: true, size: 24 }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `avis_reprise_${conge.nom}_${conge.prenom}.docx`);
};

export const generateAllDocuments = async (conge: CongeData) => {
  await Promise.all([
    generateWarakatIrsal(conge),
    generateIchaarRo5sa(conge),
    generateAvisArret(conge),
    generateAvisReprise(conge),
  ]);
};

export const generateWarakatIrsal = async (conge: CongeData) => {
  const logoBuffer = await getLogoBuffer();
  const BOLD_BORDER = { style: BorderStyle.SINGLE, size: 3, color: '000000' };
  const TABLE_BORDERS = { top: BOLD_BORDER, bottom: BOLD_BORDER, left: BOLD_BORDER, right: BOLD_BORDER };
  const NO_BORDER = { style: BorderStyle.NONE, size: 0 };
  const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER };

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
        },
      },
      children: [
        // Header: Logo + Arabic text + Date on same line
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
          rows: [new TableRow({
            children: [
              // Date column (left)
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [new Paragraph({
                  alignment: AlignmentType.LEFT,
                  bidirectional: true,
                  spacing: { after: 0, line: 240 },
                  children: [new TextRun({ text: 'فاس في: ...../...../.........', font: FONT_AR, size: 20, rightToLeft: true })],
                })],
              }),
              // Logo column (center)
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: [new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 0 },
                  children: [new ImageRun({ type: 'png', data: logoBuffer, transformation: { width: 100, height: 100 } })],
                })],
              }),
              // Arabic text column (right)
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                width: { size: 30, type: WidthType.PERCENTAGE },
                borders: NO_BORDERS,
                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                children: ARABIC_HEADER.map(line => new Paragraph({
                  alignment: AlignmentType.LEFT,
                  bidirectional: true,
                  spacing: { after: 0, line: 240 },
                  children: [new TextRun({ text: line, font: FONT_AR, size: 20, bold: true, rightToLeft: true })],
                })),
              }),
            ],
          })],
        }),

        emptyLine(),
        p('عدد: ......./........', { size: 24 }),
        emptyLine(),
        p('من رئيسة كتابة الضبط بمحكمة الاستئناف الإدارية بفاس', { bold: true, size: 28, center: true }),
        p('إلى', { bold: true, size: 28, center: true }),
        p('السيد المدير الإقليمي لوزارة العدل بفاس', { bold: true, size: 28, center: true }),
        emptyLine(),
        p('ورقـــة الإرســـال', { bold: true, underline: true, size: 28, center: true }),
        emptyLine(),

        // Main table: 2 rows, 4 columns with BOLD borders
        new Table({
          width: { size: 9466, type: WidthType.DXA },
          rows: [
            // Header row
            new TableRow({
              tableHeader: true,
              children: [
                headerCell('مـــــــلاحـــــــــــظات'),
                headerCell('عدد المرفقات'),
                headerCell('نوع المراسلات وتلخيص موضوعها'),
                headerCell('الرقم الترتيبي'),
              ],
            }),
            // Content row - TALL
            new TableRow({
              height: { value: 6000, rule: 'atLeast' },
              children: [
                cell(
                  `لكل غاية مفيدة.\n` +
                  ` وتقبلوا فائق التقدير والاحترام والسلام.\n\n` +
                   `  إمضاء رئيس كتابة الضبط  :`
                ),
                cell(''),
                cell(
                  `تجدون رفقته :\n` +
                  `إعلام باستئناف العمل يخص السيد "${conge.prenomAr || conge.prenom} ${conge.nomAr || conge.nom}"\n` +
                  `"${traduireRole(conge.role)}" بهذه المحكمة.`
                ),
                cell(''),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `warakat_irsal_${conge.nom}_${conge.prenom}.docx`);
};

export const generateIchaarRo5sa = async (conge: CongeData) => {
  const enTete = await buildEnTeteTifinaghArabe();

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1361, right: 1361, bottom: 1361, left: 1361 },
        },
      },
      children: [
        ...enTete,

        p(`فاس في: ...../...../.........`, { size: 24, spacingBefore: 120, spacingAfter: 0 }),

        emptyLine(),

        p('من السيدة رئيسة كتابة الضبط بمحكمة الاستئناف الإدارية بفاس', { bold: true, size: 32, center: true }),
        p('إلـى', { bold: true, size: 32, center: true }),
        p(`السيد/ة: ${conge.prenomAr || conge.prenom} ${conge.nomAr || conge.nom}`, { bold: true, size: 32, center: true }),
        p('رقم التأجير: ...............', { bold: true, size: 28, center: true }),
        p(`الصفة: ${traduireRole(conge.role)}`, { bold: true, size: 28, center: true }),

        emptyLine(),

        new Paragraph({
          alignment: AlignmentType.BOTH,
          bidirectional: true,
          spacing: { before: 0, after: 0, line: 276 },
          children: [
            new TextRun({
              text: 'الموضوع',
              font: FONT_AR,
              size: 36,
              bold: true,
              underline: {},
              rightToLeft: true,
            }),
            new TextRun({
              text: `: إشعار بتاريخ الاستفادة مما تبقى من الرخصة الإدارية عن سنة ${new Date().getFullYear()}.`,
              font: FONT_AR,
              size: 36,
              rightToLeft: true,
            }),
          ],
        }),

        emptyLine(),

        p('سلام تام بوجود مولانا الإمام', { center: true, spacingBefore: 0 }),

        new Paragraph({
          alignment: AlignmentType.BOTH,
          bidirectional: true,
          indent: { firstLine: 709 },
          spacing: { before: 240, line: 276 },
          children: [
            new TextRun({
              text: `وبعد، علاقة بالموضوع المشار إليه أعلاه، وبناء على طلبكم، أشعركم أن رخصتكم الإدارية، ستبتدئ من تاريخ ${formatDate(conge.dateDebut)}، وذلك لمدة ${conge.nombreJours} يوم عمل، ما لم تقتض المصلحة الإدارية خلاف ذلك.`,
              font: FONT_AR,
              size: 30,
              rightToLeft: true,
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.BOTH,
          bidirectional: true,
          indent: { firstLine: 709 },
          spacing: { before: 240, after: 0, line: 276 },
          children: [
            new TextRun({
              text: 'وبناء عليه، يتعين عليكم الشروع في الاستفادة من رخصتكم ابتداء من هذا التاريخ، وذلك بعد تصفية الأشغال المنوطة بكم، والتوقيع على الوثيقة المعدة لهذا الغرض عند مغادرتكم وعند استئنافكم للعمل، مع ضرورة التصريح بعنوان إقامتكم خلال مدة الرخصة.',
              font: FONT_AR,
              size: 30,
              rightToLeft: true,
            }),
          ],
        }),
        emptyLine(),
        new Paragraph({
          alignment: AlignmentType.BOTH,
          bidirectional: true,
          spacing: { before: 240, after: 0, line: 240 },
          children: [
            new TextRun({
              text: 'والسـلام.',
              font: FONT_AR,
              size: 36,
              rightToLeft: true,
            }),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `ichaar_ro5sa_${conge.nom}_${conge.prenom}.docx`);
};

function headerCell(text: string) {
  const BOLD_BORDER = { style: BorderStyle.SINGLE, size: 3, color: '000000' };
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 25, type: WidthType.PERCENTAGE },
    borders: { top: BOLD_BORDER, bottom: BOLD_BORDER, left: BOLD_BORDER, right: BOLD_BORDER },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        bidirectional: true,
        children: [
          new TextRun({
            text,
            font: FONT_AR,
            size: 22,
            bold: true,
            rightToLeft: true,
          }),
        ],
      }),
    ],
  });
}

function cell(text: string) {
  const BOLD_BORDER = { style: BorderStyle.SINGLE, size: 3, color: '000000' };
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    width: { size: 25, type: WidthType.PERCENTAGE },
    borders: { top: BOLD_BORDER, bottom: BOLD_BORDER, left: BOLD_BORDER, right: BOLD_BORDER },
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
        spacing: { after: 0, line: 276 },
        children: [
          new TextRun({
            text,
            font: FONT_AR,
            size: 22,
            rightToLeft: true,
          }),
        ],
      }),
    ],
  });
}

const traduireTypeConge = (type: string): string => {
  switch (type) {
    case 'Annuel': return 'سنوية';
    case 'Maladie': return 'مرضية';
    case 'Exceptionnel': return 'استثنائية';
    case 'SansSolde': return 'بدون أجر';
    default: return type;
  }
};

const traduireRole = (role: string): string => {
  switch (role) {
    case 'Admin': return 'مدير';
    case 'PrésidenteGreffe': return 'رئيسة كتابة الضبط';
    case 'Fonctionnaire': return 'موظف';
    default: return role;
  }
};
