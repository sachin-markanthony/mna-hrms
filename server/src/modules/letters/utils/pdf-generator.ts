import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';

function formatDateDDMMYYYY(dateInput?: string | Date | null, sep = '-'): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    return [
      String(now.getDate()).padStart(2, '0'),
      String(now.getMonth() + 1).padStart(2, '0'),
      now.getFullYear(),
    ].join(sep);
  }
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join(sep);
}

function getPronouns(gender?: string) {
  const g = (gender || 'MR').toUpperCase();
  if (g === 'MS' || g === 'MRS' || g === 'FEMALE') {
    return { prefix: 'Ms.', subj: 'she', obj: 'her', poss: 'her' };
  }
  return { prefix: 'Mr.', subj: 'he', obj: 'him', poss: 'his' };
}

function resolveLogoPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), '../client/public/malogo.png'),
    path.resolve(process.cwd(), 'client/public/malogo.png'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export async function generateLetterPdfBuffer(letter: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Letter Of Intent — ${letter.recipientName}`,
        Author: 'M and A Ventures',
        Subject: `Letter Of Intent: ${letter.designation}`,
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = 595.28;
    const pageHeight = 841.89;

    const issueDateStr = formatDateDDMMYYYY(letter.createdAt, '-');
    const joiningDateStr = formatDateDDMMYYYY(letter.joiningDate, '-');
    const issueDateSlash = formatDateDDMMYYYY(letter.createdAt, '/');
    const joiningDateSlash = formatDateDDMMYYYY(letter.joiningDate, '/');
    const relievingDateSlash = formatDateDDMMYYYY(letter.relievingDate, '/');
    const isOffer = letter.letterType === 'OFFER_LETTER' || !letter.letterType;
    const roleUpper = (letter.designation || 'SALES EXECUTIVE').trim().toUpperCase();
    const roleWithLocation = `${roleUpper} (BANGALORE)`;
    const pronouns = getPronouns(letter.recipientGender);
    const empIdDisplay = letter.employeeCode?.trim() || 'MNA000';

    const hrName = letter.headOfHrName || 'Shilpa Kumari.P';
    const hrTitle =
      letter.headOfHrTitle === 'Head of Finance and Human Resources' || !letter.headOfHrTitle
        ? 'Head of Human Resource /Finance'
        : letter.headOfHrTitle;

    // 1. Top Accent Strip (#c48f5a) & White Header
    doc.rect(0, 0, pageWidth, 10).fill('#c48f5a');

    // Dark Charcoal Square Logo Box
    doc.rect(38, 24, 90, 68).fill('#232528');
    const logoPath = resolveLogoPath();
    if (logoPath) {
      try {
        doc.image(logoPath, 64, 32, { width: 38, height: 38 });
      } catch {
        doc
          .fillColor('#d4b483')
          .fontSize(22)
          .font('Times-Bold')
          .text('M', 38, 38, { width: 90, align: 'center' });
      }
    } else {
      doc
        .fillColor('#d4b483')
        .fontSize(22)
        .font('Times-Bold')
        .text('M', 38, 38, { width: 90, align: 'center' });
    }

    doc
      .fillColor('#d4b483')
      .fontSize(6)
      .font('Helvetica')
      .text('MARK ANTHONY', 38, 76, { width: 90, align: 'center', characterSpacing: 1.2 });

    // Brand Title
    doc
      .fillColor('#2b2d30')
      .fontSize(24)
      .font('Helvetica')
      .text('MARK ANTHONY', 140, 30, { width: 410, align: 'center', characterSpacing: 2 });

    doc
      .fillColor('#3f4246')
      .fontSize(10.5)
      .font('Helvetica')
      .text('"WE ARE THE DIFFERENCE"', 140, 62, { width: 410, align: 'center' });

    // 3-Line Centered Tagline
    doc
      .fillColor('#4b5563')
      .fontSize(7.8)
      .font('Helvetica')
      .text(
        'Built with the ideology of being number 1. An organization that thrives around sales and success. Mark Anthony is a brand',
        36,
        102,
        { width: pageWidth - 72, align: 'center' },
      )
      .text(
        'that is growing in the real estate space at a unprecedented speed, proving to competition and builders that,',
        36,
        113,
        { width: pageWidth - 72, align: 'center' },
      )
      .text('"WE ARE THE DIFFERENCE"', 36, 124, { width: pageWidth - 72, align: 'center' });

    // 2. Document Title & Body
    if (isOffer) {
      doc
        .fillColor('#111827')
        .fontSize(11.5)
        .font('Helvetica-Bold')
        .text('Letter Of Intent', 0, 162, {
          width: pageWidth,
          align: 'center',
        });

      doc
        .fillColor('#1f2937')
        .fontSize(10.5)
        .font('Helvetica')
        .text(`Date: ${issueDateStr}`, 50, 194, { width: pageWidth - 100, align: 'right' });

      // Salutation & Body Paragraphs
      doc
        .fillColor('#111827')
        .fontSize(11)
        .font('Helvetica')
        .text(`Dear ${letter.recipientName || 'Candidate Name'}`, 50, 234);

      let cursorY = 276;

      doc
        .fillColor('#1f2937')
        .fontSize(11)
        .font('Helvetica')
        .text('Congratulations!!', 50, cursorY);

      cursorY = doc.y + 14;

      doc
        .font('Helvetica')
        .text(
          'At the outset we would like to thank you for having shown interest towards our Organization. The purpose of this letter is to inform you that your candidature has been selected for the position of ',
          50,
          cursorY,
          { width: pageWidth - 100, continued: true, lineGap: 4 },
        )
        .font('Helvetica-Bold')
        .text(roleWithLocation, { continued: true })
        .font('Helvetica')
        .text(' in our company,');

      cursorY = doc.y + 14;

      doc
        .font('Helvetica-Bold')
        .text('M and A Ventures. ', 50, cursorY, { width: pageWidth - 100, continued: true })
        .font('Helvetica')
        .text('We would be glad to invite you to work with.');

      cursorY = doc.y + 14;

      doc
        .font('Helvetica')
        .text('We take the privilege to inform you that your employment will start from ', 50, cursorY, {
          width: pageWidth - 100,
          continued: true,
        })
        .font('Helvetica-Bold')
        .text(`${joiningDateStr}.`);

      cursorY = doc.y + 14;

      doc
        .font('Helvetica')
        .text('Looking forward to have you on board as part of our team!', 50, cursorY);
    } else {
      // Subtle center watermark for Experience & Relieving Certificate
      if (logoPath) {
        try {
          doc.save();
          doc.opacity(0.08);
          doc.image(logoPath, pageWidth / 2 - 90, 340, { width: 180, height: 180 });
          doc
            .fillColor('#d4b483')
            .fontSize(26)
            .font('Helvetica')
            .text('VENTURES', 0, 526, { width: pageWidth, align: 'center', characterSpacing: 6 });
          doc.restore();
        } catch {
          // ignore watermark image failure
        }
      }

      doc
        .fillColor('#111827')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('EXPERIENCE & RELIEVING CERTIFICATE', 0, 162, {
          width: pageWidth,
          align: 'center',
          underline: true,
        });

      doc
        .fillColor('#111827')
        .fontSize(10.5)
        .font('Helvetica-Bold')
        .text('Date: ', 400, 192, { continued: true })
        .font('Helvetica')
        .text(issueDateSlash);

      doc
        .font('Helvetica-Bold')
        .text('EMP. ID.: ', 400, 207, { continued: true })
        .font('Helvetica')
        .text(empIdDisplay);

      let cursorY = 238;
      doc
        .fillColor('#111827')
        .fontSize(10.8)
        .font('Helvetica')
        .text('This is to certify that ', 50, cursorY, {
          width: pageWidth - 100,
          continued: true,
          lineGap: 3.5,
        })
        .font('Helvetica-Bold')
        .text(`${pronouns.prefix} ${letter.recipientName || 'Employee Name'}`, { continued: true })
        .font('Helvetica')
        .text(', Employee ID ', { continued: true })
        .font('Helvetica-Bold')
        .text(empIdDisplay, { continued: true })
        .font('Helvetica')
        .text(', was employed with ', { continued: true })
        .font('Helvetica-Bold')
        .text('M&A Ventures', { continued: true })
        .font('Helvetica')
        .text(' from ', { continued: true })
        .font('Helvetica-Bold')
        .text(joiningDateSlash, { continued: true })
        .font('Helvetica')
        .text(' to ', { continued: true })
        .font('Helvetica-Bold')
        .text(`${relievingDateSlash}.`);

      cursorY = doc.y + 12;
      doc
        .font('Helvetica')
        .text('During the period of employment, the employee served as ', 50, cursorY, {
          width: pageWidth - 100,
          continued: true,
          lineGap: 3.5,
        })
        .font('Helvetica-Bold')
        .text(letter.designation || 'Designation', { continued: true })
        .font('Helvetica')
        .text(' in the ', { continued: true })
        .font('Helvetica-Bold')
        .text(`${letter.department || 'Department'}.`);

      cursorY = doc.y + 12;
      doc
        .font('Helvetica')
        .text(
          `During ${pronouns.poss} tenure with the organization, ${pronouns.subj} was responsible for carrying out the duties and responsibilities assigned to ${pronouns.obj} as per ${pronouns.poss} role and contributed to the organization to the best of ${pronouns.poss} abilities.`,
          50,
          cursorY,
          { width: pageWidth - 100, lineGap: 3.5 },
        );

      cursorY = doc.y + 12;
      doc
        .font('Helvetica')
        .text('We further confirm that ', 50, cursorY, {
          width: pageWidth - 100,
          continued: true,
          lineGap: 3.5,
        })
        .font('Helvetica-Bold')
        .text(`${pronouns.prefix} ${letter.recipientName || 'Employee Name'}`, { continued: true })
        .font('Helvetica')
        .text(` has been relieved from ${pronouns.poss} duties with effect from `, {
          continued: true,
        })
        .font('Helvetica-Bold')
        .text(relievingDateSlash, { continued: true })
        .font('Helvetica')
        .text(', following completion of the required formalities and handover process.');

      cursorY = doc.y + 12;
      doc
        .font('Helvetica')
        .text(
          `We appreciate the services rendered by the employee during ${pronouns.poss} tenure with the organization and wish ${pronouns.obj} `,
          50,
          cursorY,
          { width: pageWidth - 100, continued: true, lineGap: 3.5 },
        )
        .font('Helvetica-Bold')
        .text('success and prosperity in all their future endeavors.');

      cursorY = doc.y + 12;
      doc
        .font('Helvetica')
        .text(
          "This certificate is being issued upon the employee's request for whatever purpose it may serve.",
          50,
          cursorY,
          { width: pageWidth - 100, lineGap: 3.5 },
        );
    }

    // 4. Signatory & Blue Circular Stamp
    const ySign = isOffer ? doc.y + 42 : doc.y + 24;
    if (isOffer) {
      doc
        .fillColor('#111827')
        .fontSize(11)
        .font('Helvetica')
        .text('Yours Sincerely', 50, ySign);
    }

    doc
      .fillColor('#111827')
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(isOffer ? 'For M and A Ventures' : 'For M&A Ventures', 50, isOffer ? ySign + 20 : ySign);

    // Blue Circular Rubber Stamp
    const cx = 102;
    const cy = ySign + 84;
    doc.strokeColor('#1d4ed8').lineWidth(2).circle(cx, cy, 42).stroke();
    doc.strokeColor('#1d4ed8').lineWidth(0.8).circle(cx, cy, 38).stroke();
    doc.strokeColor('#1d4ed8').lineWidth(1).circle(cx, cy, 24).stroke();

    doc
      .fillColor('#1d4ed8')
      .fontSize(7.2)
      .font('Helvetica-Bold')
      .text('M & A VENTURES', cx - 34, cy - 34, { width: 68, align: 'center' });

    doc
      .fillColor('#1d4ed8')
      .fontSize(7)
      .font('Helvetica-Bold')
      .text('BANGALORE', cx - 32, cy + 26, { width: 64, align: 'center' });

    doc
      .fillColor('#1e40af')
      .fontSize(10.5)
      .font('Times-Italic')
      .text('ShilpaKumari', cx - 34, cy - 5, { width: 68, align: 'center' });

    // HR Name & Title below Stamp
    doc
      .fillColor('#111827')
      .fontSize(10.5)
      .font('Helvetica')
      .text(hrName, 50, cy + 54);

    doc
      .fillColor('#1f2937')
      .fontSize(10.5)
      .font('Helvetica')
      .text(hrTitle, 50, cy + 74);

    // 5. Bottom Tan Footer Banner (#c48f5a)
    const footerHeight = 62;
    const footerY = pageHeight - footerHeight;
    doc.rect(0, footerY, pageWidth, footerHeight).fill('#c48f5a');

    doc
      .fillColor('#ffffff')
      .fontSize(9.5)
      .font('Helvetica')
      .text(
        'Address : Espey center, 297, 3rd floor, amar jyothi layout, opp suvitas hospital,Domlur',
        20,
        footerY + 12,
        { width: pageWidth - 40, align: 'center' },
      )
      .text('Bangalore: 560071  Karnataka', 20, footerY + 26, {
        width: pageWidth - 40,
        align: 'center',
      })
      .text('Website: Mark-anthony.in', 20, footerY + 40, {
        width: pageWidth - 40,
        align: 'center',
      });

    doc.end();
  });
}
