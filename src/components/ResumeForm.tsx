"use client";

import React, {
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  createId,
  type EducationEntry,
  type ExperienceEntry,
  LAYOUTS,
  PALETTES,
  type ResumeData,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Icons (inline SVGs to avoid extra deps)                           */
/* ------------------------------------------------------------------ */

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${
      open ? "rotate-180" : "rotate-0"
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const XIcon = () => (
  <svg
    className="w-3 h-3"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Spinner icon for loading state                                    */
/* ------------------------------------------------------------------ */

const SpinnerIcon = () => (
  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  AI suggestion helper                                              */
/* ------------------------------------------------------------------ */

async function fetchSuggestion(field: string, context: object) {
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, context }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Failed to generate suggestion");
  }
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Suggest button component                                          */
/* ------------------------------------------------------------------ */

function SuggestButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded border border-[#b08d57] px-2.5 py-1 text-xs font-medium text-[#b08d57] transition-colors hover:bg-[#b08d57]/10 disabled:opacity-60 disabled:cursor-not-allowed font-sans"
      style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "4px" }}
    >
      {loading ? (
        <>
          <SpinnerIcon />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <span>✦</span>
          <span>Suggest</span>
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared styles                                                     */
/* ------------------------------------------------------------------ */

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 font-sans outline-none transition-shadow duration-200 focus:border-[#b08d57] focus:ring-2 focus:ring-[#b08d57]/25";

const labelClass = "block text-xs font-medium text-gray-500 mb-1.5 font-sans";

const addButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#b08d57]/40 bg-[#b08d57]/5 px-4 py-2 text-sm font-medium text-[#b08d57] transition-colors hover:bg-[#b08d57]/10 hover:border-[#b08d57]/60 font-sans";

const removeButtonClass =
  "inline-flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500";

/* ------------------------------------------------------------------ */
/*  Section wrapper with collapsible header                           */
/* ------------------------------------------------------------------ */

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[#faf8f5] overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#f5f2ed]"
      >
        <h2 className="text-base font-semibold text-[#1e2a3a] font-sans">
          {title}
        </h2>
        <span className="text-[#b08d57]">
          <ChevronIcon open={open} />
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Layout mini-preview thumbnails                                    */
/* ------------------------------------------------------------------ */

function LayoutMiniPreview({ layoutId }: { layoutId: string }) {
  const w = 48,
    h = 62;
  const bg = "#f5f0ea",
    line = "#1e2a3a",
    accent = "#b08d57";

  if (layoutId === "classic") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect width={w} height={h} fill={bg} rx={2} />
        <rect x={14} y={4} width={20} height={3} fill={line} rx={1} />
        <rect x={4} y={11} width={40} height={1} fill={accent} />
        <rect x={4} y={15} width={30} height={2} fill={line} rx={0.5} />
        <rect x={4} y={19} width={40} height={1} fill="#ccc" />
        <rect x={4} y={22} width={38} height={1} fill="#ccc" />
        <rect x={4} y={27} width={25} height={2} fill={line} rx={0.5} />
        <rect x={4} y={31} width={40} height={1} fill="#ccc" />
        <rect x={4} y={34} width={36} height={1} fill="#ccc" />
        <rect x={4} y={37} width={40} height={1} fill="#ccc" />
        <rect x={4} y={42} width={25} height={2} fill={line} rx={0.5} />
        <rect x={4} y={46} width={38} height={1} fill="#ccc" />
        <rect x={4} y={49} width={40} height={1} fill="#ccc" />
        <rect x={4} y={52} width={34} height={1} fill="#ccc" />
      </svg>
    );
  }

  if (layoutId === "modern") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect width={w} height={h} fill={bg} rx={2} />
        <rect x={0} y={0} width={16} height={h} fill={line} rx={2} />
        <rect x={3} y={5} width={10} height={3} fill="white" rx={1} />
        <rect x={3} y={12} width={10} height={1} fill={accent} />
        <rect x={3} y={15} width={10} height={1} fill="rgba(255,255,255,0.4)" />
        <rect x={3} y={18} width={10} height={1} fill="rgba(255,255,255,0.4)" />
        <rect x={3} y={24} width={10} height={1} fill={accent} />
        <rect x={3} y={27} width={8} height={1} fill="rgba(255,255,255,0.4)" />
        <rect x={3} y={30} width={10} height={1} fill="rgba(255,255,255,0.4)" />
        <rect x={20} y={5} width={20} height={2} fill={line} rx={0.5} />
        <rect x={20} y={10} width={24} height={1} fill="#ccc" />
        <rect x={20} y={13} width={22} height={1} fill="#ccc" />
        <rect x={20} y={19} width={18} height={2} fill={line} rx={0.5} />
        <rect x={20} y={23} width={24} height={1} fill="#ccc" />
        <rect x={20} y={26} width={20} height={1} fill="#ccc" />
        <rect x={20} y={29} width={24} height={1} fill="#ccc" />
        <rect x={20} y={35} width={18} height={2} fill={line} rx={0.5} />
        <rect x={20} y={39} width={24} height={1} fill="#ccc" />
        <rect x={20} y={42} width={22} height={1} fill="#ccc" />
      </svg>
    );
  }

  if (layoutId === "compact") {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <rect width={w} height={h} fill={bg} rx={2} />
        <rect x={14} y={3} width={20} height={3} fill={line} rx={1} />
        <rect x={4} y={9} width={40} height={1} fill={accent} />
        <rect x={4} y={13} width={18} height={1.5} fill={line} rx={0.5} />
        <rect x={4} y={16} width={18} height={1} fill="#ccc" />
        <rect x={4} y={19} width={16} height={1} fill="#ccc" />
        <rect x={4} y={22} width={18} height={1} fill="#ccc" />
        <rect x={26} y={13} width={18} height={1.5} fill={line} rx={0.5} />
        <rect x={26} y={16} width={18} height={1} fill="#ccc" />
        <rect x={26} y={19} width={16} height={1} fill="#ccc" />
        <rect x={26} y={22} width={18} height={1} fill="#ccc" />
        <rect x={4} y={27} width={18} height={1.5} fill={line} rx={0.5} />
        <rect x={4} y={30} width={18} height={1} fill="#ccc" />
        <rect x={4} y={33} width={16} height={1} fill="#ccc" />
        <rect x={26} y={27} width={18} height={1.5} fill={line} rx={0.5} />
        <rect x={26} y={30} width={18} height={1} fill="#ccc" />
        <rect x={26} y={33} width={16} height={1} fill="#ccc" />
      </svg>
    );
  }

  // executive
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect width={w} height={h} fill={bg} rx={2} />
      <rect x={0} y={0} width={w} height={14} fill={line} />
      <rect x={10} y={4} width={28} height={3} fill="white" rx={1} />
      <rect x={14} y={9} width={20} height={1} fill={accent} />
      <rect x={4} y={18} width={25} height={2} fill={line} rx={0.5} />
      <rect x={4} y={22} width={40} height={1} fill="#ccc" />
      <rect x={4} y={25} width={38} height={1} fill="#ccc" />
      <rect x={4} y={28} width={40} height={1} fill="#ccc" />
      <rect x={4} y={33} width={25} height={2} fill={line} rx={0.5} />
      <rect x={4} y={37} width={40} height={1} fill="#ccc" />
      <rect x={4} y={40} width={36} height={1} fill="#ccc" />
      <rect x={4} y={43} width={40} height={1} fill="#ccc" />
      <rect x={4} y={48} width={25} height={2} fill={line} rx={0.5} />
      <rect x={4} y={52} width={38} height={1} fill="#ccc" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

interface ResumeFormProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export default function ResumeForm({ data, onChange }: ResumeFormProps) {
  /* Track which sections are open — start with all expanded */
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    summary: true,
    skills: true,
    experience: true,
    education: true,
    volunteer: true,
    languages: true,
  });

  const [skillInput, setSkillInput] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [bulletsLoading, setBulletsLoading] = useState<Record<string, boolean>>(
    {},
  );

  const toggle = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /* Helpers to update data immutably */
  const set = useCallback(
    (patch: Partial<ResumeData>) => {
      onChange({ ...data, ...patch });
    },
    [data, onChange],
  );

  /* ---- Photo upload ---- */
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) {
        alert("Photo must be under 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 200;
          let w = img.width,
            h = img.height;
          if (w > h) {
            h = (h / w) * maxSize;
            w = maxSize;
          } else {
            w = (w / h) * maxSize;
            h = maxSize;
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          onChange({ ...data, photo: dataUrl });
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [data, onChange],
  );

  /* ---- Skills helpers ---- */

  const addSkill = useCallback(
    (raw: string) => {
      const items = raw
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !data.skills.includes(s));
      if (items.length === 0) return;
      onChange({ ...data, skills: [...data.skills, ...items] });
      setSkillInput("");
    },
    [data, onChange],
  );

  const removeSkill = useCallback(
    (skill: string) => {
      onChange({ ...data, skills: data.skills.filter((s) => s !== skill) });
    },
    [data, onChange],
  );

  const handleSkillKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addSkill(skillInput);
      }
    },
    [addSkill, skillInput],
  );

  /* ---- Experience helpers ---- */

  const addExperience = useCallback(() => {
    const entry: ExperienceEntry = {
      id: createId(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };
    onChange({ ...data, experience: [...data.experience, entry] });
  }, [data, onChange]);

  const updateExperience = useCallback(
    (id: string, patch: Partial<ExperienceEntry>) => {
      onChange({
        ...data,
        experience: data.experience.map((e) =>
          e.id === id ? { ...e, ...patch } : e,
        ),
      });
    },
    [data, onChange],
  );

  const removeExperience = useCallback(
    (id: string) => {
      onChange({
        ...data,
        experience: data.experience.filter((e) => e.id !== id),
      });
    },
    [data, onChange],
  );

  const addBullet = useCallback(
    (expId: string) => {
      onChange({
        ...data,
        experience: data.experience.map((e) =>
          e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e,
        ),
      });
    },
    [data, onChange],
  );

  const updateBullet = useCallback(
    (expId: string, idx: number, value: string) => {
      onChange({
        ...data,
        experience: data.experience.map((e) =>
          e.id === expId
            ? {
                ...e,
                bullets: e.bullets.map((b, i) => (i === idx ? value : b)),
              }
            : e,
        ),
      });
    },
    [data, onChange],
  );

  const removeBullet = useCallback(
    (expId: string, idx: number) => {
      onChange({
        ...data,
        experience: data.experience.map((e) =>
          e.id === expId
            ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
            : e,
        ),
      });
    },
    [data, onChange],
  );

  /* ---- Education helpers ---- */

  const addEducation = useCallback(() => {
    const entry: EducationEntry = {
      id: createId(),
      degree: "",
      school: "",
      location: "",
    };
    onChange({ ...data, education: [...data.education, entry] });
  }, [data, onChange]);

  const updateEducation = useCallback(
    (id: string, patch: Partial<EducationEntry>) => {
      onChange({
        ...data,
        education: data.education.map((e) =>
          e.id === id ? { ...e, ...patch } : e,
        ),
      });
    },
    [data, onChange],
  );

  const removeEducation = useCallback(
    (id: string) => {
      onChange({
        ...data,
        education: data.education.filter((e) => e.id !== id),
      });
    },
    [data, onChange],
  );

  /* ---- Volunteer helpers ---- */

  const addVolunteer = useCallback(() => {
    onChange({ ...data, volunteer: [...data.volunteer, ""] });
  }, [data, onChange]);

  const updateVolunteer = useCallback(
    (idx: number, value: string) => {
      onChange({
        ...data,
        volunteer: data.volunteer.map((v, i) => (i === idx ? value : v)),
      });
    },
    [data, onChange],
  );

  const removeVolunteer = useCallback(
    (idx: number) => {
      onChange({
        ...data,
        volunteer: data.volunteer.filter((_, i) => i !== idx),
      });
    },
    [data, onChange],
  );

  /* ---- Languages helpers ---- */

  const addLanguage = useCallback(() => {
    onChange({
      ...data,
      languages: [...data.languages, { name: "", level: "Fluent" }],
    });
  }, [data, onChange]);

  const updateLanguage = useCallback(
    (idx: number, patch: Partial<{ name: string; level: string }>) => {
      onChange({
        ...data,
        languages: data.languages.map((l, i) =>
          i === idx ? { ...l, ...patch } : l,
        ),
      });
    },
    [data, onChange],
  );

  const removeLanguage = useCallback(
    (idx: number) => {
      onChange({
        ...data,
        languages: data.languages.filter((_, i) => i !== idx),
      });
    },
    [data, onChange],
  );

  /* ---- AI suggestion handlers ---- */

  const handleSuggestSummary = useCallback(async () => {
    if (
      data.summary.trim() &&
      !window.confirm("Replace your current summary with an AI suggestion?")
    )
      return;
    setSummaryLoading(true);
    try {
      const titles = data.experience.map((e) => e.title).filter(Boolean);
      const result = await fetchSuggestion("summary", {
        name: data.name,
        title: titles.join(", ") || undefined,
        skills: data.skills.length > 0 ? data.skills : undefined,
      });
      if (result.suggestion) {
        onChange({ ...data, summary: result.suggestion });
      }
    } catch (err: any) {
      alert(err.message || "Failed to generate suggestion. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  }, [data, onChange]);

  const handleSuggestBullets = useCallback(
    async (expId: string) => {
      const exp = data.experience.find((e) => e.id === expId);
      if (!exp) return;
      if (
        exp.bullets.some((b) => b.trim()) &&
        !window.confirm("Replace existing bullet points with AI suggestions?")
      )
        return;
      setBulletsLoading((prev) => ({ ...prev, [expId]: true }));
      try {
        const result = await fetchSuggestion("bullets", {
          name: data.name,
          title: exp.title,
          company: exp.company,
          existingBullets: exp.bullets.filter((b) => b.trim()),
          skills: data.skills.length > 0 ? data.skills : undefined,
        });
        if (result.suggestions && Array.isArray(result.suggestions)) {
          onChange({
            ...data,
            experience: data.experience.map((e) =>
              e.id === expId ? { ...e, bullets: result.suggestions } : e,
            ),
          });
        }
      } catch (err: any) {
        alert(
          err.message || "Failed to generate suggestion. Please try again.",
        );
      } finally {
        setBulletsLoading((prev) => ({ ...prev, [expId]: false }));
      }
    },
    [data, onChange],
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-4 font-sans">
      {/* ============ Color Theme ============ */}
      <div style={{ marginBottom: 24 }}>
        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#1e2a3a",
            marginBottom: 12,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Color Theme
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange({ ...data, paletteId: p.id })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                border:
                  data.paletteId === p.id ||
                  (!data.paletteId && p.id === "classic-navy")
                    ? `2px solid ${p.primary}`
                    : "2px solid #e8e2da",
                borderRadius: 4,
                background:
                  data.paletteId === p.id ||
                  (!data.paletteId && p.id === "classic-navy")
                    ? `${p.primary}08`
                    : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", gap: 3 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: p.primary,
                  }}
                />
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: p.accent,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "#1b1b1b",
                }}
              >
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ============ Layout ============ */}
      <div style={{ marginBottom: 24 }}>
        <h3
          style={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#1e2a3a",
            marginBottom: 12,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Layout
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LAYOUTS.map((l) => {
            const isSelected =
              data.layoutId === l.id || (!data.layoutId && l.id === "classic");
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => onChange({ ...data, layoutId: l.id })}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 16px",
                  border: isSelected
                    ? "2px solid #1e2a3a"
                    : "2px solid #e8e2da",
                  borderRadius: 4,
                  background: isSelected ? "#1e2a3a08" : "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: 90,
                }}
              >
                <LayoutMiniPreview layoutId={l.id} />
                <span
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 500,
                    color: "#1b1b1b",
                  }}
                >
                  {l.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ Personal Information ============ */}
      <Section
        title="Personal Information"
        open={openSections.personal}
        onToggle={() => toggle("personal")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: data.photo ? "none" : "2px dashed #d4cfc8",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f0ea",
              cursor: "pointer",
              flexShrink: 0,
              position: "relative",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {data.photo ? (
              <img
                src={data.photo}
                alt="Profile"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9a9590"
                strokeWidth="1.5"
              >
                <path
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: "#b08d57",
                background: "none",
                border: "1px solid #b08d57",
                padding: "6px 14px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {data.photo ? "Change Photo" : "Add Photo"}
            </button>
            {data.photo && (
              <button
                type="button"
                onClick={() => onChange({ ...data, photo: undefined })}
                style={{
                  fontSize: "0.75rem",
                  color: "#9a9590",
                  background: "none",
                  border: "none",
                  marginLeft: 8,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Remove
              </button>
            )}
            <p style={{ fontSize: "0.7rem", color: "#9a9590", marginTop: 4 }}>
              Optional. JPG or PNG, max 2MB.
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handlePhotoUpload}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              className={inputClass}
              placeholder="Jane Doe"
              value={data.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input
              className={inputClass}
              placeholder="San Francisco, CA"
              value={data.location}
              onChange={(e) => set({ location: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input
              className={inputClass}
              placeholder="(555) 123-4567"
              value={data.phone}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              className={inputClass}
              type="email"
              placeholder="jane@example.com"
              value={data.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </div>
        </div>
      </Section>

      {/* ============ Professional Summary ============ */}
      <Section
        title="Professional Summary"
        open={openSections.summary}
        onToggle={() => toggle("summary")}
      >
        <div className="flex items-center justify-between mb-1.5">
          <label className={`${labelClass} mb-0`}>Summary</label>
          <SuggestButton
            loading={summaryLoading}
            onClick={handleSuggestSummary}
          />
        </div>
        <textarea
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="Write a compelling summary of your professional background..."
          value={data.summary}
          onChange={(e) => set({ summary: e.target.value })}
        />
      </Section>

      {/* ============ Skills ============ */}
      <Section
        title="Skills"
        open={openSections.skills}
        onToggle={() => toggle("skills")}
      >
        {data.skills.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#b08d57]/10 px-3 py-1 text-sm font-medium text-[#8a6d3b] font-sans"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="rounded-full p-0.5 transition-colors hover:bg-[#b08d57]/20"
                  aria-label={`Remove ${skill}`}
                >
                  <XIcon />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className={`${inputClass} flex-1`}
            placeholder="Type a skill and press Enter (or separate with commas)"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
          />
          <button
            type="button"
            onClick={() => addSkill(skillInput)}
            className="shrink-0 rounded-lg bg-[#b08d57] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#9a7a4a] font-sans"
          >
            Add
          </button>
        </div>
      </Section>

      {/* ============ Professional Experience ============ */}
      <Section
        title="Professional Experience"
        open={openSections.experience}
        onToggle={() => toggle("experience")}
      >
        <div className="space-y-6">
          {data.experience.map((exp, expIdx) => (
            <div
              key={exp.id}
              className="relative rounded-lg border border-gray-200 bg-white p-5"
            >
              {/* Remove experience button */}
              <button
                type="button"
                onClick={() => removeExperience(exp.id)}
                className={`${removeButtonClass} absolute right-3 top-3`}
                aria-label="Remove experience"
              >
                <TrashIcon />
              </button>

              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">
                Experience {expIdx + 1}
              </p>

              {/* Row 1: Title, Company, Location */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Job Title</label>
                  <input
                    className={inputClass}
                    placeholder="Software Engineer"
                    value={exp.title}
                    onChange={(e) =>
                      updateExperience(exp.id, { title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Company</label>
                  <input
                    className={inputClass}
                    placeholder="Acme Inc."
                    value={exp.company}
                    onChange={(e) =>
                      updateExperience(exp.id, { company: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    placeholder="New York, NY"
                    value={exp.location}
                    onChange={(e) =>
                      updateExperience(exp.id, { location: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input
                    className={inputClass}
                    placeholder="Jan 2020"
                    value={exp.startDate}
                    onChange={(e) =>
                      updateExperience(exp.id, { startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input
                    className={inputClass}
                    placeholder="Present"
                    value={exp.endDate}
                    onChange={(e) =>
                      updateExperience(exp.id, { endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Bullet points */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`${labelClass} mb-0`}>
                    Key Accomplishments
                  </label>
                  <SuggestButton
                    loading={!!bulletsLoading[exp.id]}
                    onClick={() => handleSuggestBullets(exp.id)}
                  />
                </div>
                <div className="space-y-2">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2">
                      <span className="mt-0.5 text-xs text-gray-300">
                        &bull;
                      </span>
                      <input
                        className={`${inputClass} flex-1`}
                        placeholder="Describe an accomplishment..."
                        value={bullet}
                        onChange={(e) =>
                          updateBullet(exp.id, bIdx, e.target.value)
                        }
                      />
                      {exp.bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBullet(exp.id, bIdx)}
                          className={removeButtonClass}
                          aria-label="Remove bullet"
                        >
                          <XIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => addBullet(exp.id)}
                  className="mt-2 inline-flex items-center gap-1 text-sm text-[#b08d57] transition-colors hover:text-[#9a7a4a] font-sans"
                >
                  <PlusIcon /> Add bullet
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addExperience}
            className={addButtonClass}
          >
            <PlusIcon /> Add Experience
          </button>
        </div>
      </Section>

      {/* ============ Education ============ */}
      <Section
        title="Education"
        open={openSections.education}
        onToggle={() => toggle("education")}
      >
        <div className="space-y-6">
          {data.education.map((edu, eduIdx) => (
            <div
              key={edu.id}
              className="relative rounded-lg border border-gray-200 bg-white p-5"
            >
              <button
                type="button"
                onClick={() => removeEducation(edu.id)}
                className={`${removeButtonClass} absolute right-3 top-3`}
                aria-label="Remove education"
              >
                <TrashIcon />
              </button>

              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 font-sans">
                Education {eduIdx + 1}
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Degree</label>
                  <input
                    className={inputClass}
                    placeholder="B.S. Computer Science"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, { degree: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>School</label>
                  <input
                    className={inputClass}
                    placeholder="University of California"
                    value={edu.school}
                    onChange={(e) =>
                      updateEducation(edu.id, { school: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    className={inputClass}
                    placeholder="Berkeley, CA"
                    value={edu.location}
                    onChange={(e) =>
                      updateEducation(edu.id, { location: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addEducation}
            className={addButtonClass}
          >
            <PlusIcon /> Add Education
          </button>
        </div>
      </Section>

      {/* ============ Volunteer Experience ============ */}
      <Section
        title="Volunteer Experience"
        open={openSections.volunteer}
        onToggle={() => toggle("volunteer")}
      >
        <div className="space-y-3">
          {data.volunteer.map((org, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className={`${inputClass} flex-1`}
                placeholder="Organization name"
                value={org}
                onChange={(e) => updateVolunteer(idx, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeVolunteer(idx)}
                className={removeButtonClass}
                aria-label="Remove volunteer entry"
              >
                <TrashIcon />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addVolunteer}
            className={addButtonClass}
          >
            <PlusIcon /> Add Volunteer Organization
          </button>
        </div>
      </Section>

      {/* ============ Languages ============ */}
      <Section
        title="Languages"
        open={openSections.languages}
        onToggle={() => toggle("languages")}
      >
        <div className="space-y-3">
          {data.languages.map((lang, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  className={inputClass}
                  placeholder="Language"
                  value={lang.name}
                  onChange={(e) =>
                    updateLanguage(idx, { name: e.target.value })
                  }
                />
              </div>
              <div className="w-44">
                <select
                  className={inputClass}
                  value={lang.level}
                  onChange={(e) =>
                    updateLanguage(idx, { level: e.target.value })
                  }
                >
                  <option value="Fluent">Fluent</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeLanguage(idx)}
                className={removeButtonClass}
                aria-label="Remove language"
              >
                <TrashIcon />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLanguage}
            className={addButtonClass}
          >
            <PlusIcon /> Add Language
          </button>
        </div>
      </Section>
    </div>
  );
}
