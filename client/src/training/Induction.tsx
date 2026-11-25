
import React, { useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coffee,
  FileText,
  GraduationCap,
  Home,
  LockKeyhole,
  Play,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Video,
  Menu,
  X,
  CircleHelp,
  Headphones,
  Download,
  Bell,
  CalendarDays,
  ArrowRight,
  BookMarked,
  TrendingUp,
} from "lucide-react";

type Session = {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  minutes: number;
  chapters: string;
  description: string;
  icon: React.ElementType;
  status: "completed" | "in-progress" | "upcoming";
};

const sessions: Session[] = [
  {
    id: 1,
    title: "Welcome to MA Ventures",
    subtitle: "Company Introduction & Induction Objectives",
    duration: "15 min",
    minutes: 15,
    chapters: "Chapters 1–2",
    description:
      "Discover MA Ventures, our business, our people, our standards and the purpose of employee induction.",
    icon: Home,
    status: "completed",
  },
  {
    id: 2,
    title: "Real Estate Fundamentals",
    subtitle: "Property Types, Terminology, Pricing & Documents",
    duration: "35 min",
    minutes: 35,
    chapters: "Chapters 3–7",
    description:
      "Understand the Indian real estate industry, property categories, essential terminology, pricing and property documentation.",
    icon: BookOpen,
    status: "in-progress",
  },
  {
    id: 3,
    title: "Understanding Brokerage Business",
    subtitle: "Customer & Property Transaction Journey",
    duration: "25 min",
    minutes: 25,
    chapters: "Chapters 8–10",
    description:
      "Learn how brokerage works, how customer requirements are handled and how property transactions progress.",
    icon: TrendingUp,
    status: "upcoming",
  },
  {
    id: 4,
    title: "Culture, Ethics & Conduct",
    subtitle: "Professional Behaviour & Integrity",
    duration: "20 min",
    minutes: 20,
    chapters: "Chapters 11–12",
    description:
      "Understand customer service, professional communication, workplace ethics and integrity.",
    icon: ShieldCheck,
    status: "upcoming",
  },
  {
    id: 5,
    title: "HR Essentials & Compliance",
    subtitle: "Employee Responsibilities, Privacy & Security",
    duration: "30 min",
    minutes: 30,
    chapters: "Chapters 13–14",
    description:
      "Learn employee responsibilities, HR expectations, information security and customer data protection.",
    icon: LockKeyhole,
    status: "upcoming",
  },
  {
    id: 6,
    title: "Teams, Systems & Role Clarity",
    subtitle: "Coordination, Reporting & Performance",
    duration: "15 min",
    minutes: 15,
    chapters: "Chapter 15",
    description:
      "Understand team coordination, reporting responsibilities and performance expectations.",
    icon: Users,
    status: "upcoming",
  },
  {
    id: 7,
    title: "Practical Activities & Assessment",
    subtitle: "Case Studies, Quiz & Employee Commitment",
    duration: "30 min",
    minutes: 30,
    chapters: "Chapters 16–18",
    description:
      "Apply your knowledge through practical activities, complete the final assessment and acknowledge your commitments.",
    icon: Award,
    status: "upcoming",
  },
];

const COLORS = {
  background: "#F5EEDC",
  surface: "#FFFCF5",
  brown: "#594638",
  darkBrown: "#392D25",
  gold: "#BDA579",
  goldLight: "#E8D9B8",
  yellow: "#FFF16A",
  muted: "#8A7B6C",
  border: "#E8DDC9",
};

export default function Induction() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSession, setActiveSession] = useState(2);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const completedMinutes = 15;
  const totalMinutes = 180;
  const progress = Math.round(
    (completedMinutes / totalMinutes) * 100
  );

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) =>
      `${session.title} ${session.subtitle} ${session.chapters}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const selectedSession =
    sessions.find((session) => session.id === activeSession) ??
    sessions[0];

  const handleStart = (id: number) => {
    setActiveSession(id);
    setActiveTab("course");
    setMobileMenu(false);
  };

  const navigation = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "course", label: "Learning Sessions", icon: BookOpen },
    { id: "resources", label: "Resources", icon: FileText },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.darkBrown,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* HEADER */}

      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "rgba(255,252,245,0.96)",
          borderColor: COLORS.border,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="rounded-lg p-2 hover:bg-[#F5EEDC] lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-xl font-serif font-bold"
              style={{
                backgroundColor: COLORS.brown,
                color: COLORS.background,
              }}
            >
              M
            </div>

            <div>
              <h1
                className="font-serif text-lg font-bold tracking-[0.12em] sm:text-xl"
                style={{ color: COLORS.brown }}
              >
                MA VENTURES
              </h1>
              <p
                className="text-[9px] font-semibold tracking-[0.2em] sm:text-[10px]"
                style={{ color: COLORS.muted }}
              >
                LEARNING & DEVELOPMENT
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="flex items-center gap-2 text-sm font-medium transition"
                style={{
                  color:
                    activeTab === item.id
                      ? COLORS.brown
                      : COLORS.muted,
                }}
              >
                <item.icon size={16} />
                {item.label}
                {activeTab === item.id && (
                  <span
                    className="absolute mt-12 h-[3px] w-8 rounded-full"
                    style={{ backgroundColor: COLORS.gold }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative rounded-full p-2.5 hover:bg-[#F5EEDC]"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span
                className="absolute right-2 top-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: "#C78B54" }}
              />
            </button>

            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold"
              style={{
                backgroundColor: COLORS.goldLight,
                borderColor: COLORS.gold,
                color: COLORS.brown,
              }}
            >
              JD
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION */}

      {mobileMenu && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setMobileMenu(false)}
        >
          <div
            className="w-[280px] border-r p-5 pt-8 shadow-xl"
            style={{
              backgroundColor: COLORS.surface,
              borderColor: COLORS.border,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="mb-5 text-xs font-bold uppercase tracking-widest"
              style={{ color: COLORS.muted }}
            >
              Learning Navigation
            </p>

            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenu(false);
                }}
                className="mb-2 flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-semibold"
                style={{
                  backgroundColor:
                    activeTab === item.id
                      ? COLORS.goldLight
                      : "transparent",
                  color: COLORS.brown,
                }}
              >
                <item.icon size={18} />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-10 lg:py-10">

        {/* OVERVIEW TAB */}

        {activeTab === "overview" && (
          <div className="space-y-8">

            {/* WELCOME */}

            <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <div
                  className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]"
                  style={{ color: COLORS.gold }}
                >
                  <Sparkles size={15} />
                  EMPLOYEE INDUCTION PROGRAMME
                </div>

                <h2
                  className="font-serif text-3xl font-bold sm:text-4xl lg:text-5xl"
                  style={{ color: COLORS.brown }}
                >
                  Welcome to MA Ventures
                </h2>

                <p
                  className="mt-3 max-w-2xl text-sm leading-7 sm:text-base"
                  style={{ color: COLORS.muted }}
                >
                  Your journey starts here. Understand our business,
                  discover our industry and learn the standards that
                  bring our team together.
                </p>
              </div>

              <div
                className="flex items-center gap-2 self-start rounded-full border px-4 py-2 text-xs font-semibold md:self-auto"
                style={{
                  backgroundColor: "#F8F2E4",
                  borderColor: COLORS.goldLight,
                  color: COLORS.brown,
                }}
              >
                <CalendarDays size={15} />
                Employee Induction · Version 2.0
              </div>
            </section>

            {/* HERO CARD */}

            <section
              className="relative overflow-hidden rounded-3xl p-6 shadow-sm sm:p-9 lg:p-11"
              style={{
                background:
                  "linear-gradient(115deg, #49372D 0%, #715943 58%, #A48A62 100%)",
              }}
            >
              <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-5 -top-12 h-56 w-56 rounded-full border border-white/10" />

              <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: COLORS.yellow,
                      color: COLORS.darkBrown,
                    }}
                  >
                    <PlayCircle size={13} />
                    Your learning journey
                  </span>

                  <h3 className="mt-5 max-w-xl font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                    Understanding Our Business. Our Industry. Our People.
                  </h3>

                  <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
                    A guided learning experience designed to help
                    you become a knowledgeable, responsible and
                    customer-focused member of MA Ventures.
                  </p>

                  <button
                    onClick={() =>
                      handleStart(
                        progress > 0 ? activeSession : 1
                      )
                    }
                    className="mt-7 inline-flex items-center gap-3 rounded-xl px-6 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5"
                    style={{
                      backgroundColor: COLORS.yellow,
                      color: COLORS.darkBrown,
                    }}
                  >
                    <Play size={17} fill="currentColor" />
                    Continue Learning
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="hidden lg:flex lg:justify-end">
                  <div className="relative flex h-64 w-64 items-center justify-center rounded-full border border-white/20 bg-white/5">
                    <div className="absolute h-52 w-52 rounded-full border border-white/20" />
                    <div className="text-center">
                      <GraduationCap
                        size={65}
                        className="mx-auto text-[#F7E8C8]"
                        strokeWidth={1.2}
                      />
                      <p className="mt-4 font-serif text-xl font-bold text-white">
                        One Team.
                      </p>
                      <p className="font-serif text-xl font-bold text-white">
                        One Standard.
                      </p>
                      <p className="mt-2 text-[9px] tracking-widest text-white/60">
                        ONE COMMITMENT TO EXCELLENCE
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* STATISTICS */}

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
              {[
                {
                  label: "Programme Duration",
                  value: "3 Hours",
                  icon: Clock3,
                  note: "Including scheduled break",
                },
                {
                  label: "Learning Sessions",
                  value: "7",
                  icon: BookOpen,
                  note: "Structured sessions",
                },
                {
                  label: "Learning Progress",
                  value: `${progress}%`,
                  icon: TrendingUp,
                  note: "Based on completed time",
                },
                {
                  label: "Final Assessment",
                  value: "20 Qs",
                  icon: Award,
                  note: "Grand Final Quiz",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs font-medium"
                      style={{ color: COLORS.muted }}
                    >
                      {stat.label}
                    </span>
                    <stat.icon
                      size={19}
                      style={{ color: COLORS.gold }}
                    />
                  </div>
                  <h3
                    className="mt-3 text-2xl font-bold sm:text-3xl"
                    style={{ color: COLORS.brown }}
                  >
                    {stat.value}
                  </h3>
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: COLORS.muted }}
                  >
                    {stat.note}
                  </p>
                </div>
              ))}
            </section>

            {/* PROGRESS AND COURSE */}

            <section className="grid gap-6 lg:grid-cols-[1.65fr_0.85fr]">

              {/* LEARNING JOURNEY */}

              <div
                className="rounded-2xl border p-5 sm:p-7"
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: COLORS.border,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3
                      className="font-serif text-2xl font-bold"
                      style={{ color: COLORS.brown }}
                    >
                      Your Induction Journey
                    </h3>
                    <p
                      className="mt-1 text-xs"
                      style={{ color: COLORS.muted }}
                    >
                      Follow each session to complete your induction.
                    </p>
                  </div>

                  <span
                    className="rounded-full px-3 py-1.5 text-xs font-bold"
                    style={{
                      backgroundColor: "#F4E8D0",
                      color: COLORS.brown,
                    }}
                  >
                    {progress}% completed
                  </span>
                </div>

                <div className="mt-6">
                  <div
                    className="mb-2 flex justify-between text-xs font-semibold"
                    style={{ color: COLORS.muted }}
                  >
                    <span>Overall progress</span>
                    <span>15 / 180 minutes</span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-[#EEE5D6]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: COLORS.gold,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {sessions.map((session) => {
                    const Icon = session.icon;
                    const isActive = session.id === activeSession;

                    return (
                      <button
                        key={session.id}
                        onClick={() => handleStart(session.id)}
                        className="group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition sm:gap-4 sm:p-4"
                        style={{
                          backgroundColor: isActive
                            ? "#F6EFDF"
                            : "transparent",
                          borderColor: isActive
                            ? COLORS.gold
                            : COLORS.border,
                        }}
                      >
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                          style={{
                            backgroundColor:
                              session.status === "completed"
                                ? "#E4EBD9"
                                : COLORS.goldLight,
                            color: COLORS.brown,
                          }}
                        >
                          {session.status === "completed" ? (
                            <CheckCircle2 size={21} />
                          ) : (
                            <Icon size={21} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4
                              className="text-sm font-bold"
                              style={{ color: COLORS.brown }}
                            >
                              {session.id.toString().padStart(2, "0")}.{" "}
                              {session.title}
                            </h4>

                            {session.status === "completed" && (
                              <span className="text-[9px] font-bold uppercase text-green-700">
                                Completed
                              </span>
                            )}

                            {isActive && (
                              <span
                                className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                                style={{
                                  backgroundColor: COLORS.yellow,
                                  color: COLORS.darkBrown,
                                }}
                              >
                                CURRENT
                              </span>
                            )}
                          </div>

                          <p
                            className="mt-1 truncate text-[11px]"
                            style={{ color: COLORS.muted }}
                          >
                            {session.subtitle}
                          </p>

                          <p
                            className="mt-1 text-[10px]"
                            style={{ color: COLORS.gold }}
                          >
                            {session.chapters}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <span
                            className="text-xs font-semibold"
                            style={{ color: COLORS.muted }}
                          >
                            {session.duration}
                          </span>
                          <ChevronRight
                            size={17}
                            className="transition group-hover:translate-x-1"
                            style={{ color: COLORS.gold }}
                          />
                        </div>
                      </button>
                    );
                  })}

                  {/* BREAK */}

                  <div
                    className="flex items-center gap-4 rounded-xl border border-dashed p-4"
                    style={{
                      backgroundColor: "#F8F3E9",
                      borderColor: COLORS.goldLight,
                    }}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: COLORS.goldLight,
                        color: COLORS.brown,
                      }}
                    >
                      <Coffee size={21} />
                    </div>

                    <div className="flex-1">
                      <h4
                        className="text-sm font-bold"
                        style={{ color: COLORS.brown }}
                      >
                        Tea / Comfort Break
                      </h4>
                      <p
                        className="mt-1 text-[11px]"
                        style={{ color: COLORS.muted }}
                      >
                        Take a short break before continuing.
                      </p>
                    </div>

                    <span
                      className="text-xs font-semibold"
                      style={{ color: COLORS.muted }}
                    >
                      10 min
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("course")}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-sm font-bold transition hover:bg-[#F5EEDC]"
                  style={{
                    borderColor: COLORS.gold,
                    color: COLORS.brown,
                  }}
                >
                  View All Learning Sessions
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* SIDE PANEL */}

              <div className="space-y-5">

                {/* CURRENT SESSION */}

                <div
                  className="overflow-hidden rounded-2xl border"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  <div
                    className="flex aspect-video items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #594638, #A48A62)",
                    }}
                  >
                    <div className="text-center text-white">
                      <PlayCircle
                        size={53}
                        className="mx-auto mb-2 text-[#FFF16A]"
                        strokeWidth={1.3}
                      />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Continue Watching
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: COLORS.gold }}
                    >
                      CURRENT LESSON
                    </span>

                    <h4
                      className="mt-2 font-serif text-xl font-bold"
                      style={{ color: COLORS.brown }}
                    >
                      {selectedSession.title}
                    </h4>

                    <p
                      className="mt-2 text-xs leading-6"
                      style={{ color: COLORS.muted }}
                    >
                      {selectedSession.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span style={{ color: COLORS.muted }}>
                        {selectedSession.chapters}
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: COLORS.brown }}
                      >
                        {selectedSession.duration}
                      </span>
                    </div>

                    <button
                      onClick={() => handleStart(activeSession)}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition hover:opacity-90"
                      style={{
                        backgroundColor: COLORS.brown,
                        color: "#FFFFFF",
                      }}
                    >
                      <Play size={16} fill="currentColor" />
                      Open Learning Session
                    </button>
                  </div>
                </div>

                {/* IMPORTANT MESSAGE */}

                <div
                  className="rounded-2xl border p-5"
                  style={{
                    backgroundColor: "#FFF9D9",
                    borderColor: "#E8D77B",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} color="#8D7135" />
                    <h4 className="text-sm font-bold text-[#594638]">
                      A Message from MA Ventures
                    </h4>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[#594638]">
                    Every employee represents MA Ventures. Your
                    work, communication and conduct contribute
                    directly to our reputation.
                  </p>

                  <p className="mt-3 font-serif text-sm font-bold italic text-[#594638]">
                    One Team. One Standard. One Commitment to Excellence.
                  </p>
                </div>
              </div>
            </section>

            {/* LEARNING OBJECTIVES */}

            <section>
              <div className="mb-5">
                <h3
                  className="font-serif text-2xl font-bold"
                  style={{ color: COLORS.brown }}
                >
                  What You Will Learn
                </h3>
                <p
                  className="mt-1 text-sm"
                  style={{ color: COLORS.muted }}
                >
                  The key learning outcomes of the induction programme.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Home,
                    title: "Our Organisation",
                    desc: "Understand MA Ventures and its business environment.",
                  },
                  {
                    icon: BookOpen,
                    title: "Industry Knowledge",
                    desc: "Learn real estate concepts, terminology and transactions.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Professional Standards",
                    desc: "Follow ethics, integrity and company expectations.",
                  },
                  {
                    icon: Users,
                    title: "Team Collaboration",
                    desc: "Understand responsibilities and coordination.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border p-5"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor: COLORS.border,
                    }}
                  >
                    <item.icon
                      size={25}
                      style={{ color: COLORS.gold }}
                    />
                    <h4
                      className="mt-4 text-sm font-bold"
                      style={{ color: COLORS.brown }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="mt-2 text-xs leading-6"
                      style={{ color: COLORS.muted }}
                    >
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* COURSE TAB */}

        {activeTab === "course" && (
          <div className="space-y-7">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: COLORS.gold }}
              >
                LEARNING CENTRE
              </p>
              <h2
                className="mt-2 font-serif text-3xl font-bold sm:text-4xl"
                style={{ color: COLORS.brown }}
              >
                Learning Sessions
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: COLORS.muted }}
              >
                Explore your induction programme and continue
                learning at your own pace.
              </p>
            </div>

            <div className="relative max-w-lg">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: COLORS.muted }}
              />
              <input
                type="text"
                placeholder="Search sessions or chapters..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none focus:ring-2"
                style={{
                  backgroundColor: COLORS.surface,
                  borderColor: COLORS.border,
                  color: COLORS.brown,
                }}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {filteredSessions.map((session) => {
                const Icon = session.icon;

                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-md sm:p-6"
                    style={{
                      backgroundColor: COLORS.surface,
                      borderColor:
                        activeSession === session.id
                          ? COLORS.gold
                          : COLORS.border,
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor: COLORS.goldLight,
                          color: COLORS.brown,
                        }}
                      >
                        <Icon size={24} />
                      </div>

                      {session.status === "completed" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700">
                          <CheckCircle2 size={15} />
                          Completed
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-3 py-1 text-[10px] font-bold"
                          style={{
                            backgroundColor:
                              session.status === "in-progress"
                                ? COLORS.yellow
                                : "#F1EDE5",
                            color: COLORS.brown,
                          }}
                        >
                          {session.status === "in-progress"
                            ? "IN PROGRESS"
                            : "UPCOMING"}
                        </span>
                      )}
                    </div>

                    <p
                      className="mt-5 text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: COLORS.gold }}
                    >
                      SESSION {String(session.id).padStart(2, "0")} ·{" "}
                      {session.chapters}
                    </p>

                    <h3
                      className="mt-2 font-serif text-xl font-bold"
                      style={{ color: COLORS.brown }}
                    >
                      {session.title}
                    </h3>

                    <p
                      className="mt-2 text-xs font-medium"
                      style={{ color: COLORS.muted }}
                    >
                      {session.subtitle}
                    </p>

                    <p
                      className="mt-3 text-sm leading-6"
                      style={{ color: COLORS.muted }}
                    >
                      {session.description}
                    </p>

                    <div
                      className="mt-5 flex items-center justify-between border-t pt-4"
                      style={{ borderColor: COLORS.border }}
                    >
                      <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.muted }}>
                        <Clock3 size={15} />
                        {session.duration}
                      </div>

                      <button
                        onClick={() => handleStart(session.id)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition hover:opacity-90"
                        style={{
                          backgroundColor: COLORS.brown,
                          color: "#FFFFFF",
                        }}
                      >
                        {session.status === "completed"
                          ? "Review"
                          : session.status === "in-progress"
                            ? "Continue"
                            : "View Session"}
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredSessions.length === 0 && (
                <div
                  className="col-span-full rounded-2xl border p-10 text-center"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  <Search
                    size={32}
                    className="mx-auto"
                    style={{ color: COLORS.gold }}
                  />
                  <p className="mt-3 font-semibold">
                    No sessions found
                  </p>
                  <p
                    className="mt-1 text-sm"
                    style={{ color: COLORS.muted }}
                  >
                    Try another session or chapter name.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RESOURCES TAB */}

        {activeTab === "resources" && (
          <div className="space-y-7">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: COLORS.gold }}
              >
                LEARNING MATERIALS
              </p>
              <h2
                className="mt-2 font-serif text-3xl font-bold sm:text-4xl"
                style={{ color: COLORS.brown }}
              >
                Learning Resources
              </h2>
              <p
                className="mt-2 text-sm"
                style={{ color: COLORS.muted }}
              >
                Refer to the materials that support your induction.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  icon: FileText,
                  title: "Employee Induction Handbook",
                  description:
                    "MA Ventures Employee Induction Handbook, Version 2.0.",
                  type: "PDF DOCUMENT",
                },
                {
                  icon: BookMarked,
                  title: "Real Estate Terminology",
                  description:
                    "Reference material for essential real estate terms and definitions.",
                  type: "REFERENCE",
                },
                {
                  icon: CircleHelp,
                  title: "Knowledge Assessment",
                  description:
                    "Review the chapter quizzes and final assessment.",
                  type: "ASSESSMENT",
                },
                {
                  icon: Headphones,
                  title: "Learning Support",
                  description:
                    "Get assistance with questions about your induction.",
                  type: "SUPPORT",
                },
              ].map((resource) => (
                <div
                  key={resource.title}
                  className="flex gap-4 rounded-2xl border p-5"
                  style={{
                    backgroundColor: COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: COLORS.goldLight,
                      color: COLORS.brown,
                    }}
                  >
                    <resource.icon size={23} />
                  </div>

                  <div className="flex-1">
                    <p
                      className="text-[9px] font-bold tracking-widest"
                      style={{ color: COLORS.gold }}
                    >
                      {resource.type}
                    </p>
                    <h3
                      className="mt-1 text-base font-bold"
                      style={{ color: COLORS.brown }}
                    >
                      {resource.title}
                    </h3>
                    <p
                      className="mt-2 text-xs leading-6"
                      style={{ color: COLORS.muted }}
                    >
                      {resource.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}

        <footer
          className="mt-12 border-t py-7"
          style={{ borderColor: COLORS.goldLight }}
        >
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div>
              <p
                className="font-serif text-sm font-bold tracking-widest"
                style={{ color: COLORS.brown }}
              >
                MA VENTURES
              </p>
              <p
                className="mt-1 text-[10px]"
                style={{ color: COLORS.muted }}
              >
                Understanding Our Business · Our Industry · Our People · Our Standards
              </p>
            </div>

            <p
              className="text-xs italic"
              style={{ color: COLORS.muted }}
            >
              One Team. One Standard. One Commitment to Excellence.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
