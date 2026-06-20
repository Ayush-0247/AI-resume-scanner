import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Sends resume text and Job Description to Gemini for deep analysis.
 * Uses json response constraint for maximum robustness.
 * @param {string} resumeText 
 * @param {string} jdText 
 * @param {string} apiKey 
 * @returns {Promise<object>}
 */
export const analyzeWithGemini = async (resumeText, jdText, apiKey) => {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `You are a professional Application Tracking System (ATS) parsing bot and executive technical recruiter.
Your objective is to analyze the uploaded resume text against the provided job description and evaluate their compatibility.

Analyze the resume for:
1. ATS Score (0-100) based on relevance of roles, keywords, and skill alignment.
2. Skills Analysis: identify specific matched skills and missing skills.
3. Keyword Matching: identify matched keywords and critical missing keywords.
4. Suggestions: generate actionable, high-quality suggestions. Specifically look for weak project bullet points, lack of quantified achievements (missing metrics like %, $, time metrics), keyword alignment, and formatting optimizations.
5. Recruiter Insights: Write a 3-sentence professional recruiter assessment detailing strengths, match level, and primary reasons for this score.

You MUST respond strictly with a JSON object of this format:
{
  "score": 75,
  "skillsAnalysis": {
    "matched": ["React", "JavaScript", "HTML", "CSS"],
    "missing": ["Node.js", "Docker", "AWS"]
  },
  "keywordMatching": {
    "matched": ["Frontend development", "Responsive design", "State management"],
    "missing": ["REST APIs", "Microservices", "CI/CD pipelines"]
  },
  "suggestions": [
    {
      "category": "Quantified Achievements",
      "impact": "High",
      "text": "Add quantitative metrics to your React projects. Instead of saying 'built dashboards', write 'Designed and built React dashboard reducing loading time by 30% and supporting 5k monthly active users'."
    },
    {
      "category": "Skills Gap",
      "impact": "High",
      "text": "Add AWS experience if you have any. The role specifies containerization and AWS deployment which are currently completely absent."
    }
  ],
  "recruiterInsights": "This candidate shows robust frontend credentials with clean React skillsets. However, the lack of backend experience (Node/REST APIs) and cloud deployment skills is a primary bottleneck for this fullstack position. Re-aligning the resume to highlight basic AWS/Docker familiarity will raise screening viability."
}

Resume Text:
${resumeText}

Job Description:
${jdText}
`;

  try {
    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();
    const data = JSON.parse(textResponse);
    
    // Ensure all critical fields exist
    return {
      score: typeof data.score === 'number' ? Math.min(100, Math.max(0, data.score)) : 50,
      skillsAnalysis: {
        matched: Array.isArray(data.skillsAnalysis?.matched) ? data.skillsAnalysis.matched : [],
        missing: Array.isArray(data.skillsAnalysis?.missing) ? data.skillsAnalysis.missing : [],
        found: data.skillsAnalysis?.matched || []
      },
      keywordMatching: {
        matched: Array.isArray(data.keywordMatching?.matched) ? data.keywordMatching.matched : [],
        missing: Array.isArray(data.keywordMatching?.missing) ? data.keywordMatching.missing : [],
        density: [] // Density calculated locally
      },
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      recruiterInsights: typeof data.recruiterInsights === 'string' ? data.recruiterInsights : "Analysis complete.",
      isLocalSuggestions: false
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to analyze resume with Gemini. Please verify your API key and connection.");
  }
};
