
import React, { useState } from "react";
import {
  BriefcaseBusiness,
  Sparkles,
  Trash2,
  FileSearch,
  LoaderCircle,
} from "lucide-react";

const JobMatcher = ({ onAnalyze, loading }) => {

  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!jobDescription.trim() || loading) {
      return;
    }

    onAnalyze(jobDescription);
  };

  const handleClear = () => {
    setJobDescription("");
  };

  const wordCount = jobDescription
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (

    <section className="job-matcher-section">

      {/* HEADING */}

      <div className="job-matcher-heading">

        <div className="job-heading-icon">
          <BriefcaseBusiness size={24} />
        </div>

        <div>
          <h2>Job Description Matcher</h2>

          <p>
            Compare your resume with your dream job requirements.
          </p>
        </div>

      </div>


      {/* FORM */}

      <form onSubmit={handleSubmit}>

        <label htmlFor="jobDescription">
          Paste Job Description
        </label>

        <textarea
          id="jobDescription"
          className="job-description-input"
          placeholder="Paste the complete job description here...

Example:
We are looking for a Python Full Stack Developer with knowledge of Python, React.js, JavaScript, HTML, CSS, SQL and REST APIs..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={loading}
          rows={9}
        />


        {/* WORD COUNT */}

        <div className="job-input-footer">

          <span>
            {wordCount} words
          </span>

          <button
            type="button"
            className="clear-job-btn"
            onClick={handleClear}
            disabled={loading || !jobDescription}
          >
            <Trash2 size={15} />
            Clear
          </button>

        </div>


        {/* ANALYZE BUTTON */}

        <button
          type="submit"
          className="analyze-job-btn"
          disabled={loading || !jobDescription.trim()}
        >

          {loading ? (

            <>
              <LoaderCircle
                size={19}
                className="analyze-spinner"
              />
              Analyzing Your Resume...
            </>

          ) : (

            <>
              <Sparkles size={19} />
              Analyze Job Match
              <FileSearch size={19} />
            </>

          )}

        </button>

      </form>


      {/* HELPER TEXT */}

      <p className="job-matcher-helper">
        <Sparkles size={14} />
        Upload your resume first, then paste a job description
        to get your personalized results.
      </p>

    </section>

  );

};

export default JobMatcher;
