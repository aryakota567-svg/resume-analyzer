
import { extractSkills } from "./analyzeResume";

export const matchJobDescription = (resumeText, jobDescription) => {
  if (!resumeText || !jobDescription.trim()) {
    throw new Error("Please provide both resume text and job description.");
  }

  // Detect skills in both documents
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobDescription);

  // Find matching skills
  const matchedSkills = jobSkills.filter((skill) =>
    resumeSkills.some(
      (resumeSkill) =>
        resumeSkill.toLowerCase() === skill.toLowerCase()
    )
  );

  // Find missing skills
  const missingSkills = jobSkills.filter(
    (skill) =>
      !matchedSkills.some(
        (matchedSkill) =>
          matchedSkill.toLowerCase() === skill.toLowerCase()
      )
  );

  // Calculate job match score
  const matchScore =
    jobSkills.length > 0
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 0;

  // Generate recommendations
  const recommendations = [];

  if (missingSkills.length > 0) {
    recommendations.push(
      `Consider highlighting relevant experience with: ${missingSkills.join(", ")}.`
    );
  }

  if (matchedSkills.length > 0) {
    recommendations.push(
      `Your resume already demonstrates ${matchedSkills.length} of the detected job skills.`
    );
  }

  if (jobSkills.length === 0) {
    recommendations.push(
      "No recognized technical skills were detected in the job description. Try including its technical requirements."
    );
  }

  let matchLabel = "Low Match";

  if (matchScore >= 80) {
    matchLabel = "Excellent Match";
  } else if (matchScore >= 60) {
    matchLabel = "Good Match";
  } else if (matchScore >= 40) {
    matchLabel = "Moderate Match";
  }

  return {
    matchScore,
    matchLabel,
    resumeSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
    recommendations
  };
};
