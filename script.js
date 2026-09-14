/* =========================================================
   CYBERHUNT
   Beginner-friendly JavaScript
   ========================================================= */


/* ================= USER / PROGRESS ================= */

let currentUser = {
    username: "",
    email: ""
};

let progress = {
    xp: 0,
    cases: [],
    labs: 0,
    badges: [],
    quizPoints: 0
};

const caseData = [
    {
        id: 0,
        number: "CASE FILE 01",
        title: "Operation Phantom Email",
        difficulty: "BEGINNER",
        description:
            "An employee received an urgent email asking them to verify their corporate account.",
        event:
            "At 09:14 AM, an employee received an email that appeared to come from the IT department. The message warned that the employee's account would be suspended unless they clicked a link and entered their credentials.",
        clues: [
            "The sender address contains a slightly altered company domain.",
            "The message creates urgency and threatens account suspension.",
            "The link leads to a page that looks like the company's login page."
        ],
        question:
            "What type of cyber attack is most likely taking place?",
        options: [
            "Phishing",
            "DDoS attack",
            "Physical theft",
            "Data backup"
        ],
        answer: 0,
        explanation:
            "This is phishing. The attacker is using a deceptive message and fake login page to trick the victim into revealing information.",
        hint:
            "Think about an attacker pretending to be a trusted organization.",
        badge: "Phishing Hunter"
    },

    {
        id: 1,
        number: "CASE FILE 02",
        title: "The Silent USB",
        difficulty: "BEGINNER",
        description:
            "A mysterious USB device was found connected to a workstation in a restricted area.",
        event:
            "Security logs show that a previously unknown USB device was connected to a workstation. Shortly afterward, unusual files appeared on the machine.",
        clues: [
            "The USB device does not belong to the organization.",
            "The workstation normally blocks unknown removable devices.",
            "Several unfamiliar executable files appeared afterward."
        ],
        question:
            "What security risk should investigators consider first?",
        options: [
            "Malware introduction",
            "Strong authentication",
            "Software update",
            "Data compression"
        ],
        answer: 0,
        explanation:
            "Unknown removable media can introduce malicious software. Investigators should safely isolate and examine the device rather than executing unknown files.",
        hint:
            "Think about what can happen when unknown software enters a trusted computer.",
        badge: "Evidence Hunter"
    },

    {
        id: 2,
        number: "CASE FILE 03",
        title: "Locked at Midnight",
        difficulty: "INTERMEDIATE",
        description:
            "A company's shared files suddenly became inaccessible late at night.",
        event:
            "At 12:07 AM, employees began receiving reports that shared documents could no longer be opened. File names had changed and a message demanded payment.",
        clues: [
            "Many files became inaccessible at approximately the same time.",
            "A message demands payment.",
            "The incident began after a suspicious executable was opened."
        ],
        question:
            "Which threat best matches the incident?",
        options: [
            "Ransomware",
            "Firewall",
            "DNS",
            "Password manager"
        ],
        answer: 0,
        explanation:
            "Ransomware is malware that can encrypt or otherwise make data inaccessible and demand payment from victims.",
        hint:
            "The attacker wants money and the organization's files are inaccessible.",
        badge: "Ransomware Responder"
    },

    {
        id: 3,
        number: "CASE FILE 04",
        title: "The Open Door",
        difficulty: "INTERMEDIATE",
        description:
            "A server unexpectedly becomes reachable from the public internet.",
        event:
            "During a routine security review, analysts discover that a development server is accessible from outside the organization. The server was never intended to be public.",
        clues: [
            "The server is intended only for internal testing.",
            "An external connection successfully reaches the service.",
            "The security team discovers an unnecessary open network port."
        ],
        question:
            "What security issue is being investigated?",
        options: [
            "Misconfiguration",
            "Strong encryption",
            "Phishing",
            "Data normalization"
        ],
        answer: 0,
        explanation:
            "An incorrectly exposed service can result from security misconfiguration. Proper network rules and access controls should restrict unnecessary exposure.",
        hint:
            "Something that should have been closed was accidentally left accessible.",
        badge: "Security Investigator"
    },

    {
        id: 4,
        number: "CASE FILE 05",
        title: "The Stolen Identity",
        difficulty: "ADVANCED",
        description:
            "A user notices login activity that they do not recognize.",
        event:
            "A security analyst sees several successful login attempts associated with a user's account. The user says they were not active at those times.",
        clues: [
            "Successful logins occurred from unfamiliar locations.",
            "The account password was recently reused on another service.",
            "The organization has detected credential exposure on an unrelated website."
        ],
        question:
            "What is the most likely explanation?",
        options: [
            "Compromised credentials",
            "Screen brightness",
            "File compression",
            "Printer failure"
        ],
        answer: 0,
        explanation:
            "The evidence suggests that the account credentials may have been compromised and reused by an unauthorized person.",
        hint:
            "Focus on the relationship between reused passwords and unexpected successful logins.",
        badge: "Identity Defender"
    }
];


const badgesData = [
    {
        icon: "⌕",
        name: "Phishing Hunter",
        description: "Complete Operation Phantom Email."
    },
    {
        icon: "▣",
        name: "Evidence Hunter",
        description: "Investigate the Silent USB."
    },
    {
        icon: "⌁",
        name: "Ransomware Responder",
        description: "Solve the Locked at Midnight case."
    },
    {
        icon: "⚡",
        name: "Security Investigator",
        description: "Solve The Open Door."
    },
    {
        icon: "♜",
        name: "Identity Defender",
        description: "Complete The Stolen Identity."
    }
];


/* ================= MATERIALS ================= */

const materials = {

    beginner: [
        {
            icon: "◈",
            title: "What is Cybersecurity?",
            description:
                "Understand cybersecurity, threats, assets, vulnerabilities and basic security principles."
        },
        {
            icon: "△",
            title: "CIA Triad",
            description:
                "Learn confidentiality, integrity and availability — the three core goals of information security."
        },
        {
            icon: "🔑",
            title: "Authentication",
            description:
                "Learn passwords, multi-factor authentication and the difference between authentication and authorization."
        },
        {
            icon: "⌕",
            title: "Cyber Threats",
            description:
                "Explore malware, phishing, social engineering, ransomware and other common threats."
        },
        {
            icon: "▣",
            title: "Passwords",
            description:
                "Understand strong passwords, password managers, reuse risks and account protection."
        },
        {
            icon: "🌐",
            title: "Basic Networking",
            description:
                "Learn IP addresses, DNS, ports, protocols and how devices communicate."
        }
    ],

    intermediate: [
        {
            icon: "⚔",
            title: "Malware",
            description:
                "Study viruses, worms, trojans, spyware and ransomware at a conceptual level."
        },
        {
            icon: "✉",
            title: "Social Engineering",
            description:
                "Understand how attackers manipulate people through phishing, pretexting and related techniques."
        },
        {
            icon: "🔐",
            title: "Cryptography",
            description:
                "Learn encryption, keys, hashing, digital signatures and certificates."
        },
        {
            icon: "▥",
            title: "Network Security",
            description:
                "Understand firewalls, segmentation, secure protocols and network monitoring."
        },
        {
            icon: "◉",
            title: "Incident Response",
            description:
                "Learn how organizations detect, contain, investigate and recover from incidents."
        },
        {
            icon: "⌁",
            title: "Security Monitoring",
            description:
                "Understand logs, alerts, indicators of compromise and security monitoring concepts."
        }
    ],

    advanced: [
        {
            icon: "◈",
            title: "Digital Forensics",
            description:
                "Explore evidence preservation, timelines, logs and forensic investigation concepts."
        },
        {
            icon: "☁",
            title: "Cloud Security",
            description:
                "Learn identity, access control, configuration and shared responsibility concepts."
        },
        {
            icon: "⚡",
            title: "Threat Intelligence",
            description:
                "Understand indicators, threat actors, intelligence sources and defensive analysis."
        },
        {
            icon: "⌘",
            title: "Security Architecture",
            description:
                "Study defense in depth, zero trust and security design principles."
        },
        {
            icon: "▤",
            title: "Vulnerability Management",
            description:
                "Learn how organizations identify, prioritize and remediate security weaknesses."
        },
        {
            icon: "♜",
            title: "Ethical Security Testing",
            description:
                "Understand authorized security testing, scope, rules of engagement and responsible disclosure."
        }
    ]

};


/* ================= QUIZ DATA ================= */

const quizData = [
    {
        question: "An attacker sends a fake login email to steal credentials. What is this?",
        options: ["Phishing", "Encryption", "Firewall", "Backup"],
        answer: 0,
        explanation: "Phishing uses deceptive communication to trick users into revealing information."
    },

    {
        question: "Which three concepts form the CIA Triad?",
        options: [
            "Confidentiality, Integrity, Availability",
            "Control, Internet, Access",
            "Code, Identity, Authentication",
            "Cloud, Infrastructure, Antivirus"
        ],
        answer: 0,
        explanation: "CIA stands for Confidentiality, Integrity and Availability."
    },

    {
        question: "Which technique converts data into a fixed-size digest?",
        options: [
            "Hashing",
            "Formatting",
            "Compression",
            "Routing"
        ],
        answer: 0,
        explanation: "Hashing produces a digest from input data and is commonly used for integrity verification."
    },

    {
        question: "A malicious program encrypts files and demands payment. What is it?",
        options: [
            "Ransomware",
            "Firewall",
            "DNS",
            "Authentication"
        ],
        answer: 0,
        explanation: "Ransomware commonly makes data inaccessible and demands payment."
    },

    {
        question: "Which is the strongest example of multi-factor authentication?",
        options: [
            "Password + authenticator code",
            "Two passwords",
            "Username only",
            "Same password twice"
        ],
        answer: 0,
        explanation: "MFA combines different authentication factors, such as something you know and something you have."
    }
];

let currentQuiz = 0;
let quizAnswered = false;


/* ================= LOGIN ================= */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const error = document.getElementById("loginError");

    const usernamePattern = /^[A-Za-z0-9]+$/;

    if (!usernamePattern.test(username)) {
        error.textContent =
            "Username can contain letters and numbers only.";
        return;
    }

    if (password.length < 8) {
        error.textContent =
            "Password must contain at least 8 characters.";
        return;
    }

    if (!email.includes("@")) {
        error.textContent =
            "Please enter a valid email address.";
        return;
    }

    currentUser.username = username;
    currentUser.email = email;

    localStorage.setItem(
        "cyberhuntUser",
        JSON.stringify(currentUser)
    );

    error.textContent = "";

    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    updateUserUI();
    loadProgress();
    openPage("dashboard");

    showToast("Welcome to CyberHunt, " + username + ".");
});


/* PASSWORD SHOW/HIDE */

document.getElementById("showPassword").addEventListener(
    "click",
    function() {

        const password = document.getElementById("password");

        if (password.type === "password") {
            password.type = "text";
            this.textContent = "HIDE";
        } else {
            password.type = "password";
            this.textContent = "SHOW";
        }

    }
);


document.getElementById("password").addEventListener(
    "input",
    function() {

        const rule = document.querySelector(".password-rule");

        if (this.value.length >= 8) {
            rule.classList.add("valid");
        } else {
            rule.classList.remove("valid");
        }

    }
);


/* ================= USER ================= */

function updateUserUI() {

    const username = currentUser.username || "Hunter";

    document.getElementById("sideUsername").textContent = username;
    document.getElementById("topUsername").textContent = username;

    const firstLetter = username.charAt(0).toUpperCase();

    document.getElementById("avatar").textContent = firstLetter;
    document.getElementById("topAvatar").textContent = firstLetter;
}


/* ================= PAGE NAVIGATION ================= */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener("click", function() {

        openPage(this.dataset.page);

    });

});


function openPage(pageName) {

    const pages = document.querySelectorAll(".page");

    pages.forEach(page => {
        page.classList.remove("active-page");
    });

    const page = document.getElementById(pageName + "Page");

    if (page) {
        page.classList.add("active-page");
    }

    navItems.forEach(item => {
        item.classList.remove("active");

        if (item.dataset.page === pageName) {
            item.classList.add("active");
        }
    });

    const names = {
        dashboard: "Dashboard",
        ai: "AI Study Studio",
        materials: "Materials",
        cases: "Case Studies",
        labs: "Cyber Labs",
        quizzes: "Mini Quizzes",
        badges: "Badges",
        progress: "Progress",
        investigation: "Investigation"
    };

    document.getElementById("breadcrumb").textContent =
        names[pageName] || "CyberHunt";

    if (pageName === "cases") {
        renderCases();
    }

    if (pageName === "badges") {
        renderBadges();
    }

    if (pageName === "progress") {
        updateAllUI();
    }

    if (pageName === "materials") {
        renderMaterials("beginner");
    }

    if (pageName === "quizzes") {
        startQuiz();
    }

}


/* ================= PROGRESS STORAGE ================= */

function loadProgress() {

    const saved = localStorage.getItem("cyberhuntProgress");

    if (saved) {
        progress = JSON.parse(saved);
    }

    updateAllUI();
}


function saveProgress() {

    localStorage.setItem(
        "cyberhuntProgress",
        JSON.stringify(progress)
    );

    updateAllUI();
}


function getLevel() {

    return Math.floor(progress.xp / 100) + 1;

}


function getLevelProgress() {

    return progress.xp % 100;

}


function updateAllUI() {

    const xp = progress.xp;
    const level = getLevel();
    const levelProgress = getLevelProgress();

    document.getElementById("dashXP").textContent = xp;
    document.getElementById("dashCases").textContent =
        progress.cases.length + " / 5";
    document.getElementById("dashLabs").textContent =
        progress.labs + " / 5";
    document.getElementById("dashBadges").textContent =
        progress.badges.length + " / 5";

    document.getElementById("sideXP").textContent = xp;
    document.getElementById("sideLevel").textContent = level;
    document.getElementById("sideProgress").style.width =
        levelProgress + "%";

    document.getElementById("bigXP").textContent = xp + " XP";
    document.getElementById("bigLevel").textContent = level;

    document.getElementById("bigProgress").style.width =
        levelProgress + "%";

    document.getElementById("progressCases").textContent =
        progress.cases.length;

    document.getElementById("progressLabs").textContent =
        progress.labs;

    document.getElementById("progressBadges").textContent =
        progress.badges.length;

    document.getElementById("progressQuiz").textContent =
        progress.quizPoints;

    const badgePercent =
        Math.round((progress.badges.length / 5) * 100);

    document.getElementById("badgeCount").textContent =
        progress.badges.length;

    document.getElementById("badgePercent").textContent =
        badgePercent + "%";

    document.getElementById("badgeProgress").style.width =
        badgePercent + "%";
}


/* ================= CASE FILES ================= */

function renderCases() {

    const grid = document.getElementById("caseGrid");

    grid.innerHTML = "";

    caseData.forEach((item, index) => {

        const completed = progress.cases.includes(index);

        const unlocked =
            index === 0 ||
            progress.cases.includes(index - 1);

        const card = document.createElement("div");

        card.className =
            "case-card " +
            (completed ? "completed " : "") +
            (!unlocked ? "locked" : "");

        card.innerHTML = `

            <div class="case-tag">${item.number}</div>

            <h3>${item.title}</h3>

            <p>${item.description}</p>

            <div class="case-bottom">

                <span class="case-difficulty">
        
