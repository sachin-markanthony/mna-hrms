import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { INDUCTION_CONFIG } from '../config/induction.config';
import { buttonStyles } from '../components/ui/Button';

const FAQS = [
  {
    question: 'How do I unlock the next chapter?',
    answer:
      'Read the current chapter to the end, mark it as read, and pass its assessment. A pass completes the chapter and unlocks only the next chapter in sequence.',
  },
  {
    question: 'What score do I need to pass?',
    answer: `The pass mark is ${INDUCTION_CONFIG.passingPercentage}% for every chapter assessment and for the Grand Final Quiz. The exact number of correct answers is shown before you start each assessment.`,
  },
  {
    question: 'What happens if I do not pass an assessment?',
    answer:
      'The next chapter stays locked. You can review the chapter and retry the assessment immediately. Every attempt is saved separately, so retrying never deletes your earlier results.',
  },
  {
    question: 'Can I revisit a chapter I have already completed?',
    answer:
      'Yes. Completed chapters stay available for revision. Revisiting a chapter does not reset its completion status or remove your assessment history.',
  },
  {
    question: 'Is my progress saved if I refresh the page?',
    answer:
      'Yes. In this demo phase your chapter progress and assessment attempts are stored in your browser. When the NestJS backend is connected, the same progress will be stored against your employee record.',
  },
  {
    question: 'Why can I not see chapters 19 and 22?',
    answer:
      "Those chapters are trainer resources. The employee induction journey contains the 18 learning chapters, a reference library and the Grand Final Quiz. Trainer materials and answer keys are never shown to employees.",
  },
];

const CONTACT_CARDS = [
  {
    icon: Mail,
    title: 'Email learning support',
    description: 'For chapter content, assessment or progress questions.',
    action: `mailto:${INDUCTION_CONFIG.supportEmail}?subject=MA%20Ventures%20Induction%20Support`,
    actionLabel: INDUCTION_CONFIG.supportEmail,
  },
  {
    icon: Phone,
    title: 'Call the HR learning desk',
    description: 'Available during normal business hours.',
    action: `tel:${INDUCTION_CONFIG.supportPhone.replace(/\s/g, '')}`,
    actionLabel: INDUCTION_CONFIG.supportPhone,
  },
  {
    icon: MessageCircle,
    title: 'Ask your manager or buddy',
    description: 'For day-to-day questions about your role and team.',
    action: 'mailto:hr@markanthony.co.in?subject=Induction%20buddy%20question',
    actionLabel: 'Contact your induction buddy',
  },
];

export function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
          <LifeBuoy className="h-3 w-3" />
          Help & support
        </div>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#3B2314] sm:text-3xl">
          We are here to help
        </h1>
        <p className="mt-1 max-w-2xl text-[11.5px] leading-6 text-[#8A7A6C]">
          If a chapter feels unclear, an assessment does not go to plan, or you need more time,
          speak to the learning team. Learning takes practice, and support is part of the process.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CONTACT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <section
              key={card.title}
              className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FBF5EA] text-[#9A7A45]">
                <Icon className="h-4 w-4" />
              </div>
              <h2 className="mt-3 text-[12.5px] font-extrabold text-[#3B2314]">{card.title}</h2>
              <p className="mt-1 text-[10.5px] leading-5 text-[#8A7A6C]">{card.description}</p>
              <a
                href={card.action}
                className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold text-[#8A6427] underline decoration-[#D9BE92] underline-offset-4 transition hover:text-[#3B2314]"
              >
                {card.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </a>
            </section>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-[#E9DED2] bg-white p-5 shadow-[0_10px_35px_rgba(59,35,20,0.05)] sm:p-6">
          <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
            <HelpCircle className="h-3 w-3" />
            Frequently asked questions
          </div>
          <div className="mt-3 divide-y divide-[#F3ECE3]">
            {FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <div key={faq.question} className="py-3">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 text-left"
                  >
                    <span className="text-[11.5px] font-bold text-[#3B2314]">{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#B8893A] transition-transform ${open ? 'rotate-180' : ''
                        }`}
                    />
                  </button>
                  {open && (
                    <p className="mt-2 pr-6 text-[10.5px] leading-6 text-[#7A6A5C]">{faq.answer}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-[#E9DED2] bg-[#FFFCF7] p-5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <BookOpen className="h-3 w-3" />
              Quick links
            </div>
            <div className="mt-3 space-y-2">
              <Link
                to="/induction/chapters"
                className="flex items-center justify-between gap-2 rounded-xl border border-[#EFE5D9] bg-white px-3 py-2.5 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314]"
              >
                Learning chapters
                <ArrowRight className="h-3 w-3 text-[#B8893A]" />
              </Link>
              <Link
                to="/induction/assessments"
                className="flex items-center justify-between gap-2 rounded-xl border border-[#EFE5D9] bg-white px-3 py-2.5 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314]"
              >
                My assessments
                <ArrowRight className="h-3 w-3 text-[#B8893A]" />
              </Link>
              <Link
                to="/induction/progress"
                className="flex items-center justify-between gap-2 rounded-xl border border-[#EFE5D9] bg-white px-3 py-2.5 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314]"
              >
                My progress
                <ArrowRight className="h-3 w-3 text-[#B8893A]" />
              </Link>
              <Link
                to="/induction/reference"
                className="flex items-center justify-between gap-2 rounded-xl border border-[#EFE5D9] bg-white px-3 py-2.5 text-[10.5px] font-bold text-[#6E5B4C] transition hover:border-[#C9A46A] hover:text-[#3B2314]"
              >
                Reference notes
                <ArrowRight className="h-3 w-3 text-[#B8893A]" />
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-[#E9DED2] bg-white p-5">
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A7A45]">
              <ShieldCheck className="h-3 w-3" />
              Assessment support
            </div>
            <p className="mt-2 text-[10.5px] leading-5 text-[#8A7A6C]">
              You need {INDUCTION_CONFIG.passingPercentage}% to pass each assessment. If you do
              not pass, the next chapter remains locked and you can retry after reviewing the
              chapter. Your previous attempts are always kept.
            </p>
            <Link
              to="/induction/assessments"
              className={buttonStyles('secondary', 'sm', 'mt-3 w-full')}
            >
              <ClipboardCheck className="h-3 w-3" />
              View assessment history
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
