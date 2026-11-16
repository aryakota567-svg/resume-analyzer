
import React, { useState } from "react";

import ResumeUpload from "./components/ResumeUpload";
import JobMatcher from "./components/JobMatcher";

import { extractResumeText } from "./utils/extractText";
import { analyzeResume } from "./utils/analyzeResume";
import { matchJobDescription } from "./utils/jobMatcher";


import {
  LayoutDashboard,
  FileText,
  Target,
  BriefcaseBusiness,
  Lightbulb,
  Moon,
  Sun,
  Sparkles,
  Download,
} from "lucide-react";

import { jsPDF } from "jspdf";

import "./App.css";

const App = () => {

  // THEME STATE
  const [dark, setDark] = useState(true);

  // RESUME STATES
  const [resumeText, setResumeText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);

  // JOB MATCHING STATES
  const [jobResult, setJobResult] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState("");

  // IMPROVEMENT CHECKLIST STATE
  const [completedSuggestions, setCompletedSuggestions] = useState([]);

  // RESET CHECKLIST
  const resetChecklist = () => {
    setCompletedSuggestions([]);
  };

  // TOGGLE CHECKLIST ITEM
  const toggleSuggestion = (index) => {
    setCompletedSuggestions((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    );
  };

  // RESUME UPLOAD AND TEXT EXTRACTION
  const handleFileSelect = async (file) => {

    if (!file) {
      setResumeText("");
      setAnalysisResult(null);
      setJobResult(null);
      setExtractionError("");
      setJobError("");
      resetChecklist();
      return;
    }

    try {
      setExtracting(true);

      setExtractionError("");
      setAnalysisResult(null);
      setJobResult(null);
      setJobError("");
      setResumeText("");
      resetChecklist();

      // Extract text only. Do not analyze yet.
      const extractedText = await extractResumeText(file);

      if (!extractedText.trim()) {
        throw new Error(
          "No readable text found in this resume."
        );
      }

      setResumeText(extractedText);

    } catch (error) {

      setExtractionError(
        error.message || "Unable to read your resume."
      );

    } finally {
      setExtracting(false);
    }
  };


  // JOB DESCRIPTION AND RESUME ANALYSIS
  const handleJobAnalysis = async (jobDescription) => {

    try {
      setJobLoading(true);

      setJobError("");
      setAnalysisResult(null);
      setJobResult(null);
      resetChecklist();

      if (!resumeText) {
        throw new Error("Please upload your resume first.");
      }

      if (!jobDescription.trim()) {
        throw new Error("Please enter a job description.");
      }

      // Small delay to allow the loading state to appear
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Analyze resume only after clicking Analyze
      const resumeResult = analyzeResume(resumeText);

      // Match resume with job description
      const matchResult = matchJobDescription(
        resumeText,
        jobDescription
      );

      setAnalysisResult(resumeResult);
      setJobResult(matchResult);

    } catch (error) {

      setAnalysisResult(null);
      setJobResult(null);

      setJobError(
        error.message || "Something went wrong during analysis."
      );

    } finally {
      setJobLoading(false);
    }
  };


  // DOWNLOAD TEXT REPORT
  const handleDownloadReport = () => {

    if (!analysisResult || !jobResult) return;

    const report = `
========================================
         RESUME ANALYSIS REPORT
========================================

ATS RESUME SCORE
Score: ${analysisResult.score}/100
Rating: ${analysisResult.scoreLabel || "Analysis completed"}

JOB MATCH RESULTS
Match Score: ${jobResult.matchScore}%
Match Rating: ${jobResult.matchLabel || "Analysis completed"}

----------------------------------------
MATCHED SKILLS
----------------------------------------
${
  jobResult.matchedSkills?.length
    ? jobResult.matchedSkills.join(", ")
    : "No matched skills found."
}

----------------------------------------
MISSING SKILLS
----------------------------------------
${
  jobResult.missingSkills?.length
    ? jobResult.missingSkills.join(", ")
    : "No missing skills found."
}

----------------------------------------
RESUME STATISTICS
----------------------------------------
Word Count: ${analysisResult.wordCount}
Action Verbs: ${analysisResult.actionVerbCount}
Email Found: ${analysisResult.hasEmail ? "Yes" : "No"}
Phone Found: ${analysisResult.hasPhone ? "Yes" : "No"}
LinkedIn Found: ${analysisResult.hasLinkedIn ? "Yes" : "No"}
GitHub Found: ${analysisResult.hasGitHub ? "Yes" : "No"}

----------------------------------------
IMPROVEMENT SUGGESTIONS
----------------------------------------
${
  analysisResult.suggestions?.length
    ? analysisResult.suggestions.map((item, index) =>
        `${index + 1}. ${item}`
      ).join("\n")
    : "No suggestions available."
}

----------------------------------------
JOB MATCH RECOMMENDATIONS
----------------------------------------
${
  jobResult.recommendations?.length
    ? jobResult.recommendations.map((item, index) =>
        `${index + 1}. ${item}`
      ).join("\n")
    : "No recommendations available."
}

========================================
          Generated by ResumeIQ
========================================
`;

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ResumeIQ-Analysis-Report.txt";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  // DOWNLOAD PDF REPORT
  const handleDownloadPdf = () => {

    if (!analysisResult || !jobResult) return;

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 18;
    const contentWidth = pageWidth - margin * 2;

    let y = 20;

    const addHeading = (heading) => {

      y += 5;

      if (y > pageHeight - 25) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);

      doc.text(heading, margin, y);

      y += 8;
    };

    const addText = (value) => {

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(55, 65, 81);

      const lines = doc.splitTextToSize(
        String(value || "Not available"),
        contentWidth
      );

      lines.forEach((line) => {

        if (y > pageHeight - 18) {
          doc.addPage();
          y = 20;
        }

        doc.text(line, margin, y);
        y += 6;

      });
    };


    // PDF HEADER
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(23);
    doc.setTextColor(255, 255, 255);

    doc.text("ResumeIQ", margin, 18);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    doc.text("Resume Analysis Report", margin, 29);

    y = 52;


    // ATS SCORE
    addHeading("ATS RESUME SCORE");

    addText(
      `${analysisResult.score}/100 - ${analysisResult.scoreLabel || ""}`
    );


    // JOB MATCH SCORE
    addHeading("JOB MATCH SCORE");

    addText(
      `${jobResult.matchScore}% - ${jobResult.matchLabel || ""}`
    );


    // MATCHED SKILLS
    addHeading("MATCHED SKILLS");

    addText(
      jobResult.matchedSkills?.length
        ? jobResult.matchedSkills.join(", ")
        : "No matched skills found."
    );


    // MISSING SKILLS
    addHeading("MISSING SKILLS");

    addText(
      jobResult.missingSkills?.length
        ? jobResult.missingSkills.join(", ")
        : "No missing skills found."
    );


    // RESUME STATISTICS
    addHeading("RESUME STATISTICS");

    addText(`Word Count: ${analysisResult.wordCount}`);
    addText(`Action Verbs: ${analysisResult.actionVerbCount}`);
    addText(`Email Found: ${analysisResult.hasEmail ? "Yes" : "No"}`);
    addText(`Phone Found: ${analysisResult.hasPhone ? "Yes" : "No"}`);
    addText(`LinkedIn Found: ${analysisResult.hasLinkedIn ? "Yes" : "No"}`);
    addText(`GitHub Found: ${analysisResult.hasGitHub ? "Yes" : "No"}`);


    // IMPROVEMENT SUGGESTIONS
    addHeading("IMPROVEMENT SUGGESTIONS");

    (analysisResult.suggestions || []).forEach((item, index) => {
      addText(`${index + 1}. ${item}`);
    });


    // JOB MATCH RECOMMENDATIONS
    addHeading("JOB MATCH RECOMMENDATIONS");

    (jobResult.recommendations || []).forEach((item, index) => {
      addText(`${index + 1}. ${item}`);
    });


    // CHECKLIST PROGRESS
    addHeading("IMPROVEMENT CHECKLIST PROGRESS");

    addText(
      `Completed: ${completedSuggestions.length} / ${
        analysisResult.suggestions?.length || 0
      }`
    );


    // PDF FOOTER ON EVERY PAGE
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {

      doc.setPage(i);

      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);

      doc.text(
        "Generated by ResumeIQ",
        margin,
        pageHeight - 10
      );

      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: "right" }
      );

    }

    doc.save("ResumeIQ-Analysis-Report.pdf");
  };


  return (

    <div className={`app ${dark ? "dark" : "light"}`}>

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="brand">

          

         <div className="brand-logo">
  <div className="brand-icon">
   <Sparkles size={30} strokeWidth={2.4} />
  </div>

  <div className="brand-text">
    <h2>SkillSync</h2>
    <span>SMART CAREER ANALYZER</span>
  </div>
</div>
        </div>

        <p className="menu-title">MAIN MENU</p>

        <a href="#dashboard" className="nav-item active">
          <LayoutDashboard />
          Dashboard
        </a>

        <a href="#analyzer" className="nav-item">
          <FileText />
          Resume Analyzer
        </a>

        <a href="#ats" className="nav-item">
          <Target />
          ATS Score
        </a>

        <a href="#jobs" className="nav-item">
          <BriefcaseBusiness />
          Job Matching
        </a>

        <a href="#suggestions" className="nav-item">
          <Lightbulb />
          Suggestions
        </a>


        <div className="sidebar-bottom">

          <div className="sidebar-card">
            <Sparkles />

            <h4>Build your career</h4>

            <p>Make your resume stand out.</p>
          </div>

          <div className="profile">

            <div className="avatar">R</div>

            <div>
              <h4>Resume User</h4>
              <p>Free workspace</p>
            </div>

          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <main className="main-content" id="dashboard">


        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <p className="breadcrumb">
              Workspace / Dashboard
            </p>

            <h2>Resume Dashboard</h2>

          </div>

          <button
            className="theme-btn"
            onClick={() => setDark(!dark)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun /> : <Moon />}
          </button>

        </header>


        {/* WELCOME SECTION */}

        <section className="welcome-section">

          <div>

            <span className="welcome-tag">
              <Sparkles size={15} />
              AI POWERED RESUME INTELLIGENCE
            </span>

            <h1>
              Make your resume <span>stand out.</span>
            </h1>

            <p>
              Analyze your resume, discover opportunities
              and get closer to your dream job.
            </p>

          </div>

          <div className="welcome-icon">
            <FileText size={65} />
          </div>

        </section>


        {/* RESUME UPLOAD */}

        <div id="analyzer">

          <ResumeUpload
            onFileSelect={handleFileSelect}
          />

        </div>


        {/* RESUME EXTRACTION LOADING */}

        {extracting && (

          <div className="extraction-status">

            <span className="extraction-spinner"></span>

            <p>Reading your resume...</p>

          </div>

        )}


        {/* RESUME EXTRACTION ERROR */}

        {extractionError && (

          <div className="extraction-error">
            {extractionError}
          </div>

        )}


        {/* EXTRACTED RESUME TEXT */}

        {resumeText && (

          <div className="extracted-resume">

            <h3>Resume Text Extracted Successfully</h3>

            <p>
              Your resume is ready. Now paste a job description
              below to start the analysis.
            </p>

            <div className="resume-text-preview">
              {resumeText.slice(0, 1500)}
            </div>

            <p className="resume-character-count">
              Total characters: {resumeText.length}
            </p>

          </div>

        )}


        {/* JOB DESCRIPTION MATCHER */}

        {resumeText && (

          <div id="jobs">

            <JobMatcher
              onAnalyze={handleJobAnalysis}
              loading={jobLoading}
            />

          </div>

        )}


        {/* JOB MATCHING ERROR */}

        {jobError && (

          <div className="error-message">
            {jobError}
          </div>

        )}


        {/* ANALYSIS RESULTS */}

        {analysisResult && (

          <div className="analysis-results" id="ats">


            {/* RESULTS HEADING */}

            <div className="results-heading">

              <h2>Resume Analysis Results</h2>

              <p>
                Here's how your resume performs in our ATS-style review.
              </p>

            </div>


            {/* DOWNLOAD BUTTONS */}

            <div className="download-buttons-container">

              <button
                className="download-report-btn"
                onClick={handleDownloadReport}
                type="button"
              >
                <Download size={18} />
                Download Analysis Report
              </button>


              <button
                className="download-report-btn"
                onClick={handleDownloadPdf}
                type="button"
              >
                <Download size={18} />
                Download PDF Report
              </button>

            </div>


            {/* ATS SCORE */}

            <div className="ats-score-card">

              <div
                className="score-circle"
                style={{
                  "--score": analysisResult.score
                }}
              >

                <h1>{analysisResult.score}</h1>

                <span>/100</span>

              </div>

              <div className="score-details">

                <h3>{analysisResult.scoreLabel}</h3>

                <p>
                  Your resume's estimated ATS readiness score.
                </p>

              </div>

            </div>


            {/* JOB MATCH RESULTS */}

            {jobResult && (

              <div className="job-results-section">

                <div className="results-heading">

                  <h2>Job Compatibility Results</h2>

                  <p>
                    Here's how your resume matches this job description.
                  </p>

                </div>


                {/* JOB MATCH PERCENTAGE CIRCLE */}

                <div className="job-match-score-card">

                  <div
                    className="job-match-circle"
                    style={{
                      "--match-score": jobResult.matchScore
                    }}
                  >

                    <div className="job-match-circle-inner">

                      <h1>{jobResult.matchScore}%</h1>

                      <span>Match</span>

                    </div>

                  </div>

                  <div className="job-match-details">

                    <h3>{jobResult.matchLabel}</h3>

                    <p>
                      Your resume matches{" "}
                      {jobResult.matchedSkills.length} out of{" "}
                      {jobResult.jobSkills.length} detected job skills.
                    </p>

                  </div>

                </div>


                {/* SKILLS COMPARISON CHART */}

                <div className="skills-chart-section">

                  <div className="skills-chart-heading">

                    <h2>Skills Match Overview</h2>

                    <p>
                      See how your resume matches the job requirements.
                    </p>

                  </div>

                  {(() => {

                    const matched =
                      jobResult.matchedSkills?.length || 0;

                    const missing =
                      jobResult.missingSkills?.length || 0;

                    const total = matched + missing;

                    const matchedPercentage = total
                      ? (matched / total) * 100
                      : 0;

                    const missingPercentage = total
                      ? (missing / total) * 100
                      : 0;

                    return (

                      <>

                        <div className="skills-chart-bar">

                          <div className="skills-chart-label">

                            <span>Matched Skills</span>

                            <strong>{matched} Skills</strong>

                          </div>

                          <div className="skills-chart-track">

                            <div
                              className="skills-chart-fill matched-fill"
                              style={{
                                width: `${matchedPercentage}%`
                              }}
                            />

                          </div>

                        </div>


                        <div className="skills-chart-bar">

                          <div className="skills-chart-label">

                            <span>Missing Skills</span>

                            <strong>{missing} Skills</strong>

                          </div>

                          <div className="skills-chart-track">

                            <div
                              className="skills-chart-fill missing-fill"
                              style={{
                                width: `${missingPercentage}%`
                              }}
                            />

                          </div>

                        </div>


                        <div className="skills-chart-legend">

                          <span>
                            <i className="legend-matched" />
                            Matched: {matchedPercentage.toFixed(1)}%
                          </span>

                          <span>
                            <i className="legend-missing" />
                            Missing: {missingPercentage.toFixed(1)}%
                          </span>

                        </div>

                      </>

                    );

                  })()}

                </div>


                {/* MATCHED SKILLS */}

                <div className="job-skills-card">

                  <h3>
                    <span className="match-icon">✓</span>
                    Matched Skills ({jobResult.matchedSkills.length})
                  </h3>

                  <div className="job-skills-list">

                    {jobResult.matchedSkills.length > 0 ? (

                      jobResult.matchedSkills.map((skill, index) => (

                        <span
                          className="matched-skill"
                          key={index}
                        >
                          ✓ {skill}
                        </span>

                      ))

                    ) : (

                      <p>No matching skills detected.</p>

                    )}

                  </div>

                </div>


                {/* MISSING SKILLS */}

                <div className="job-skills-card">

                  <h3>
                    <span className="missing-icon">!</span>
                    Missing Skills ({jobResult.missingSkills.length})
                  </h3>

                  <div className="job-skills-list">

                    {jobResult.missingSkills.length > 0 ? (

                      jobResult.missingSkills.map((skill, index) => (

                        <span
                          className="missing-skill"
                          key={index}
                        >
                          + {skill}
                        </span>

                      ))

                    ) : (

                      <p>
                        Excellent! All detected job skills are present.
                      </p>

                    )}

                  </div>

                </div>


                {/* PERSONALIZED RECOMMENDATIONS */}

                <div className="job-skills-card">

                  <h3>Personalized Recommendations</h3>

                  <ul className="job-recommendations">

                    {(jobResult.recommendations || []).map(
                      (recommendation, index) => (

                        <li key={index}>
                          {recommendation}
                        </li>

                      )
                    )}

                  </ul>

                </div>

              </div>

            )}


            {/* RESUME STATISTICS */}

            <div className="analysis-stats">

              <div className="analysis-stat-card">

                <h2>{analysisResult.skills.length}</h2>

                <p>Skills Detected</p>

              </div>

              <div className="analysis-stat-card">

                <h2>{analysisResult.wordCount}</h2>

                <p>Total Words</p>

              </div>

              <div className="analysis-stat-card">

                <h2>{analysisResult.actionVerbCount}</h2>

                <p>Action Verbs</p>

              </div>

            </div>


            {/* DETECTED TECHNICAL SKILLS */}

            <div className="analysis-content-card">

              <h3>Technical Skills Detected</h3>

              <div className="skills-list">

                {analysisResult.skills.length > 0 ? (

                  analysisResult.skills.map((skill, index) => (

                    <span
                      className="skill-tag"
                      key={index}
                    >
                      {skill}
                    </span>

                  ))

                ) : (

                  <p>No matching skills detected.</p>

                )}

              </div>

            </div>


            {/* IMPROVEMENT SUGGESTIONS */}

            <div
              className="analysis-content-card"
              id="suggestions"
            >

              <h3>Improvement Suggestions</h3>

              {analysisResult.suggestions.length > 0 ? (

                <ul className="suggestions-list">

                  {analysisResult.suggestions.map(
                    (suggestion, index) => (

                      <li key={index}>
                        {suggestion}
                      </li>

                    )
                  )}

                </ul>

              ) : (

                <p>
                  Great! No major suggestions from this initial review.
                </p>

              )}

            </div>


            {/* RESUME IMPROVEMENT CHECKLIST */}

            <div className="improvement-checklist">

              <div className="checklist-heading">

                <div>

                  <h2>Resume Improvement Checklist</h2>

                  <p>
                    Complete these actions to improve your resume.
                  </p>

                </div>

                <div className="checklist-progress">

                  {completedSuggestions.length}/
                  {analysisResult.suggestions?.length || 0}

                </div>

              </div>


              {analysisResult.suggestions?.length > 0 ? (

                <>

                  {/* CHECKLIST PROGRESS BAR */}

                  <div className="checklist-progress-track">

                    <div
                      className="checklist-progress-fill"
                      style={{
                        width: `${
                          (completedSuggestions.length /
                            analysisResult.suggestions.length) *
                          100
                        }%`
                      }}
                    />

                  </div>


                  {/* CHECKLIST ITEMS */}

                  <div className="checklist-items">

                    {analysisResult.suggestions.map(
                      (suggestion, index) => (

                        <label
                          className={`checklist-item ${
                            completedSuggestions.includes(index)
                              ? "completed"
                              : ""
                          }`}
                          key={index}
                        >

                          <input
                            type="checkbox"
                            checked={completedSuggestions.includes(index)}
                            onChange={() => toggleSuggestion(index)}
                          />

                          <span className="custom-checkmark">

                            {completedSuggestions.includes(index)
                              ? "✓"
                              : ""}

                          </span>

                          <span className="checklist-text">

                            {suggestion}

                          </span>

                        </label>

                      )
                    )}

                  </div>


                  {/* CHECKLIST COMPLETION MESSAGE */}

                  <p className="checklist-footer">

                    {completedSuggestions.length ===
                    analysisResult.suggestions.length

                      ? "Great job! You completed all improvements."

                      : "Keep going! Every improvement makes your resume stronger."

                    }

                  </p>

                </>

              ) : (

                <p>
                  No improvement suggestions available.
                </p>

              )}

            </div>


          </div>

        )}

      </main>

    </div>

  );

};

export default App;
