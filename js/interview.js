// interview.js — Interview Question Generator
// Generates role-specific interview questions based on JD + candidate skills

const InterviewGenerator = (() => {

  // ── Question Bank by Category ────────────────────────────────────────────
  const GENERIC_BEHAVIORAL = [
    "Tell me about a time you handled a tight deadline. What was your approach?",
    "Describe a situation where you disagreed with a teammate. How did you resolve it?",
    "Give an example of a project you led end-to-end. What were the outcomes?",
    "Tell me about a failure. What did you learn from it?",
    "How do you prioritize tasks when everything feels urgent?",
    "Describe a time you had to learn something new quickly. How did you do it?",
    "Tell me about a time you received critical feedback. How did you respond?"
  ];

  const GENERIC_SITUATIONAL = [
    "If you were given an unclear requirement, how would you proceed?",
    "How would you handle a situation where your manager's direction conflicts with best practices?",
    "If a key team member leaves mid-project, how do you ensure continuity?",
    "You have two deadlines clashing — how do you decide which to prioritize?"
  ];

  // Skill-to-question mapping
  const SKILL_QUESTIONS = {
    // Programming languages
    "python":      ["Walk me through a Python project you're proud of. What libraries did you use?",
                    "How do you handle memory management in Python for large datasets?"],
    "javascript":  ["Explain the event loop in JavaScript in simple terms.",
                    "How do you manage async operations — callbacks, promises, or async/await?"],
    "java":        ["How does Java handle garbage collection? When have you had to tune it?",
                    "Explain the difference between an interface and an abstract class in Java."],
    "c++":         ["Describe a time you debugged a memory leak in C++.",
                    "When would you choose C++ over a higher-level language?"],
    "typescript":  ["Why would you choose TypeScript over plain JavaScript?",
                    "How do you handle complex type definitions in TypeScript?"],
    "sql":         ["Describe the most complex SQL query you've written. What did it do?",
                    "How do you optimize a slow-running SQL query?"],

    // Frameworks
    "react":       ["How do you manage global state in a large React app?",
                    "Explain the difference between useEffect and useLayoutEffect."],
    "node":        ["How does Node.js handle concurrency without multiple threads?",
                    "What's your approach to error handling in Node.js APIs?"],
    "django":      ["How does Django's ORM differ from writing raw SQL? When would you use each?",
                    "Explain Django's middleware pipeline."],
    "flask":       ["How do you structure a large Flask application?",
                    "How do you handle authentication in Flask?"],
    "angular":     ["What is change detection in Angular and how do you optimize it?",
                    "Explain the difference between template-driven and reactive forms."],
    "vue":         ["How does Vue's reactivity system work under the hood?",
                    "When would you use Vuex vs. Vue's Composition API for state?"],
    "spring":      ["Explain Spring Boot's auto-configuration mechanism.",
                    "How do you handle transactions in Spring?"],

    // Cloud / DevOps
    "aws":         ["Describe an AWS architecture you've designed. What services did you use and why?",
                    "How do you handle cost optimization on AWS?"],
    "docker":      ["Walk me through how you'd containerize an existing application.",
                    "How do you handle secrets in Docker containers?"],
    "kubernetes":  ["Explain the difference between a Deployment and a StatefulSet in Kubernetes.",
                    "How do you troubleshoot a pod that keeps crashing?"],
    "ci/cd":       ["Describe your ideal CI/CD pipeline. What tools would you use?",
                    "How do you ensure zero-downtime deployments?"],
    "terraform":   ["How do you manage Terraform state in a team environment?",
                    "Describe a time Terraform caused an unintended infrastructure change."],

    // Data / ML
    "machine learning": ["Walk me through how you'd approach a new ML problem from scratch.",
                         "How do you handle class imbalance in a classification problem?"],
    "deep learning":    ["Explain overfitting and the techniques you use to prevent it.",
                         "How do you choose between CNN, RNN, and Transformer architectures?"],
    "data analysis":    ["Describe your data cleaning process when you get messy data.",
                         "How do you decide which visualization to use for a dataset?"],
    "pandas":           ["How do you handle large DataFrames that don't fit in memory?",
                         "What's the difference between .loc and .iloc in pandas?"],
    "tensorflow":       ["How do you debug a model that isn't converging in TensorFlow?",
                         "Explain the difference between eager and graph execution."],
    "nlp":              ["Describe a text classification project you built. What was your pipeline?",
                         "How do you handle out-of-vocabulary words in NLP models?"],

    // Soft skills / roles
    "communication":    ["How do you explain technical concepts to non-technical stakeholders?",
                         "Describe how you document your work for future team members."],
    "leadership":       ["How do you motivate a team during a difficult project phase?",
                         "Describe your approach to giving constructive feedback."],
    "agile":            ["How do you handle scope creep in an Agile sprint?",
                         "What metrics do you track to measure a team's Agile health?"],
    "scrum":            ["Describe a retrospective that led to a meaningful process change.",
                         "How do you handle a sprint where the team consistently misses velocity?"],
    "problem solving":  ["Walk me through how you'd debug an issue you've never seen before.",
                         "Describe the most complex problem you've solved. What was your process?"]
  };

  // ── Main Generator ───────────────────────────────────────────────────────
  function generate(matchedSkills = [], jobTitle = "", missingSkills = []) {
    const questions = {
      behavioral:    [],
      situational:   [],
      technical:     [],
      gapBased:      [],
      roleSpecific:  []
    };

    // Always add 3 behavioral + 2 situational
    questions.behavioral  = shuffle(GENERIC_BEHAVIORAL).slice(0, 3);
    questions.situational = shuffle(GENERIC_SITUATIONAL).slice(0, 2);

    // Technical questions from matched skills
    const seen = new Set();
    matchedSkills.forEach(skill => {
      const key = Object.keys(SKILL_QUESTIONS).find(k =>
        skill.toLowerCase().includes(k) || k.includes(skill.toLowerCase())
      );
      if (key && SKILL_QUESTIONS[key]) {
        SKILL_QUESTIONS[key].forEach(q => {
          if (!seen.has(q)) { seen.add(q); questions.technical.push(q); }
        });
      }
    });
    // Cap at 6 technical questions
    questions.technical = questions.technical.slice(0, 6);

    // Gap-based questions for missing skills
    missingSkills.slice(0, 3).forEach(skill => {
      questions.gapBased.push(
        `You don't seem to have listed ${skill} on your resume — have you had any exposure to it? How quickly do you think you could get up to speed?`
      );
    });

    // Role-specific opener
    if (jobTitle) {
      questions.roleSpecific.push(
        `Why are you specifically interested in a ${jobTitle} role at this stage of your career?`,
        `What does success look like for you in the first 90 days as a ${jobTitle}?`
      );
    }

    return questions;
  }

  // ── Render to DOM ────────────────────────────────────────────────────────
  function render(questions, containerId, candidateName = "") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const nameLabel = candidateName ? ` for ${candidateName}` : "";

    const sections = [
      { key: "roleSpecific",  icon: "🎯", title: "Role-Specific"    },
      { key: "behavioral",    icon: "🧠", title: "Behavioral (STAR)" },
      { key: "situational",   icon: "💡", title: "Situational"       },
      { key: "technical",     icon: "⚙️", title: "Technical"         },
      { key: "gapBased",      icon: "🔍", title: "Skill Gap Probes"  }
    ];

    const sectionsHTML = sections.map(sec => {
      const qs = questions[sec.key];
      if (!qs || qs.length === 0) return "";
      const qHTML = qs.map((q, i) =>
        `<div class="iq-question"><span class="iq-num">${i + 1}.</span><span>${q}</span></div>`
      ).join("");
      return `
        <div class="iq-section">
          <div class="iq-section-title">${sec.icon} ${sec.title}</div>
          ${qHTML}
        </div>`;
    }).join("");

    container.innerHTML = `
      <div class="iq-report">
        <div class="iq-header">📋 Interview Questions${nameLabel}</div>
        ${sectionsHTML}
        <button class="iq-copy-btn" onclick="InterviewGenerator.copyAll('${containerId}')">
          📋 Copy All Questions
        </button>
      </div>`;
  }

  // ── Copy All to Clipboard ────────────────────────────────────────────────
  function copyAll(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const questions = [...container.querySelectorAll(".iq-question span:last-child")]
      .map((el, i) => `${i + 1}. ${el.textContent}`)
      .join("\n");
    navigator.clipboard.writeText(questions).then(() => {
      const btn = container.querySelector(".iq-copy-btn");
      if (btn) { btn.textContent = "✅ Copied!"; setTimeout(() => btn.textContent = "📋 Copy All Questions", 2000); }
    });
  }

  // ── Inject Styles ────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("iq-styles")) return;
    const style = document.createElement("style");
    style.id = "iq-styles";
    style.textContent = `
      .iq-report { display:flex; flex-direction:column; gap:16px; }
      .iq-header { font-size:1.1rem; font-weight:700; color:#1e293b;
        padding-bottom:8px; border-bottom:2px solid #e2e8f0; }
      .iq-section { background:#fff; border:1px solid #e2e8f0;
        border-radius:10px; padding:14px 16px; }
      .iq-section-title { font-weight:700; color:#4f46e5;
        margin-bottom:10px; font-size:0.95rem; }
      .iq-question { display:flex; gap:10px; padding:8px 0;
        border-bottom:1px solid #f1f5f9; font-size:0.88rem; color:#334155; line-height:1.5; }
      .iq-question:last-child { border-bottom:none; }
      .iq-num { font-weight:700; color:#94a3b8; min-width:18px; }
      .iq-copy-btn { align-self:flex-start; background:#4f46e5; color:#fff;
        border:none; padding:10px 20px; border-radius:8px; cursor:pointer;
        font-size:0.9rem; font-weight:600; transition:background 0.2s; }
      .iq-copy-btn:hover { background:#4338ca; }
    `;
    document.head.appendChild(style);
  }

  // ── Utility ──────────────────────────────────────────────────────────────
  function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
  }

  // ── Public API ───────────────────────────────────────────────────────────
  return {
    generate,
    render,
    copyAll,
    injectStyles,

    analyze(matchedSkills, jobTitle, missingSkills, containerId, candidateName) {
      injectStyles();
      const questions = generate(matchedSkills, jobTitle, missingSkills);
      if (containerId) render(questions, containerId, candidateName);
      return questions;
    }
  };

})();
