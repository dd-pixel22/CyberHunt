/* =========================================================
   CYBERHUNT
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

const STORAGE_KEY = "cyberhunt_state";

let state = {
  loggedIn: false,
  username: "",
  email: "",
  xp: 0,
  solvedCases: [],
  badges: [],
  quizScore: 0,
  quizCompleted: 0
};

const savedState = localStorage.getItem(STORAGE_KEY);

if (savedState) {
  try {
    state = {
      ...state,
      ...JSON.parse(savedState)
    };
  } catch (error) {
    console.log("Starting fresh.");
  }
}


/* =========================================================
   ELEMENTS
   ========================================================= */

const loginPage = document.getElementById("loginPage");
const app = document.getElementById("app");

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");
const userCircle = document.getElementById("userCircle");
const welcomeName = document.getElementById("welcomeName");

const topXP = document.getElementById("topXP");
const topLevel = document.getElementById("topLevel");

const dashXP = document.getElementById("dashXP");
const dashCases = document.getElementById("dashCases");
const dashBadges = document.getElementById("dashBadges");
const dashQuiz = document.getElementById("dashQuiz");

const mainProgress = document.getElementById("mainProgress");
const mainProgressText = document.getElementById("mainProgressText");


/* =========================================================
   SAVE
   ========================================================= */

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}


/* =========================================================
   LOGIN
   ========================================================= */

loginForm.addEventListener("submit", function(event) {

  event.preventDefault();

  const email =
    document.getElementById("email").value.trim();

  const username =
    document.getElementById("username").value.trim();

  const password =
    document.getElementById("password").value;

  loginError.textContent = "";


  if (!email.includes("@")) {
    loginError.textContent =
      "Please enter a valid email address.";
    return;
  }


  if (!/^[A-Za-z0-9]+$/.test(username)) {
    loginError.textContent =
      "Username can contain letters and numbers only.";
    return;
  }


  if (password.length < 8) {
    loginError.textContent =
      "Password must contain at least 8 characters.";
    return;
  }


  state.loggedIn = true;
  state.username = username;
  state.email = email;

  saveState();

  loginPage.classList.add("hidden");
  app.classList.remove("hidden");

  updateUI();

  showToast(
    "Welcome to CyberHunt, Detective " + username + "!"
  );

});


/* =========================================================
   LOGOUT
   ========================================================= */

document
  .getElementById("logoutBtn")
  .addEventListener("click", function() {

    state.loggedIn = false;

    saveState();

    app.classList.add("hidden");
    loginPage.classList.remove("hidden");

  });


/* =========================================================
   INITIAL LOGIN STATE
   ========================================================= */

if (state.loggedIn && state.username) {

  loginPage.classList.add("hidden");
  app.classList.remove("hidden");

  updateUI();

}


/* =========================================================
   NAVIGATION
   ========================================================= */

const navItems =
  document.querySelectorAll(".nav-item");

const sections =
  document.querySelectorAll(".page-section");


function openSection(sectionId) {

  sections.forEach(section => {
    section.classList.remove("active");
  });

  const target =
    document.getElementById(sectionId);

  if (target) {
    target.classList.add("active");
  }


  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.section === sectionId
    );

  });


  document
    .getElementById("sidebar")
    .classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


navItems.forEach(item => {

  item.addEventListener("click", function() {

    openSection(
      this.dataset.section
    );

  });

});


document.querySelectorAll("[data-go]")
  .forEach(button => {

    button.addEventListener("click", function() {

      openSection(
        this.dataset.go
      );

    });

  });


document
  .getElementById("mobileMenu")
  .addEventListener("click", function() {

    document
      .getElementById("sidebar")
      .classList.toggle("open");

  });


/* =========================================================
   UI
   ========================================================= */

function getLevel() {

  return Math.floor(state.xp / 100) + 1;

}


function updateUI() {

  const name =
    state.username || "Detective";

  const initials =
    name.charAt(0).toUpperCase();


  profileName.textContent = name;
  profileAvatar.textContent = initials;
  userCircle.textContent = initials;

  welcomeName.textContent = name;


  topXP.textContent = state.xp;
  topLevel.textContent = getLevel();


  dashXP.textContent = state.xp;
  dashCases.textContent = state.solvedCases.length;
  dashBadges.textContent = state.badges.length;


  const quizPercent =
    state.quizCompleted > 0
      ? Math.round(
          (state.quizScore /
            state.quizCompleted) * 100
        )
      : 0;

  dashQuiz.textContent =
    quizPercent + "%";


  const progress =
    Math.min(
      100,
      Math.round(
        (state.solvedCases.length / 50) * 100
      )
    );


  mainProgress.style.width =
    progress + "%";

  mainProgressText.textContent =
    progress + "%";


  document.getElementById(
    "caseSolvedCount"
  ).textContent =
    state.solvedCases.length;


  updateBadges();

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;

function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(() => {

      toast.classList.remove("show");

    }, 3000);

}


/* =========================================================
   AI STUDY STUDIO
   ========================================================= */

const aiForm =
  document.getElementById("aiForm");

const aiInput =
  document.getElementById("aiInput");

const chatMessages =
  document.getElementById("chatMessages");


function addChatMessage(
  message,
  isUser = false
) {

  const div =
    document.createElement("div");

  div.className =
    "chat-message " +
    (isUser
      ? "user-message"
      : "ai-message");


  div.innerHTML = `

    <div class="chat-avatar">
      ${isUser ? "D" : "◈"}
    </div>

    <div>

      <strong>
        ${isUser ? "You" : "CyberHunt AI"}
      </strong>

      <p>${message}</p>

    </div>

  `;

  chatMessages.appendChild(div);

  chatMessages.scrollTop =
    chatMessages.scrollHeight;

}


function aiResponse(question) {

  const q =
    question.toLowerCase();


  if (
    q.includes("cia") ||
    q.includes("confidentiality")
  ) {

    return `
      <b>CIA Triad</b> means
      <b>Confidentiality, Integrity and Availability</b>.<br><br>

      🔐 Confidentiality = only authorized people can access data.<br>
      🧾 Integrity = data should remain accurate and unaltered.<br>
      ⚡ Availability = systems and information should be available when needed.<br><br>

      <b>Exam trick:</b> Ask yourself:
      "Who can see it? Can it be changed? Can I access it?"
    `;

  }


  if (
    q.includes("phishing")
  ) {

    return `
      <b>Phishing</b> is a social-engineering attack where an attacker
      attempts to trick a person into revealing information or performing
      an unsafe action.<br><br>

      Example:
      You receive an email pretending to be from your bank asking you
      to urgently verify your account.<br><br>

      <b>Detective clues:</b> urgency, suspicious links, unexpected
      attachments and requests for sensitive information.
    `;

  }


  if (
    q.includes("hash") ||
    q.includes("hashing")
  ) {

    return `
      <b>Hashing</b> converts data into a fixed-length value using a
      mathematical algorithm.<br><br>

      A good cryptographic hash is designed so that changing the input
      changes the resulting hash significantly.<br><br>

      Common example:
      <b>SHA-256</b>.<br><br>

      <b>Remember:</b> Hashing is generally one-way; encryption is designed
      to be reversible with the appropriate key.
    `;

  }


  if (
    q.includes("encryption") ||
    q.includes("encrypt")
  ) {

    return `
      <b>Encryption</b> transforms readable plaintext into ciphertext
      so that authorized users can recover the original information
      using the appropriate key.<br><br>

      <b>Simple memory trick:</b><br>
      Plaintext → Encryption → Ciphertext
    `;

  }


  if (
    q.includes("malware")
  ) {

    return `
      <b>Malware</b> is malicious software designed to perform harmful
      or unauthorized actions.<br><br>

      Examples include viruses, worms, trojans and ransomware.<br><br>

      <b>Detective clue:</b> If the scenario focuses on malicious software,
      think about the malware category first.
    `;

  }


  if (
    q.includes("ransomware")
  ) {

    return `
      <b>Ransomware</b> is malware that commonly prevents access to data
      or systems and demands payment from the victim.<br><br>

      <b>Scenario clue:</b> Files become inaccessible and a message
      demands money → think ransomware.
    `;

  }


  if (
    q.includes("firewall")
  ) {

    return `
      A <b>firewall</b> is a security control that monitors and filters
      network traffic according to defined rules.<br><br>

      Think of it as a security checkpoint between network environments.
    `;

  }


  if (
    q.includes("authentication")
  ) {

    return `
      <b>Authentication</b> answers:
      "Who are you?"<br><br>

      Examples include passwords, security keys and biometrics.<br><br>

      <b>Authentication ≠ Authorization.</b><br>
      Authentication verifies identity.
      Authorization determines what that identity is allowed to do.
    `;

  }


  if (
    q.includes("authorization")
  ) {

    return `
      <b>Authorization</b> determines what an authenticated user is
      permitted to access or perform.<br><br>

      <b>Memory trick:</b><br>
      Authentication = Who are you?<br>
      Authorization = What can you do?
    `;

  }


  if (
    q.includes("network")
  ) {

    return `
      A computer network allows devices to communicate and share
      resources.<br><br>

      Important concepts to learn include:
      IP addresses, protocols, routers, switches, TCP/IP, DNS and HTTP/HTTPS.
    `;

  }


  if (
    q.includes("sql")
  ) {

    return `
      <b>SQL</b> is used to work with relational databases.<br><br>

      DDL examples:
      CREATE, ALTER, DROP<br><br>

      DML examples:
      INSERT, UPDATE, DELETE
    `;

  }


  return `
    I found your question interesting, Detective.<br><br>

    Try asking me about:
    <b>CIA Triad, phishing, malware, ransomware, hashing,
    encryption, authentication, authorization, firewalls,
    networking or SQL.</b><br><br>

    For this GitHub version, my knowledge comes from the built-in
    CyberHunt study library.
  `;

}


aiForm.addEventListener(
  "submit",
  function(event) {

    event.preventDefault();

    const question =
      aiInput.value.trim();

    if (!question) return;


    addChatMessage(
      question,
      true
    );

    aiInput.value = "";


    setTimeout(() => {

      addChatMessage(
        aiResponse(question)
      );

    }, 400);

  }
);


document
  .querySelectorAll(".suggestion")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        aiInput.value =
          this.textContent.trim();

        aiForm.dispatchEvent(
          new Event("submit")
        );

      }
    );

  });


/* =========================================================
   MATERIALS
   ========================================================= */

const materials = {

  beginner: [

    {
      icon: "01",
      title: "Cybersecurity Fundamentals",
      description:
        "Understand the basic purpose of cybersecurity and how organizations protect information.",
      points: [
        "Cybersecurity definition",
        "Assets and vulnerabilities",
        "Threats and risks",
        "Security controls"
      ]
    },

    {
      icon: "02",
      title: "CIA Triad",
      description:
        "The three foundational security goals used when protecting information.",
      points: [
        "Confidentiality",
        "Integrity",
        "Availability",
        "Scenario identification"
      ]
    },

    {
      icon: "03",
      title: "Basic Security Terms",
      description:
        "Learn the vocabulary needed to understand security incidents.",
      points: [
        "Threat",
        "Vulnerability",
        "Risk",
        "Attack",
        "Asset"
      ]
    },

    {
      icon: "04",
      title: "Authentication",
      description:
        "Learn how systems verify the identity of users.",
      points: [
        "Passwords",
        "Biometrics",
        "MFA",
        "Authentication vs authorization"
      ]
    },

    {
      icon: "05",
      title: "Phishing & Social Engineering",
      description:
        "Understand how attackers manipulate people rather than only technology.",
      points: [
        "Phishing",
        "Smishing",
        "Vishing",
        "Social engineering clues"
      ]
    },

    {
      icon: "06",
      title: "Malware",
      description:
        "Understand common forms of malicious software.",
      points: [
        "Virus",
        "Worm",
        "Trojan",
        "Ransomware"
      ]
    }

  ],


  intermediate: [

    {
      icon: "07",
      title: "Network Security",
      description:
        "Study how networks are monitored and protected.",
      points: [
        "TCP/IP",
        "Ports",
        "Firewalls",
        "Network segmentation"
      ]
    },

    {
      icon: "08",
      title: "Cryptography",
      description:
        "Understand the fundamentals of protecting information mathematically.",
      points: [
        "Plaintext",
        "Ciphertext",
        "Keys",
        "Symmetric and asymmetric encryption"
      ]
    },

    {
      icon: "09",
      title: "Hashing",
      description:
        "Learn how cryptographic hash functions are used.",
      points: [
        "SHA-256",
        "Integrity",
        "Password storage concepts",
        "One-way transformation"
      ]
    },

    {
      icon: "10",
      title: "Web Security",
      description:
        "Understand common web application security concepts.",
      points: [
        "HTTPS",
        "Sessions",
        "Input validation",
        "OWASP concepts"
      ]
    },

    {
      icon: "11",
      title: "Incident Response",
      description:
        "Learn the general process organizations use after detecting incidents.",
      points: [
        "Preparation",
        "Detection",
        "Containment",
        "Recovery"
      ]
    },

    {
      icon: "12",
      title: "Access Control",
      description:
        "Understand how organizations decide who can access resources.",
      points: [
        "Least privilege",
        "RBAC",
        "Authorization",
        "Access reviews"
      ]
    }

  ],


  advanced: [

    {
      icon: "13",
      title: "Security Architecture",
      description:
        "Understand how security controls work together across an organization.",
      points: [
        "Defense in depth",
        "Zero trust",
        "Segmentation",
        "Security boundaries"
      ]
    },

    {
      icon: "14",
      title: "Digital Forensics",
      description:
        "Learn the principles of investigating digital evidence.",
      points: [
        "Evidence preservation",
        "Chain of custody",
        "Timeline analysis",
        "Evidence integrity"
      ]
    },

    {
      icon: "15",
      title: "Threat Intelligence",
      description:
        "Understand how security teams collect and analyze information about threats.",
      points: [
        "Indicators",
        "Threat actors",
        "Tactics",
        "Risk analysis"
      ]
    },

    {
      icon: "16",
      title: "Security Governance",
      description:
        "Study how organizations manage security through policies and processes.",
      points: [
        "Policies",
        "Risk management",
        "Compliance",
        "Security awareness"
      ]
    },

    {
      icon: "17",
      title: "Cloud Security",
      description:
        "Understand important security considerations in cloud environments.",
      points: [
        "Identity",
        "Access management",
        "Configuration",
        "Shared responsibility"
      ]
    },

    {
      icon: "18",
      title: "Security Operations",
      description:
        "Explore how security teams monitor and respond to suspicious activity.",
      points: [
        "SIEM concepts",
        "Alert triage",
        "Log analysis",
        "Incident escalation"
      ]
    }

  ]

};


const materialContent =
  document.getElementById(
    "materialContent"
  );


function renderMaterials(level) {

  materialContent.innerHTML = "";

  materials[level].forEach(item => {

    const card =
      document.createElement("article");

    card.className =
      "material-card";

    card.innerHTML = `

      <div class="material-icon">
        ${item.icon}
      </div>

      <h3>${item.title}</h3>

      <p>
        ${item.description}
      </p>

      <ul class="material-points">

        ${item.points
          .map(
            point =>
              `<li>${point}</li>`
          )
          .join("")}

      </ul>

    `;

    materialContent.appendChild(card);

  });

}


renderMaterials("beginner");


document
  .querySelectorAll(".material-tab")
  .forEach(tab => {

    tab.addEventListener(
      "click",
      function() {

        document
          .querySelectorAll(".material-tab")
          .forEach(t =>
            t.classList.remove("active")
          );

        this.classList.add("active");

        renderMaterials(
          this.dataset.level
        );

      }
    );

  });


/* =========================================================
   CASE STUDIES
   5 CASES × 10 LEVELS
   ========================================================= */

const caseDefinitions = [

  {
    id: "phishing",
    name: "The Phishing Trail",
    short: "Social Engineering",
    icon: "01"
  },

  {
    id: "ransomware",
    name: "Locked Files",
    short: "Ransomware Incident",
    icon: "02"
  },

  {
    id: "insider",
    name: "The Insider Clue",
    short: "Access Control",
    icon: "03"
  },

  {
    id: "network",
    name: "Ghost on the Network",
    short: "Network Security",
    icon: "04"
  },

  {
    id: "data",
    name: "The Missing Database",
    short: "Data Protection",
    icon: "05"
  }

];


const scenarioTemplates = {

  phishing: [
    "An employee receives an urgent message asking them to verify an account.",
    "A suspicious email contains a link that does not match the organization name.",
     
        
