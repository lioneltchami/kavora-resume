"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResumeData } from "@/lib/types";
import { getLayout, getPalette } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAPER_W = 816; // 8.5 in * 96 dpi
const PAPER_H = 1056; // 11 in * 96 dpi

const BODY_COLOR = "#2d2d2d";
const PLACEHOLDER_COLOR = "#b8b8b8";

// ---------------------------------------------------------------------------
// Tiny helpers
// ---------------------------------------------------------------------------

function Placeholder({ children }: { children: string }) {
  return (
    <span style={{ color: PLACEHOLDER_COLOR, fontStyle: "italic" }}>
      {children}
    </span>
  );
}

function SectionTitle({
  children,
  color,
  style,
}: {
  children: string;
  color: string;
  style?: React.CSSProperties;
}) {
  return (
    <h2
      style={{
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        fontSize: "11pt",
        fontWeight: 700,
        color,
        textTransform: "uppercase",
        letterSpacing: "2px",
        marginBottom: "6px",
        marginTop: 0,
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

function HRule({ color, marginY = 10 }: { color: string; marginY?: number }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1.5px solid ${color}`,
        margin: `${marginY}px 0`,
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Shared content fragments used by multiple layouts
// ---------------------------------------------------------------------------

interface ContentProps {
  data: ResumeData;
  palette: { primary: string; accent: string; headerBg: string };
  hasName: boolean;
  hasContact: boolean;
  hasSummary: boolean;
  hasSkills: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasVolunteer: boolean;
  hasLanguages: boolean;
  contactParts: string[];
}

function ExperienceBlock({
  data,
  palette,
}: {
  data: ResumeData;
  palette: ContentProps["palette"];
}) {
  return (
    <>
      {data.experience.map((job, idx) => (
        <div
          key={job.id}
          style={{
            marginBottom: idx < data.experience.length - 1 ? "10px" : "0",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "10pt",
                color: palette.primary,
              }}
            >
              {job.title || <Placeholder>Job Title</Placeholder>}
            </span>
            <span
              style={{
                fontStyle: "italic",
                fontSize: "8.5pt",
                color: "#666",
                whiteSpace: "nowrap",
                marginLeft: "12px",
              }}
            >
              {[job.startDate, job.endDate].filter(Boolean).join(" – ") || ""}
            </span>
          </div>
          <div
            style={{
              color: palette.accent,
              fontWeight: 600,
              fontSize: "9pt",
              marginBottom: "3px",
            }}
          >
            {[job.company, job.location].filter(Boolean).join(", ") || (
              <Placeholder>Company Name</Placeholder>
            )}
          </div>
          {job.bullets.length > 0 && (
            <ul
              style={{
                margin: "2px 0 0 0",
                paddingLeft: "16px",
                listStyleType: "square",
              }}
            >
              {job.bullets
                .filter((b) => b.trim().length > 0)
                .map((bullet, bi) => (
                  <li
                    key={bi}
                    style={{
                      fontSize: "9pt",
                      lineHeight: 1.45,
                      marginBottom: "1.5px",
                      color: BODY_COLOR,
                    }}
                  >
                    {bullet}
                  </li>
                ))}
            </ul>
          )}
        </div>
      ))}
    </>
  );
}

function EducationBlock({
  data,
  palette,
}: {
  data: ResumeData;
  palette: ContentProps["palette"];
}) {
  return (
    <>
      {data.education.map((edu) => (
        <div key={edu.id} style={{ marginBottom: "6px" }}>
          <div style={{ fontWeight: 700, fontSize: "9.5pt" }}>
            {edu.degree || <Placeholder>Degree</Placeholder>}
          </div>
          <div
            style={{
              fontSize: "9pt",
              color: palette.accent,
              fontWeight: 600,
            }}
          >
            {[edu.school, edu.location].filter(Boolean).join(", ") || (
              <Placeholder>School Name</Placeholder>
            )}
          </div>
        </div>
      ))}
    </>
  );
}

function VolunteerBlock({ data }: { data: ResumeData }) {
  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: "16px",
        listStyleType: "square",
      }}
    >
      {data.volunteer.map((v, i) => (
        <li key={i} style={{ fontSize: "9pt", marginBottom: "1.5px" }}>
          {v}
        </li>
      ))}
    </ul>
  );
}

function LanguagesBlock({ data }: { data: ResumeData }) {
  return (
    <div style={{ fontSize: "9pt" }}>
      {data.languages.map((lang, i) => (
        <div key={i} style={{ marginBottom: "2px" }}>
          <span style={{ fontWeight: 600 }}>{lang.name}</span>
          {lang.level && <span style={{ color: "#666" }}> — {lang.level}</span>}
        </div>
      ))}
    </div>
  );
}

function SkillTags({
  data,
  palette,
}: {
  data: ResumeData;
  palette: ContentProps["palette"];
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
      {data.skills.map((skill, i) => (
        <span
          key={i}
          style={{
            background: `${palette.primary}15`,
            color: palette.primary,
            fontSize: "8.5pt",
            padding: "3px 10px",
            borderRadius: "3px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          {skill}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout: Classic (original)
// ---------------------------------------------------------------------------

function ClassicLayout(p: ContentProps) {
  const {
    data,
    palette,
    hasName,
    hasContact,
    hasSummary,
    hasSkills,
    hasExperience,
    hasEducation,
    hasVolunteer,
    hasLanguages,
    contactParts,
  } = p;
  return (
    <>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "2px" }}>
        {data.photo && (
          <img
            src={data.photo}
            alt=""
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${palette.accent}`,
              marginBottom: 6,
            }}
          />
        )}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: "24pt",
            fontWeight: 700,
            color: palette.primary,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "1px",
          }}
        >
          {hasName ? data.name : <Placeholder>Your Name</Placeholder>}
        </h1>
        <div
          style={{
            fontSize: "9pt",
            marginTop: "6px",
            color: BODY_COLOR,
            letterSpacing: "0.3px",
          }}
        >
          {hasContact ? (
            contactParts.join("  |  ")
          ) : (
            <Placeholder>Location | Phone | Email</Placeholder>
          )}
        </div>
      </div>

      <HRule color={palette.accent} />

      {/* SUMMARY */}
      <div style={{ marginBottom: "12px" }}>
        <SectionTitle color={palette.primary}>
          Professional Summary
        </SectionTitle>
        <p
          style={{
            margin: 0,
            textAlign: "justify",
            fontSize: "9.5pt",
            lineHeight: 1.5,
          }}
        >
          {hasSummary ? (
            data.summary
          ) : (
            <Placeholder>
              Professional summary highlighting your career achievements, key
              strengths, and value proposition...
            </Placeholder>
          )}
        </p>
      </div>

      {/* SKILLS */}
      <div style={{ marginBottom: "12px" }}>
        <SectionTitle color={palette.primary}>Core Competencies</SectionTitle>
        {hasSkills ? (
          <SkillTags data={data} palette={palette} />
        ) : (
          <Placeholder>Add your key skills and competencies</Placeholder>
        )}
      </div>

      {/* EXPERIENCE */}
      <div style={{ marginBottom: "10px" }}>
        <SectionTitle color={palette.primary}>
          Professional Experience
        </SectionTitle>
        {hasExperience ? (
          <ExperienceBlock data={data} palette={palette} />
        ) : (
          <Placeholder>
            Your professional experience will appear here
          </Placeholder>
        )}
      </div>

      <HRule color="#d0d0d0" marginY={8} />

      {/* BOTTOM GRID */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
      >
        <div>
          <SectionTitle color={palette.primary}>Education</SectionTitle>
          {hasEducation ? (
            <EducationBlock data={data} palette={palette} />
          ) : (
            <Placeholder>Your education will appear here</Placeholder>
          )}
        </div>
        <div>
          {(hasVolunteer || !hasLanguages) && (
            <div style={{ marginBottom: "10px" }}>
              <SectionTitle color={palette.primary}>
                Volunteer Experience
              </SectionTitle>
              {hasVolunteer ? (
                <VolunteerBlock data={data} />
              ) : (
                <Placeholder>Volunteer work</Placeholder>
              )}
            </div>
          )}
          <div>
            <SectionTitle color={palette.primary}>Languages</SectionTitle>
            {hasLanguages ? (
              <LanguagesBlock data={data} />
            ) : (
              <Placeholder>Languages spoken</Placeholder>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Layout: Modern (sidebar)
// ---------------------------------------------------------------------------

function ModernLayout(p: ContentProps) {
  const {
    data,
    palette,
    hasName,
    hasContact,
    hasSummary,
    hasSkills,
    hasExperience,
    hasEducation,
    hasVolunteer,
    hasLanguages,
    contactParts,
  } = p;

  const sidebarW = "30%";
  const contentW = "70%";

  return (
    <div
      style={{ display: "flex", height: "100%", margin: "-54px -54px -42px" }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarW,
          background: palette.headerBg,
          color: "white",
          padding: "40px 24px 32px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {/* Photo */}
        {data.photo && (
          <div style={{ textAlign: "center" }}>
            <img
              src={data.photo}
              alt=""
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${palette.accent}`,
              }}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', 'Georgia', serif",
              fontSize: "17pt",
              fontWeight: 700,
              color: "white",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: "0.5px",
            }}
          >
            {hasName ? (
              data.name
            ) : (
              <span style={{ color: "rgba(255,255,255,0.4)" }}>Your Name</span>
            )}
          </h1>
        </div>

        {/* Contact */}
        <div>
          <h2
            style={{
              fontSize: "8pt",
              fontWeight: 700,
              color: palette.accent,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "6px",
              marginTop: 0,
            }}
          >
            Contact
          </h2>
          {hasContact ? (
            <div
              style={{
                fontSize: "8pt",
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {data.location.trim() && <div>{data.location.trim()}</div>}
              {data.phone.trim() && <div>{data.phone.trim()}</div>}
              {data.email.trim() && (
                <div style={{ wordBreak: "break-all" }}>
                  {data.email.trim()}
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                fontSize: "8pt",
                color: "rgba(255,255,255,0.35)",
                fontStyle: "italic",
              }}
            >
              Contact info
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
          <h2
            style={{
              fontSize: "8pt",
              fontWeight: 700,
              color: palette.accent,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "6px",
              marginTop: 0,
            }}
          >
            Skills
          </h2>
          {hasSkills ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {data.skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontSize: "7.5pt",
                    padding: "2px 8px",
                    borderRadius: "3px",
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: "8pt",
                color: "rgba(255,255,255,0.35)",
                fontStyle: "italic",
              }}
            >
              Your skills
            </div>
          )}
        </div>

        {/* Languages */}
        <div>
          <h2
            style={{
              fontSize: "8pt",
              fontWeight: 700,
              color: palette.accent,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "6px",
              marginTop: 0,
            }}
          >
            Languages
          </h2>
          {hasLanguages ? (
            <div style={{ fontSize: "8pt", color: "rgba(255,255,255,0.85)" }}>
              {data.languages.map((lang, i) => (
                <div key={i} style={{ marginBottom: "2px" }}>
                  <span style={{ fontWeight: 600 }}>{lang.name}</span>
                  {lang.level && (
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      {" "}
                      — {lang.level}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: "8pt",
                color: "rgba(255,255,255,0.35)",
                fontStyle: "italic",
              }}
            >
              Languages
            </div>
          )}
        </div>

        {/* Education in sidebar */}
        <div>
          <h2
            style={{
              fontSize: "8pt",
              fontWeight: 700,
              color: palette.accent,
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              marginBottom: "6px",
              marginTop: 0,
            }}
          >
            Education
          </h2>
          {hasEducation ? (
            data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: "6px" }}>
                <div
                  style={{ fontWeight: 700, fontSize: "8.5pt", color: "white" }}
                >
                  {edu.degree || (
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>
                      Degree
                    </span>
                  )}
                </div>
                <div
                  style={{ fontSize: "7.5pt", color: "rgba(255,255,255,0.65)" }}
                >
                  {[edu.school, edu.location].filter(Boolean).join(", ") ||
                    "School"}
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                fontSize: "8pt",
                color: "rgba(255,255,255,0.35)",
                fontStyle: "italic",
              }}
            >
              Education
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          width: contentW,
          padding: "40px 36px 32px 32px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* Summary */}
        <div style={{ marginBottom: "16px" }}>
          <SectionTitle color={palette.primary}>
            Professional Summary
          </SectionTitle>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: "9pt",
              lineHeight: 1.5,
            }}
          >
            {hasSummary ? (
              data.summary
            ) : (
              <Placeholder>
                Professional summary highlighting your career achievements...
              </Placeholder>
            )}
          </p>
        </div>

        <HRule color={palette.accent} marginY={10} />

        {/* Experience */}
        <div style={{ marginBottom: "12px" }}>
          <SectionTitle color={palette.primary}>
            Professional Experience
          </SectionTitle>
          {hasExperience ? (
            <ExperienceBlock data={data} palette={palette} />
          ) : (
            <Placeholder>
              Your professional experience will appear here
            </Placeholder>
          )}
        </div>

        {/* Volunteer */}
        {hasVolunteer && (
          <>
            <HRule color="#d0d0d0" marginY={8} />
            <div>
              <SectionTitle color={palette.primary}>
                Volunteer Experience
              </SectionTitle>
              <VolunteerBlock data={data} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout: Compact (two-column body)
// ---------------------------------------------------------------------------

function CompactLayout(p: ContentProps) {
  const {
    data,
    palette,
    hasName,
    hasContact,
    hasSummary,
    hasSkills,
    hasExperience,
    hasEducation,
    hasVolunteer,
    hasLanguages,
    contactParts,
  } = p;

  return (
    <>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "2px" }}>
        {data.photo && (
          <img
            src={data.photo}
            alt=""
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${palette.accent}`,
              marginBottom: 4,
            }}
          />
        )}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: "22pt",
            fontWeight: 700,
            color: palette.primary,
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "1px",
          }}
        >
          {hasName ? data.name : <Placeholder>Your Name</Placeholder>}
        </h1>
        <div
          style={{
            fontSize: "8.5pt",
            marginTop: "4px",
            color: BODY_COLOR,
            letterSpacing: "0.3px",
          }}
        >
          {hasContact ? (
            contactParts.join("  |  ")
          ) : (
            <Placeholder>Location | Phone | Email</Placeholder>
          )}
        </div>
      </div>

      <HRule color={palette.accent} marginY={8} />

      {/* SUMMARY (full width) */}
      {(hasSummary || true) && (
        <div style={{ marginBottom: "10px" }}>
          <SectionTitle color={palette.primary}>
            Professional Summary
          </SectionTitle>
          <p
            style={{
              margin: 0,
              textAlign: "justify",
              fontSize: "9pt",
              lineHeight: 1.45,
            }}
          >
            {hasSummary ? (
              data.summary
            ) : (
              <Placeholder>
                Professional summary highlighting your career achievements...
              </Placeholder>
            )}
          </p>
        </div>
      )}

      <HRule color="#d0d0d0" marginY={6} />

      {/* TWO-COLUMN BODY */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Left column: Experience */}
        <div>
          <SectionTitle color={palette.primary}>Experience</SectionTitle>
          {hasExperience ? (
            data.experience.map((job, idx) => (
              <div
                key={job.id}
                style={{
                  marginBottom: idx < data.experience.length - 1 ? "8px" : "0",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "9.5pt",
                    color: palette.primary,
                  }}
                >
                  {job.title || <Placeholder>Job Title</Placeholder>}
                </div>
                <div
                  style={{
                    fontSize: "8pt",
                    color: palette.accent,
                    fontWeight: 600,
                    marginBottom: "1px",
                  }}
                >
                  {[job.company, job.location].filter(Boolean).join(", ") || (
                    <Placeholder>Company</Placeholder>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "7.5pt",
                    color: "#888",
                    fontStyle: "italic",
                    marginBottom: "2px",
                  }}
                >
                  {[job.startDate, job.endDate].filter(Boolean).join(" – ")}
                </div>
                {job.bullets.length > 0 && (
                  <ul
                    style={{
                      margin: "1px 0 0 0",
                      paddingLeft: "12px",
                      listStyleType: "square",
                    }}
                  >
                    {job.bullets
                      .filter((b) => b.trim().length > 0)
                      .map((bullet, bi) => (
                        <li
                          key={bi}
                          style={{
                            fontSize: "8pt",
                            lineHeight: 1.4,
                            marginBottom: "1px",
                            color: BODY_COLOR,
                          }}
                        >
                          {bullet}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))
          ) : (
            <Placeholder>Experience will appear here</Placeholder>
          )}
        </div>

        {/* Right column: Skills, Education, Volunteer, Languages */}
        <div>
          {/* Skills */}
          <div style={{ marginBottom: "10px" }}>
            <SectionTitle color={palette.primary}>
              Core Competencies
            </SectionTitle>
            {hasSkills ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {data.skills.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      background: `${palette.primary}15`,
                      color: palette.primary,
                      fontSize: "7.5pt",
                      padding: "2px 7px",
                      borderRadius: "3px",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <Placeholder>Skills</Placeholder>
            )}
          </div>

          {/* Education */}
          <div style={{ marginBottom: "10px" }}>
            <SectionTitle color={palette.primary}>Education</SectionTitle>
            {hasEducation ? (
              <EducationBlock data={data} palette={palette} />
            ) : (
              <Placeholder>Education</Placeholder>
            )}
          </div>

          {/* Volunteer */}
          {hasVolunteer && (
            <div style={{ marginBottom: "10px" }}>
              <SectionTitle color={palette.primary}>Volunteer</SectionTitle>
              <VolunteerBlock data={data} />
            </div>
          )}

          {/* Languages */}
          <div>
            <SectionTitle color={palette.primary}>Languages</SectionTitle>
            {hasLanguages ? (
              <LanguagesBlock data={data} />
            ) : (
              <Placeholder>Languages</Placeholder>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Layout: Executive (bold header band)
// ---------------------------------------------------------------------------

function ExecutiveLayout(p: ContentProps) {
  const {
    data,
    palette,
    hasName,
    hasContact,
    hasSummary,
    hasSkills,
    hasExperience,
    hasEducation,
    hasVolunteer,
    hasLanguages,
    contactParts,
  } = p;

  return (
    <div style={{ margin: "-54px -54px -42px", height: "100%" }}>
      {/* FULL-WIDTH DARK HEADER */}
      <div
        style={{
          background: palette.headerBg,
          padding: "36px 54px 28px",
          textAlign: "center",
        }}
      >
        {data.photo && (
          <img
            src={data.photo}
            alt=""
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              objectFit: "cover",
              border: `2px solid ${palette.accent}`,
              marginBottom: 8,
            }}
          />
        )}
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: "28pt",
            fontWeight: 700,
            color: "white",
            margin: 0,
            lineHeight: 1.15,
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          {hasName ? (
            data.name
          ) : (
            <span style={{ color: "rgba(255,255,255,0.4)" }}>Your Name</span>
          )}
        </h1>
        <div
          style={{
            fontSize: "9pt",
            marginTop: "8px",
            color: palette.accent,
            letterSpacing: "1px",
          }}
        >
          {hasContact ? (
            contactParts.join("   |   ")
          ) : (
            <span style={{ color: "rgba(255,255,255,0.4)" }}>
              Location | Phone | Email
            </span>
          )}
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "24px 54px 36px" }}>
        {/* Summary */}
        <div style={{ marginBottom: "16px" }}>
          <SectionTitle
            color={palette.primary}
            style={{
              fontSize: "12pt",
              borderBottom: `2px solid ${palette.accent}`,
              paddingBottom: "4px",
            }}
          >
            Professional Summary
          </SectionTitle>
          <p
            style={{
              margin: "8px 0 0",
              textAlign: "justify",
              fontSize: "10pt",
              lineHeight: 1.55,
            }}
          >
            {hasSummary ? (
              data.summary
            ) : (
              <Placeholder>
                Professional summary highlighting your career achievements, key
                strengths, and value proposition...
              </Placeholder>
            )}
          </p>
        </div>

        {/* Skills */}
        <div style={{ marginBottom: "14px" }}>
          <SectionTitle
            color={palette.primary}
            style={{
              fontSize: "12pt",
              borderBottom: `2px solid ${palette.accent}`,
              paddingBottom: "4px",
            }}
          >
            Core Competencies
          </SectionTitle>
          <div style={{ marginTop: "6px" }}>
            {hasSkills ? (
              <SkillTags data={data} palette={palette} />
            ) : (
              <Placeholder>Add your key skills and competencies</Placeholder>
            )}
          </div>
        </div>

        {/* Experience */}
        <div style={{ marginBottom: "14px" }}>
          <SectionTitle
            color={palette.primary}
            style={{
              fontSize: "12pt",
              borderBottom: `2px solid ${palette.accent}`,
              paddingBottom: "4px",
            }}
          >
            Professional Experience
          </SectionTitle>
          <div style={{ marginTop: "6px" }}>
            {hasExperience ? (
              <ExperienceBlock data={data} palette={palette} />
            ) : (
              <Placeholder>
                Your professional experience will appear here
              </Placeholder>
            )}
          </div>
        </div>

        {/* Bottom grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div>
            <SectionTitle
              color={palette.primary}
              style={{
                fontSize: "12pt",
                borderBottom: `2px solid ${palette.accent}`,
                paddingBottom: "4px",
              }}
            >
              Education
            </SectionTitle>
            <div style={{ marginTop: "6px" }}>
              {hasEducation ? (
                <EducationBlock data={data} palette={palette} />
              ) : (
                <Placeholder>Your education will appear here</Placeholder>
              )}
            </div>
          </div>
          <div>
            {hasVolunteer && (
              <div style={{ marginBottom: "10px" }}>
                <SectionTitle
                  color={palette.primary}
                  style={{
                    fontSize: "12pt",
                    borderBottom: `2px solid ${palette.accent}`,
                    paddingBottom: "4px",
                  }}
                >
                  Volunteer Experience
                </SectionTitle>
                <div style={{ marginTop: "6px" }}>
                  <VolunteerBlock data={data} />
                </div>
              </div>
            )}
            <div>
              <SectionTitle
                color={palette.primary}
                style={{
                  fontSize: "12pt",
                  borderBottom: `2px solid ${palette.accent}`,
                  paddingBottom: "4px",
                }}
              >
                Languages
              </SectionTitle>
              <div style={{ marginTop: "6px" }}>
                {hasLanguages ? (
                  <LanguagesBlock data={data} />
                ) : (
                  <Placeholder>Languages spoken</Placeholder>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ResumePreview({ data }: { data: ResumeData }) {
  const palette = getPalette(data.paletteId);
  const layout = getLayout(data.layoutId);
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const recalcScale = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    setScale(containerWidth / PAPER_W);
  }, []);

  useEffect(() => {
    recalcScale();

    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => recalcScale());
    observer.observe(el);
    return () => observer.disconnect();
  }, [recalcScale]);

  // Check for overflow
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;
    setIsOverflowing(el.scrollHeight > el.clientHeight);
  });

  // ------ derived booleans for placeholders ------
  const hasName = data.name.trim().length > 0;
  const hasContact =
    data.location.trim() || data.phone.trim() || data.email.trim();
  const hasSummary = data.summary.trim().length > 0;
  const hasSkills = data.skills.length > 0;
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const hasVolunteer = data.volunteer.length > 0;
  const hasLanguages = data.languages.length > 0;

  // Contact pieces
  const contactParts: string[] = [];
  if (data.location.trim()) contactParts.push(data.location.trim());
  if (data.phone.trim()) contactParts.push(data.phone.trim());
  if (data.email.trim()) contactParts.push(data.email.trim());

  const contentProps: ContentProps = {
    data,
    palette,
    hasName,
    hasContact: !!hasContact,
    hasSummary,
    hasSkills,
    hasExperience,
    hasEducation,
    hasVolunteer,
    hasLanguages,
    contactParts,
  };

  function renderContent() {
    switch (layout.id) {
      case "modern":
        return <ModernLayout {...contentProps} />;
      case "compact":
        return <CompactLayout {...contentProps} />;
      case "executive":
        return <ExecutiveLayout {...contentProps} />;
      default:
        return <ClassicLayout {...contentProps} />;
    }
  }

  // Modern layout uses negative margins to fill the paper, so no padding on paper
  const isModern = layout.id === "modern";
  const isExecutive = layout.id === "executive";
  const noPadding = isModern || isExecutive;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflow: "hidden",
        position: "relative",
        height: `${PAPER_H * scale}px`,
      }}
    >
      {/* Paper */}
      <div
        ref={paperRef}
        id="resume-preview"
        style={{
          width: `${PAPER_W}px`,
          height: `${PAPER_H}px`,
          background: "#ffffff",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          padding: noPadding ? "54px 54px 42px" : "54px 54px 42px",
          boxSizing: "border-box",
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
          fontSize: "9.5pt",
          lineHeight: 1.45,
          color: BODY_COLOR,
          overflow: "visible",
        }}
      >
        {renderContent()}
      </div>
      {isOverflowing && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 16px",
            backgroundColor: "#fef3cd",
            border: "1px solid #ffc107",
            borderRadius: 4,
            fontSize: "0.8rem",
            color: "#856404",
            textAlign: "center",
          }}
        >
          ⚠ Your resume exceeds one page. Consider trimming content for best
          results.
        </div>
      )}
    </div>
  );
}
