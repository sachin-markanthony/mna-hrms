import type { OfficialLetter } from '../types';

interface LetterDocumentProps {
  letter: Partial<OfficialLetter>;
  showWatermark?: boolean;
  id?: string;
}

function formatDateDDMMYYYY(dateInput?: string | Date | null, sep = '-'): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (Number.isNaN(d.getTime())) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}${sep}${mm}${sep}${yyyy}`;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}${sep}${mm}${sep}${yyyy}`;
}

function getPronouns(gender?: string) {
  const g = (gender || 'MR').toUpperCase();
  if (g === 'MS' || g === 'MRS' || g === 'FEMALE') {
    return { prefix: 'Ms.', subj: 'she', obj: 'her', poss: 'her' };
  }
  return { prefix: 'Mr.', subj: 'he', obj: 'him', poss: 'his' };
}

export function LetterDocument({
  letter,
  showWatermark = false,
  id = 'printable-letterhead',
}: LetterDocumentProps) {
  const issueDateFormatted = formatDateDDMMYYYY(letter.createdAt, '-');
  const joiningDateFormatted = formatDateDDMMYYYY(letter.joiningDate, '-');
  const issueDateSlash = formatDateDDMMYYYY(letter.createdAt, '/');
  const joiningDateSlash = formatDateDDMMYYYY(letter.joiningDate, '/');
  const relievingDateSlash = formatDateDDMMYYYY(letter.relievingDate, '/');

  const isOffer = letter.letterType === 'OFFER_LETTER' || !letter.letterType;
  const isExperience = letter.letterType === 'EXPERIENCE_LETTER';

  const roleUpper = (letter.designation || 'SALES EXECUTIVE').trim().toUpperCase();
  const roleWithLocation = `${roleUpper} (BANGALORE)`;
  const pronouns = getPronouns(letter.recipientGender);
  const empIdDisplay = letter.employeeCode?.trim() || 'MNA000';

  const hrName = letter.headOfHrName || 'Shilpa Kumari.P';
  const hrTitle =
    letter.headOfHrTitle === 'Head of Finance and Human Resources' || !letter.headOfHrTitle
      ? 'Head of Human Resource /Finance'
      : letter.headOfHrTitle;

  return (
    <div
      id={id}
      className="relative mx-auto shadow-lg font-sans print:shadow-none print:max-w-full print:m-0 flex flex-col justify-between overflow-hidden"
      style={{
        width: '100%',
        maxWidth: '794px',
        minHeight: '1122px',
        backgroundColor: '#ffffff',
        color: '#1a1a1a',
        border: '1px solid #e5e7eb',
      }}
    >
      {/* Subtle Watermark */}
      {(showWatermark || isExperience) && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
          style={{ opacity: isExperience ? 0.08 : 0.025 }}
        >
          {isExperience ? (
            <div className="flex flex-col items-center">
              <img
                src="/malogo.png"
                alt=""
                style={{ width: '260px', height: '260px', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontSize: '36px',
                  letterSpacing: '0.28em',
                  color: '#d4b483',
                  fontWeight: 500,
                  marginTop: '8px',
                }}
              >
                VENTURES
              </span>
            </div>
          ) : (
            <span
              className="text-[110px] font-black uppercase rotate-[-30deg]"
              style={{ color: '#111827' }}
            >
              MARK ANTHONY
            </span>
          )}
        </div>
      )}

      {/* TOP + BODY WRAPPER */}
      <div className="flex-1 flex flex-col">
        {/* Top Warm Tan Accent Strip (Matching Bottom Address Bar) */}
        <div style={{ height: '12px', backgroundColor: '#c48f5a', width: '100%' }} />

        {/* ====================================================
            1. CORPORATE LETTERHEAD HEADER (White Background)
            ==================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '24px 44px 14px 44px',
          }}
        >
          <div className="flex items-center gap-6">
            {/* Left Dark Charcoal Square Logo Box */}
            <div
              className="flex flex-col items-center justify-center shrink-0"
              style={{
                width: '112px',
                height: '86px',
                backgroundColor: '#232528',
                padding: '10px',
              }}
            >
              <img
                src="/malogo.png"
                alt="Mark Anthony"
                style={{ width: '44px', height: '44px', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontSize: '7px',
                  letterSpacing: '0.2em',
                  color: '#d4b483',
                  textTransform: 'uppercase',
                  marginTop: '5px',
                  fontWeight: 500,
                }}
              >
                MARK ANTHONY
              </span>
            </div>

            {/* Center/Right Brand Title */}
            <div className="flex-1 text-center pr-12">
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 300,
                  letterSpacing: '0.08em',
                  color: '#2b2d30',
                  lineHeight: 1.15,
                  textTransform: 'uppercase',
                }}
              >
                MARK ANTHONY
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  letterSpacing: '0.04em',
                  color: '#3f4246',
                  marginTop: '4px',
                  textTransform: 'uppercase',
                }}
              >
                &ldquo;WE ARE THE DIFFERENCE&rdquo;
              </div>
            </div>
          </div>

          {/* 3-Line Centered Tagline */}
          <div
            className="text-center"
            style={{
              marginTop: '14px',
              fontSize: '9.5px',
              lineHeight: 1.45,
              color: '#4b5563',
            }}
          >
            <div>
              Built with the ideology of being number 1. An organization that thrives around sales
              and success. Mark Anthony is a brand
            </div>
            <div>
              that is growing in the real estate space at a unprecedented speed, proving to
              competition and builders that,
            </div>
            <div style={{ marginTop: '2px' }}>&ldquo;WE ARE THE DIFFERENCE&rdquo;</div>
          </div>
        </div>

        {/* ====================================================
            2. MAIN LETTER CONTENT
            ==================================================== */}
        <div style={{ padding: '26px 56px 32px 56px', fontSize: '13px', lineHeight: 1.65 }}>
          {/* Centered Document Title */}
          <div
            className="text-center"
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: isExperience ? '22px' : '18px',
              textDecoration: isExperience ? 'underline' : 'none',
              textUnderlineOffset: '3px',
            }}
          >
            {isOffer ? 'Letter Of Intent' : 'EXPERIENCE & RELIEVING CERTIFICATE'}
          </div>

          {isOffer && (
            <>
              {/* Right-Aligned Date */}
              <div
                className="text-right"
                style={{
                  fontSize: '12.5px',
                  color: '#1f2937',
                  marginBottom: '28px',
                }}
              >
                Date: {issueDateFormatted}
              </div>

              {/* Salutation */}
              <div style={{ marginBottom: '26px', fontSize: '13px', color: '#111827' }}>
                Dear {letter.recipientName || 'Candidate Name'}
              </div>

              <div style={{ color: '#1f2937', fontSize: '13px', lineHeight: 1.65 }}>
                <p style={{ marginBottom: '16px' }}>Congratulations!!</p>

                <p style={{ marginBottom: '16px' }}>
                  At the outset we would like to thank you for having shown interest towards our
                  Organization. The purpose of this letter is to inform you that your candidature has
                  been selected for the position of{' '}
                  <strong style={{ fontWeight: 700, color: '#111827' }}>{roleWithLocation}</strong>{' '}
                  in our company,
                </p>

                <p style={{ marginBottom: '16px' }}>
                  <strong style={{ fontWeight: 700, color: '#111827' }}>M and A Ventures.</strong>{' '}
                  We would be glad to invite you to work with.
                </p>

                <p style={{ marginBottom: '16px' }}>
                  We take the privilege to inform you that your employment will start from{' '}
                  <strong style={{ fontWeight: 700, color: '#111827' }}>
                    {joiningDateFormatted}.
                  </strong>
                </p>

                <p style={{ marginBottom: '16px' }}>
                  Looking forward to have you on board as part of our team!
                </p>
              </div>
            </>
          )}

          {isExperience && (
            <>
              {/* Right-Aligned Date & EMP. ID. */}
              <div
                className="text-right"
                style={{
                  fontSize: '12.5px',
                  color: '#111827',
                  marginBottom: '22px',
                  lineHeight: 1.5,
                }}
              >
                <div>
                  <strong style={{ fontWeight: 700 }}>Date:</strong> {issueDateSlash}
                </div>
                <div>
                  <strong style={{ fontWeight: 700 }}>EMP. ID.:</strong> {empIdDisplay}
                </div>
              </div>

              <div style={{ color: '#111827', fontSize: '13px', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '14px' }}>
                  This is to certify that{' '}
                  <strong style={{ fontWeight: 700 }}>
                    {pronouns.prefix} {letter.recipientName || 'Employee Name'}
                  </strong>
                  , Employee ID <strong style={{ fontWeight: 700 }}>{empIdDisplay}</strong>, was
                  employed with <strong style={{ fontWeight: 700 }}>M&amp;A Ventures</strong> from{' '}
                  <strong style={{ fontWeight: 700 }}>{joiningDateSlash}</strong> to{' '}
                  <strong style={{ fontWeight: 700 }}>{relievingDateSlash}</strong>.
                </p>

                <p style={{ marginBottom: '14px' }}>
                  During the period of employment, the employee served as{' '}
                  <strong style={{ fontWeight: 700 }}>
                    {letter.designation || 'Designation'}
                  </strong>{' '}
                  in the{' '}
                  <strong style={{ fontWeight: 700 }}>
                    {letter.department || 'Department'}
                  </strong>
                  .
                </p>

                <p style={{ marginBottom: '14px' }}>
                  During {pronouns.poss} tenure with the organization, {pronouns.subj} was
                  responsible for carrying out the duties and responsibilities assigned to{' '}
                  {pronouns.obj} as per {pronouns.poss} role and contributed to the organization to
                  the best of {pronouns.poss} abilities.
                </p>

                <p style={{ marginBottom: '14px' }}>
                  We further confirm that{' '}
                  <strong style={{ fontWeight: 700 }}>
                    {pronouns.prefix} {letter.recipientName || 'Employee Name'}
                  </strong>{' '}
                  has been relieved from {pronouns.poss} duties with effect from{' '}
                  <strong style={{ fontWeight: 700 }}>{relievingDateSlash}</strong>, following
                  completion of the required formalities and handover process.
                </p>

                <p style={{ marginBottom: '14px' }}>
                  We appreciate the services rendered by the employee during {pronouns.poss} tenure
                  with the organization and wish {pronouns.obj}{' '}
                  <strong style={{ fontWeight: 700 }}>
                    success and prosperity in all their future endeavors.
                  </strong>
                </p>

                <p style={{ marginBottom: '14px' }}>
                  This certificate is being issued upon the employee&apos;s request for whatever
                  purpose it may serve.
                </p>
              </div>
            </>
          )}

          {/* ====================================================
              3. SIGNATORY & BLUE CIRCULAR STAMP (Exact Match)
              ==================================================== */}
          <div style={{ marginTop: isExperience ? '28px' : '44px', fontSize: '13px', color: '#111827' }}>
            {isOffer && <div style={{ marginBottom: '14px' }}>Yours Sincerely</div>}
            <div style={{ fontWeight: 700, marginBottom: '12px' }}>
              {isOffer ? 'For M and A Ventures' : 'For M&A Ventures'}
            </div>

            {/* Official Blue Circular Stamp with Signature Inside */}
            <div style={{ margin: '8px 0 14px 4px' }}>
              <svg
                width="116"
                height="116"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
                style={{ transform: 'rotate(-6deg)' }}
              >
                <defs>
                  <path id="stampTopArc" d="M 22,60 A 38,38 0 1,1 98,60" />
                  <path id="stampBottomArc" d="M 22,64 A 38,38 0 0,0 98,64" />
                </defs>

                {/* Outer & Inner Blue Stamp Rings */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.2"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="0.9"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="31"
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="1.2"
                />

                {/* Top Curved Text: M & A VENTURES */}
                <text
                  fill="#1d4ed8"
                  fontSize="10.2"
                  fontWeight="700"
                  letterSpacing="1.1"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  <textPath href="#stampTopArc" startOffset="50%" textAnchor="middle">
                    M &amp; A VENTURES
                  </textPath>
                </text>

                {/* Bottom Curved Text: BANGALORE */}
                <text
                  fill="#1d4ed8"
                  fontSize="9.8"
                  fontWeight="700"
                  letterSpacing="1.6"
                  fontFamily="Arial, Helvetica, sans-serif"
                >
                  <textPath href="#stampBottomArc" startOffset="50%" textAnchor="middle">
                    BANGALORE
                  </textPath>
                </text>

                {/* Side Dots */}
                <circle cx="20" cy="60" r="1.5" fill="#1d4ed8" />
                <circle cx="100" cy="60" r="1.5" fill="#1d4ed8" />

                {/* Signature Inside Stamp */}
                <text
                  x="60"
                  y="64"
                  textAnchor="middle"
                  fill="#1e40af"
                  fontSize="12.5"
                  fontStyle="italic"
                  fontFamily="Georgia, 'Times New Roman', serif"
                >
                  ShilpaKumari
                </text>
              </svg>
            </div>

            <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#111827' }}>{hrName}</div>
            <div style={{ marginTop: '8px', fontSize: '12.5px', color: '#1f2937' }}>{hrTitle}</div>
          </div>
        </div>
      </div>

      {/* ====================================================
          4. BOTTOM TAN / GOLD-BROWN FOOTER BAR (Exact Match)
          ==================================================== */}
      <div
        className="text-center"
        style={{
          backgroundColor: '#c48f5a',
          color: '#ffffff',
          padding: '14px 24px',
          fontSize: '11.5px',
          lineHeight: 1.5,
        }}
      >
        <div>
          Address : Espey center, 297, 3rd floor, amar jyothi layout, opp suvitas hospital,Domlur
        </div>
        <div>Bangalore: 560071&nbsp;&nbsp;Karnataka</div>
        <div>Website: Mark-anthony.in</div>
      </div>
    </div>
  );
}
