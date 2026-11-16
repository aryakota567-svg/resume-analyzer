
export const SKILLS_LIST = [
  "HTML", "CSS", "JavaScript", "React", "React.js",
  "Python", "Java", "C", "C++", "SQL", "MySQL",
  "MongoDB", "Node.js", "Express", "Django", "Flask",
  "Bootstrap", "Tailwind CSS", "Git", "GitHub",
  "REST API", "REST APIs", "AWS", "Excel",
  "Machine Learning", "Data Analysis", "TypeScript",
  "Next.js", "Firebase", "PostgreSQL"
];

const SECTION_PATTERNS = {
  contact: /email|phone|mobile|linkedin|github/i,
  summary: /summary|objective|profile|about me/i,
  education: /education|academic|qualification/i,
  experience: /experience|employment|internship|work history/i,
  skills: /skills|technical skills|technologies|competencies/i,
  projects: /projects|personal projects|academic projects/i,
  certifications: /certifications|certificates|courses/i
};

const ACTION_VERBS = [
  "developed", "created", "designed", "implemented",
  "managed", "built", "improved", "optimized",
  "analyzed", "led", "achieved", "automated",
  "collaborated", "delivered", "tested", "maintained"
];

// Detect skills in resume
export const extractSkills = (text) => {
  const lowerText = text.toLowerCase();

  return SKILLS_LIST.filter((skill) => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const regex = new RegExp(
      `(^|[^a-z0-9])${escaped.toLowerCase()}(?=[^a-z0-9]|$)`,
      "i"
    );

    return regex.test(lowerText);
  });
};

// Detect resume sections
const detectSections = (text) => {
  const sections = {};

  Object.entries(SECTION_PATTERNS).forEach(([section, pattern]) => {
    sections[section] = pattern.test(text);
  });

  return sections;
};

// Count action verbs
const countActionVerbs = (text) => {
  const lowerText = text.toLowerCase();

  return ACTION_VERBS.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(lowerText)
  ).length;
};

// Main ATS analysis function
export const analyzeResume = (text) => {
  if (!text || !text.trim()) {
    throw new Error("Resume text is empty.");
  }

  const sections = detectSections(text);
  const skills = extractSkills(text);

  const wordCount = text.trim().split(/\s+/).length;

  const hasEmail =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);

  const hasPhone =
    /(\+?\d[\d\s().-]{7,}\d)/.test(text);

  const hasLinkedIn = /linkedin\.com/i.test(text);
  const hasGitHub = /github\.com/i.test(text);

  const hasNumbers = /\b\d+%|\b\d+\+|\b\d+\s*(users|clients|projects|years)/i.test(text);

  const actionVerbCount = countActionVerbs(text);

  // Score breakdown
  const breakdown = {
    contact: (
      (hasEmail ? 5 : 0) +
      (hasPhone ? 5 : 0)
    ),

    sections: Object.values(sections).filter(Boolean).length * 4,

    skills: Math.min(skills.length * 2, 20),

    content: Math.min(Math.floor(wordCount / 15), 15),

    impact: (
      (hasNumbers ? 10 : 0) +
      Math.min(actionVerbCount * 2, 10)
    ),

    links: (
      (hasLinkedIn ? 5 : 0) +
      (hasGitHub ? 5 : 0)
    )
  };

  const totalScore = Math.min(
    Object.values(breakdown).reduce((total, value) => total + value, 0),
    100
  );

  // Suggestions
  const suggestions = [];

  if (!hasEmail) {
    suggestions.push("Add a professional email address.");
  }

  if (!hasPhone) {
    suggestions.push("Include your contact phone number.");
  }

  if (!sections.summary) {
    suggestions.push("Add a professional summary or career objective.");
  }

  if (!sections.education) {
    suggestions.push("Include your educational qualifications.");
  }

  if (!sections.skills) {
    suggestions.push("Add a dedicated technical skills section.");
  }

  if (!sections.projects && !sections.experience) {
    suggestions.push("Include relevant projects, internships, or work experience.");
  }

  if (skills.length < 5) {
    suggestions.push("Highlight more relevant technical skills.");
  }

  if (!hasNumbers) {
    suggestions.push("Add measurable achievements and project results.");
  }

  if (!hasLinkedIn) {
    suggestions.push("Consider adding your LinkedIn profile.");
  }

  if (!hasGitHub) {
    suggestions.push("Add your GitHub profile to showcase your projects.");
  }

  if (actionVerbCount < 3) {
    suggestions.push("Use stronger action verbs to describe your work.");
  }

  if (wordCount < 100) {
    suggestions.push("Your resume may be too short. Add more relevant details.");
  }

  if (wordCount > 1000) {
    suggestions.push("Consider making your resume more concise.");
  }

  // Score interpretation
  let scoreLabel = "Needs Improvement";

  if (totalScore >= 80) {
    scoreLabel = "Excellent";
  } else if (totalScore >= 65) {
    scoreLabel = "Good";
  } else if (totalScore >= 45) {
    scoreLabel = "Average";
  }

  return {
    score: totalScore,
    scoreLabel,
    breakdown,
    skills,
    sections,
    wordCount,
    actionVerbCount,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasGitHub,
    suggestions
  };
};
