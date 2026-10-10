/**
 * Industry Classification & Capability Flags Utility
 * Centralized governance for role-gated feature visibility, UI adaptations,
 * and profile-aware AI question generation.
 */

// Explicit keywords defining software and technical coding disciplines
const TECH_CODING_PATTERNS = [
  "software",
  "developer",
  "development",
  "web",
  "full-stack",
  "fullstack",
  "frontend",
  "backend",
  "devops",
  "cloud",
  "data science",
  "machine learning",
  "ai/ml",
  "artificial intelligence",
  "cybersecurity",
  "security",
  "blockchain",
  "quantum",
  "robotics",
  "iot",
  "mobile",
  "ios",
  "android",
  "programming",
  "systems",
  "embedded",
  "site reliability",
  "sre",
];

// Profile mapping definitions for non-technical domains
const DOMAIN_DEFINITIONS = {
  marketing: {
    domainTerm: "Campaign ROI & Funnel Conversion",
    alternativeToolTitle: "Campaign & Growth Case Study Simulator",
    alternativeToolDescription: "Simulate high-impact go-to-market strategies, CAC/LTV payback modeling, and A/B test campaign evaluations.",
    interviewQuestionType: "scenario_case_study",
    focusAreas: ["Growth Funnels", "CAC / LTV Economics", "Attribution Models", "SEO & Paid Media", "Brand Positioning"],
  },
  finance: {
    domainTerm: "Financial Modeling & Valuation Accuracy",
    alternativeToolTitle: "Corporate Finance & Deal Room Lab",
    alternativeToolDescription: "Work through DCF valuations, risk mitigation models, P&L optimizations, and capital allocation dilemmas.",
    interviewQuestionType: "domain_analytical",
    focusAreas: ["Discounted Cash Flow (DCF)", "LBO & M&A Analysis", "Financial Statements (P&L, Cash Flow)", "Risk Management", "Capital Allocation"],
  },
  hr: {
    domainTerm: "Talent Retention & Conflict Resolution",
    alternativeToolTitle: "Executive HR & People Operations Room",
    alternativeToolDescription: "Address organizational design, employee mediation, talent acquisition metrics, and labor compliance case studies.",
    interviewQuestionType: "scenario_case_study",
    focusAreas: ["Employee Relations & Mediation", "Talent Acquisition Pipelines", "Compensation & Equity Strategy", "Compliance & Labor Laws", "Performance Culture"],
  },
  sales: {
    domainTerm: "Pipeline Velocity & Deal Closing",
    alternativeToolTitle: "Enterprise Pitch & Objection Room",
    alternativeToolDescription: "Navigate complex enterprise sales cycles, objection handling, MEDDPICC qualification, and quota forecasting.",
    interviewQuestionType: "scenario_case_study",
    focusAreas: ["Enterprise Discovery", "MEDDPICC Qualification", "Contract Negotiation", "Quota Forecasting", "Multi-Stakeholder Alignment"],
  },
  healthcare: {
    domainTerm: "Clinical Protocols & Patient Care Efficacy",
    alternativeToolTitle: "Clinical Case Study & Protocol Review",
    alternativeToolDescription: "Evaluate healthcare delivery scenarios, compliance (HIPAA/regulatory), patient outcomes, and clinical risk.",
    interviewQuestionType: "domain_analytical",
    focusAreas: ["Regulatory Compliance & HIPAA", "Clinical Workflow Optimization", "Patient Outcomes", "Healthcare Analytics", "Cross-Functional Care"],
  },
  design: {
    domainTerm: "User Experience & Visual Craft",
    alternativeToolTitle: "Product Design & Portfolio Critique Lab",
    alternativeToolDescription: "Analyze user research findings, design system scalability, accessibility standards, and product trade-offs.",
    interviewQuestionType: "scenario_case_study",
    focusAreas: ["User Research Synthesis", "Design Systems", "Interaction Design", "Accessibility (WCAG)", "Cross-Functional Engineering Handoff"],
  },
  general: {
    domainTerm: "Operational Excellence & Execution",
    alternativeToolTitle: "Business Strategy & Case Simulator",
    alternativeToolDescription: "Tackle strategic business scenarios, project execution tradeoffs, stakeholder alignment, and operational KPIs.",
    interviewQuestionType: "domain_analytical",
    focusAreas: ["Project Management", "Stakeholder Communication", "Resource Optimization", "KPI Tracking", "Change Management"],
  },
};

/**
 * Returns capability flags and domain-tailored properties based on industry and specialization.
 *
 * @param {string} industry - Raw industry slug (e.g. "tech-software-development", "finance-banking")
 * @param {string} specialization - Optional user specialization or target role
 * @returns {object} capability flags and descriptive metadata
 */
export function getIndustryCapabilities(industry = "", specialization = "") {
  const normalized = `${industry || ""} ${specialization || ""}`.toLowerCase().trim();

  // If industry is explicitly tech/software
  const isTechIndustry = normalized.startsWith("tech") || normalized.includes("technology");
  const hasCodingKeyword = TECH_CODING_PATTERNS.some((pattern) =>
    normalized.includes(pattern)
  );

  // Coding Sandbox is enabled ONLY if the profile reflects technical software/engineering roles
  const hasCodingSandbox = isTechIndustry && hasCodingKeyword;
  const hasSystemDesign =
    hasCodingSandbox ||
    normalized.includes("architecture") ||
    normalized.includes("systems") ||
    normalized.includes("devops");

  // Determine domain classification for users
  let domainKey = hasCodingSandbox ? "tech" : "general";
  if (!hasCodingSandbox) {
    if (normalized.includes("market") || normalized.includes("advertis") || normalized.includes("growth") || normalized.includes("seo")) {
      domainKey = "marketing";
    } else if (normalized.includes("financ") || normalized.includes("bank") || normalized.includes("account") || normalized.includes("invest")) {
      domainKey = "finance";
    } else if (normalized.includes("human resource") || normalized.includes("hr") || normalized.includes("talent") || normalized.includes("people ops")) {
      domainKey = "hr";
    } else if (normalized.includes("sale") || normalized.includes("business dev") || normalized.includes("account exec")) {
      domainKey = "sales";
    } else if (normalized.includes("health") || normalized.includes("medic") || normalized.includes("pharma") || normalized.includes("clinic")) {
      domainKey = "healthcare";
    } else if (normalized.includes("design") || normalized.includes("ui/ux") || normalized.includes("creative") || normalized.includes("graphic")) {
      domainKey = "design";
    }
  }

  const domainConfig = DOMAIN_DEFINITIONS[domainKey] || DOMAIN_DEFINITIONS.general;

  return {
    isTechnical: hasCodingSandbox,
    hasCodingSandbox,
    hasSystemDesign,
    interviewQuestionType: hasCodingSandbox
      ? "technical_code"
      : domainConfig.interviewQuestionType,
    domainTerm: hasCodingSandbox
      ? "Code Quality & Algorithms"
      : domainConfig.domainTerm,
    alternativeToolTitle: domainConfig.alternativeToolTitle,
    alternativeToolDescription: domainConfig.alternativeToolDescription,
    focusAreas: hasCodingSandbox
      ? ["Algorithms & Data Structures", "System Design & Architecture", "API Design", "Code Maintainability", "Debugging"]
      : domainConfig.focusAreas,
    domainKey,
  };
}

/**
 * Returns curated domain fallback questions when generative AI is unreachable,
 * guaranteeing non-technical profiles NEVER receive code/programming MCQs.
 */
export function getDomainFallbackQuestions(domainKey = "general", industry = "") {
  const fallbacksByDomain = {
    marketing: [
      {
        question: "When evaluating a direct-to-consumer growth campaign, which metric indicates an unsustainable acquisition model?",
        options: [
          "Customer Acquisition Cost (CAC) exceeds Customer Lifetime Value (LTV) across a 12-month cohort",
          "Click-Through Rate (CTR) drops below 2.5% on brand search ads",
          "Organic impressions increase faster than paid social ad spend",
          "Bounce rate on informational blog posts reaches 45%",
        ],
        correctAnswer: "Customer Acquisition Cost (CAC) exceeds Customer Lifetime Value (LTV) across a 12-month cohort",
        explanation: "If CAC exceeds LTV, the business loses money on every acquired customer, making unit economics unsustainable regardless of top-line volume.",
        skillTested: "Growth Economics & Unit Metrics",
      },
      {
        question: "What does a Return on Ad Spend (ROAS) of 4.0x represent for an enterprise marketing team?",
        options: [
          "The campaign converted 4% of total visitors into subscribers",
          "Every $1.00 spent on advertising generated $4.00 in attributed top-line revenue",
          "The customer churn rate decreased by a factor of 4",
          "The advertising creative was refreshed 4 times during the campaign",
        ],
        correctAnswer: "Every $1.00 spent on advertising generated $4.00 in attributed top-line revenue",
        explanation: "ROAS measures gross revenue generated per advertising dollar spent (Revenue / Ad Spend). A 4.0x ROAS means $4 in revenue per $1 spent.",
        skillTested: "Performance Marketing & ROAS",
      },
      {
        question: "In Conversion Rate Optimization (CRO), what determines whether an A/B test variant result is statistically significant?",
        options: [
          "The test was run for exactly 3 days over a weekend",
          "The variant achieved a p-value < 0.05 with adequate sample size to rule out random chance",
          "The creative design was approved by executive leadership",
          "The traffic was split 80% to control and 20% to variant",
        ],
        correctAnswer: "The variant achieved a p-value < 0.05 with adequate sample size to rule out random chance",
        explanation: "Statistical significance (commonly p < 0.05 at 95% confidence) ensures observed conversion lifts are genuine rather than random variance.",
        skillTested: "Experimentation & A/B Testing",
      },
      {
        question: "Which multi-touch attribution model assigns equal weight to every touchpoint along a prospective customer's journey?",
        options: [
          "Linear Attribution",
          "First-Touch Attribution",
          "Time-Decay Attribution",
          "Position-Based (U-Shaped) Attribution",
        ],
        correctAnswer: "Linear Attribution",
        explanation: "Linear attribution gives equal credit to all interactions (e.g. blog post, webinar, retargeting ad) prior to conversion.",
        skillTested: "Marketing Attribution Models",
      },
      {
        question: "What is the primary role of establishing a distinct Brand Positioning Statement?",
        options: [
          "To provide exact CSS color palettes for website developers",
          "To articulate how the product uniquely solves customer pain points compared to direct market alternatives",
          "To calculate quarterly sales commissions for the account executives",
          "To establish server uptime guidelines for cloud applications",
        ],
        correctAnswer: "To articulate how the product uniquely solves customer pain points compared to direct market alternatives",
        explanation: "Brand positioning clarifies target customer definition, category framing, distinct value proposition, and reasons to believe.",
        skillTested: "Brand Strategy & Positioning",
      },
    ],
    finance: [
      {
        question: "In a Discounted Cash Flow (DCF) valuation, what does the Weighted Average Cost of Capital (WACC) represent?",
        options: [
          "The total tax liability owed to state and federal governments",
          "The blended cost of equity and debt financing, reflecting the minimum return required by capital providers",
          "The annual amortization cost of intangible intellectual property",
          "The total payroll budget allocated to the finance department",
        ],
        correctAnswer: "The blended cost of equity and debt financing, reflecting the minimum return required by capital providers",
        explanation: "WACC serves as the discount rate in DCF models, capturing the opportunity cost and risk of both debt and equity financing.",
        skillTested: "Valuation & DCF Modeling",
      },
      {
        question: "How is Net Working Capital (NWC) calculated on a corporate balance sheet?",
        options: [
          "Total Assets minus Total Liabilities",
          "Current Assets minus Current Liabilities",
          "Gross Revenue minus Operating Expenses (OpEx)",
          "EBITDA minus Capital Expenditures (CapEx)",
        ],
        correctAnswer: "Current Assets minus Current Liabilities",
        explanation: "Net Working Capital measures short-term liquidity and operational health by comparing short-term assets against short-term liabilities.",
        skillTested: "Financial Accounting & Liquidity",
      },
      {
        question: "Why is EBITDA frequently used when comparing operating profitability across companies in the same industry?",
        options: [
          "It eliminates differences in capital structure (debt), taxation rates, and depreciation schedules",
          "It is the only metric recognized by GAAP and IFRS standards",
          "It automatically includes future revenue forecasts",
          "It represents pure cash sitting in the corporate checking account",
        ],
        correctAnswer: "It eliminates differences in capital structure (debt), taxation rates, and depreciation schedules",
        explanation: "EBITDA normalizes for differing leverage (interest), geographic tax rates, and asset ages (depreciation/amortization).",
        skillTested: "Corporate Finance & EBITDA",
      },
      {
        question: "What is the key difference between the Current Ratio and the Quick (Acid-Test) Ratio?",
        options: [
          "The Quick Ratio excludes illiquid inventory and prepaid expenses from current assets",
          "The Current Ratio ignores all accounts payable",
          "The Quick Ratio includes future 5-year projected sales",
          "The Current Ratio is only applicable to commercial banks",
        ],
        correctAnswer: "The Quick Ratio excludes illiquid inventory and prepaid expenses from current assets",
        explanation: "The Quick Ratio evaluates strict immediate liquidity by stripping out inventory, which cannot be converted to cash instantaneously without haircuts.",
        skillTested: "Financial Ratio Analysis",
      },
      {
        question: "In capital budgeting, what does an investment project having a Net Present Value (NPV) greater than zero signify?",
        options: [
          "The project is legally mandated by regulators",
          "The present value of projected cash inflows exceeds initial capital expenditures at the required hurdle rate",
          "The company will experience zero financial risk",
          "The payback period is guaranteed to be under 30 days",
        ],
        correctAnswer: "The present value of projected cash inflows exceeds initial capital expenditures at the required hurdle rate",
        explanation: "A positive NPV indicates that the project creates economic value above and beyond the cost of capital.",
        skillTested: "Capital Budgeting & NPV",
      },
    ],
    hr: [
      {
        question: "When mediating a workplace conflict between two cross-functional leaders, what is the best practice initial step?",
        options: [
          "Immediately reassign one of the employees to a different department",
          "Conduct structured individual discovery sessions to understand underlying needs and objectives before a joint resolution meeting",
          "Issue formal written disciplinary warnings to both employees simultaneously",
          "Ignore the disagreement until one employee formally escalates to senior management",
        ],
        correctAnswer: "Conduct structured individual discovery sessions to understand underlying needs and objectives before a joint resolution meeting",
        explanation: "Understanding root causes and emotional stakes privately ensures the mediator can steer the subsequent joint conversation toward collaborative problem solving.",
        skillTested: "Conflict Resolution & Mediation",
      },
      {
        question: "Which metric is the most reliable leading indicator of employee disengagement and cultural friction?",
        options: [
          "Quarterly Employee Net Promoter Score (eNPS) and pulse survey sentiment trends",
          "The number of company swag t-shirts ordered per quarter",
          "Daily badge-swipe timestamps at the office entrance",
          "The total number of external LinkedIn job postings",
        ],
        correctAnswer: "Quarterly Employee Net Promoter Score (eNPS) and pulse survey sentiment trends",
        explanation: "Pulse surveys and eNPS capture shifts in morale and trust months before they manifest as costly resignations and attrition.",
        skillTested: "Talent Retention & eNPS",
      },
      {
        question: "In competency-based structured interviews, what is the primary benefit of standardized scoring rubrics?",
        options: [
          "It reduces interviewer unconscious bias and establishes consistent, defensible evaluation criteria",
          "It allows interviews to be finished in under 5 minutes",
          "It guarantees that every candidate receives the exact same salary offer",
          "It removes the need for reference checks",
        ],
        correctAnswer: "It reduces interviewer unconscious bias and establishes consistent, defensible evaluation criteria",
        explanation: "Calibrated rubrics ensure candidates are assessed against verifiable competencies rather than personal rapport or gut feeling.",
        skillTested: "Structured Interviewing & DEI",
      },
      {
        question: "What is the primary objective of a Progressive Discipline policy in People Operations?",
        options: [
          "To provide transparent feedback and structured opportunities for performance correction before termination",
          "To immediately penalize minor administrative mistakes with termination",
          "To prevent employees from ever requesting salary raises",
          "To replace annual performance review discussions",
        ],
        correctAnswer: "To provide transparent feedback and structured opportunities for performance correction before termination",
        explanation: "Progressive discipline gives employees clear benchmarks to remediate performance while creating a compliant paper trail if separation becomes necessary.",
        skillTested: "Employee Relations & Compliance",
      },
      {
        question: "Which regulatory framework governs overtime pay, minimum wage standards, and exempt vs non-exempt classification in the United States?",
        options: [
          "Fair Labor Standards Act (FLSA)",
          "Health Insurance Portability and Accountability Act (HIPAA)",
          "Sarbanes-Oxley Act (SOX)",
          "Family and Medical Leave Act (FMLA)",
        ],
        correctAnswer: "Fair Labor Standards Act (FLSA)",
        explanation: "The FLSA establishes federal minimum wage, overtime eligibility, recordkeeping, and youth employment standards.",
        skillTested: "Labor Law & Compliance",
      },
    ],
    tech: [
      {
        question: "In modern cloud architecture, what is the primary purpose of database connection pooling?",
        options: [
          "To encrypt database passwords in transit",
          "To reuse existing database connections and reduce handshake latency overhead",
          "To automatically write SQL queries for developers",
          "To convert SQL data into JSON format",
        ],
        correctAnswer: "To reuse existing database connections and reduce handshake latency overhead",
        explanation: "Connection pooling maintains a cache of open database connections that can be reused for future requests, avoiding the CPU and latency cost of repeatedly establishing new TLS/TCP handshakes.",
        skillTested: "Database Systems & Scaling",
      },
      {
        question: "What does idempotency mean in the context of RESTful APIs and distributed systems?",
        options: [
          "An endpoint that requires multi-factor authentication",
          "Making multiple identical requests produces the exact same server state as making a single request",
          "An API endpoint that responds in less than 50ms",
          "An endpoint that caches responses permanently in memory",
        ],
        correctAnswer: "Making multiple identical requests produces the exact same server state as making a single request",
        explanation: "An HTTP method is idempotent if the intended effect on the server of making multiple identical requests is the same as for a single request (e.g., GET, PUT, DELETE).",
        skillTested: "API Design & Distributed Systems",
      },
      {
        question: "What is the primary advantage of using a B-Tree index on a frequently queried relational database column?",
        options: [
          "Increases database disk storage efficiency",
          "Accelerates data retrieval speeds from O(N) to O(log N)",
          "Automatically eliminates duplicate records",
          "Speeds up bulk write and INSERT operations",
        ],
        correctAnswer: "Accelerates data retrieval speeds from O(N) to O(log N)",
        explanation: "B-Tree indexes allow the database engine to locate target rows in logarithmic time instead of performing full table scans.",
        skillTested: "Data Structures & Indexing",
      },
      {
        question: "Which security principle dictates that users and services should only be granted minimum necessary permissions?",
        options: [
          "Principle of Least Privilege",
          "Zero-Downtime Deployment Pattern",
          "Single Responsibility Principle",
          "Mutual TLS Authentication",
        ],
        correctAnswer: "Principle of Least Privilege",
        explanation: "Least Privilege reduces risk by ensuring compromised credentials or errors cannot access resources outside the immediate scope of duty.",
        skillTested: "Security Architecture",
      },
      {
        question: "What is the primary advantage of optimistic concurrency control over pessimistic concurrency control in high-read systems?",
        options: [
          "It avoids holding database row locks during transaction processing, maximizing read throughput",
          "It eliminates the need for database backups",
          "It forces all transactions to execute serially on a single thread",
          "It stores data entirely in browser local storage",
        ],
        correctAnswer: "It avoids holding database row locks during transaction processing, maximizing read throughput",
        explanation: "Optimistic concurrency uses record versioning to check for conflicts at commit time, avoiding expensive row locks when write contention is low.",
        skillTested: "Concurrency & Transactions",
      },
    ],
    general: [
      {
        question: "In project management, what is the Critical Path Method (CPM) used to determine?",
        options: [
          "The longest sequence of dependent activities and the shortest possible project completion time",
          "The exact budget allocation for marketing swag",
          "The hourly salary rate of junior contractors",
          "The physical route delivery trucks should take to warehouses",
        ],
        correctAnswer: "The longest sequence of dependent activities and the shortest possible project completion time",
        explanation: "The critical path identifies activities where any delay will directly postpone the overall project completion date.",
        skillTested: "Project Management & CPM",
      },
      {
        question: "In stakeholder management, what does a RACI matrix define?",
        options: [
          "Responsible, Accountable, Consulted, and Informed project roles",
          "Revenue, Assets, Cash, and Interest financial targets",
          "Recruitment, Assessment, Compensation, and Insurance policies",
          "Risk, Action, Compliance, and Investigation protocols",
        ],
        correctAnswer: "Responsible, Accountable, Consulted, and Informed project roles",
        explanation: "A RACI matrix clarifies role ownership, accountability, consultation requirements, and informational updates across teams.",
        skillTested: "Stakeholder Alignment & Governance",
      },
      {
        question: "What is the difference between a Leading Indicator and a Lagging Indicator in organizational performance?",
        options: [
          "Leading indicators predict future performance; lagging indicators measure past results",
          "Leading indicators are financial; lagging indicators are non-financial",
          "Leading indicators are qualitative; lagging indicators are always numerical",
          "Leading indicators only apply to startups; lagging indicators only apply to enterprises",
        ],
        correctAnswer: "Leading indicators predict future performance; lagging indicators measure past results",
        explanation: "Leading indicators (e.g. sales calls made) provide predictive input, while lagging indicators (e.g. quarterly revenue) confirm historical outputs.",
        skillTested: "Performance Metrics & KPIs",
      },
      {
        question: "When conducting Root Cause Analysis for an operational failure, what is the goal of the '5 Whys' technique?",
        options: [
          "To peel away layers of symptoms and identify the fundamental underlying breakdown in process or policy",
          "To find five employees responsible for the incident to discipline",
          "To delay reporting the problem to senior leadership for 5 days",
          "To generate five alternative marketing slogans",
        ],
        correctAnswer: "To peel away layers of symptoms and identify the fundamental underlying breakdown in process or policy",
        explanation: "Repeatedly asking 'why' moves investigation beyond superficial human error to systemic organizational and procedural flaws.",
        skillTested: "Operational Excellence & Root Cause Analysis",
      },
      {
        question: "What is the primary benefit of establishing Objectives and Key Results (OKRs) across teams?",
        options: [
          "Aligning cross-functional goals with measurable, outcome-oriented success criteria",
          "Tracking exact minutes employees spend on coffee breaks",
          "Calculating daily tax withholding deductions",
          "Automating legal contract drafting without attorney review",
        ],
        correctAnswer: "Aligning cross-functional goals with measurable, outcome-oriented success criteria",
        explanation: "OKRs connect high-level strategic objectives with quantifiable key results that keep teams focused on impact over output.",
        skillTested: "Strategic Execution & OKRs",
      },
    ],
  };

  return fallbacksByDomain[domainKey] || fallbacksByDomain.general;
}

