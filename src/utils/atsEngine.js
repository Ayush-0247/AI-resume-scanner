// Dictionary of standard keywords and skills to match
const SKILLS_DICTIONARY = [
  'React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'GitHub', 
  'HTML', 'CSS', 'Tailwind', 'REST APIs', 'JWT', 'SQL', 'Python', 'Java', 
  'Docker', 'AWS', 'TypeScript', 'Redux', 'PostgreSQL', 'GraphQL', 'Kubernetes',
  'Next.js', 'Firebase', 'CI/CD', 'Agile', 'Scrum', 'Testing', 'Jest', 'Webpack',
  'Linux', 'NoSQL', 'Cloud', 'DevOps', 'Microservices', 'System Design'
];

const SECTIONS_DICTIONARY = {
  Summary: [/summary/i, /profile/i, /about me/i, /objective/i, /professional summary/i],
  Skills: [/skills/i, /technical skills/i, /core competencies/i, /technologies/i, /expertise/i],
  Education: [/education/i, /academic/i, /university/i, /degree/i],
  Projects: [/projects/i, /personal projects/i, /key projects/i, /applications/i],
  Experience: [/experience/i, /work experience/i, /employment history/i, /professional experience/i, /work history/i],
  Certifications: [/certifications/i, /certificates/i, /credentials/i, /licenses/i]
};

const ACTION_VERBS = [
  'led', 'built', 'designed', 'managed', 'implemented', 'optimized', 'developed', 
  'created', 'achieved', 'improved', 'designed', 'delivered', 'formulated', 
  'architected', 'spearheaded', 'executed', 'analyzed', 'engineered', 'launched',
  'collaborated', 'accelerated', 'decreased', 'increased', 'maximized', 'minimized'
];

/**
 * Normalizes text for better keyword searching.
 * @param {string} text 
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, ' ')
    .replace(/\s+/g, ' ');
};

/**
 * Analyzes resume text against a job description.
 * @param {string} resumeText 
 * @param {string} jdText 
 * @returns {object}
 */
export const analyzeATS = (resumeText, jdText) => {
  const normResume = normalizeText(resumeText);
  const normJd = normalizeText(jdText);
  
  // 1. Resume Section Detection
  const sectionsDetected = [];
  const sectionsMissing = [];
  
  for (const [section, regexes] of Object.entries(SECTIONS_DICTIONARY)) {
    const isFound = regexes.some(regex => regex.test(resumeText));
    if (isFound) {
      sectionsDetected.push(section);
    } else {
      sectionsMissing.push(section);
    }
  }
  
  // 2. Skills Analysis (Specific checklist requested by user)
  const skillsToCheck = [
    'React', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Git', 'GitHub',
    'HTML', 'CSS', 'Tailwind', 'REST APIs', 'JWT', 'SQL', 'Python', 'Java',
    'Docker', 'AWS'
  ];
  
  const skillsFoundInResume = [];
  const skillsFoundInJd = [];
  
  skillsToCheck.forEach(skill => {
    // Escape special characters for regex (e.g. Node.js, REST APIs)
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (regex.test(normResume)) {
      skillsFoundInResume.push(skill);
    }
    if (regex.test(normJd)) {
      skillsFoundInJd.push(skill);
    }
  });
  
  // If JD is empty, default JD skills to a general set or empty
  const jdHasSkills = skillsFoundInJd.length > 0;
  
  const matchedSkills = skillsFoundInResume.filter(skill => skillsFoundInJd.includes(skill));
  const missingSkills = jdHasSkills 
    ? skillsFoundInJd.filter(skill => !skillsFoundInResume.includes(skill))
    : skillsToCheck.filter(skill => !skillsFoundInResume.includes(skill)).slice(0, 5); // Fallback to showing some standard missing skills if no JD
  
  // 3. Keyword Matching & Density
  // Find all dictionary keywords present in the JD. If no JD, use a default set of common developer keywords.
  let targetKeywords = SKILLS_DICTIONARY.filter(keyword => {
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(normJd);
  });
  
  if (targetKeywords.length === 0) {
    // Default fallback if JD has no matches
    targetKeywords = ['React', 'JavaScript', 'Node.js', 'Git', 'HTML', 'CSS', 'SQL'];
  }
  
  const matchedKeywords = [];
  const missingKeywords = [];
  const keywordDensity = [];
  
  const totalWords = resumeText.split(/\s+/).filter(w => w.length > 0).length || 1;
  
  targetKeywords.forEach(keyword => {
    const escaped = keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const matches = normResume.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      matchedKeywords.push(keyword);
      const density = ((count / totalWords) * 100).toFixed(2);
      keywordDensity.push({
        keyword,
        count,
        density: parseFloat(density)
      });
    } else {
      missingKeywords.push(keyword);
    }
  });
  
  // 4. Content Formatting & Quality Analysis
  // Quantified achievements check (e.g. presence of numbers followed by % or standard metrics like "saved 20%", "managed 5", "10x", etc.)
  const quantifiedMatches = resumeText.match(/\b\d+(?:\.\d+)?%|\b\d+\s*(?:million|billion|k|x|percent|users|servers|developers|projects|months|years)\b/gi);
  const quantifiedCount = quantifiedMatches ? quantifiedMatches.length : 0;
  const isQuantified = quantifiedCount >= 3;
  
  // Action verbs check
  const actionVerbsFound = ACTION_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}\\b`, 'i');
    return regex.test(normResume);
  });
  const actionVerbsCount = actionVerbsFound.length;
  const hasActionVerbs = actionVerbsCount >= 4;
  
  // Length check
  const isLengthGood = totalWords >= 200 && totalWords <= 800;
  
  // 5. Score Calculation
  // Weighted scoring system:
  // - Skills Match (40 points)
  // - Keyword Match (25 points)
  // - Section completeness (20 points)
  // - Formatting & Action Verbs (15 points)
  
  let skillsScore = 0;
  if (jdHasSkills) {
    skillsScore = (matchedSkills.length / skillsFoundInJd.length) * 40;
  } else {
    // If no skills found in JD, score based on general skills found in resume
    skillsScore = Math.min((skillsFoundInResume.length / 8) * 40, 40);
  }
  
  const keywordScore = targetKeywords.length > 0 
    ? (matchedKeywords.length / targetKeywords.length) * 25 
    : 25;
    
  const sectionScore = (sectionsDetected.length / Object.keys(SECTIONS_DICTIONARY).length) * 20;
  
  let formatScore = 0;
  if (isQuantified) formatScore += 5;
  else if (quantifiedCount > 0) formatScore += 2;
  
  if (hasActionVerbs) formatScore += 5;
  else if (actionVerbsCount > 0) formatScore += 2;
  
  if (isLengthGood) formatScore += 5;
  else if (totalWords >= 150 && totalWords <= 1200) formatScore += 3;
  
  const finalScore = Math.round(skillsScore + keywordScore + sectionScore + formatScore);
  const clampedScore = Math.max(0, Math.min(100, finalScore));
  
  // 6. Generate Actionable Heuristic Suggestions
  const suggestions = [];
  
  // Section suggestions
  sectionsMissing.forEach(section => {
    suggestions.push({
      category: 'Section completeness',
      impact: 'High',
      text: `Add a dedicated "${section}" section to your resume. Many ATS algorithms explicitly search for these headings to categorize your content.`
    });
  });
  
  // Skill suggestions
  missingSkills.forEach(skill => {
    suggestions.push({
      category: 'Missing Skills',
      impact: 'High',
      text: `Add "${skill}" to your resume. This skill is prominent in the job description and acts as a primary filter.`
    });
  });
  
  // Keyword suggestions
  missingKeywords.slice(0, 5).forEach(kw => {
    suggestions.push({
      category: 'Keyword Matching',
      impact: 'Medium',
      text: `Incorporate the keyword "${kw}" naturally in your experience descriptions or summary to improve search alignment.`
    });
  });
  
  // Content quality suggestions
  if (quantifiedCount < 3) {
    suggestions.push({
      category: 'Quantified Achievements',
      impact: 'Medium',
      text: `Quantify your accomplishments. Instead of just listing tasks, include specific results (e.g. "increased speed by 25%", "cut API latency in half", "managed a team of 4"). Found only ${quantifiedCount} numeric metrics.`
    });
  }
  
  if (actionVerbsCount < 4) {
    suggestions.push({
      category: 'Action Verbs',
      impact: 'Low',
      text: `Use strong action verbs (e.g., "architected", "spearheaded", "engineered") at the start of your bullet points instead of passive verbs like "responsible for" or "assisted with".`
    });
  }
  
  if (totalWords < 200) {
    suggestions.push({
      category: 'Formatting',
      impact: 'Low',
      text: `Your resume is quite brief (${totalWords} words). Elaborate more on your project achievements and professional experience details to rank better for long-tail keywords.`
    });
  } else if (totalWords > 1000) {
    suggestions.push({
      category: 'Formatting',
      impact: 'Low',
      text: `Your resume is very long (${totalWords} words). Try to condense it to 1-2 pages (approx. 400-800 words) focusing strictly on the most relevant experiences.`
    });
  }
  
  // Keyword density checks
  keywordDensity.forEach(item => {
    if (item.density > 4.5) {
      suggestions.push({
        category: 'Keyword Stuffing',
        impact: 'Medium',
        text: `The keyword "${item.keyword}" has a density of ${item.density}%. Consider reducing its occurrence slightly to avoid triggers for keyword stuffing.`
      });
    }
  });

  // Calculate Resume Completeness (based on sections and length)
  const completeness = Math.round(
    (sectionsDetected.length / Object.keys(SECTIONS_DICTIONARY).length) * 70 +
    (isLengthGood ? 30 : totalWords > 150 ? 15 : 0)
  );

  // Recruiter Insights
  let recruiterInsights = '';
  if (clampedScore >= 80) {
    recruiterInsights = 'Excellent candidate profile. Strong technical alignment and well-structured resume. High probability of passing initial screening.';
  } else if (clampedScore >= 60) {
    recruiterInsights = 'Good candidate matching. The resume contains core requirements but would benefit from including missing keywords and qualifying technical outcomes.';
  } else {
    recruiterInsights = 'Low alignment detected. Essential skills requested in the job description are missing. High risk of auto-rejection by ATS filters.';
  }
  
  return {
    score: clampedScore,
    sectionsDetected,
    sectionsMissing,
    skillsAnalysis: {
      found: skillsFoundInResume,
      matched: matchedSkills,
      missing: missingSkills,
    },
    keywordMatching: {
      matched: matchedKeywords,
      missing: missingKeywords,
      density: keywordDensity
    },
    formatting: {
      wordCount: totalWords,
      quantifiedCount,
      actionVerbsCount
    },
    completeness,
    suggestions,
    recruiterInsights,
    isLocalSuggestions: true // Indicates that these are generated locally rather than via Gemini API
  };
};
