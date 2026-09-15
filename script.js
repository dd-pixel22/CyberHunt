/* =========================================================
   CYBERHUNT — CYBERSECURITY STUDY PLATFORM
   Complete JavaScript
   ========================================================= */

"use strict";

/* -------------------- HELPERS -------------------- */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE_KEY = "cyberhuntStudyStateV3";

let state = {
  user: null,
  xp: 0,
  completedCases: [],
  quizBest: 0,
  quizAttemptAwarded: false,
  badges: [],
  aiHistory: [],
  completedLabs: [],
  streak: 1,
  currentSection: "dashboard"
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Could not save state:", error);
  }
}

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      state = {
        ...state,
        ...parsed,
        user: parsed.user || null,
        completedCases: Array.isArray(parsed.completedCases)
          ? parsed.completedCases
          : [],
        badges: Array.isArray(parsed.badges) ? parsed.badges : [],
        aiHistory: Array.isArray(parsed.aiHistory)
          ? parsed.aiHistory
          : [],
        completedLabs: Array.isArray(parsed.completedLabs)
          ? parsed.completedLabs
          : []
      };
    }
  } catch (error) {
    console.warn("Saved state was invalid. Starting fresh.");
  }
}

function toast(message) {
  const box = $("#toast");
  if (!box) return;

  box.textContent = message;
  box.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    box.classList.remove("show");
  }, 2600);
}

function openExternal(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

/* =========================================================
   LOGIN
   ========================================================= */

function login() {
  const email = $("#email")?.value.trim() || "";
  const username = $("#username")?.value.trim() || "";
  const password = $("#password")?.value || "";
  const error = $("#loginError");

  if (error) error.textContent = "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (error) error.textContent = "Enter a valid email address.";
    return;
  }

  if (!/^[A-Za-z0-9]+$/.test(username)) {
    if (error) {
      error.textContent =
        "Username can contain only letters and numbers.";
    }
    return;
  }

  if (username.length < 3) {
    if (error) error.textContent = "Username must be at least 3 characters.";
    return;
  }

  if (password.length < 8) {
    if (error) {
      error.textContent = "Password must be at least 8 characters.";
    }
    return;
  }

  /*
    Password is deliberately NOT stored.
    This is a static GitHub Pages demo.
  */

  state.user = {
    name: username,
    email: email
  };

  state.currentSection = "dashboard";

  save();

  try {
    sessionStorage.setItem("cyberhuntLoggedIn", "1");
  } catch (e) {}

  $("#loginPage")?.classList.add("hidden");
  $("#app")?.classList.remove("hidden");

  updateHeader();
  showSection("dashboard");
  renderAll();
  renderChat();

  toast("Welcome to CyberHunt, " + username + "!");
}

function logout() {
  try {
    sessionStorage.removeItem("cyberhuntLoggedIn");
  } catch (e) {}

  $("#app")?.classList.add("hidden");
  $("#loginPage")?.classList.remove("hidden");

  const password = $("#password");
  if (password) password.value = "";

  toast("Logged out.");
}

/* =========================================================
   HEADER / PROGRESS
   ========================================================= */

function getLevel() {
  return Math.max(1, Math.floor(state.xp / 250) + 1);
}

function getOverallProgress() {
  const caseProgress = state.completedCases.length / 50;
  const labProgress = state.completedLabs.length / 5;
  const quizProgress = state.quizBest / 10;

  return Math.min(
    100,
    Math.round(
      (caseProgress * 0.6 +
        labProgress * 0.25 +
        quizProgress * 0.15) *
        100
    )
  );
}

function updateHeader() {
  const level = getLevel();

  if ($("#xpTop")) $("#xpTop").textContent = state.xp;
  if ($("#levelTop")) $("#levelTop").textContent = level;

  if ($("#dashXP")) $("#dashXP").textContent = state.xp;
  if ($("#casesDone")) $("#casesDone").textContent = state.completedCases.length;
  if ($("#labsDone")) $("#labsDone").textContent = state.completedLabs.length;
  if ($("#quizBest")) $("#quizBest").textContent = state.quizBest;

  const name = state.user?.name || "Detective";

  if ($("#welcomeName")) {
    $("#welcomeName").textContent = name;
  }

  if ($("#profileTop")) {
    $("#profileTop").textContent = name.charAt(0).toUpperCase();
  }

  const progress = getOverallProgress();

  if ($("#progressPill")) {
    $("#progressPill").textContent = progress + "%";
  }

  if ($("#overallProgress")) {
    $("#overallProgress").style.width = progress + "%";
  }

  updateNextMission();
}

function updateNextMission() {
  const title = $("#nextTitle");
  const desc = $("#nextDesc");

  if (!title || !desc) return;

  if (state.completedCases.length === 0) {
    title.textContent = "Start with Cybersecurity Foundations";
    desc.textContent =
      "Open a material, learn the concept, then test yourself with a case.";
  } else if (state.completedCases.length < 10) {
    title.textContent = "Continue your first investigation track";
    desc.textContent =
      "Solve more scenarios to strengthen your cybersecurity decision-making.";
  } else if (state.completedLabs.length < 5) {
    title.textContent = "Try a Practice Lab";
    desc.textContent =
      "Practice encoding, decoding and hashing safely in your browser.";
  } else {
    title.textContent = "Explore advanced security";
    desc.textContent =
      "Study Zero Trust, forensics, cloud security and governance.";
  }
}

/* =========================================================
   NAVIGATION
   ========================================================= */

function showSection(sectionId) {
  const section = $("#" + sectionId);
  if (!section) return;

  $$(".page-section").forEach((page) => {
    page.classList.remove("active-section");
  });

  section.classList.add("active-section");

  $$(".nav-item").forEach((item) => {
    item.classList.toggle(
      "active",
      item.dataset.section === sectionId
    );
  });

  const names = {
    dashboard: "Dashboard",
    ai: "AI Study Studio",
    materials: "Materials",
    cases: "Case Studies",
    quizzes: "Mini Quizzes",
    labs: "Practice Labs",
    badges: "Badges"
  };

  if ($("#crumb")) {
    $("#crumb").textContent = names[sectionId] || "CyberHunt";
  }

  state.currentSection = sectionId;
  save();

  if (sectionId === "materials") renderMaterials();
  if (sectionId === "cases") renderCases();
  if (sectionId === "quizzes") renderQuiz();
  if (sectionId === "labs") renderLabs();
  if (sectionId === "badges") renderBadges();
  if (sectionId === "ai") renderChat();

  $("#sidebar")?.classList.remove("mobile-open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   CYBERSECURITY MATERIALS
   ========================================================= */

const materials = [
  {
    id: 1,
    level: "FOUNDATION",
    title: "Cybersecurity Foundations",
    short: "Understand what cybersecurity protects and why it matters.",
    detail:
      "Cybersecurity is the practice of protecting systems, networks, applications, devices and information from unauthorized access, misuse, disruption or destruction.",
    why:
      "Almost every organization depends on digital systems. A security failure can affect money, privacy, reputation, operations and safety.",
    keys: [
      "Assets are things worth protecting.",
      "Threats can cause harm.",
      "Vulnerabilities are weaknesses.",
      "Controls reduce risk.",
      "Security requires people, processes and technology."
    ],
    example:
      "A university protects student records using authentication, access controls, backups and monitoring.",
    scenario:
      "A student receives an unexpected attachment from an unknown sender. Before opening it, the student checks the sender, verifies the message and reports it.",
    remember:
      "Protect assets by identifying threats, weaknesses and appropriate controls."
  },

  {
    id: 2,
    level: "FOUNDATION",
    title: "CIA Triad",
    short: "The three fundamental goals of information security.",
    detail:
      "CIA stands for Confidentiality, Integrity and Availability. These three goals help security teams decide what protection a system needs.",
    why:
      "The CIA triad provides a simple framework for analyzing security incidents and selecting controls.",
    keys: [
      "Confidentiality = only authorized people can see information.",
      "Integrity = information remains accurate and trustworthy.",
      "Availability = authorized users can access information when needed."
    ],
    example:
      "Encryption protects confidentiality, hashing can help verify integrity, and backups improve availability.",
    scenario:
      "An attacker changes a company's financial records without permission. The main security property affected is integrity.",
    remember:
      "C = Can I keep it secret? I = Is it correct? A = Can I access it?"
  },

  {
    id: 3,
    level: "FOUNDATION",
    title: "Threats, Vulnerabilities & Risk",
    short: "Learn the difference between a threat, weakness and risk.",
    detail:
      "A threat is a potential cause of harm. A vulnerability is a weakness that could be exploited. Risk is the possibility and impact of harm when a threat takes advantage of a vulnerability.",
    why:
      "Security teams need these concepts to prioritize what should be fixed first.",
    keys: [
      "Threat = potential danger.",
      "Vulnerability = weakness.",
      "Risk = potential loss or impact.",
      "Control = protection used to reduce risk."
    ],
    example:
      "An outdated web server is a vulnerability. An attacker exploiting it is a threat event. The resulting business damage is risk.",
    scenario:
      "A company discovers an old application with a known security weakness. The team patches it before attackers exploit it.",
    remember:
      "Threat + vulnerability can create risk."
  },

  {
    id: 4,
    level: "FOUNDATION",
    title: "Assets & Security Controls",
    short: "Identify what needs protection and how controls help.",
    detail:
      "Assets include data, hardware, software, identities, services and reputation. Security controls are safeguards that reduce security risk.",
    why:
      "You cannot protect something effectively until you know what it is and how valuable it is.",
    keys: [
      "Administrative controls use policies and procedures.",
      "Technical controls use technology.",
      "Physical controls protect physical environments."
    ],
    example:
      "A server room can use locks as a physical control and access logging as a technical control.",
    scenario:
      "A company identifies customer records as a high-value asset and restricts access to authorized employees.",
    remember:
      "First identify the asset, then protect it."
  },

  {
    id: 5,
    level: "FOUNDATION",
    title: "Authentication & Authorization",
    short: "Understand identity verification versus permission.",
    detail:
      "Authentication answers 'Who are you?' Authorization answers 'What are you allowed to do?'",
    why:
      "Confusing these concepts can lead to excessive access and security failures.",
    keys: [
      "Authentication verifies identity.",
      "Authorization determines permissions.",
      "Accounting/logging records activity."
    ],
    example:
      "Logging into a student portal is authentication. Being allowed to view only your own marks is authorization.",
    scenario:
      "A user successfully logs in but cannot access the administrator dashboard. Authentication succeeded, but authorization correctly denied access.",
    remember:
      "AUTHENTICATION = identity. AUTHORIZATION = permission."
  },

  {
    id: 6,
    level: "FOUNDATION",
    title: "Password Security & MFA",
    short: "Use strong authentication to reduce account compromise.",
    detail:
      "Strong passwords should be long and unique. Multi-factor authentication adds another verification factor such as a hardware key, authenticator app or biometric.",
    why:
      "Passwords alone can be stolen, guessed, reused or phished.",
    keys: [
      "Use unique passwords.",
      "Prefer long passwords or passphrases.",
      "Use MFA.",
      "Never share authentication codes."
    ],
    example:
      "A student uses a password manager and MFA for their university account.",
    scenario:
      "An attacker knows a user's password but cannot access the account because MFA blocks the login.",
    remember:
      "MFA adds another layer beyond the password."
  },

  {
    id: 7,
    level: "DEFENSIVE",
    title: "Social Engineering & Phishing",
    short: "Recognize attacks that manipulate people.",
    detail:
      "Social engineering uses psychological manipulation to make people reveal information, transfer money or perform unsafe actions. Phishing commonly uses deceptive messages or websites.",
    why:
      "Technology cannot fully protect an organization if users are manipulated into bypassing security.",
    keys: [
      "Urgency is a common warning sign.",
      "Unexpected links require verification.",
      "Check sender and destination.",
      "Never share passwords or MFA codes."
    ],
    example:
      "A fake bank email tells a user to verify an account through a suspicious link.",
    scenario:
      "An employee receives an urgent message requesting an MFA code. The employee refuses and reports the message.",
    remember:
      "Stop → Verify → Report."
  },

  {
    id: 8,
    level: "DEFENSIVE",
    title: "Malware Fundamentals",
    short: "Learn the major categories of malicious software.",
    detail:
      "Malware is malicious software designed to disrupt, damage, spy on or gain unauthorized access to systems.",
    why:
      "Recognizing malware behavior helps defenders respond quickly.",
    keys: [
      "Virus",
      "Worm",
      "Trojan",
      "Spyware",
      "Ransomware"
    ],
    example:
      "Ransomware encrypts files and demands payment.",
    scenario:
      "Several files suddenly become inaccessible and receive unusual extensions. The organization isolates affected systems.",
    remember:
      "Unexpected file changes + suspicious processes = investigate."
  },

  {
    id: 9,
    level: "DEFENSIVE",
    title: "Network Security Basics",
    short: "Understand how networks are protected.",
    detail:
      "Network security protects communication, devices and services from unauthorized access and disruption.",
    why:
      "Networks connect users, applications, cloud services and critical systems.",
    keys: [
      "Segmentation",
      "Firewalls",
      "Secure protocols",
      "Monitoring",
      "Access control"
    ],
    example:
      "A company separates guest Wi-Fi from internal business systems.",
    scenario:
      "A guest device should not directly reach the company's database network, so segmentation is used.",
    remember:
      "Segmentation limits how far an incident can spread."
  },

  {
    id: 10,
    level: "DEFENSIVE",
    title: "Firewalls, IDS & IPS",
    short: "Know the role of three common network defenses.",
    detail:
      "Firewalls control network traffic according to rules. IDS systems detect suspicious activity. IPS systems can detect and actively block certain traffic.",
    why:
      "Different controls provide different layers of defense.",
    keys: [
      "Firewall = traffic control.",
      "IDS = detection.",
      "IPS = detection + prevention/blocking."
    ],
    example:
      "An IDS alerts analysts about suspicious traffic while an IPS may block matching malicious traffic.",
    scenario:
      "A security team wants alerts about suspicious network behavior without automatically blocking it. An IDS is appropriate.",
    remember:
      "IDS sees. IPS sees + can stop."
  },

  {
    id: 11,
    level: "INTERMEDIATE",
    title: "Cryptography Basics",
    short: "Understand encryption and secure communication.",
    detail:
      "Cryptography uses mathematical techniques to protect information. Encryption transforms readable plaintext into ciphertext that requires a key to recover.",
    why:
      "Sensitive information often travels across networks and must be protected from unauthorized viewing.",
    keys: [
      "Plaintext = readable information.",
      "Ciphertext = encrypted information.",
      "Key = secret or controlled value used by the algorithm.",
      "Encryption primarily supports confidentiality."
    ],
    example:
      "HTTPS protects web communication using cryptographic protocols.",
    scenario:
      "A company encrypts sensitive files so unauthorized people cannot read their contents.",
    remember:
      "Encryption protects readable data from unauthorized reading."
  },

  {
    id: 12,
    level: "INTERMEDIATE",
    title: "Hashing & SHA-256",
    short: "Learn one-way transformations and integrity checking.",
    detail:
      "A cryptographic hash function transforms input into a fixed-length digest. SHA-256 produces a 256-bit digest.",
    why:
      "Hashes can help verify whether data has changed.",
    keys: [
      "Hashing is not the same as encryption.",
      "SHA-256 produces a fixed-size digest.",
      "A small input change creates a very different digest.",
      "Hashes are commonly used for integrity verification."
    ],
    example:
      "A downloaded file can be hashed and compared with a trusted published hash.",
    scenario:
      "A forensic analyst calculates a SHA-256 hash before and after copying evidence to verify integrity.",
    remember:
      "Encryption is reversible with the correct key; hashing is designed as a one-way function."
  },

  {
    id: 13,
    level: "INTERMEDIATE",
    title: "Digital Signatures & PKI",
    short: "Understand trust, authenticity and digital signatures.",
    detail:
      "Digital signatures use asymmetric cryptography to provide evidence of authenticity and integrity. Public Key Infrastructure helps manage certificates and trust relationships.",
    why:
      "Organizations need ways to verify who or what produced digital information.",
    keys: [
      "Private key signs.",
      "Public key verifies.",
      "Certificates bind identities to public keys.",
      "Signatures can detect modification."
    ],
    example:
      "A software publisher signs an application so users can verify its origin and integrity.",
    scenario:
      "A browser validates a website certificate during an HTTPS connection.",
    remember:
      "Private key signs; public key verifies."
  },

  {
    id: 14,
    level: "INTERMEDIATE",
    title: "Web Security Fundamentals",
    short: "Understand common web application security principles.",
    detail:
      "Web security protects browsers, servers, APIs, databases and users from attacks and misuse.",
    why:
      "Web applications are exposed to large numbers of users and potentially untrusted input.",
    keys: [
      "Validate input.",
      "Use secure authentication.",
      "Enforce authorization.",
      "Protect sessions.",
      "Log important security events."
    ],
    example:
      "A banking application checks that a user is authorized before returning account information.",
    scenario:
      "A user changes an ID in a URL and sees another user's record. This indicates an authorization failure.",
    remember:
      "Never trust client-controlled input or identity claims."
  },

  {
    id: 15,
    level: "INTERMEDIATE",
    title: "Injection & XSS Concepts",
    short: "Recognize two major web application risks.",
    detail:
      "Injection occurs when untrusted input is interpreted as commands or queries. Cross-site scripting (XSS) occurs when untrusted content is executed in a user's browser.",
    why:
      "Improper input handling can allow attackers to influence application behavior.",
    keys: [
      "Use parameterized queries.",
      "Validate input.",
      "Encode output appropriately.",
      "Use secure frameworks and libraries."
    ],
    example:
      "Parameterized SQL queries help prevent SQL injection.",
    scenario:
      "A login form safely passes user input to the database through a parameterized query.",
    remember:
      "Treat external input as untrusted."
  },

  {
    id: 16,
    level: "DEFENSIVE",
    title: "Incident Response",
    short: "Learn how defenders handle security incidents.",
    detail:
      "Incident response is a structured process for preparing for, detecting, analyzing, containing, eradicating and recovering from security incidents.",
    why:
      "Fast and organized response can reduce damage and improve recovery.",
    keys: [
      "Preparation",
      "Detection and analysis",
      "Containment",
      "Eradication",
      "Recovery",
      "Lessons learned"
    ],
    example:
      "When ransomware is detected, defenders isolate affected systems before investigating and restoring them.",
    scenario:
      "A compromised laptop is disconnected from the network to prevent possible spread.",
    remember:
      "Contain first when appropriate, then investigate and recover."
  },

  {
    id: 17,
    level: "DEFENSIVE",
    title: "Logging & SIEM",
    short: "Use security logs to understand what happened.",
    detail:
      "Logs record system and security events. SIEM platforms collect, correlate and analyze security information from multiple sources.",
    why:
      "Without useful logs, investigating an incident becomes much harder.",
    keys: [
      "Authentication logs",
      "Firewall logs",
      "Application logs",
      "Endpoint events",
      "Correlation and alerting"
    ],
    example:
      "A SIEM correlates repeated failed logins with a successful login from an unusual location.",
    scenario:
      "An analyst reviews authentication and firewall logs to reconstruct suspicious activity.",
    remember:
      "Logs provide evidence and visibility."
  },

  {
    id: 18,
    level: "INTERMEDIATE",
    title: "Risk Management",
    short: "Prioritize security decisions based on risk.",
    detail:
      "Risk management identifies, evaluates and treats risks. Organizations may avoid, mitigate, transfer or accept risk depending on context.",
    why:
      "Organizations have limited resources and cannot eliminate every possible risk.",
    keys: [
      "Identify risk.",
      "Assess likelihood and impact.",
      "Choose treatment.",
      "Monitor changes."
    ],
    example:
      "A company prioritizes fixing a critical internet-facing vulnerability over a low-impact internal issue.",
    scenario:
      "A security team ranks vulnerabilities by likelihood and business impact before assigning remediation work.",
    remember:
      "Prioritize based on likelihood + impact."
  },

  {
    id: 19,
    level: "ADVANCED",
    title: "Zero Trust",
    short: "Never automatically trust based only on network location.",
    detail:
      "Zero Trust is a security approach that continuously verifies identities, devices, access and context rather than assuming that something is trustworthy simply because it is inside a network.",
    why:
      "Modern organizations use cloud services, remote work and distributed systems, making old perimeter assumptions weaker.",
    keys: [
      "Verify explicitly.",
      "Use least privilege.",
      "Assume breach.",
      "Continuously evaluate access."
    ],
    example:
      "An employee may need to authenticate and satisfy device requirements before accessing a sensitive application even from the corporate network.",
    scenario:
      "An internal employee attempts to access a sensitive database and is required to authenticate and receive only the permissions needed.",
    remember:
      "Never trust automatically; verify continuously."
  },

  {
    id: 20,
    level: "ADVANCED",
    title: "Threat Modeling",
    short: "Think about attacks before systems are deployed.",
    detail:
      "Threat modeling systematically identifies assets, trust boundaries, threats, vulnerabilities and mitigations during system design.",
    why:
      "Finding design weaknesses early is usually easier and cheaper than fixing them after deployment.",
    keys: [
      "Identify assets.",
      "Map data flows.",
      "Identify threats.",
      "Design mitigations.",
      "Review assumptions."
    ],
    example:
      "A development team threat-models a payment application before releasing it.",
    scenario:
      "Developers identify that a payment API accepts sensitive input and add authentication, authorization and validation requirements.",
    remember:
      "Secure design starts before deployment."
  },

  {
    id: 21,
    level: "ADVANCED",
    title: "Digital Forensics",
    short: "Collect and analyze digital evidence responsibly.",
    detail:
      "Digital forensics involves identifying, preserving, collecting, examining and reporting digital evidence.",
    why:
      "Investigators need trustworthy evidence to understand incidents and support organizational or legal processes.",
    keys: [
      "Preserve evidence.",
      "Maintain integrity.",
      "Document actions.",
      "Use chain of custody.",
      "Separate facts from assumptions."
    ],
    example:
      "An investigator calculates a hash of a forensic image to verify that the evidence remains unchanged.",
    scenario:
      "An analyst documents who handled evidence, when it was transferred and how it was stored.",
    remember:
      "Evidence must remain trustworthy and traceable."
  },

  {
    id: 22,
    level: "ADVANCED",
    title: "Cloud Security",
    short: "Protect systems and data in cloud environments.",
    detail:
      "Cloud security involves identity management, configuration security, encryption, logging, monitoring and understanding the shared responsibility model.",
    why:
      "Cloud environments can be highly dynamic and misconfiguration can expose sensitive resources.",
    keys: [
      "Least privilege IAM.",
      "Secure configuration.",
      "Encryption.",
      "Logging.",
      "Shared responsibility."
    ],
    example:
      "A cloud storage bucket is configured so sensitive files cannot be publicly accessed.",
    scenario:
      "A team discovers that a storage resource is public and immediately changes its access configuration.",
    remember:
      "Cloud security depends heavily on identity and configuration."
  },

  {
    id: 23,
    level: "ADVANCED",
    title: "Secure SDLC",
    short: "Build security into software development.",
    detail:
      "A Secure Software Development Life Cycle integrates security throughout requirements, design, coding, testing, deployment and maintenance.",
    why:
      "Security discovered only after deployment can be more expensive to fix.",
    keys: [
      "Secure requirements.",
      "Threat modeling.",
      "Code review.",
      "Security testing.",
      "Dependency management."
    ],
    example:
      "Developers run automated security checks during CI/CD before deployment.",
    scenario:
      "A development team identifies an authorization weakness during design review rather than after release.",
    remember:
      "Security is a lifecycle activity, not a final checkbox."
  },

  {
    id: 24,
    level: "ADVANCED",
    title: "Security Governance & Compliance",
    short: "Understand policies, responsibilities and requirements.",
    detail:
      "Security governance defines how security decisions are directed, monitored and aligned with organizational objectives. Compliance involves meeting applicable requirements.",
    why:
      "Security needs leadership, accountability and documented expectations.",
    keys: [
      "Policies",
      "Roles and responsibilities",
      "Risk oversight",
      "Audits",
      "Compliance requirements"
    ],
    example:
      "An organization creates a policy defining how sensitive data should be handled.",
    scenario:
      "A company assigns responsibility for reviewing security risks to an appropriate governance role.",
    remember:
      "Governance sets direction and accountability."
  },

  {
    id: 25,
    level: "ADVANCED",
    title: "Software Supply Chain Security",
    short: "Protect dependencies, packages and development pipelines.",
    detail:
      "Software supply chain security focuses on the components, tools and processes used to build and distribute software.",
    why:
      "A vulnerability or compromise in a dependency can affect many applications.",
    keys: [
      "Dependency inventory.",
      "Patch vulnerable packages.",
      "Verify sources.",
      "Protect CI/CD.",
      "Use software bills of materials where appropriate."
    ],
    example:
      "A development team scans third-party dependencies for known vulnerabilities.",
    scenario:
      "A vulnerable library is identified in an application and replaced with a patched version.",
    remember:
      "Your software can inherit risk from what it depends on."
  },

  {
    id: 26,
    level: "ADVANCED",
    title: "NIST CSF 2.0",
    short: "Understand the modern cybersecurity risk-management framework.",
    detail:
      "The NIST Cybersecurity Framework 2.0 provides a structure for managing cybersecurity risk. Its core functions are Govern, Identify, Protect, Detect, Respond and Recover.",
    why:
      "Frameworks help organizations organize security activities and communicate risk.",
    keys: [
      "Govern",
      "Identify",
      "Protect",
      "Detect",
      "Respond",
      "Recover"
    ],
    example:
      "An organization identifies critical assets, protects them, monitors for incidents and prepares recovery processes.",
    scenario:
      "Leadership establishes cybersecurity policies, roles and risk strategy. This aligns strongly with Govern.",
    remember:
      "GV → ID → PR → DE → RS → RC."
  },

  {
    id: 27,
    level: "ADVANCED",
    title: "OWASP Top 10",
    short: "Study common web application security risks.",
    detail:
      "The OWASP Top 10 is a widely used awareness resource for web application security risks. Use the current OWASP material when studying the latest categories.",
    why:
      "It gives developers and security learners a common vocabulary for discussing web application risks.",
    keys: [
      "Broken access control",
      "Injection",
      "Security misconfiguration",
      "Cryptographic failures",
      "Authentication failures",
      "Logging and monitoring"
    ],
    example:
      "An application checks authorization on the server before returning another user's information.",
    scenario:
      "A user changes an object identifier and obtains another user's data because the server failed to enforce authorization.",
    remember:
      "Authorization must be enforced server-side."
  }
];

/* =========================================================
   MATERIALS RENDERING
   ========================================================= */

function renderMaterialFilters() {
  const box = $("#materialFilters");
  if (!box) return;

  const levels = ["ALL", "FOUNDATION", "DEFENSIVE", "INTERMEDIATE", "ADVANCED"];

  box.innerHTML = levels
    .map(
      (level, index) =>
        `<button class="${index === 0 ? "active" : ""}" data-level="${level}">
          ${level}
        </button>`
    )
    .join("");
}

function renderMaterials() {
  const grid = $("#materialsGrid");
  if (!grid) return;

  const query = ($("#materialSearch")?.value || "")
    .trim()
    .toLowerCase();

  const activeFilter =
    $("#materialFilters .active")?.dataset.level || "ALL";

  const filtered = materials.filter((item) => {
    const matchesLevel =
      activeFilter === "ALL" || item.level === activeFilter;

    const text =
      `${item.title} ${item.short} ${item.detail} ${item.keys.join(" ")}`.toLowerCase();

    return matchesLevel && text.includes(query);
  });

  grid.innerHTML = filtered
    .map(
      (item) => `
      <article class="info-card material-card">
        <span class="card-tag">${escapeHTML(item.level)}</span>
        <h3>${escapeHTML(item.title)}</h3>
        <p>${escapeHTML(item.short)}</p>
        <div class="button-row">
          <button class="primary-btn small-btn" data-material="${item.id}">
            Study Topic →
          </button>
        </div>
      </article>
    `
    )
    .join("");

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>No materials found</h3>
        <p>Try another keyword or category.</p>
      </div>
    `;
  }
}

function openMaterial(id) {
  const item = materials.find((m) => m.id === Number(id));
  if (!item) return;

  const content = $("#detailContent");
  const overlay = $("#detailOverlay");

  if (!content || !overlay) return;

  content.innerHTML = `
    <p class="eyebrow">${escapeHTML(item.level)}</p>
    <h2>${escapeHTML(item.title)}</h2>

    <div class="detail-section">
      <h3>What is it?</h3>
      <p>${escapeHTML(item.detail)}</p>
    </div>

    <div class="detail-section">
      <h3>Why does it matter?</h3>
      <p>${escapeHTML(item.why)}</p>
    </div>

    <div class="detail-section">
      <h3>Key concepts</h3>
      <ul>
        ${item.keys.map((x) => `<li>${escapeHTML(x)}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-section">
      <h3>Example</h3>
      <p>${escapeHTML(item.example)}</p>
    </div>

    <div class="detail-section scenario-box">
      <h3>Scenario</h3>
      <p>${escapeHTML(item.scenario)}</p>
    </div>

    <div class="detail-section remember-box">
      <h3>Remember</h3>
      <p>${escapeHTML(item.remember)}</p>
    </div>

    <div class="button-row">
      <button class="primary-btn" data-ask-material="${item.id}">
        Ask AI about this
      </button>
      <button class="ghost-btn" data-web-material="${item.id}">
        Search Web ↗
      </button>
      <button class="ghost-btn" data-youtube-material="${item.id}">
        YouTube ↗
      </button>
    </div>
  `;

  overlay.classList.remove("hidden");
}

function askAboutMaterial(id) {
  const item = materials.find((m) => m.id === Number(id));
  if (!item) return;

  $("#detailOverlay")?.classList.add("hidden");

  showSection("ai");

  const prompt =
    `Explain ${item.title} in simple BTech CSE exam language with a definition, ` +
    `key points, one example, one scenario and a memory trick.`;

  $("#aiInput").value = prompt;
  askAI(prompt);
}

/* =========================================================
   CASE STUDIES
   ========================================================= */

const tracks = [
  {
    id: "phishing",
    title: "Phishing Files",
    description: "Investigate deceptive messages and social engineering.",
    icon: "✉"
  },
  {
    id: "ransomware",
    title: "Ransomware Response",
    description: "Practice defensive incident response decisions.",
    icon: "◆"
  },
  {
    id: "insider",
    title: "Insider Mystery",
    description: "Analyze access, logs and insider-risk scenarios.",
    icon: "◉"
  },
  {
    id: "web",
    title: "Web Shield",
    description: "Apply secure web application principles.",
    icon: "⌁"
  },
  {
    id: "forensics",
    title: "Digital Forensics Hunt",
    description: "Learn evidence preservation and investigation.",
    icon: "⌘"
  }
];

const caseData = {
  phishing: [
    ["Urgent Invoice", "An employee receives an unexpected invoice email demanding immediate payment.", "What should the employee do first?", ["Click the invoice quickly", "Verify the sender and report the message", "Forward it to everyone", "Disable all company systems"], "B", "Unexpected urgency is a common phishing warning sign. Verify before acting."],
    ["Suspicious Link", "A message contains a button labeled 'Company Portal' but its destination looks unfamiliar.", "Which clue is most important?", ["The email uses a company logo", "The link destination is suspicious", "The message is short", "The font looks normal"], "B", "The destination of a link can reveal a deceptive domain."],
    ["Unknown Attachment", "A supplier sends an unexpected executable attachment.", "What is the safest response?", ["Open it immediately", "Rename it", "Verify the sender and scan/report it", "Send it to a friend"], "C", "Unexpected attachments should be treated as untrusted."],
    ["MFA Request", "A user receives a message asking for a one-time MFA code.", "What should the user do?", ["Share it", "Post it", "Refuse and report the request", "Send it to the manager through the same message"], "C", "Legitimate support should not require users to casually disclose authentication codes."],
    ["Smishing", "A student receives a text message claiming their bank account will be closed unless they click a link.", "What type of social engineering is this?", ["Smishing", "Tailgating", "Shoulder surfing", "Dumpster diving"], "A", "SMS-based phishing is commonly called smishing."],
    ["Authority Pressure", "A fake executive asks an employee to urgently purchase gift cards.", "Which manipulation technique is being used?", ["Authority and urgency", "Encryption", "Hashing", "Network segmentation"], "A", "Attackers often exploit authority and urgency."],
    ["Report It", "An employee recognizes a phishing email before clicking anything.", "What is the best defensive action?", ["Ignore it forever", "Report it through the organization's process", "Reply angrily", "Publish it online"], "B", "Reporting helps security teams protect other users."],
    ["Evidence", "A suspicious message is reported to the security team.", "What can help investigation?", ["Deleting all traces", "Preserving the message and relevant headers", "Forwarding it publicly", "Changing the font"], "B", "Preserved evidence can help analysts investigate the event."],
    ["Prevention", "A company wants to reduce successful phishing attacks.", "Which combination is strongest?", ["Training only", "Technology only", "Training, technical controls and reporting", "No controls"], "C", "Defense in depth combines people, process and technology."],
    ["Response", "Several employees clicked a phishing link.", "What should security teams prioritize?", ["Blame employees", "Investigate affected accounts and contain the incident", "Delete logs", "Ignore it"], "B", "Containment and investigation reduce further risk."]
  ],

  ransomware: [
    ["Strange Extensions", "Several computers suddenly show unfamiliar file extensions.", "What should defenders suspect?", ["Normal maintenance", "Possible ransomware activity", "Printer failure", "Password expiration"], "B", "Sudden widespread file changes can indicate ransomware."],
    ["Isolation", "Ransomware is suspected on one workstation.", "What is an appropriate immediate defensive action?", ["Connect it to more systems", "Isolate the affected system", "Delete every backup", "Publish the files"], "B", "Isolation can reduce spread."],
    ["Backups", "A ransomware incident has affected production files.", "What should responders verify?", ["Whether reliable backups exist", "Whether users can change wallpaper", "Whether the keyboard works", "Whether email signatures changed"], "A", "Backups can support recovery if they are intact and trustworthy."],
    ["Preserve Evidence", "An incident responder needs to understand how the ransomware entered.", "What should be protected?", ["Logs and relevant evidence", "Only screenshots", "Nothing", "Random files"], "A", "Evidence can reveal root cause and scope."],
    ["Scope", "One server is infected and defenders suspect others may be affected.", "What should investigators determine?", ["The scope of compromise", "The office temperature", "Employee birthdays", "Wallpaper settings"], "A", "Determining scope helps containment and recovery."],
    ["Recovery", "Systems are isolated and verified clean backups are available.", "What is an appropriate recovery step?", ["Restore using trusted processes", "Reconnect everything blindly", "Delete all logs", "Disable security controls"], "A", "Recovery should use trusted systems and controlled processes."],
    ["Root Cause", "After recovery, the team investigates how the attack started.", "Why?", ["To identify and fix weaknesses", "To make the attack happen again", "To remove all documentation", "To blame users"], "A", "Root-cause analysis supports long-term improvement."],
    ["Communication", "A major incident affects business operations.", "Why is incident communication important?", ["To coordinate stakeholders", "To hide every fact", "To spread rumors", "To disable backups"], "A", "Clear communication helps coordinate response and recovery."],
    ["Lessons Learned", "The incident is resolved.", "What should happen next?", ["Conduct a lessons-learned review", "Forget everything", "Delete the incident report", "Remove monitoring"], "A", "Post-incident review improves future resilience."],
    ["Resilience", "A company wants to reduce future ransomware impact.", "Which approach is strongest?", ["Backups, segmentation, MFA, patching and response planning", "One password for everyone", "No monitoring", "Publicly sharing credentials"], "A", "Layered controls improve resilience."]
  ],

  insider: [
    ["Least Privilege", "An employee only needs access to one project.", "Which principle should guide access?", ["Least privilege", "Maximum privilege", "Anonymous access", "No logging"], "A", "Users should receive only the access needed for their role."],
    ["Access Review", "An employee changes departments.", "What should happen to old permissions?", ["Review and remove unnecessary access", "Keep everything forever", "Give administrator rights", "Disable all systems"], "A", "Access should match current responsibilities."],
    ["Log Anomaly", "A user account accesses sensitive files at an unusual time.", "What should analysts do?", ["Investigate the anomaly", "Ignore it automatically", "Delete logs", "Share credentials"], "A", "An unusual event is a signal for investigation, not automatic proof of guilt."],
    ["DLP", "An organization wants to reduce unauthorized transfer of sensitive data.", "Which type of control can help?", ["Data Loss Prevention", "Screen brightness", "Printer paper", "Wallpaper policy"], "A", "DLP can help identify or prevent inappropriate data movement."],
    ["Separation", "One employee can both request and approve a sensitive financial transaction.", "Which control could reduce this risk?", ["Separation of duties", "Shared passwords", "Open access", "No auditing"], "A", "Separating responsibilities reduces opportunities for abuse."],
    ["Privileged Access", "An administrator account has broad permissions.", "What is a strong practice?", ["Restrict and monitor privileged access", "Share the account", "Remove all logs", "Use it for everyone"], "A", "Privileged accounts require strong controls."],
    ["Due Care", "Management implements reasonable safeguards for important systems.", "What principle does this reflect?", ["Due care", "Random access", "Social engineering", "Encryption"], "A", "Due care means taking reasonable security precautions."],
    ["Fair Investigation", "An employee is suspected of misuse.", "What should investigators do?", ["Collect evidence objectively", "Assume guilt immediately", "Delete evidence", "Publish accusations"], "A", "Security investigations should distinguish evidence from assumptions."],
    ["Account Review", "A contractor's project ends.", "What should happen to the contractor account?", ["Disable or review access promptly", "Keep full access forever", "Share it", "Make it public"], "A", "Unused accounts increase unnecessary risk."],
    ["Reporting", "Evidence suggests a policy violation.", "What should the security team do?", ["Follow the organization's investigation and reporting process", "Post private evidence online", "Destroy records", "Ignore it"], "A", "Controlled reporting protects evidence and supports fair handling."]
  ],

  web: [
    ["Record Ownership", "A user changes an ID in a URL and sees another user's record.", "What security issue is most likely?", ["Broken access control", "Strong encryption", "Availability", "Backup failure"], "A", "Server-side authorization must verify ownership."],
    ["SQL Safety", "A developer builds SQL queries by directly concatenating user input.", "What should be used instead?", ["Parameterized queries", "More HTML", "Longer URLs", "Screenshots"], "A", "Parameterized queries help prevent SQL injection."],
    ["XSS Defense", "User-supplied content is displayed directly in a web page.", "What should developers consider?", ["Context-appropriate output encoding", "Removing all logs", "Giving admin access", "Sharing passwords"], "A", "Untrusted output should be handled safely."],
    ["Session Security", "A website keeps users logged in using a session token.", "What is important?", ["Secure session management", "Public session tokens", "Shared tokens", "No expiration"], "A", "Session tokens need appropriate protection and lifecycle controls."],
    ["CSRF", "A malicious page attempts to cause a user's browser to submit an unwanted state-changing request.", "Which defense can help?", ["CSRF protections", "More screen brightness", "Open permissions", "Plaintext passwords"], "A", "CSRF defenses help ensure state-changing requests are legitimate."],
    ["Input Validation", "A form accepts unexpected input.", "What is a strong principle?", ["Validate and constrain untrusted input", "Trust all input", "Disable authentication", "Delete logs"], "A", "Input should be treated as untrusted."],
    ["Secure Design", "A developer identifies an authorization problem before coding begins.", "What practice helped?", ["Threat modeling / secure design", "Password sharing", "No testing", "Open access"], "A", "Security should be considered during design."],
    ["Logging", "A web application suffers repeated failed administrator logins.", "What can help investigation?", ["Security logging and monitoring", "Deleting logs", "Ignoring events", "Disabling alerts"], "A", "Useful logs provide visibility into suspicious behavior."],
    ["Patching", "A framework has a known critical security vulnerability.", "What should the team do?", ["Apply a tested security update", "Ignore it", "Publish credentials", "Disable all security"], "A", "Known vulnerabilities should be remediated appropriately."],
    ["Defense in Depth", "A web application uses MFA, authorization, validation and monitoring.", "What principle does this demonstrate?", ["Defense in depth", "Single point of failure", "No trust", "Data deletion"], "A", "Multiple independent controls provide layered protection."]
  ],

  forensics: [
    ["File Hash", "An investigator wants to verify a forensic file did not change.", "What can help?", ["Cryptographic hash", "File rename", "Screenshot only", "Email forwarding"], "A", "Hashes can help verify integrity."],
    ["Metadata", "An investigator examines timestamps and file metadata.", "Why?", ["They may provide investigative context", "They automatically prove guilt", "They replace all evidence", "They disable malware"], "A", "Metadata can provide useful context but must be interpreted carefully."],
    ["DNS Logs", "An infected endpoint contacted a suspicious domain.", "Which source may help?", ["DNS logs", "Wallpaper settings", "Printer color", "Keyboard layout"], "A", "DNS logs can help reveal domain lookups."],
    ["Firewall Event", "A firewall recorded an unusual outbound connection.", "What can it provide?", ["Network evidence", "A guaranteed attacker's identity", "A password", "A replacement for all logs"], "A", "Firewall events can contribute to an investigation."],
    ["Timeline", "An analyst combines login, file and network events.", "What are they building?", ["An incident timeline", "A password list", "A firewall", "A database"], "A", "Timelines help reconstruct sequences of events."],
    ["Chain of Custody", "Evidence is transferred between investigators.", "What should be documented?", ["Who handled it and when", "Nothing", "Only the filename", "The investigator's favorite color"], "A", "Chain of custody supports evidence traceability."],
    ["Evidence Copy", "An analyst needs to examine a disk image.", "What is safer?", ["Work from a verified forensic copy", "Modify the original", "Delete the original", "Upload it publicly"], "A", "Investigators generally preserve originals and work from controlled copies."],
    ["Integrity Check", "A forensic image has a known hash.", "Why calculate it again later?", ["To verify integrity", "To change the evidence", "To create a password", "To disable logging"], "A", "Matching hashes provide evidence that the data has not changed."],
    ["Facts vs Assumptions", "An analyst sees an unusual login.", "What should the report say?", ["Document the observed fact and investigate possible explanations", "State guilt immediately", "Delete the event", "Invent a reason"], "A", "Good analysis separates facts from assumptions."],
    ["Final Report", "An investigation is complete.", "What should the final report contain?", ["Methods, evidence, findings and conclusions", "Only rumors", "Passwords", "Unverified accusations"], "A", "A professional report explains what was examined and what was found."]
  ]
};

function getCaseList(trackId) {
  return caseData[trackId] || [];
}

function renderCases() {
  const grid = $("#casesGrid");
  if (!grid) return;

  grid.innerHTML = tracks
    .map((track) => {
      const done = getCaseList(track.id).filter((_, i) =>
        state.completedCases.includes(`${track.id}-${i + 1}`)
      ).length;

      return `
        <article class="case-track">
          <div class="case-icon">${track.icon}</div>
          <div>
            <p class="eyebrow">${done}/10 COMPLETE</p>
            <h3>${escapeHTML(track.title)}</h3>
            <p>${escapeHTML(track.description)}</p>
          </div>
          <button class="primary-btn" data-track="${track.id}">
            View Levels →
          </button>
        </article>
      `;
    })
    .join("");

  const levels = $("#caseLevels");
  if (levels) {
    levels.classList.add("hidden");
    levels.innerHTML = "";
  }
}

function openTrack(trackId) {
  const track = tracks.find((t) => t.id === trackId);
  const list = getCaseList(trackId);

  if (!track || !list.length) return;

  const grid = $("#casesGrid");
  const levels = $("#caseLevels");

  if (!grid || !levels) return;

  grid.classList.add("hidden");
  levels.classList.remove("hidden");

  levels.innerHTML = `
    <div class="section-heading">
      <div>
        <p class="eyebrow">INVESTIGATION TRACK</p>
        <h3>${escapeHTML(track.title)}</h3>
        <p>${escapeHTML(track.description)}</p>
      </div>
      <button class="ghost-btn" data-back-cases>← All Tracks</button>
    </div>

    <div class="level-grid">
      ${list
        .map((item, index) => {
          const number = index + 1;
          const id = `${trackId}-${number}`;
          const complete = state.completedCases.includes(id);

          return `
            <button class="level-card ${complete ? "complete" : ""}"
                    data-case="${trackId}|${number}">
              <span>LEVEL ${number}</span>
              <b>${escapeHTML(item[0])}</b>
              <small>${complete ? "✓ Completed" : "Start Investigation →"}</small>
            </button>
          `;
        })
        .join("")}
    </div>
  `;
}

function openCase(trackId, number) {
  const list = getCaseList(trackId);
  const item = list[number - 1];
  const track = tracks.find((t) => t.id === trackId);

  if (!item || !track) return;

  const content = $("#detailContent");
  const overlay = $("#detailOverlay");

  if (!content || !overlay) return;

  const [title, scenario, question, options, answer, explanation] = item;

  content.innerHTML = `
    <p class="eyebrow">${escapeHTML(track.title)} · LEVEL ${number}</p>
    <h2>${escapeHTML(title)}</h2>

    <div class="detail-section scenario-box">
      <h3>Mission Briefing</h3>
      <p>${escapeHTML(scenario)}</p>
    </div>

    <div class="detail-section">
      <h3>Clues</h3>
      <ul>
        <li>Look for unusual behavior.</li>
        <li>Identify the security principle involved.</li>
        <li>Choose the safest defensive action.</li>
      </ul>
    </div>

    <div class="detail-section">
      <h3>Question</h3>
      <p><strong>${escapeHTML(question)}</strong></p>

      <div class="case-options">
        ${options
          .map(
            (option, index) => `
              <button
                class="case-option"
                data-answer="${String.fromCharCode(65 + index)}"
                data-correct="${answer}"
                data-track="${trackId}"
                data-level="${number}"
              >
                <span>${String.fromCharCode(65 + index)}</span>
                ${escapeHTML(option)}
              </button>
            `
          )
          .join("")}
      </div>
    </div>

    <div id="caseResult"></div>

    <button
      id="hintBtn"
      class="ghost-btn"
      data-hint="${escapeHTML(explanation)}"
    >
      💡 Show Hint
    </button>
  `;

  overlay.classList.remove("hidden");
}

function answerCase(button) {
  const selected = button.dataset.answer;
  const correct = button.dataset.correct;
  const track = button.dataset.track;
  const level = Number(button.dataset.level);

  $$(".case-option").forEach((option) => {
    option.disabled = true;

    if (option.dataset.answer === correct) {
      option.classList.add("correct");
    }

    if (
      option.dataset.answer === selected &&
      selected !== correct
    ) {
      option.classList.add("wrong");
    }
  });

  const result = $("#caseResult");
  if (!result) return;

  const isCorrect = selected === correct;

  if (isCorrect) {
    const caseId = `${track}-${level}`;
    let earned = 0;

    if (!state.completedCases.includes(caseId)) {
      state.completedCases.push(caseId);
      earned = 25;
      state.xp += earned;
      checkBadges();
      save();
      updateHeader();
    }

    result.innerHTML = `
      <div class="result success">
        <h3>✓ Correct!</h3>
        <p>You identified the correct defensive decision.</p>
        <strong>${earned ? "+" + earned + " XP" : "Already completed · review mode"}</strong>
      </div>
    `;

    toast(earned ? `Case solved! +${earned} XP` : "Case reviewed.");
  } else {
    result.innerHTML = `
      <div class="result error">
        <h3>Not quite.</h3>
        <p>Review the highlighted correct option and explanation.</p>
      </div>
    `;

    toast("Review the correct answer and explanation.");
  }

  const explanation = caseData[track][level - 1][5];

  result.innerHTML += `
    <div class="detail-section">
      <h3>Explanation</h3>
      <p>${escapeHTML(explanation)}</p>
    </div>
  `;

  renderCases();
}

function showHint(text) {
  toast(text);
}

/* =========================================================
   MINI QUIZ
   ========================================================= */

const quizQuestions = [
  {
    q: "A database record is changed without authorization. Which CIA property is affected most directly?",
    options: ["Confidentiality", "Integrity", "Availability", "Authentication"],
    answer: 1,
    explanation: "Integrity means information remains accurate and trustworthy."
  },
  {
    q: "A password is stolen, but an authenticator app blocks the attacker's login. Which control helped?",
    options: ["MFA", "Hashing only", "Firewall only", "Backup"],
    answer: 0,
    explanation: "MFA requires an additional authentication factor."
  },
  {
    q: "A logged-in user changes an ID and views another user's data. What is the primary issue?",
    options: ["Broken access control", "Encryption", "Availability", "Compression"],
    answer: 0,
    explanation: "The server failed to enforce authorization for the requested resource."
  },
  {
    q: "A security system detects suspicious network traffic and alerts analysts without blocking it. What is it?",
    options: ["IDS", "IPS", "Backup", "Password manager"],
    answer: 0,
    explanation: "An IDS focuses on detection and alerting."
  },
  {
    q: "Which is primarily designed as a one-way transformation?",
    options: ["Encryption", "Hashing", "Compression", "Encoding"],
    answer: 1,
    explanation: "Cryptographic hashes are designed as one-way functions."
  },
  {
    q: "A message urgently asks for an MFA code. What is the safest response?",
    options: ["Share the code", "Ignore security rules", "Refuse and report it", "Post it"],
    answer: 2,
    explanation: "Authentication codes should never be casually disclosed."
  },
  {
    q: "Ransomware is detected on one endpoint. What should defenders consider immediately?",
    options: ["Isolation", "Sharing the endpoint", "Deleting backups", "Disabling monitoring"],
    answer: 0,
    explanation: "Isolation can reduce the chance of further spread."
  },
  {
    q: "Which principle gives a user only the access required for their role?",
    options: ["Least privilege", "Maximum privilege", "Open access", "Anonymous access"],
    answer: 0,
    explanation: "Least privilege limits permissions to what is necessary."
  },
  {
    q: "In NIST CSF 2.0, which function focuses on cybersecurity strategy, policy and oversight?",
    options: ["Protect", "Detect", "Govern", "Recover"],
    answer: 2,
    explanation: "Govern establishes and monitors cybersecurity strategy and expectations."
  },
  {
    q: "What is a strong defense against SQL injection?",
    options: ["Parameterized queries", "More screenshots", "Longer usernames", "Disabling logs"],
    answer: 0,
    explanation: "Parameterized queries separate data from SQL commands."
  }
];

let quizAnswers = {};

function renderQuiz() {
  const area = $("#quizArea");
  if (!area) return;

  if (Object.keys(quizAnswers).length === quizQuestions.length) {
    const score = calculateQuizScore();

    area.innerHTML = `
      <div class="quiz-complete">
        <p class="eyebrow">QUIZ COMPLETE</p>
        <h2>${score}/10</h2>
        <p>You answered ${score} questions correctly.</p>
        <button class="primary-btn" data-restart-quiz>
          Try Again
        </button>
      </div>
    `;

    return;
  }

  area.innerHTML = `
    <div class="quiz-head">
      <div>
        <p class="eyebrow">10 SCENARIOS</p>
        <h3>Apply what you know</h3>
      </div>
      <span class="pill">${Object.keys(quizAnswers).length}/10</span>
    </div>

    ${quizQuestions
      .map(
        (item, index) => `
        <div class="quiz-question">
          <p>
            <strong>${index + 1}.</strong>
            ${escapeHTML(item.q)}
          </p>

          <div class="quiz-options">
            ${item.options
              .map(
                (option, optionIndex) => `
                  <button
                    class="${
                      quizAnswers[index] !== undefined
                        ? optionIndex === item.answer
                          ? "correct"
                          : quizAnswers[index] === optionIndex
                          ? "wrong"
                          : ""
                        : ""
                    }"
                    data-quiz="${index}|${optionIndex}"
                    ${
                      quizAnswers[index] !== undefined
                        ? "disabled"
                        : ""
                    }
                  >
                    ${String.fromCharCode(65 + optionIndex)}.
                    ${escapeHTML(option)}
                  </button>
                `
              )
              .join("")}
          </div>

          ${
            quizAnswers[index] !== undefined
              ? `
                <small class="quiz-explanation">
                  ${escapeHTML(item.explanation)}
                </small>
              `
              : ""
          }
        </div>
      `
      )
      .join("")}
  `;
}

function answerQuiz(questionIndex, optionIndex) {
  if (quizAnswers[questionIndex] !== undefined) return;

  quizAnswers[questionIndex] = optionIndex;
  renderQuiz();

  if (Object.keys(quizAnswers).length === quizQuestions.length) {
    const score = calculateQuizScore();

    if (score > state.quizBest) {
      state.quizBest = score;

      if (!state.quizAttemptAwarded) {
        state.xp += score * 5;
        state.quizAttemptAwarded = true;
      }
    }

    checkBadges();
    save();
    updateHeader();
  }
}

function calculateQuizScore() {
  return quizQuestions.reduce(
    (score, question, index) =>
      score +
      (quizAnswers[index] === question.answer ? 1 : 0),
    0
  );
}

function restartQuiz() {
  quizAnswers = {};
  renderQuiz();
}

/* =========================================================
   PRACTICE LABS
   ========================================================= */

const labs = [
  {
    id: "base64",
    title: "Base64 Encode / Decode",
    icon: "B64",
    theory:
      "Base64 is an encoding scheme that represents binary data using printable characters. It is encoding, not encryption.",
    why:
      "Base64 appears in data transfer, email, APIs and security investigations.",
    steps: [
      "Enter text.",
      "Choose Encode or Decode.",
      "Run the operation.",
      "Inspect the result."
    ],
    example: "Text: CyberHunt → Base64: Q3liZXJIdW50",
    remember: "Base64 does NOT provide confidentiality."
  },
  {
    id: "url",
    title: "URL Encode / Decode",
    icon: "URL",
    theory:
      "URL encoding converts characters into a format suitable for use inside URLs.",
    why:
      "Web applications frequently handle user-controlled URL parameters.",
    steps: [
      "Enter a URL or text.",
      "Choose Encode or Decode.",
      "Run the operation.",
      "Compare the input and output."
    ],
    example: "hello world → hello%20world",
    remember: "URL encoding is not encryption."
  },
  {
    id: "hex",
    title: "Hex Encode / Decode",
    icon: "HEX",
    theory:
      "Hexadecimal represents bytes using symbols 0–9 and A–F.",
    why:
      "Hex is common in digital forensics, networking and data inspection.",
    steps: [
      "Enter text.",
      "Encode it into hexadecimal.",
      "Copy the result.",
      "Decode it back."
    ],
    example: "ABC → 41 42 43",
    remember: "Hex is a representation, not encryption."
  },
  {
    id: "rot13",
    title: "ROT13",
    icon: "13",
    theory:
      "ROT13 substitutes each alphabetic character with the character 13 positions away.",
    why:
      "It is useful for understanding substitution and reversible transformations.",
    steps: [
      "Enter text.",
      "Apply ROT13.",
      "Apply ROT13 again.",
      "Observe that the original text returns."
    ],
    example: "HELLO → URYYB",
    remember: "ROT13 provides no serious security."
  },
  {
    id: "sha256",
    title: "SHA-256 Hashing",
    icon: "#",
    theory:
      "SHA-256 is a cryptographic hash function that produces a 256-bit digest.",
    why:
      "Hashes can be used to verify data integrity and identify exact content.",
    steps: [
      "Enter text.",
      "Generate SHA-256.",
      "Copy the digest.",
      "Change one character and hash again."
    ],
    example:
      "A tiny input change should produce a substantially different digest.",
    remember: "Hashing is designed as a one-way transformation."
  }
];

function renderLabs() {
  const grid = $("#labsGrid");
  if (!grid) return;

  grid.innerHTML = labs
    .map(
      (lab) => `
      <article class="info-card lab-card">
        <div class="lab-icon">${escapeHTML(lab.icon)}</div>
        <span class="card-tag">SAFE PRACTICE</span>
        <h3>${escapeHTML(lab.title)}</h3>
        <p>${escapeHTML(lab.theory)}</p>
        <button class="primary-btn" data-lab="${lab.id}">
          Learn & Practice →
        </button>
      </article>
    `
    )
    .join("");
}

function openLab(id) {
  const lab = labs.find((x) => x.id === id);
  if (!lab) return;

  const content = $("#detailContent");
  const overlay = $("#detailOverlay");

  if (!content || !overlay) return;

  content.innerHTML = `
    <p class="eyebrow">SAFE PRACTICE LAB</p>
    <h2>${escapeHTML(lab.title)}</h2>

    <div class="detail-section">
      <h3>Theory</h3>
      <p>${escapeHTML(lab.theory)}</p>
    </div>

    <div class="detail-section">
      <h3>Why it matters</h3>
      <p>${escapeHTML(lab.why)}</p>
    </div>

    <div class="detail-section">
      <h3>Steps</h3>
      <ol>
        ${lab.steps.map((x) => `<li>${escapeHTML(x)}</li>`).join("")}
      </ol>
    </div>

    <div class="detail-section scenario-box">
      <h3>Worked example</h3>
      <p>${escapeHTML(lab.example)}</p>
    </div>

    <div class="detail-section remember-box">
      <h3>Remember</h3>
      <p>${escapeHTML(lab.remember)}</p>
    </div>

    <button class="primary-btn full" data-start-lab="${lab.id}">
      Start Practice →
    </button>
  `;

  overlay.classList.remove("hidden");
}

function startLab(id) {
  const lab = labs.find((x) => x.id === id);
  if (!lab) return;

  const content = $("#detailContent");
  if (!content) return;

  content.innerHTML = `
    <p class="eyebrow">PRACTICE</p>
    <h2>${escapeHTML(lab.title)}</h2>

    <div class="lab-practice">
      <textarea
        id="labInput"
        rows="5"
        placeholder="Enter your text here..."
      ></textarea>

      ${
        id === "base64"
          ? `
          <div class="button-row">
            <button class="primary-btn" data-lab-action="base64-encode">Encode</button>
            <button class="ghost-btn" data-lab-action="base64-decode">Decode</button>
          </div>
        `
          : ""
      }

      ${
        id === "url"
          ? `
          <div class="button-row">
            <button class="primary-btn" data-lab-action="url-encode">Encode</button>
            <button class="ghost-btn" data-lab-action="url-decode">Decode</button>
          </div>
        `
          : ""
      }

      ${
        id === "hex"
          ? `
          <div class="button-row">
            <button class="primary-btn" data-lab-action="hex-encode">Encode</button>
            <button class="ghost-btn" data-lab-action="hex-decode">Decode</button>
          </div>
        `
          : ""
      }

      ${
        id === "rot13"
          ? `
          <button class="primary-btn full" data-lab-action="rot13">
            Apply ROT13
          </button>
        `
          : ""
      }

      ${
        id === "sha256"
          ? `
          <button class="primary-btn full" data-lab-action="sha256">
            Generate SHA-256
          </button>
        `
          : ""
      }

      <div id="labOutput" class="lab-output">
        Result will appear here.
      </div>
    </div>
  `;
}

function markLabComplete(id) {
  if (!state.completedLabs.includes(id)) {
    state.completedLabs.push(id);
    state.xp += 30;

    checkBadges();
    save();
    updateHeader();

    toast("Lab completed! +30 XP");
  }
}

function base64Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64Decode(text) {
  const binary = atob(text.trim());
  const bytes = Uint8Array.from(binary, (char) =>
    char.charCodeAt(0)
  );

  return new TextDecoder().decode(bytes);
}

function hexEncode(text) {
  return [...new TextEncoder().encode(text)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
}

function hexDecode(text) {
  const clean = text.replace(/[^0-9a-fA-F]/g, "");

  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hexadecimal input.");
  }

  const bytes = [];

  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

function rot13(text) {
  return text.replace(/[A-Za-z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode(
      ((char.charCodeAt(0) - base + 13) % 26) + base
    );
  });
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);

  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function runLabAction(action) {
  const input = $("#labInput")?.value || "";
  const output = $("#labOutput");

  if (!output) return;

  try {
    let result = "";

    if (action === "base64-encode") {
      result = base64Encode(input);
    }

    if (action === "base64-decode") {
      result = base64Decode(input);
    }

    if (action === "url-encode") {
      result = encodeURIComponent(input);
    }

    if (action === "url-decode") {
      result = decodeURIComponent(input);
    }

    if (action === "hex-encode") {
      result = hexEncode(input);
    }

    if (action === "hex-decode") {
      result = hexDecode(input);
    }

    if (action === "rot13") {
      result = rot13(input);
    }

    if (action === "sha256") {
      result = await sha256(input);
    }

    output.textContent = result;

    const id = action.split("-")[0];

    if (labs.some((lab) => lab.id === id)) {
      markLabComplete(id);
    }
  } catch (error) {
    output.textContent =
      "Invalid input. Please check the value and try again.";
  }
}

/* =========================================================
   BADGES
   ========================================================= */

const badgeDefinitions = [
  {
    id: "first-case",
    title: "First Case",
    description: "Solve your first cybersecurity case.",
    condition: () => state.completedCases.length >= 1
  },
  {
    id: "foundation",
    title: "Foundation Complete",
    description: "Complete your first 5 cases.",
    condition: () => state.completedCases.length >= 5
  },
  {
    id: "phishing",
    title: "Phishing Analyst",
    description: "Complete all Phishing Files cases.",
    condition: () =>
      getCaseList("phishing").every((_, i) =>
        state.completedCases.includes(`phishing-${i + 1}`)
      )
  },
  {
    id: "ransomware",
    title: "Ransomware Responder",
    description: "Complete all Ransomware Response cases.",
    condition: () =>
      getCaseList("ransomware").every((_, i) =>
        state.completedCases.includes(`ransomware-${i + 1}`)
      )
  },
  {
    id: "insider",
    title: "Insider Investigator",
    description: "Complete all Insider Mystery cases.",
    condition: () =>
      getCaseList("insider").every((_, i) =>
        state.completedCases.includes(`insider-${i + 1}`)
      )
  },
  {
    id: "web",
    title: "Web Defender",
    description: "Complete all Web Shield cases.",
    condition: () =>
      getCaseList("web").every((_, i) =>
        state.completedCases.includes(`web-${i + 1}`)
      )
  },
  {
    id: "forensics",
    title: "Forensics Analyst",
    description: "Complete all Digital Forensics cases.",
    condition: () =>
      getCaseList("forensics").every((_, i) =>
        state.completedCases.includes(`forensics-${i + 1}`)
      )
  },
  {
    id: "ten-levels",
    title: "10 Levels",
    description: "Solve 10 case studies.",
    condition: () => state.completedCases.length >= 10
  },
  {
    id: "twenty-five-levels",
    title: "25 Levels",
    description: "Solve 25 case studies.",
    condition: () => state.completedCases.length >= 25
  },
  {
    id: "fifty-levels",
    title: "50 Levels",
    description: "Complete every case study.",
    condition: () => state.completedCases.length >= 50
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Score at least 8/10 on the quiz.",
    condition: () => state.quizBest >= 8
  },
  {
    id: "lab-explorer",
    title: "Lab Explorer",
    description: "Complete all five practice labs.",
    condition: () => state.completedLabs.length >= 5
  },
  {
    id: "graduate",
    title: "CyberHunt Graduate",
    description: "Complete all major learning activities.",
    condition: () =>
      state.completedCases.length >= 50 &&
      state.completedLabs.length >= 5 &&
      state.quizBest >= 8
  }
];

function checkBadges() {
  badgeDefinitions.forEach((badge) => {
    if (badge.condition() && !state.badges.includes(badge.id)) {
      state.badges.push(badge.id);
      toast("Badge unlocked: " + badge.title);
    }
  });
}

function renderBadges() {
  const grid = $("#badgesGrid");
  if (!grid) return;

  grid.innerHTML = badgeDefinitions
    .map((badge) => {
      const unlocked = state.badges.includes(badge.id);

      return `
        <article class="badge-card ${unlocked ? "unlocked" : "locked"}">
          <div class="badge-symbol">
            ${unlocked ? "◇" : "?"}
          </div>
          <span class="card-tag">
            ${unlocked ? "UNLOCKED" : "LOCKED"}
          </span>
          <h3>${escapeHTML(badge.title)}</h3>
          <p>${escapeHTML(badge.description)}</p>
        </article>
      `;
    })
    .join("");
}

/* =========================================================
   AI STUDY STUDIO
   ========================================================= */

const aiKnowledge = [
  {
    keywords: ["cia", "confidentiality", "integrity", "availability"],
    title: "CIA Triad",
    answer:
      "The CIA Triad has three goals: Confidentiality means only authorized people can access information. Integrity means information stays accurate and trustworthy. Availability means authorized users can access systems and data when needed."
  },
  {
    keywords: ["phishing", "email scam", "smishing", "social engineering"],
    title: "Phishing",
    answer:
      "Phishing is a social-engineering technique that tries to trick users into revealing information or performing unsafe actions. Warning signs include urgency, suspicious links, unexpected attachments, unusual sender addresses and requests for passwords or MFA codes. A good response is Stop → Verify → Report."
  },
  {
    keywords: ["hash", "hashing", "sha", "sha-256", "sha256"],
    title: "Hashing",
    answer:
      "Hashing converts input into a fixed-length digest. SHA-256 produces a 256-bit digest. Hashing is designed as a one-way transformation and is commonly used for integrity verification. It is different from encryption."
  },
  {
    keywords: ["encryption", "cryptography", "ciphertext"],
    title: "Encryption",
    answer:
      "Encryption transforms plaintext into ciphertext using a cryptographic algorithm and key. Its main security purpose is confidentiality. Unlike hashing, encryption is designed so authorized users can recover the original data."
  },
  {
    keywords: ["authentication", "authorization", "auth"],
    title: "Authentication vs Authorization",
    answer:
      "Authentication answers 'Who are you?' Authorization answers 'What are you allowed to do?' Logging in is authentication. Permission to view or edit a specific resource is authorization."
  },
  {
    keywords: ["mfa", "multi factor", "multifactor", "2fa"],
    title: "MFA",
    answer:
      "Multi-factor authentication requires more than one authentication factor. For example, a password plus an authenticator-app approval. MFA reduces the impact of stolen passwords."
  },
  {
    keywords: ["ransomware"],
    title: "Ransomware",
    answer:
      "Ransomware is malware that commonly encrypts data and demands payment. Defensive priorities can include isolation, investigation, preserving evidence, checking trustworthy backups, removing the cause and controlled recovery."
  },
  {
    keywords: ["malware", "virus", "worm", "trojan", "spyware"],
    title: "Malware",
    answer:
      "Malware is malicious software. Common categories include viruses, worms, Trojans, spyware and ransomware. Defenses include secure configuration, patching, endpoint protection, access controls, backups and user awareness."
  },
  {
    keywords: ["firewall", "ids", "ips"],
    title: "Firewall, IDS and IPS",
    answer:
      "A firewall controls network traffic using rules. An IDS detects suspicious activity and alerts defenders. An IPS can detect and actively block certain traffic. They provide different layers of network defense."
  },
  {
    keywords: ["sql injection", "sql"],
    title: "SQL Injection",
    answer:
      "SQL injection can occur when untrusted input is incorrectly incorporated into database queries. Strong defenses include parameterized queries, safe database APIs, input validation and least-privilege database accounts."
  },
  {
    keywords: ["xss", "cross site scripting"],
    title: "XSS",
    answer:
      "Cross-site scripting occurs when untrusted content is executed in a user's browser. Common defenses include context-appropriate output encoding, safe frameworks, input handling and appropriate security policies."
  },
  {
    keywords: ["incident response", "incident"],
    title: "Incident Response",
    answer:
      "Incident response is the organized handling of security incidents. A common lifecycle includes preparation, detection and analysis, containment, eradication, recovery and lessons learned."
  },
  {
    keywords: ["least privilege"],
    title: "Least Privilege",
    answer:
      "Least privilege means giving users, applications and services only the permissions they need to perform their tasks. This reduces the possible impact of compromised accounts."
  },
  {
    keywords: ["zero trust"],
    title: "Zero Trust",
    answer:
      "Zero Trust does not automatically trust users or devices simply because they are inside a network. It emphasizes explicit verification, least privilege and continuous evaluation."
  },
  {
    keywords: ["nist", "csf", "cybersecurity framework"],
    title: "NIST CSF 2.0",
    answer:
      "NIST CSF 2.0 organizes cybersecurity risk management around six Core Functions: Govern, Identify, Protect, Detect, Respond and Recover."
  },
  {
    keywords: ["owasp", "top 10"],
    title: "OWASP Top 10",
    answer:
      "The OWASP Top 10 is a widely used awareness resource for important web application security risks. For current study, learners should consult the latest official OWASP publication."
  },
  {
    keywords: ["risk", "vulnerability", "threat"],
    title: "Threat, Vulnerability and Risk",
    answer:
      "A threat is a potential cause of harm. A vulnerability is a weakness. Risk represents the potential for loss or impact when threats interact with vulnerabilities. Controls reduce risk."
  },
  {
    keywords: ["digital forensics", "forensics", "evidence"],
    title: "Digital Forensics",
    answer:
      "Digital forensics involves preserving, collecting, examining and reporting digital evidence. Important ideas include integrity, hashing, documentation, timelines and chain of custody."
  }
];

function findAIAnswer(question) {
  const q = question.toLowerCase();

  let best = null;
  let bestScore = 0;

  aiKnowledge.forEach((entry) => {
    let score = 0;

    entry.keywords.forEach((keyword) => {
      if (q.includes(keyword)) score += keyword.length;
    });

    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  if (best) {
    return {
      title: best.title,
      text:
        best.answer +
        "\n\nExam tip: In a scenario question, identify the asset, threat, vulnerability and security principle before choosing the answer."
    };
  }

  return {
    title: "Cybersecurity Study Guidance",
    text:
      "Start by identifying the cybersecurity concept involved. Ask yourself: What is being protected? What is the threat? What weakness is involved? Which security principle or control applies? Then connect the situation to concepts such as CIA, authentication, authorization, least privilege, defense in depth or incident response."
  };
}

function addChatMessage(type, title, text) {
  const box = $("#chatMessages");
  if (!box) return;

  const message = document.createElement("div");
  message.className = "chat-message " + type;

  message.innerHTML = `
    <div class="chat-message-title">${escapeHTML(title)}</div>
    <div class="chat-message-text">
      ${escapeHTML(text).replace(/\n/g, "<br>")}
    </div>
  `;

  box.appendChild(message);
  box.scrollTop = box.scrollHeight;
}

function renderChat() {
  const box = $("#chatMessages");
  if (!box) return;

  box.innerHTML = "";

  if (!state.aiHistory.length) {
    addChatMessage(
      "assistant",
      "CyberHunt AI",
      "Hi! I'm your cybersecurity study assistant. Ask me about CIA, phishing, ransomware, hashing, encryption, authentication, web security, incident response, NIST, OWASP and more."
    );
    return;
  }

  state.aiHistory.forEach((message) => {
    addChatMessage(
      message.role,
      message.title,
      message.text
    );
  });
}

function askAI(question) {
  const q = question.trim();
  if (!q) return;

  const answer = findAIAnswer(q);

  state.aiHistory.push({
    role: "user",
    title: "You",
    text: q
  });

  state.aiHistory.push({
    role: "assistant",
    title: answer.title,
    text: answer.text
  });

  /*
    Keep session history manageable.
  */
  if (state.aiHistory.length > 30) {
    state.aiHistory = state.aiHistory.slice(-30);
  }

  save();
  renderChat();
}

/* =========================================================
   LIVE WEB + YOUTUBE
   ========================================================= */

function webSearch(query) {
  const q = (query || "").trim();

  if (!q) {
    toast("Enter a topic to research.");
    return;
  }

  const url =
    "https://www.google.com/search?q=" +
    encodeURIComponent(q + " cybersecurity");

  openExternal(url);

  toast("Live Web research opened.");
}

function youtubeSearch(query) {
  const q = (query || "").trim();

  if (!q) {
    toast("Enter a topic for YouTube.");
    return;
  }

  const url =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(q + " cybersecurity tutorial");

  openExternal(url);

  toast("YouTube learning opened.");
}

/* =========================================================
   EVENT HANDLERS
   ========================================================= */

function initEvents() {
  /* LOGIN */

  const loginForm = $("#loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      login();
    });
  }

  /* LOGOUT */

  $("#logoutBtn")?.addEventListener("click", logout);

  /* NAVIGATION */

  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      showSection(button.dataset.section);
    });
  });

  $$("[data-go]").forEach((button) => {
    button.addEventListener("click", () => {
      showSection(button.dataset.go);
    });
  });

  /* MOBILE MENU */

  $("#menuBtn")?.addEventListener("click", () => {
    $("#sidebar")?.classList.toggle("mobile-open");
  });

  /* MATERIAL SEARCH */

  $("#materialSearch")?.addEventListener("input", renderMaterials);

  /* MATERIAL FILTERS */

  $("#materialFilters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-level]");
    if (!button) return;

    $$("#materialFilters button").forEach((item) =>
      item.classList.remove("active")
    );

    button.classList.add("active");
    renderMaterials();
  });

  /* LIVE WEB */

  $("#webSearchBtn")?.addEventListener("click", () => {
    webSearch($("#webQuery")?.value);
  });

  /* YOUTUBE */

  $("#youtubeSearchBtn")?.addEventListener("click", () => {
    youtubeSearch($("#webQuery")?.value);
  });

  /* AI FORM */

  $("#aiForm")?.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = $("#aiInput");
    const q = input?.value.trim();

    if (!q) return;

    askAI(q);

    if (input) input.value = "";

    /*
      The same topic goes to both research options.
    */
    webSearch(q);
    youtubeSearch(q);
  });

  /* SUGGESTED AI PROMPTS */

  document.addEventListener("click", (event) => {
    const promptButton = event.target.closest("[data-prompt]");

    if (promptButton) {
      const prompt = promptButton.dataset.prompt;

      showSection("ai");

      if ($("#aiInput")) {
        $("#aiInput").value = prompt;
      }

      askAI(prompt);

      webSearch(prompt);
      youtubeSearch(prompt);

      if ($("#aiInput")) {
        $("#aiInput").value = "";
      }

      return;
    }

    /* WEB PRESETS */

    const webButton = event.target.closest("[data-web]");

    if (webButton) {
      const query = webButton.dataset.web;

      if ($("#webQuery")) {
        $("#webQuery").value = query;
      }

      webSearch(query);
      return;
    }

    /* YOUTUBE PRESETS */

    const youtubeButton = event.target.closest("[data-youtube]");

    if (youtubeButton) {
      const query = youtubeButton.dataset.youtube;

      if ($("#webQuery")) {
        $("#webQuery").value = query;
      }

      youtubeSearch(query);
      return;
    }

    /* MATERIAL */

    const materialButton =
      event.target.closest("[data-material]");

    if (materialButton) {
      openMaterial(materialButton.dataset.material);
      return;
    }

    /* MATERIAL ASK AI */

    const askMaterialButton =
      event.target.closest("[data-ask-material]");

    if (askMaterialButton) {
      askAboutMaterial(
        askMaterialButton.dataset.askMaterial
      );
      return;
    }

    /* MATERIAL WEB */

    const materialWebButton =
      event.target.closest("[data-web-material]");

    if (materialWebButton) {
      const item = materials.find(
        (m) =>
          m.id === Number(
            materialWebButton.dataset.webMaterial
          )
      );

      if (item) webSearch(item.title);
      return;
    }

    /* MATERIAL YOUTUBE */

    const materialYoutubeButton =
      event.target.closest("[data-youtube-material]");

    if (materialYoutubeButton) {
      const item = materials.find(
        (m) =>
          m.id === Number(
            materialYoutubeButton.dataset.youtubeMaterial
          )
      );

      if (item) youtubeSearch(item.title);
      return;
    }

    /* CASE TRACK */

    const trackButton = event.target.closest("[data-track]");

    if (trackButton) {
      openTrack(trackButton.dataset.track);
      return;
    }

    /* CASE LEVEL */

    const caseButton = event.target.closest("[data-case]");

    if (caseButton) {
      const [track, level] =
        caseButton.dataset.case.split("|");

      openCase(track, Number(level));
      return;
    }

    /* BACK TO CASES */

    if (event.target.closest("[data-back-cases]")) {
      renderCases();
      return;
    }

    /* CASE ANSWER */

    const answerButton =
      event.target.closest("[data-answer]");

    if (
      answerButton &&
      answerButton.classList.contains("case-option")
    ) {
      answerCase(answerButton);
      return;
    }

    /* HINT */

    const hintButton = event.target.closest("[data-hint]");

    if (hintButton) {
      showHint(hintButton.dataset.hint);
      return;
    }

    /* QUIZ */

    const quizButton = event.target.closest("[data-quiz]");

    if (quizButton) {
      const [questionIndex, optionIndex] =
        quizButton.dataset.quiz.split("|");

      answerQuiz(
        Number(questionIndex),
        Number(optionIndex)
      );

      return;
    }

    /* RESTART QUIZ */

    if (event.target.closest("[data-restart-quiz]")) {
      restartQuiz();
      return;
    }

    /* LAB */

    const labButton = event.target.closest("[data-lab]");

    if (labButton) {
      openLab(labButton.dataset.lab);
      return;
    }

    /* START LAB */

    const startLabButton =
      event.target.closest("[data-start-lab]");

    if (startLabButton) {
      startLab(startLabButton.dataset.startLab);
      return;
    }

    /* LAB ACTION */

    const labActionButton =
      event.target.closest("[data-lab-action]");

    if (labActionButton) {
      runLabAction(labActionButton.dataset.labAction);
      return;
    }
  });

  /* CLOSE DETAIL */

  $("#closeDetail")?.addEventListener("click", () => {
    $("#detailOverlay")?.classList.add("hidden");
  });

  $("#detailOverlay")?.addEventListener("click", (event) => {
    if (event.target.id === "detailOverlay") {
      event.currentTarget.classList.add("hidden");
    }
  });
}

/* =========================================================
   INITIAL RENDER
   ========================================================= */

function renderAll() {
  renderMaterialFilters();
  renderMaterials();
  renderCases();
  renderQuiz();
  renderLabs();
  renderBadges();
  updateHeader();
}

/* =========================================================
   START CYBERHUNT
   ========================================================= */

function init() {
  load();

  /*
    Login listener is initialized regardless of whether
    the user has previously logged in.
  */
  initEvents();

  renderAll();

  let loggedIn = false;

  try {
    loggedIn =
      sessionStorage.getItem("cyberhuntLoggedIn") === "1";
  } catch (e) {}

  /*
    If the current browser session is already logged in,
    show the application.
  */
  if (loggedIn && state.user) {
    $("#loginPage")?.classList.add("hidden");
    $("#app")?.classList.remove("hidden");

    updateHeader();
    showSection(state.currentSection || "dashboard");
    renderChat();
  } else {
    $("#loginPage")?.classList.remove("hidden");
    $("#app")?.classList.add("hidden");
  }
}

/*
  Because the script tag in your HTML uses "defer",
  DOMContentLoaded is safe and prevents the login
  elements from being accessed before they exist.
*/
document.addEventListener("DOMContentLoaded", init);
