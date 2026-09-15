/* =========================================================
   CYBERHUNT
   MAIN APPLICATION LOGIC
========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (selector) => document.querySelector(selector);

    const $$ = (selector) => Array.from(document.querySelectorAll(selector));

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showToast(message) {

        const toast = $("#toast");

        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(window.cyberToastTimer);

        window.cyberToastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }


    /* =====================================================
       STATE
    ===================================================== */

    const STORAGE_KEY = "cyberhunt_state_v3";

    const defaultState = {
        loggedIn: false,
        username: "",
        email: "",
        xp: 0,
        completedCases: [],
        completedLevels: {},
        quizScore: 0,
        quizTotal: 0,
        badges: []
    };

    let state = loadState();

    function loadState() {

        try {

            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return { ...defaultState };
            }

            const parsed = JSON.parse(saved);

            return {
                ...defaultState,
                ...parsed,
                completedCases: parsed.completedCases || [],
                completedLevels: parsed.completedLevels || {},
                badges: parsed.badges || []
            };

        } catch (error) {

            console.warn("Could not load CyberHunt state.", error);

            return { ...defaultState };
        }
    }


    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            console.warn("Could not save CyberHunt state.", error);
        }
    }


    /* =====================================================
       LOGIN
    ===================================================== */

    const loginForm = $("#loginForm");
    const loginPage = $("#loginPage");
    const app = $("#app");

    const emailInput = $("#email");
    const usernameInput = $("#username");
    const passwordInput = $("#password");

    const loginError = $("#loginError");

    if (loginForm) {

        loginForm.addEventListener("submit", (event) => {

            event.preventDefault();

            if (loginError) {
                loginError.textContent = "";
            }

            const email = emailInput
                ? emailInput.value.trim()
                : "";

            const username = usernameInput
                ? usernameInput.value.trim()
                : "";

            const password = passwordInput
                ? passwordInput.value
                : "";


            if (!email) {
                showLoginError("Please enter your email.");
                return;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                showLoginError("Please enter a valid email address.");
                return;
            }


            if (!username) {
                showLoginError("Please enter a username.");
                return;
            }

            /*
                Username requirement:
                letters + numbers only
            */

            const usernamePattern =
                /^[A-Za-z0-9]+$/;

            if (!usernamePattern.test(username)) {
                showLoginError(
                    "Username can contain only letters and numbers."
                );
                return;
            }


            if (password.length < 8) {
                showLoginError(
                    "Password must contain at least 8 characters."
                );
                return;
            }


            /*
                IMPORTANT:
                We do not store the password.
                This is a static demo login.
            */

            state.loggedIn = true;
            state.username = username;
            state.email = email;

            saveState();

            openApplication();

            showToast(
                `Welcome to CyberHunt, ${username}.`
            );

        });

    }


    function showLoginError(message) {

        if (loginError) {
            loginError.textContent = message;
        }
    }


    const togglePassword = $("#togglePassword");

    if (togglePassword && passwordInput) {

        togglePassword.addEventListener("click", () => {

            if (passwordInput.type === "password") {

                passwordInput.type = "text";
                togglePassword.textContent = "Hide";

            } else {

                passwordInput.type = "password";
                togglePassword.textContent = "Show";
            }

        });
    }


    function openApplication() {

        if (loginPage) {
            loginPage.classList.add("hidden");
        }

        if (app) {
            app.classList.remove("hidden");
        }

        updateUserUI();
        updateDashboard();
        renderMaterials();
        renderCases();
        renderBadges();
        initializeQuiz();
    }


    function logout() {

        state.loggedIn = false;

        saveState();

        if (app) {
            app.classList.add("hidden");
        }

        if (loginPage) {
            loginPage.classList.remove("hidden");
        }

        if (passwordInput) {
            passwordInput.value = "";
        }

        showToast("You have been logged out.");

    }


    const logoutBtn = $("#logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }


    /*
        Automatically restore session after page refresh.
    */

    if (state.loggedIn) {
        openApplication();
    }


    /* =====================================================
       USER UI
    ===================================================== */

    function getUserInitial() {

        if (!state.username) {
            return "D";
        }

        return state.username
            .charAt(0)
            .toUpperCase();
    }


    function updateUserUI() {

        const name = state.username || "Detective";

        const welcomeName = $("#welcomeName");
        const profileName = $("#profileName");
        const avatar = $("#profileAvatar");

        if (welcomeName) {
            welcomeName.textContent = name;
        }

        if (profileName) {
            profileName.textContent = name;
        }

        if (avatar) {
            avatar.textContent = getUserInitial();
        }

        const topXP = $("#topXP");

        if (topXP) {
            topXP.textContent = state.xp;
        }

        const topLevel = $("#topLevel");

        if (topLevel) {
            topLevel.textContent = calculateLevel();
        }
    }


    function calculateLevel() {

        return Math.max(
            1,
            Math.floor(state.xp / 100) + 1
        );
    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    const navItems = $$(".nav-item");

    navItems.forEach((button) => {

        button.addEventListener("click", () => {

            const section = button.dataset.section;

            if (section) {
                showSection(section);
            }

            const sidebar = $("#sidebar");

            if (sidebar) {
                sidebar.classList.remove("mobile-open");
            }

        });

    });


    $$("[data-go-section]").forEach((button) => {

        button.addEventListener("click", () => {

            const section = button.dataset.goSection;

            if (section) {
                showSection(section);
            }

        });

    });


    function showSection(sectionId) {

        $$(".content-section").forEach((section) => {
            section.classList.remove("active-section");
        });

        const target = document.getElementById(sectionId);

        if (target) {
            target.classList.add("active-section");
        }

        navItems.forEach((item) => {

            item.classList.toggle(
                "active",
                item.dataset.section === sectionId
            );

        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    const mobileMenuBtn = $("#mobileMenuBtn");

    if (mobileMenuBtn) {

        mobileMenuBtn.addEventListener("click", () => {

            const sidebar = $("#sidebar");

            if (sidebar) {
                sidebar.classList.toggle("mobile-open");
            }

        });

    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        updateUserUI();

        const completed =
            state.completedCases.length;

        const percent =
            Math.round((completed / 50) * 100);

        const dashXP = $("#dashXP");
        const dashCases = $("#dashCases");
        const dashQuiz = $("#dashQuiz");
        const dashBadges = $("#dashBadges");

        if (dashXP) {
            dashXP.textContent = state.xp;
        }

        if (dashCases) {
            dashCases.textContent =
                `${completed} / 50`;
        }

        if (dashQuiz) {

            const score =
                state.quizTotal > 0
                    ? Math.round(
                        (state.quizScore /
                            state.quizTotal) * 100
                    )
                    : 0;

            dashQuiz.textContent = `${score}%`;
        }

        if (dashBadges) {
            dashBadges.textContent =
                state.badges.length;
        }


        const overallProgress = $("#overallProgress");

        if (overallProgress) {
            overallProgress.style.width =
                `${percent}%`;
        }


        const overallPercent = $("#overallPercent");

        if (overallPercent) {
            overallPercent.textContent =
                `${percent}%`;
        }


        const sidebarProgress = $("#sidebarProgress");

        if (sidebarProgress) {
            sidebarProgress.style.width =
                `${percent}%`;
        }


        const sidebarProgressText =
            $("#sidebarProgressText");

        if (sidebarProgressText) {
            sidebarProgressText.textContent =
                `${percent}%`;
        }


        const missionTitle =
            $("#currentMissionTitle");

        const missionText =
            $("#currentMissionText");

        if (completed === 0) {

            if (missionTitle) {
                missionTitle.textContent =
                    "Cybersecurity Fundamentals";
            }

            if (missionText) {
                missionText.textContent =
                    "Start with the foundations of cybersecurity: CIA Triad, threats, vulnerabilities, risk, authentication and security controls.";
            }

        } else if (completed < 10) {

            if (missionTitle) {
                missionTitle.textContent =
                    "Phishing Files";
            }

            if (missionText) {
                missionText.textContent =
                    "Investigate suspicious communication, social engineering indicators and account security decisions.";
            }

        } else if (completed < 20) {

            if (missionTitle) {
                missionTitle.textContent =
                    "Ransomware Response";
            }

            if (missionText) {
                missionText.textContent =
                    "Learn how defenders recognize, contain and recover from ransomware incidents.";
            }

        } else {

            if (missionTitle) {
                missionTitle.textContent =
                    "Continue Your Investigation";
            }

            if (missionText) {
                missionText.textContent =
                    "Continue through the case studies and strengthen your reasoning across multiple cybersecurity domains.";
            }
        }

    }


    /* =====================================================
       MATERIAL LIBRARY
    ===================================================== */

    const materials = [

        {
            level: "beginner",
            title: "CIA Triad",
            description:
                "The three foundational security goals: confidentiality, integrity and availability.",
            topics:
                ["Confidentiality", "Integrity", "Availability", "Examples"]
        },

        {
            level: "beginner",
            title: "Security Fundamentals",
            description:
                "Understand assets, threats, vulnerabilities, risks, controls and security incidents.",
            topics:
                ["Asset", "Threat", "Vulnerability", "Risk"]
        },

        {
            level: "beginner",
            title: "Authentication & Authorization",
            description:
                "Learn how systems identify users and determine what those users are allowed to access.",
            topics:
                ["Authentication", "Authorization", "MFA", "RBAC"]
        },

        {
            level: "beginner",
            title: "Social Engineering",
            description:
                "Understand how attackers manipulate human behavior through deception and persuasion.",
            topics:
                ["Phishing", "Pretexting", "Baiting", "Awareness"]
        },

        {
            level: "beginner",
            title: "Malware Basics",
            description:
                "Understand malware categories and how defenders recognize suspicious behavior.",
            topics:
                ["Virus", "Worm", "Trojan", "Ransomware"]
        },

        {
            level: "beginner",
            title: "Networking Basics",
            description:
                "Build the networking knowledge needed for cybersecurity.",
            topics:
                ["IP", "DNS", "TCP", "HTTP"]
        },

        {
            level: "intermediate",
            title: "Cryptography",
            description:
                "Learn encryption, keys, symmetric and asymmetric cryptography and digital signatures.",
            topics:
                ["Encryption", "Keys", "RSA", "AES"]
        },

        {
            level: "intermediate",
            title: "Hashing",
            description:
                "Understand one-way functions, integrity checks and password-storage concepts.",
            topics:
                ["SHA-256", "Digest", "Integrity", "Passwords"]
        },

        {
            level: "intermediate",
            title: "Firewalls",
            description:
                "Learn how network controls inspect traffic and enforce security policy.",
            topics:
                ["Filtering", "Rules", "Network", "Host"]
        },

        {
            level: "intermediate",
            title: "IDS & IPS",
            description:
                "Understand detection and prevention systems and their role in defensive security.",
            topics:
                ["IDS", "IPS", "Alerts", "Detection"]
        },

        {
            level: "intermediate",
            title: "Incident Response",
            description:
                "Learn the lifecycle used to prepare for, detect, contain, recover from and learn from incidents.",
            topics:
                ["Preparation", "Detection", "Containment", "Recovery"]
        },

        {
            level: "intermediate",
            title: "SIEM & Security Logs",
            description:
                "Understand how security teams collect, correlate and investigate events.",
            topics:
                ["Logs", "Events", "Correlation", "SOC"]
        },

        {
            level: "intermediate",
            title: "Web Security",
            description:
                "Study secure web application concepts and common application security risks.",
            topics:
                ["Sessions", "Input", "Access", "OWASP"]
        },

        {
            level: "intermediate",
            title: "Secure Coding",
            description:
                "Learn principles that help developers build software resistant to common security failures.",
            topics:
                ["Validation", "Errors", "Secrets", "Dependencies"]
        },

        {
            level: "advanced",
            title: "Zero Trust",
            description:
                "Understand identity-centered security and the principle of continuously verifying access.",
            topics:
                ["Identity", "Least Privilege", "Policy", "Continuous Verification"]
        },

        {
            level: "advanced",
            title: "Digital Forensics",
            description:
                "Learn how investigators preserve, analyze and document digital evidence.",
            topics:
                ["Evidence", "Hashing", "Timeline", "Integrity"]
        },

        {
            level: "advanced",
            title: "Cloud Security",
            description:
                "Understand identity, configuration, data protection and shared-responsibility concepts.",
            topics:
                ["IAM", "Cloud", "Configuration", "Data"]
        },

        {
            level: "advanced",
            title: "Threat Modeling",
            description:
                "Identify possible threats during system design and prioritize defensive measures.",
            topics:
                ["Assets", "Threats", "Attack Surface", "Mitigation"]
        },

        {
            level: "advanced",
            title: "Security Governance",
            description:
                "Learn policies, risk management, security roles, controls and organizational accountability.",
            topics:
                ["Governance", "Risk", "Policy", "Compliance"]
        },

        {
            level: "advanced",
            title: "Security Architecture",
            description:
                "Understand how multiple security controls work together as a defensive system.",
            topics:
                ["Defense in Depth", "Zero Trust", "Network", "Identity"]
        }

    ];


    function renderMaterials(filter = "all") {

        const grid = $("#materialsGrid");

        if (!grid) return;

        const filtered =
            filter === "all"
                ? materials
                : materials.filter(
                    material => material.level === filter
                );


        grid.innerHTML = filtered.map((material) => {

            const levelName =
                material.level.charAt(0).toUpperCase() +
                material.level.slice(1);

            return `
                <article class="material-card">

                    <span class="material-level">
                        ${escapeHTML(levelName)}
                    </span>

                    <h3>
                        ${escapeHTML(material.title)}
                    </h3>

                    <p>
                        ${escapeHTML(material.description)}
                    </p>

                    <div class="material-topics">

                        ${material.topics.map(topic => `
                            <span class="topic-tag">
                                ${escapeHTML(topic)}
                            </span>
                        `).join("")}

                    </div>

                </article>
            `;

        }).join("");

    }


    $$("[data-level-filter]").forEach((button) => {

        button.addEventListener("click", () => {

            $$("[data-level-filter]").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            renderMaterials(
                button.dataset.levelFilter
            );

        });

    });


    /* =====================================================
       CASE STUDY DATA
    ===================================================== */

    /*
        Five investigation tracks.
        Each track contains ten unique levels.
    */

    const caseTracks = [

        {
            id: "phishing",
            number: "CASE 01",
            title: "The Phishing Files",
            category: "SOCIAL ENGINEERING",
            description:
                "Investigate suspicious messages, identity deception, account compromise indicators and safe reporting decisions.",
            levels: [

                {
                    title: "The Unexpected Invoice",
                    scenario:
                        "An employee receives an invoice email from a supplier they recognize. The message asks them to open an attachment immediately. The employee says they were not expecting an invoice this week.",
                    clues: [
                        "The message creates urgency.",
                        "The employee was not expecting an invoice.",
                        "The attachment is unexpected."
                    ],
                    question:
                        "What should the employee do first?",
                    options: [
                        "Open the attachment to see what it contains.",
                        "Verify the request through a trusted communication channel.",
                        "Forward the attachment to coworkers.",
                        "Disable the antivirus."
                    ],
                    answer: 1,
                    explanation:
                        "Unexpected attachments combined with urgency are warning signs. Verification through a trusted channel reduces the chance of social-engineering success.",
                    hint:
                        "Do not trust an unexpected request simply because the sender name looks familiar."
                },

                {
                    title: "The Look-Alike Login",
                    scenario:
                        "A user receives a message asking them to sign in because their account will supposedly be locked in ten minutes. The link opens a page that visually resembles the company's login page.",
                    clues: [
                        "The message threatens account lockout.",
                        "The request is urgent.",
                        "The login page was reached from an unsolicited message."
                    ],
                    question:
                        "Which concept is most strongly represented?",
                    options: [
                        "Phishing",
                        "Data backup",
                        "Load balancing",
                        "Physical security"
                    ],
                    answer: 0,
                    explanation:
                        "A deceptive message designed to make a user reveal information through a fraudulent page is a classic phishing scenario.",
                    hint:
                        "Look at the combination of deception + urgency + credential request."
                },

                {
                    title: "The Familiar Sender",
                    scenario:
                        "A finance employee receives a payment-change request appearing to come from a manager. The writing style looks slightly unusual, and the request asks for immediate action.",
                    clues: [
                        "Payment information is being changed.",
                        "The request is unusually urgent.",
                        "The writing style is different."
                    ],
                    question:
                        "Which defensive principle is most appropriate?",
                    options: [
                        "Trust internal email automatically.",
                        "Verify high-impact requests independently.",
                        "Delete all finance emails.",
                        "Disable MFA."
                    ],
                    answer: 1,
                    explanation:
                        "High-impact financial requests should be independently verified because compromised accounts and impersonation can make the sender identity misleading.",
                    hint:
                        "The more damaging the requested action, the stronger the verification should be."
                },

                {
                    title: "The QR Message",
                    scenario:
                        "Employees receive a QR code poster saying they must scan it to keep their workplace account active. The security team did not announce any such change.",
                    clues: [
                        "The message was not announced by IT.",
                        "Scanning leads to a login page.",
                        "Employees are pressured to act quickly."
                    ],
                    question:
                        "What is the safest response?",
                    options: [
                        "Scan it using a personal phone.",
                        "Verify the announcement with the security team.",
                        "Share it in a group chat.",
                        "Enter credentials immediately."
                    ],
                    answer: 1,
                    explanation:
                        "Unexpected QR-based login requests can be used for phishing. Independent verification is safer than interacting with the QR code.",
                    hint:
                        "Unexpected authentication requests deserve verification."
                },

                {
                    title: "The Attachment Trap",
                    scenario:
                        "A message contains a document claiming to be a password-reset form. The recipient did not request a reset.",
                    clues: [
                        "The reset was not requested.",
                        "A document is attached.",
                        "The message asks for account information."
                    ],
                    question:
                        "Which clue is most suspicious?",
                    options: [
                        "The email contains normal punctuation.",
                        "The password-reset request was unexpected.",
                        "The message has a greeting.",
                        "The email contains text."
                    ],
                    answer: 1,
                    explanation:
                        "Unexpected password-reset requests can be used to trick users into giving away credentials or sensitive information.",
                    hint:
                        "Unexpected security actions should be verified before interaction."
                },

                {
                    title: "MFA Fatigue",
                    scenario:
                        "A user receives repeated MFA approval notifications even though they are not attempting to sign in.",
                    clues: [
                        "The user did not initiate a login.",
                        "Several approval prompts arrive.",
                        "The attacker may be hoping for accidental approval."
                    ],
                    question:
                        "What should the user do?",
                    options: [
                        "Approve one prompt to make them stop.",
                        "Deny the prompts and report the suspicious activity.",
                        "Disable MFA permanently.",
                        "Share the MFA code."
                    ],
                    answer: 1,
                    explanation:
                        "Unexpected MFA prompts should be denied and reported. Repeated prompts can be an attempt to pressure the user into approving an unauthorized login.",
                    hint:
                        "Never approve authentication you did not initiate."
                },

                {
                    title: "The Spoofed Domain",
                    scenario:
                        "An email appears to come from a known organization, but careful inspection reveals a domain that differs by one character.",
                    clues: [
                        "The domain is almost identical.",
                        "The email requests sensitive information.",
                        "The difference is easy to overlook."
                    ],
                    question:
                        "What technique may be involved?",
                    options: [
                        "Domain impersonation",
                        "Disk fragmentation",
                        "Load balancing",
                        "Compression"
                    ],
                    answer: 0,
                    explanation:
                        "Look-alike domains can be used to impersonate trusted organizations and deceive users.",
                    hint:
                        "Inspect the actual domain rather than only the displayed sender name."
                },

                {
                    title: "Report or Ignore?",
                    scenario:
                        "A student recognizes a suspicious message that resembles a university login notification.",
                    clues: [
                        "The student did not initiate the request.",
                        "The message asks for login information.",
                        "Other students may receive the same message."
                    ],
                    question:
                        "Why should the message be reported?",
                    options: [
                        "Only to punish the sender.",
                        "So defenders can investigate and protect other users.",
                        "Because every email is dangerous.",
                        "To make the inbox empty."
                    ],
                    answer: 1,
                    explanation:
                        "Reporting gives defenders useful information and can help protect other users from the same campaign.",
                    hint:
                        "Think beyond the individual user."
                },

                {
                    title: "Credential Exposure",
                    scenario:
                        "A user realizes they entered their password into a suspicious page and immediately closes the browser.",
                    clues: [
                        "Credentials may have been exposed.",
                        "The page was suspicious.",
                        "The user acted quickly."
                    ],
                    question:
                        "What is an important next step?",
                    options: [
                        "Reuse the same password everywhere.",
                        "Change the affected password through the legitimate service and report the incident.",
                        "Ignore it if nothing happened immediately.",
                        "Post the password publicly."
                    ],
                    answer: 1,
                    explanation:
                        "Potential credential exposure should be treated as a security incident. Changing the password through the legitimate service and reporting the event are appropriate defensive actions.",
                    hint:
                        "Think containment + reporting."
                },

                {
                    title: "The Security Lesson",
                    scenario:
                        "After a phishing campaign, an organization discovers that employees responded differently to similar messages.",
                    clues: [
                        "Employees had different levels of awareness.",
                        "The same campaign reached multiple users.",
                        "Some reports arrived late."
                    ],
                    question:
                        "What is the best long-term improvement?",
                    options: [
                        "Ban all email.",
                        "Combine awareness training, reporting processes and technical controls.",
                        "Ignore the campaign.",
                        "Remove security policies."
                    ],
                    answer: 1,
                    explanation:
                        "Security is strongest when people, processes and technology work together.",
                    hint:
                        "Cybersecurity is a system, not a single tool."
                }

            ]
        },


        {
            id: "ransomware",
            number: "CASE 02",
            title: "Ransomware Response",
            category: "INCIDENT RESPONSE",
            description:
                "Follow a ransomware incident from first indicators through containment, recovery and lessons learned.",
            levels: [

                {
                    title: "Strange File Extensions",
                    scenario:
                        "Several employees report that documents suddenly have unfamiliar extensions and cannot be opened.",
                    clues: [
                        "Multiple users are affected.",
                        "Documents changed unexpectedly.",
                        "Files cannot be opened normally."
                    ],
                    question:
                        "What should the security team consider?",
                    options: [
                        "A possible ransomware incident.",
                        "A normal software update.",
                        "A printer issue.",
                        "A Wi-Fi naming problem."
                    ],
                    answer: 0,
                    explanation:
                        "Unexpected widespread file encryption or modification is a potential ransomware indicator.",
                    hint:
                        "Think about availability and unauthorized modification of data."
                },

                {
                    title: "Containment First",
                    scenario:
                        "The security team suspects ransomware is spreading between systems.",
                    clues: [
                        "More machines are becoming affected.",
                        "The cause is not yet fully known.",
                        "Further spread could increase impact."
                    ],
                    question:
                        "What incident-response priority is appropriate?",
                    options: [
                        "Contain the incident.",
                        "Publish the incident online.",
                        "Ignore the affected systems.",
                        "Delete all evidence."
                    ],
                    answer: 0,
                    explanation:
                        "Containment aims to limit the spread and impact while preserving the ability to investigate.",
                    hint:
                        "Stop the situation from becoming larger."
                },

                {
                    title: "Preserving Evidence",
                    scenario:
                        "A technician wants to immediately wipe an affected machine before the security team examines it.",
                    clues: [
                        "The system may contain useful evidence.",
                        "The incident is under investigation.",
                        "Wiping destroys potentially useful information."
                    ],
                    question:
                        "What is the concern?",
                    options: [
                        "Evidence preservation.",
                        "Screen brightness.",
                        "Printer configuration.",
                        "Keyboard layout."
                    ],
                    answer: 0,
                    explanation:
                        "Investigators should consider evidence preservation before destructive remediation steps.",
                    hint:
                        "Ask what information might disappear if the machine is wiped."
                },

                {
                    title: "Backup Reality Check",
                    scenario:
                        "The organization discovers that backups exist, but some backups were not recently tested.",
                    clues: [
                        "Backups exist.",
                        "Some have not been tested.",
                        "Recovery depends on reliable backups."
                    ],
                    question:
                        "What lesson does this reveal?",
                    options: [
                        "Backups never need testing.",
                        "Backup recovery should be regularly tested.",
                        "Backups are unnecessary.",
                        "Only attackers need backups."
                    ],
                    answer: 1,
                    explanation:
                        "A backup strategy is much stronger when restoration procedures are tested regularly.",
                    hint:
                        "A backup that cannot be restored reliably is a serious risk."
                },

                {
                    title: "Communication",
                    scenario:
                        "During the incident, employees receive conflicting instructions from different departments.",
                    clues: [
                        "Messages conflict.",
                        "Employees are uncertain what to do.",
                        "The incident is still active."
                    ],
                    question:
                        "What capability needs improvement?",
                    options: [
                        "Incident communication and coordination.",
                        "Monitor resolution.",
                        "Keyboard speed.",
                        "Email color."
                    ],
                    answer: 0,
                    explanation:
                        "Clear incident roles and communication channels are important during security incidents.",
                    hint:
                        "Incident response involves people and processes as well as technology."
                },

                {
                    title: "Recovery Planning",
                    scenario:
                        "Systems have been contained and cleaned. The organization now wants to restore critical services.",
                    clues: [
                        "Containment has occurred.",
                        "Systems need to return to operation.",
                        "Recovery should be controlled."
                    ],
                    question:
                        "What should guide restoration?",
                    options: [
                        "A documented recovery plan.",
                        "Randomly turning systems on.",
                        "Ignoring dependencies.",
                        "Deleting logs."
                    ],
                    answer: 0,
                    explanation:
                        "Recovery should follow a documented plan that considers priorities, dependencies, security and validation.",
                    hint:
                        "Recovery should be deliberate rather than random."
                },

                {
                    title: "Root Cause",
                    scenario:
                        "After recovery, investigators discover that a vulnerable application had not received an important security update.",
                    clues: [
                        "A known weakness existed.",
                        "The system was not updated.",
                        "The incident exposed a process weakness."
                    ],
                    question:
                        "What should happen next?",
                    options: [
                        "Only restart the server.",
                        "Improve vulnerability and patch management.",
                        "Ignore the finding.",
                        "Remove monitoring."
                    ],
                    answer: 1,
                    explanation:
                        "Lessons learned should address the underlying security and process weaknesses.",
                    hint:
                        "Ask how the organization can prevent recurrence."
                },

                {
                    title: "Incident Documentation",
                    scenario:
                        "Different responders remember different times for important events during the incident.",
                    clues: [
                        "Timelines conflict.",
                        "Multiple people were involved.",
                        "Accurate records help investigations."
                    ],
                    question:
                        "What would improve future investigations?",
                    options: [
                        "Better event logging and documentation.",
                        "Less monitoring.",
                        "Deleting logs after incidents.",
                        "Avoiding incident records."
                    ],
                    answer: 0,
                    explanation:
                        "Reliable logs and documentation help responders reconstruct events and make better decisions.",
                    hint:
                        "A timeline depends on trustworthy records."
                },

                {
                    title: "Business Impact",
                    scenario:
                        "A ransomware event prevents employees from accessing an important business application for two days.",
                    clues: [
                        "The service is unavailable.",
                        "Operations are affected.",
                        "The organization may lose revenue."
                    ],
                    question:
                        "Which CIA property is directly affected?",
                    options: [
                        "Availability",
                        "Confidentiality only",
                        "Authentication only",
                        "Non-repudiation only"
                    ],
                    answer: 0,
                    explanation:
                        "Availability concerns whether authorized users can access systems and information when needed.",
                    hint:
                        "Which CIA property deals with access to services?"
                },

                {
                    title: "Lessons Learned",
                    scenario:
                        "The incident is closed. The security team holds a meeting to discuss what worked, what failed and what should change.",
                    clues: [
                        "The incident has ended.",
                        "The organization wants improvement.",
                        "Controls and processes need review."
                    ],
                    question:
                        "What activity is this?",
                    options: [
                        "Lessons learned / post-incident review.",
                        "Phishing.",
                        "Encryption.",
                        "Authentication."
                    ],
                    answer: 0,
                    explanation:
                        "Post-incident reviews help organizations improve controls, procedures and preparedness.",
                    hint:
                        "Incident response should produce organizational learning."
                }

            ]
        },


        {
            id: "insider",
            number: "CASE 03",
            title: "The Insider Mystery",
            category: "IDENTITY & ACCESS",
            description:
                "Investigate unusual access, privilege misuse, data movement and identity-management decisions.",
            levels: [

                {
                    title: "Too Much Access",
                    scenario:
                        "An employee's account can access several systems that are unrelated to their current job responsibilities.",
                    clues: [
                        "Access exceeds job requirements.",
                        "The employee changed roles months ago.",
                        "Permissions were never reviewed."
                    ],
                    question:
                        "Which principle is most relevant?",
                    options: [
                        "Least privilege.",
                        "Open access.",
                        "Maximum privilege.",
                        "No authentication."
                    ],
                    answer: 0,
                    explanation:
                        "Least privilege means users receive only the access required for legitimate responsibilities.",
                    hint:
                        "Give users only what they need."
                },

                {
                    title: "After the Role Change",
                    scenario:
                        "A worker moves from finance to marketing but keeps access to financial systems.",
                    clues: [
                        "The employee changed departments.",
                        "Old permissions remain.",
                        "Financial data is sensitive."
                    ],
                    question:
                        "What process should address this?",
                    options: [
                        "Access review and timely deprovisioning.",
                        "More shared passwords.",
                        "Removing audit logs.",
                        "Disabling all employees."
                    ],
                    answer: 0,
                    explanation:
                        "Identity and access management should update permissions when job responsibilities change.",
                    hint:
                        "Think about the employee's current role."
                },

                {
                    title: "Unusual Download",
                    scenario:
                        "A user's account downloads a large amount of sensitive data outside their normal working pattern.",
                    clues: [
                        "The amount is unusual.",
                        "The data is sensitive.",
                        "The behavior differs from the user's baseline."
                    ],
                    question:
                        "What could help detect this?",
                    options: [
                        "Behavior and audit-log monitoring.",
                        "Removing logging.",
                        "Disabling alerts.",
                        "Ignoring unusual behavior."
                    ],
                    answer: 0,
                    explanation:
                        "Monitoring and analysis can identify unusual access patterns that deserve investigation.",
                    hint:
                        "Security teams need visibility into account activity."
                },

                {
                    title: "Shared Credentials",
                    scenario:
                        "A team uses one shared administrator password because it is convenient.",
                    clues: [
                        "Multiple people know the password.",
                        "Individual accountability is reduced.",
                        "The account has high privileges."
                    ],
                    question:
                        "What is the major security concern?",
                    options: [
                        "Weak accountability and excessive credential exposure.",
                        "Faster typing.",
                        "Better availability.",
                        "Improved auditing."
                    ],
                    answer: 0,
                    explanation:
                        "Individual accounts and controlled privileged access improve accountability and reduce unnecessary credential sharing.",
                    hint:
                        "Ask whether you can identify exactly who performed an action."
                },

                {
                    title: "Privileged Account",
                    scenario:
                        "A system administrator uses a highly privileged account for ordinary web browsing and email.",
                    clues: [
                        "The account has elevated privileges.",
                        "The activities do not require those privileges.",
                        "A malicious event could have greater impact."
                    ],
                    question:
                        "What is a better practice?",
                    options: [
                        "Use a lower-privilege account for ordinary activities.",
                        "Use the admin account everywhere.",
                        "Share the admin password.",
                        "Disable logging."
                    ],
                    answer: 0,
                    explanation:
                        "Separating privileged administrative activity from everyday use reduces potential impact.",
                    hint:
                        "Do everyday work with everyday permissions."
                },

                {
                    title: "Access Logs",
                    scenario:
                        "Investigators need to determine which account accessed a confidential document.",
                    clues: [
                        "The organization needs accountability.",
                        "The file is sensitive.",
                        "Access records exist."
                    ],
                    question:
                        "What evidence is most useful?",
                    options: [
                        "Access and audit logs.",
                        "Wallpaper settings.",
                        "Printer colors.",
                        "Browser theme."
                    ],
                    answer: 0,
                    explanation:
                        "Audit logs can provide information about access attempts and actions.",
                    hint:
                        "Look for records of who accessed what and when."
                },

                {
                    title: "Account Review",
                    scenario:
                        "The security team discovers that dozens of inactive accounts remain enabled.",
                    clues: [
                        "Accounts are no longer needed.",
                        "They remain enabled.",
                        "Unused accounts increase unnecessary attack surface."
                    ],
                    question:
                        "What should the organization do?",
                    options: [
                        "Review and disable accounts that are no longer required.",
                        "Create more inactive accounts.",
                        "Publish credentials.",
                        "Disable monitoring."
                    ],
                    answer: 0,
                    explanation:
                        "Unused accounts should be reviewed and appropriately disabled or removed.",
                    hint:
                        "Unused access is unnecessary access."
                },

                {
                    title: "Data Loss Prevention",
                    scenario:
                        "An organization wants to reduce accidental transfer of sensitive documents outside approved systems.",
                    clues: [
                        "Sensitive information is involved.",
                        "The organization wants to control data movement.",
                        "Both users and technology matter."
                    ],
                    question:
                        "Which capability could help?",
                    options: [
                        "Data Loss Prevention controls.",
                        "Screen brightness.",
                        "Disk defragmentation.",
                        "Game software."
                    ],
                    answer: 0,
                    explanation:
                        "DLP technologies and policies can help identify and control movement of sensitive information.",
                    hint:
                        "Think about preventing sensitive data from leaving approved boundaries."
                },

                {
                    title: "Separation of Duties",
                    scenario:
                        "One employee can request, approve and execute a large financial transaction without another person's review.",
                    clues: [
                        "One person controls multiple steps.",
                        "The transaction has high impact.",
                        "Independent review is absent."
                    ],
                    question:
                        "Which control would improve the situation?",
                    options: [
                        "Separation of duties.",
                        "Shared passwords.",
                        "Unlimited access.",
                        "No auditing."
                    ],
                    answer: 0,
                    explanation:
                        "Separation of duties reduces the risk that one individual can complete a sensitive process without oversight.",
                    hint:
                        "High-impact processes often benefit from independent checks."
                },

                {
                    title: "The Balanced Investigation",
                    scenario:
                        "Security monitoring identifies suspicious activity associated with an employee account, but there is not yet enough evidence to conclude intentional misuse.",
                    clues: [
                        "Suspicious activity exists.",
                        "Evidence is incomplete.",
                        "The organization must investigate fairly."
                    ],
                    question:
                        "What is the best approach?",
                    options: [
                        "Investigate using evidence, documented procedures and appropriate access controls.",
                        "Immediately accuse the employee publicly.",
                        "Delete the logs.",
                        "Ignore the alert."
                    ],
                    answer: 0,
                    explanation:
                        "Security investigations should rely on evidence, appropriate procedures and careful handling of sensitive information.",
                    hint:
                        "Suspicion is not the same as proof."
                }

            ]
        },


        {
            id: "web",
            number: "CASE 04",
            title: "Web Shield",
            category: "APPLICATION SECURITY",
            description:
                "Explore secure application design, access control, input validation, authentication and OWASP concepts.",
            levels: [

                {
                    title: "The Access Control Gap",
                    scenario:
                        "A user can view another user's account information simply by changing a record identifier in a request.",
                    clues: [
                        "The application trusts a client-supplied identifier.",
                        "Authorization is not properly enforced.",
                        "Another user's information becomes accessible."
                    ],
                    question:
                        "What security concept is involved?",
                    options: [
                        "Broken access control.",
                        "Screen resolution.",
                        "Compression.",
                        "Physical security."
                    ],
                    answer: 0,
                    explanation:
                        "Applications must verify that the authenticated user is authorized to access the requested resource.",
                    hint:
                        "Authentication tells you who someone is; authorization determines what they can access."
                },

                {
                    title: "The Unsafe Input",
                    scenario:
                        "A web application accepts user input without properly validating or safely processing it.",
                    clues: [
                        "Input is accepted directly.",
                        "The application performs sensitive operations.",
                        "Validation is weak."
                    ],
                    question:
                        "Which security practice is important?",
                    options: [
                        "Appropriate input validation and safe processing.",
                        "Trust every input.",
                        "Disable logging.",
                        "Remove authentication."
                    ],
                    answer: 0,
                    explanation:
                        "Applications should treat external input as untrusted and process it safely according to context.",
                    hint:
                        "Never assume user-controlled input is automatically safe."
                },

                {
                    title: "Authentication Failure",
                    scenario:
                        "A web application allows weak passwords and provides no additional protection for repeated login attempts.",
                    clues: [
                        "Password policy is weak.",
                        "Login attempts are not sufficiently controlled.",
                        "Accounts may be easier to compromise."
                    ],
                    question:
                        "What area should be strengthened?",
                    options: [
                        "Authentication security.",
                        "Screen design.",
                        "Database color scheme.",
                        "File compression."
                    ],
                    answer: 0,
                    explanation:
                        "Authentication controls should protect account access using appropriate password policies, MFA and protective mechanisms.",
                    hint:
                        "The problem concerns proving identity securely."
                },

                {
                    title: "Security Misconfiguration",
                    scenario:
                        "A production application exposes unnecessary services and retains default configuration settings.",
                    clues: [
                        "Default settings remain.",
                        "Unnecessary services are exposed.",
                        "The system is publicly accessible."
                    ],
                    question:
                        "What is this an example of?",
                    options: [
                        "Security misconfiguration.",
                        "Strong authentication.",
                        "Data minimization.",
                        "Secure defaults."
                    ],
                    answer: 0,
                    explanation:
                        "Unnecessary services and unsafe default settings can create avoidable security weaknesses.",
                    hint:
                        "Think about the configuration rather than the user."
                },

                {
                    title: "Dependency Risk",
                    scenario:
                        "A web application uses an old third-party component with a publicly documented security issue.",
                    clues: [
                        "A third-party component is outdated.",
                        "A known security issue exists.",
                        "The application depends on the component."
                    ],
                    question:
                        "What practice helps reduce this risk?",
                    options: [
                        "Dependency and patch management.",
                        "Ignoring software versions.",
                        "Removing logs.",
                        "Sharing administrator accounts."
                    ],
                    answer: 0,
                    explanation:
                        "Organizations should maintain awareness of dependencies and update vulnerable components appropriately.",
                    hint:
                        "Your application's security can depend on its software supply chain."
                },

                {
                    title: "Logging the Right Events",
                    scenario:
                        "A security team investigates an application incident but discovers that important authentication events were never logged.",
                    clues: [
                        "Investigators lack evidence.",
                        "Authentication events are important.",
                        "Monitoring coverage is incomplete."
                    ],
                    question:
                        "Which improvement is appropriate?",
                    options: [
                        "Security logging and monitoring.",
                        "Less logging.",
                        "Deleting audit records.",
                        "Removing alerts."
                    ],
                    answer: 0,
                    explanation:
                        "Useful security events should be logged, monitored and protected against inappropriate modification.",
                    hint:
                        "Defenders need visibility to investigate incidents."
                },

                {
                    title: "Secure Error Handling",
                    scenario:
                        "An application displays detailed internal technical information whenever an error occurs.",
                    clues: [
                        "Internal details are exposed.",
                        "The information is unnecessary for normal users.",
                        "Attackers may gain useful context."
                    ],
                    question:
                        "What is safer?",
                    options: [
                        "Show users controlled error messages while keeping sensitive diagnostic information protected.",
                        "Display every internal detail.",
                        "Disable all errors.",
                        "Publish system secrets."
                    ],
                    answer: 0,
                    explanation:
                        "Error messages should provide useful information without unnecessarily exposing internal security-sensitive details.",
                    hint:
                        "Users need helpful messages; attackers do not need your internal blueprint."
                },

                {
                    title: "Session Security",
                    scenario:
                        "A web application keeps users signed in using session tokens, but the tokens are not adequately protected.",
                    clues: [
                        "Sessions represent authenticated users.",
                        "Tokens are sensitive.",
                        "Unauthorized possession could have consequences."
                    ],
                    question:
                        "What should developers prioritize?",
                    options: [
                        "Secure session management.",
                        "Longer error messages.",
                        "More advertisements.",
                        "Public session tokens."
                    ],
                    answer: 0,
                    explanation:
                        "Session identifiers should be generated, transmitted, stored and invalidated securely.",
                    hint:
                        "A session token can represent an authenticated identity."
                },

                {
                    title: "Security by Design",
                    scenario:
                        "A development team adds security only after a major feature has been completed.",
                    clues: [
                        "Security is delayed.",
                        "Design decisions have already been made.",
                        "Changes later may be expensive."
                    ],
                    question:
                        "What is a better philosophy?",
                    options: [
                        "Build security considerations into design and development from the beginning.",
                        "Wait until after deployment.",
                        "Ignore threat modeling.",
                        "Remove security testing."
                    ],
                    answer: 0,
                    explanation:
                        "Security is generally more effective when considered throughout the development lifecycle.",
                    hint:
                        "Security should not be an afterthought."
                },

                {
                    title: "The Security Review",
                    scenario:
                        "Before releasing a new application, a team reviews authentication, authorization, input handling, dependencies, logging and error handling.",
                    clues: [
                        "Multiple security areas are reviewed.",
                        "The review occurs before release.",
                        "The goal is to reduce risk."
                    ],
                    question:
                        "What principle does this demonstrate?",
                    options: [
                        "Secure development lifecycle thinking.",
                        "Security through obscurity.",
                        "Ignoring risk.",
                        "No testing."
                    ],
                    answer: 0,
                    explanation:
                        "Security reviews across the development lifecycle help identify weaknesses before they become production incidents.",
                    hint:
                        "Think about integrating security into software development."
                }

            ]
        },


        {
            id: "forensics",
            number: "CASE 05",
            title: "Digital Evidence Hunt",
            category: "FORENSICS & DEFENSE",
            description:
                "Learn how defenders use logs, hashes, timelines, DNS, network evidence and evidence integrity.",
            levels: [

                {
                    title: "The Evidence Question",
                    scenario:
                        "An investigator receives a digital file that may be relevant to a security incident.",
                    clues: [
                        "The file may become evidence.",
                        "Investigators need to show it was not changed.",
                        "Documentation matters."
                    ],
                    question:
                        "What can help demonstrate file integrity?",
                    options: [
                        "A cryptographic hash.",
                        "Changing the file name.",
                        "Opening and editing it.",
                        "Deleting metadata."
                    ],
                    answer: 0,
                    explanation:
                        "Cryptographic hashes can provide a digest that helps investigators detect whether data has changed.",
                    hint:
                        "Think about a digital fingerprint for data."
                },

                {
                    title: "The Timeline",
                    scenario:
                        "Investigators need to determine what happened before, during and after a suspicious event.",
                    clues: [
                        "Events occurred at different times.",
                        "Multiple systems contain records.",
                        "Sequence matters."
                    ],
                    question:
                        "What should investigators build?",
                    options: [
                        "An event timeline.",
                        "A new password.",
                        "A random list.",
                        "A wallpaper collection."
                    ],
                    answer: 0,
                    explanation:
                        "Timelines help investigators understand the sequence and relationship between events.",
                    hint:
                        "Arrange evidence chronologically."
                },

                {
                    title: "DNS Clue",
                    scenario:
                        "A workstation repeatedly communicates with a domain that security analysts do not recognize.",
                    clues: [
                        "DNS requests were logged.",
                        "The domain is unfamiliar.",
                        "The behavior is unusual for the workstation."
                    ],
                    question:
                        "What can DNS logs help investigators understand?",
                    options: [
                        "Which domain names the system attempted to resolve.",
                        "The user's keyboard layout.",
                        "The monitor size.",
                        "The employee's salary."
                    ],
                    answer: 0,
                    explanation:
                        "DNS logs can provide useful evidence about domain-resolution activity.",
                    hint:
                        "DNS connects names to network addresses."
                },

                {
                    title: "Firewall Evidence",
                    scenario:
                        "A security analyst reviews firewall records after noticing unusual network behavior.",
                    clues: [
                        "The firewall records traffic events.",
                        "The analyst wants network evidence.",
                        "Time and connection information may be available."
                    ],
                    question:
                        "What can firewall logs help reveal?",
                    options: [
                        "Network connection activity.",
                        "Employee grades.",
                        "Screen brightness.",
                        "Keyboard shortcuts."
                    ],
                    answer: 0,
                    explanation:
                        "Firewall logs can provide evidence about permitted or blocked network traffic.",
                    hint:
                        "Think about network connections."
                },

                {
                    title: "The Alert",
                    scenario:
                        "A monitoring system generates an alert after detecting unusual behavior on a server.",
                    clues: [
                        "An alert is generated.",
                        "The event needs investigation.",
                        "An alert is not automatically proof of compromise."
                    ],
                    question:
                        "What should the analyst do?",
                    options: [
                        "Investigate and validate the alert using available evidence.",
                        "Assume compromise without investigation.",
                        "Delete the alert.",
                        "Disable monitoring."
                    ],
                    answer: 0,
                    explanation:
                        "Security alerts require analysis and validation. False positives are possible.",
                    hint:
                        "Detection is the beginning of investigation, not the conclusion."
                },

                {
                    title: "Chain of Custody",
                    scenario:
                        "A digital storage device is collected for an investigation and may later be reviewed by other parties.",
                    clues: [
                        "The device is evidence.",
                        "Multiple people may handle it.",
                        "Documentation is required."
                    ],
                    question:
                        "Why is chain of custody important?",
                    options: [
                        "It documents evidence handling and helps establish integrity.",
                        "It makes files smaller.",
                        "It improves Wi-Fi speed.",
                        "It encrypts every file automatically."
                    ],
                    answer: 0,
                    explanation:
                        "Chain-of-custody records help document who handled evidence, when and how.",
                    hint:
                        "Think about proving where evidence came from and how it was handled."
                },

                {
                    title: "Indicator vs Conclusion",
                    scenario:
                        "An analyst sees an unfamiliar process name and immediately declares the machine compromised.",
                    clues: [
                        "One suspicious indicator exists.",
                        "More evidence is needed.",
                        "Investigations require context."
                    ],
                    question:
                        "What should the analyst remember?",
                    options: [
                        "One indicator is not necessarily a final conclusion.",
                        "Every unknown process is malicious.",
                        "Logs are unnecessary.",
                        "Investigation should stop."
                    ],
                    answer: 0,
                    explanation:
                        "Security analysis should consider context, corroborating evidence and alternative explanations.",
                    hint:
                        "An indicator tells you where to look, not always what the final answer is."
                },

                {
                    title: "Evidence Integrity",
                    scenario:
                        "An investigator compares the hash of a collected file with a previously recorded hash.",
                    clues: [
                        "Hashes were recorded.",
                        "The same file is being checked.",
                        "Integrity is important."
                    ],
                    question:
                        "What does a matching hash suggest?",
                    options: [
                        "The data is consistent with the recorded digest.",
                        "The file is automatically safe.",
                        "The file cannot contain malware.",
                        "The file has been decrypted."
                    ],
                    answer: 0,
                    explanation:
                        "A matching cryptographic hash indicates the data produces the same digest; it does not prove the content is safe.",
                    hint:
                        "Integrity is different from safety."
                },

                {
                    title: "Defensive Correlation",
                    scenario:
                        "A SOC analyst has authentication logs, endpoint alerts and firewall records for the same time period.",
                    clues: [
                        "Multiple evidence sources exist.",
                        "The events overlap in time.",
                        "Correlation can provide context."
                    ],
                    question:
                        "Why correlate these sources?",
                    options: [
                        "To build a stronger understanding of what happened.",
                        "To delete duplicate logs.",
                        "To make alerts disappear.",
                        "To remove authentication."
                    ],
                    answer: 0,
                    explanation:
                        "Correlating multiple data sources can help analysts identify relationships that are not visible in a single log.",
                    hint:
                        "One source gives one perspective; several can provide context."
                },

                {
                    title: "The Final Report",
                    scenario:
                        "An investigation is complete. The security team must communicate findings to technical and nontechnical leadership.",
                    clues: [
                        "The investigation produced evidence.",
                        "Different audiences need different levels of detail.",
                        "Recommendations are needed."
                    ],
                    question:
                        "What should a good incident report contain?",
                    options: [
                        "Findings, evidence, impact, actions and recommendations.",
                        "Only technical jargon.",
                        "Only the attacker's name.",
                        "No evidence."
                    ],
                    answer: 0,
                    explanation:
                        "A useful report communicates what happened, what evidence supports the conclusion, the impact and recommended improvements.",
                    hint:
                        "A report should help the organization understand and improve."
                }

            ]
        }

    ];


    /* =====================================================
       CASE STUDY ENGINE
    ===================================================== */

    let currentCase = null;
    let currentCaseLevel = 0;
    let selectedCaseAnswer = null;


    function renderCases() {

        const grid = $("#caseGrid");

        if (!grid) return;

        grid.innerHTML = caseTracks.map((caseItem, index) => {

            const completed =
                caseItem.levels.filter(
                    (_, levelIndex) =>
                        isLevelCompleted(
                            caseItem.id,
                            levelIndex
                        )
                ).length;

            const percent =
                Math.round(
                    (completed / 10) * 100
                );

            return `
                <article class="case-card">

                    <span class="case-number">
                        ${escapeHTML(caseItem.number)}
                    </span>

                    <h2>
                        ${escapeHTML(caseItem.title)}
                    </h2>

                    <p>
                        ${escapeHTML(caseItem.description)}
                    </p>

                    <div class="case-meta">
                        <span>
                            ${escapeHTML(caseItem.category)}
                        </span>

                        <span>
                            ${completed} / 10 complete
                        </span>
                    </div>

                    <div class="case-progress">

                        <div class="case-progress-bar">
                            <span
                                style="width:${percent}%"
                            ></span>
                        </div>

                    </div>

                    <button
                        class="outline-btn open-case-btn"
                        data-case-index="${index}"
                    >
                        Investigate Case →
                    </button>

                </article>
            `;

        }).join("");


        $$(".open-case-btn").forEach((button) => {

            button.addEventListener("click", () => {

                const index =
                    Number(button.dataset.caseIndex);

                openCase(index);

            });

        });

    }


    function isLevelCompleted(caseId, levelIndex) {

        return Boolean(
            state.completedLevels[
                `${caseId}-${levelIndex}`
            ]
        );

    }


    function openCase(index) {

        currentCase = caseTracks[index];

        currentCaseLevel = findFirstIncompleteLevel(
            currentCase
        );

        if (currentCaseLevel === -1) {
            currentCaseLevel = 0;
        }

        const overview = $("#caseOverview");
        const workspace = $("#caseWorkspace");

        if (overview) {
            overview.classList.add("hidden");
        }

        if (workspace) {
            workspace.classList.remove("hidden");
        }

        renderCaseWorkspace();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    function findFirstIncompleteLevel(caseItem) {

        for (
            let i = 0;
            i < caseItem.levels.length;
            i++
        ) {

            if (
                !isLevelCompleted(
                    caseItem.id,
                    i
                )
            ) {
                return i;
            }
        }

        return -1;
    }


    function renderCaseWorkspace() {

        if (!currentCase) return;

        const category = $("#caseCategory");
        const title = $("#caseTitle");
        const description = $("#caseDescription");

        if (category) {
            category.textContent =
                currentCase.category;
        }

        if (title) {
            title.textContent =
                currentCase.title;
        }

        if (description) {
            description.textContent =
                currentCase.description;
        }


        renderLevelSelector();

        loadCaseLevel();

    }


    function renderLevelSelector() {

        const selector = $("#levelSelector");

        if (!selector || !currentCase) {
            return;
        }

        selector.innerHTML =
            currentCase.levels.map((_, index) => {

                const completed =
                    isLevelCompleted(
                        currentCase.id,
                        index
                    );

                const active =
                    index === currentCaseLevel;

                return `
                    <button
                        class="level-btn
                            ${active ? "active" : ""}
                            ${completed ? "completed" : ""}"
                        data-level="${index}"
                    >
                        ${index + 1}
                    </button>
                `;

            }).join("");


        $$(".level-btn").forEach((button) => {

            button.addEventListener("click", () => {

                const index =
                    Number(button.dataset.level);

                /*
                    Users can revisit completed levels.
                */

                currentCaseLevel = index;

                loadCaseLevel();

            });

        });

    }


    function loadCaseLevel() {

        if (!currentCase) return;

        const level =
            currentCase.levels[currentCaseLevel];

        if (!level) return;

        selectedCaseAnswer = null;


        const levelNumber =
            $("#caseLevelNumber");

        const xp =
            $("#caseXP");

        const scenarioTitle =
            $("#scenarioTitle");

        const scenarioText =
            $("#scenarioText");

        const question =
            $("#questionText");

        const clueList =
            $("#clueList");

        const answerOptions =
            $("#answerOptions");

        const feedback =
            $("#caseFeedback");

        const hintBox =
            $("#hintBox");


        if (levelNumber) {
            levelNumber.textContent =
                currentCaseLevel + 1;
        }

        if (xp) {
            xp.textContent =
                isLevelCompleted(
                    currentCase.id,
                    currentCaseLevel
                )
                    ? "COMPLETED"
                    : "+25 XP";
        }

        if (scenarioTitle) {
            scenarioTitle.textContent =
                level.title;
        }

        if (scenarioText) {
            scenarioText.textContent =
                level.scenario;
        }

        if (question) {
            question.textContent =
                level.question;
        }

        if (clueList) {

            clueList.innerHTML =
                level.clues.map(clue => `
                    <li>
                        ${escapeHTML(clue)}
                    </li>
                `).join("");

        }

        if (hintBox) {
            hintBox.classList.add("hidden");
            hintBox.textContent = "";
        }

        if (feedback) {
            feedback.className =
                "case-feedback hidden";

            feedback.innerHTML = "";
        }


        if (answerOptions) {

            answerOptions.innerHTML =
                level.options.map((option, index) => {

                    const letter =
                        String.fromCharCode(
                            65 + index
                        );

                    return `
                        <button
                            class="answer-option"
                            data-answer="${index}"
                        >
                            <span class="answer-letter">
                                ${letter}
                            </span>

                            <span>
                                ${escapeHTML(option)}
                            </span>
                        </button>
                    `;

                }).join("");


            $$(".answer-option").forEach((button) => {

                button.addEventListener("click", () => {

                    $$(".answer-option").forEach(
                        option => {
                            option.classList.remove(
                                "selected"
                            );
                        }
                    );

                    button.classList.add("selected");

                    selectedCaseAnswer =
                        Number(
                            button.dataset.answer
                        );

                });

            });

        }

        renderLevelSelector();

    }


    const hintBtn = $("#hintBtn");

    if (hintBtn) {

        hintBtn.addEventListener("click", () => {

            if (!currentCase) return;

            const level =
                currentCase.levels[currentCaseLevel];

            const hintBox = $("#hintBox");

            if (!hintBox) return;

            hintBox.textContent =
                "Hint: " + level.hint;

            hintBox.classList.remove("hidden");

        });

    }


    const submitCaseAnswer =
        $("#submitCaseAnswer");

    if (submitCaseAnswer) {

        submitCaseAnswer.addEventListener(
            "click",
            () => {

                if (!currentCase) return;

                if (selectedCaseAnswer === null) {

                    showToast(
                        "Select an answer first."
                    );

                    return;
                }

                const level =
                    currentCase.levels[currentCaseLevel];

                const feedback =
                    $("#caseFeedback");

                if (
                    selectedCaseAnswer ===
                    level.answer
                ) {

                    const key =
                        `${currentCase.id}-${currentCaseLevel}`;

                    const alreadyCompleted =
                        isLevelCompleted(
                            currentCase.id,
                            currentCaseLevel
                        );


                    if (!alreadyCompleted) {

                        state.completedLevels[key] = true;

                        state.xp += 25;

                        updateCaseCompletion(
                            currentCase.id
                        );

                        saveState();

                        checkBadges();

                        updateDashboard();
                        renderBadges();
                        renderCases();

                        showToast(
                            "+25 XP — Correct decision."
                        );

                    }


                    if (feedback) {

                        feedback.className =
                            "case-feedback correct";

                        feedback.innerHTML = `
                            <strong>Correct.</strong><br>
                            ${escapeHTML(level.explanation)}
                        `;

                    }

                } else {

                    if (feedback) {

                        feedback.className =
                            "case-feedback incorrect";

                        feedback.innerHTML = `
                            <strong>Not quite.</strong><br>
                            Review the clues and try again.
                            <br><br>
                            <strong>Why:</strong>
                            ${escapeHTML(level.explanation)}
                        `;

                    }

                    showToast(
                        "Review the evidence and try again."
                    );

                }

            }
        );

    }


    function updateCaseCompletion(caseId) {

        const track =
            caseTracks.find(
                item => item.id === caseId
            );

        if (!track) return;

        const complete =
            track.levels.every(
                (_, index) =>
                    isLevelCompleted(
                        caseId,
                        index
                    )
            );

        if (
            complete &&
            !state.completedCases.includes(caseId)
        ) {

            state.completedCases.push(caseId);

            state.xp += 100;

            showToast(
                `${track.title} completed — +100 bonus XP.`
            );

        }

    }


    const backToCases = $("#backToCases");

    if (backToCases) {

        backToCases.addEventListener("click", () => {

            const workspace = $("#caseWorkspace");
            const overview = $("#caseOverview");

            if (workspace) {
                workspace.classList.add("hidden");
            }

            if (overview) {
                overview.classList.remove("hidden");
            }

            renderCases();

        });

    }


    /* =====================================================
       BADGES
    ===================================================== */

    const badgeDefinitions = [

        {
            id: "first-case",
            icon: "01",
            title: "First Investigation",
            description: "Complete your first case-study level.",
            condition: () =>
                state.completedCases.length > 0 ||
                Object.keys(state.completedLevels).length >= 1
        },

        {
            id: "ten-levels",
            icon: "10",
            title: "Field Analyst",
            description: "Complete 10 investigation levels.",
            condition: () =>
                Object.keys(state.completedLevels).length >= 10
        },

        {
            id: "twenty-five-levels",
            icon: "25",
            title: "Security Analyst",
            description: "Complete 25 investigation levels.",
            condition: () =>
                Object.keys(state.completedLevels).length >= 25
        },

        {
            id: "all-cases",
            icon: "50",
            title: "Master Detective",
            description: "Complete all 50 case-study levels.",
            condition: () =>
                Object.keys(state.completedLevels).length >= 50
        },

        {
            id: "quiz",
            icon: "✓",
            title: "Knowledge Checker",
            description: "Complete the mini quiz.",
            condition: () =>
                state.quizTotal >= 10
        },

        {
            id: "five-hundred-xp",
            icon: "XP",
            title: "500 XP",
            description: "Earn 500 XP.",
            condition: () =>
                state.xp >= 500
        },

        {
            id: "thousand-xp",
            icon: "1K",
            title: "1,000 XP",
            description: "Earn 1,000 XP.",
            condition: () =>
                state.xp >= 1000
        },

        {
            id: "web-security",
            icon: "WEB",
            title: "Web Defender",
            description: "Complete the Web Shield case.",
            condition: () =>
                state.completedCases.includes("web")
        }

    ];


    function checkBadges() {

        badgeDefinitions.forEach((badge) => {

            if (
                badge.condition() &&
                !state.badges.includes(badge.id)
            ) {

                state.badges.push(badge.id);

                showToast(
                    `Badge unlocked: ${badge.title}`
                );

            }

        });

        saveState();

    }


    function renderBadges() {

        const grid = $("#badgesGrid");

        if (!grid) return;

        grid.innerHTML =
            badgeDefinitions.map((badge) => {

                const earned =
                    state.badges.includes(
                        badge.id
                    );

                return `
                    <article
                        class="badge-card
                        ${earned ? "earned" : ""}"
                    >

                        <div class="badge-icon">
                            ${escapeHTML(badge.icon)}
                        </div>

                        <h3>
                            ${escapeHTML(badge.title)}
                        </h3>

                        <p>
                            ${escapeHTML(badge.description)}
                        </p>

                    </article>
                `;

            }).join("");

    }


    /* =====================================================
       MINI QUIZ
    ===================================================== */

    const quizQuestions = [

        {
            question:
                "A company wants to ensure unauthorized people cannot read confidential files. Which CIA property is most relevant?",
            options:
                ["Availability", "Confidentiality", "Integrity", "Redundancy"],
            answer: 1,
            explanation:
                "Confidentiality protects information from unauthorized disclosure."
        },

        {
            question:
                "A known software weakness exists but has not yet been exploited. What is the weakness called?",
            options:
                ["Vulnerability", "Incident", "Asset", "Backup"],
            answer: 0,
            explanation:
                "A vulnerability is a weakness that could potentially be exploited."
        },

        {
            question:
                "A user proves their identity using a password and MFA. What security process is this?",
            options:
                ["Authorization", "Authentication", "Accounting", "Encryption"],
            answer: 1,
            explanation:
                "Authentication verifies identity."
        },

        {
            question:
                "A user is authenticated but cannot access an administrator-only function. Which concept is working?",
            options:
                ["Authorization", "Hashing", "Encoding", "Compression"],
            answer: 0,
            explanation:
                "Authorization determines what an authenticated user is allowed to do."
        },

        {
            question:
                "A suspicious email asks a user to urgently click a login link. What is the most likely threat category?",
            options:
                ["Phishing", "Backup failure", "Disk fragmentation", "Load balancing"],
            answer: 0,
            explanation:
                "Phishing uses deceptive messages to manipulate users into taking unsafe actions."
        },

        {
            question:
                "Which technology is primarily used to create a fixed-length digest for integrity checking?",
            options:
                ["Hash function", "Firewall", "Router", "MFA"],
            answer: 0,
            explanation:
                "Cryptographic hash functions produce fixed-length digests."
        },

        {
            question:
                "An organization collects security events from many systems and correlates them for analysts. What capability is this associated with?",
            options:
                ["SIEM", "Monitor brightness", "File compression", "Keyboard management"],
            answer: 0,
            explanation:
                "SIEM platforms collect and correlate security-related events."
        },

        {
            question:
                "Which principle says a user should receive only the access required for their work?",
            options:
                ["Least privilege", "Maximum privilege", "Open access", "Default trust"],
            answer: 0,
            explanation:
                "Least privilege limits access to what is necessary."
        },

        {
            question:
                "What is the safest description of Base64?",
            options:
                [
                    "Encryption",
                    "Encoding",
                    "Authentication",
                    "Digital signature"
                ],
            answer: 1,
            explanation:
                "Base64 is an encoding method, not encryption."
        },

        {
            question:
                "Which framework helps organizations manage cybersecurity risk through a structured set of outcomes?",
            options:
                ["NIST CSF", "HTML", "JPEG", "DNS"],
            answer: 0,
            explanation:
                "NIST CSF is a cybersecurity risk-management framework."
        }

    ];


    let quizIndex = 0;
    let quizSelected = null;
    let quizAnswered = false;


    function initializeQuiz() {

        quizIndex = 0;
        quizSelected = null;
        quizAnswered = false;

        renderQuizQuestion();

    }


    function renderQuizQuestion() {

        const question =
            quizQuestions[quizIndex];

        if (!question) return;

        const questionElement =
            $("#quizQuestion");

        const progress =
            $("#quizProgress");

        const progressBar =
            $("#quizProgressBar");

        const options =
            $("#quizOptions");

        const feedback =
            $("#quizFeedback");

        const nextButton =
            $("#nextQuizBtn");


        if (questionElement) {
            questionElement.textContent =
                question.question;
        }

        if (progress) {
            progress.textContent =
                `Question ${quizIndex + 1} / ${quizQuestions.length}`;
        }

        if (progressBar) {

            progressBar.style.width =
                `${((quizIndex + 1) /
                    quizQuestions.length) * 100}%`;

        }

        if (feedback) {

            feedback.className =
                "quiz-feedback hidden";

            feedback.innerHTML = "";
        }

        if (nextButton) {
            nextButton.textContent =
                "Check Answer";
        }

        quizSelected = null;
        quizAnswered = false;


        if (options) {

            options.innerHTML =
                question.options.map((option, index) => {

                    const letter =
                        String.fromCharCode(
                            65 + index
                        );

                    return `
                        <button
                            class="answer-option"
                            data-quiz-answer="${index}"
                        >
                            <span class="answer-letter">
                                ${letter}
                            </span>

                            <span>
                                ${escapeHTML(option)}
                            </span>
                        </button>
                    `;

                }).join("");


            $$(".answer-option").forEach((button) => {

                button.addEventListener("click", () => {

                    if (quizAnswered) return;

                    $$(".answer-option").forEach(
                        option =>
                            option.classList.remove(
                                "selected"
                            )
                    );

                    button.classList.add("selected");

                    quizSelected =
                        Number(
                            button.dataset.quizAnswer
                        );

                });

            });

        }

    }


    const nextQuizBtn = $("#nextQuizBtn");

    if (nextQuizBtn) {

        nextQuizBtn.addEventListener("click", () => {

            const question =
                quizQuestions[quizIndex];

            if (!question) return;


            if (!quizAnswered) {

                if (quizSelected === null) {

                    showToast(
                        "Select an answer first."
                    );

                    return;
                }


                quizAnswered = true;

                state.quizTotal += 1;


                const feedback =
                    $("#quizFeedback");


                if (
                    quizSelected ===
                    question.answer
                ) {

                    state.quizScore += 1;

                    if (feedback) {

                        feedback.className =
                            "quiz-feedback correct";

                        feedback.innerHTML = `
                            <strong>Correct.</strong><br>
                            ${escapeHTML(
                                question.explanation
                            )}
                        `;
                    }

                    state.xp += 10;

                    showToast(
                        "+10 XP — Correct answer."
                    );

                } else {

                    if (feedback) {

                        feedback.className =
                            "quiz-feedback incorrect";

                        feedback.innerHTML = `
                            <strong>Review this one.</strong><br>
                            Correct answer:
                            <strong>
                                ${escapeHTML(
                                    question.options[
                                        question.answer
                                    ]
                                )}
                            </strong>
                            <br>
                            ${escapeHTML(
                                question.explanation
                            )}
                        `;

                    }

                }


                saveState();
                checkBadges();
                updateDashboard();

                nextQuizBtn.textContent =
                    quizIndex ===
                    quizQuestions.length - 1
                        ? "Restart Quiz"
                        : "Next Question";

                return;

            }


            if (
                quizIndex ===
                quizQuestions.length - 1
            ) {

                quizIndex = 0;

                showToast(
                    "Quiz restarted."
                );

            } else {

                quizIndex += 1;

            }

            renderQuizQuestion();

        });

    }


    /* =====================================================
       AI STUDY STUDIO
    ===================================================== */

    /*
        This is intentionally a local knowledge assistant.

        It does NOT pretend to be a real remote LLM.

        It:
        1. Searches CyberHunt's built-in knowledge.
        2. Matches common cybersecurity topics.
        3. Provides educational explanations.
        4. Can launch a web search for current information.
    */

    const aiKnowledge = [

        {
            keywords: [
                "cia",
                "confidentiality",
                "integrity",
                "availability"
            ],
            title: "CIA Triad",
            response:
                "The CIA Triad is a foundation of cybersecurity:\n\n• Confidentiality — information should only be accessible to authorized people.\n• Integrity — information should remain accurate and protected from unauthorized modification.\n• Availability — systems and information should be accessible when authorized users need them.\n\nExample: If a hospital database is changed without authorization, integrity is affected. If patients cannot access the system, availability is affected. If unauthorized people read private records, confidentiality is affected.\n\nMemory trick: C = Can only authorized people see it? I = Is the data trustworthy? A = Can authorized users access it when needed?"
        },

        {
            keywords: [
                "threat",
                "vulnerability",
                "risk"
            ],
            title: "Threat vs Vulnerability vs Risk",
            response:
                "Think of these as three different ideas:\n\nThreat = something capable of causing harm.\nVulnerability = a weakness that could be used to cause harm.\nRisk = the possibility and potential impact of harm when a threat can exploit a vulnerability.\n\nExample: A phishing campaign is a threat. Weak security awareness can be a vulnerability. The possibility of an employee giving away credentials and the resulting impact represents risk.\n\nMemory trick: Threat = danger. Vulnerability = weakness. Risk = possible consequence."
        },

        {
            keywords: [
                "authentication",
                "authorization",
                "difference"
            ],
            title: "Authentication vs Authorization",
            response:
                "Authentication answers: 'Who are you?'\n\nAuthorization answers: 'What are you allowed to access or do?'\n\nExample: You enter a university username, password and MFA code. That is authentication. After logging in, being allowed to access only your own student records is authorization.\n\nMemory trick: Authentication = identity. Authorization = permission."
        },

        {
            keywords: [
                "phishing",
                "social engineering"
            ],
            title: "Phishing",
            response:
                "Phishing is a social-engineering technique where deceptive messages attempt to manipulate people into taking an unsafe action.\n\nCommon warning signs include:\n• Unexpected requests\n• Urgency or fear\n• Suspicious links\n• Unexpected attachments\n• Requests for passwords or sensitive information\n• Look-alike domains\n\nDefensive response: pause, verify the request through a trusted channel, avoid suspicious links or attachments, and report the message through the organization's process."
        },

        {
            keywords: [
                "ransomware"
            ],
            title: "Ransomware",
            response:
                "Ransomware is malware associated with unauthorized disruption or encryption of data and systems, often accompanied by an extortion demand.\n\nDefensive thinking:\n1. Detect unusual activity.\n2. Contain affected systems according to the organization's incident-response plan.\n3. Preserve useful evidence.\n4. Assess scope and impact.\n5. Recover using trusted systems and tested backups.\n6. Perform lessons learned.\n\nImportant: never treat an incident as only a technical problem. Communication, business continuity and recovery planning matter too."
        },

        {
            keywords: [
                "hash",
                "hashing",
                "sha",
                "sha256"
            ],
            title: "Hashing",
            response:
                "Hashing is a one-way transformation that produces a fixed-length digest from input data.\n\nSHA-256 is an example of a cryptographic hash function.\n\nImportant distinction:\nHashing ≠ encryption.\n\nEncryption is designed to protect confidentiality and can be reversed with the appropriate key. Hashing is generally used for integrity checks and other applications where the original data should not simply be recovered from the digest.\n\nCyberHunt's Practice Labs include a SHA-256 demonstration."
        },

        {
            keywords: [
                "encryption",
                "cryptography"
            ],
            title: "Cryptography",
            response:
                "Cryptography uses mathematical techniques to protect information and communications.\n\nImportant concepts:\n• Symmetric encryption uses the same secret key for encryption and decryption.\n• Asymmetric cryptography uses related public and private keys.\n• Hashing produces a digest rather than reversible encrypted data.\n• Digital signatures help provide authenticity and integrity.\n\nStart by learning the difference between encryption, hashing and digital signatures."
        },

        {
            keywords: [
                "firewall"
            ],
            title: "Firewalls",
            response:
                "A firewall is a security control that can enforce rules about network traffic.\n\nA firewall can help control which traffic is allowed or blocked based on factors such as addresses, ports, protocols and policies.\n\nImportant limitation: a firewall is not a complete cybersecurity solution. Organizations normally combine multiple controls such as identity security, endpoint protection, monitoring, secure development and user awareness."
        },

        {
            keywords: [
                "ids",
                "ips"
            ],
            title: "IDS vs IPS",
            response:
                "IDS = Intrusion Detection System. It focuses on detecting suspicious activity and generating alerts.\n\nIPS = Intrusion Prevention System. It can take preventive action based on configured security policies.\n\nMemory trick: Detection tells defenders something suspicious may be happening; prevention can actively enforce a response."
        },

        {
            keywords: [
                "incident response",
                "incident"
            ],
            title: "Incident Response",
            response:
                "Incident response is the organized process used to prepare for, detect, analyze, contain, eradicate, recover from and learn from cybersecurity incidents.\n\nA simple study flow is:\nPrepare → Detect → Analyze → Contain → Eradicate → Recover → Learn.\n\nThe exact terminology can differ between frameworks, but the important idea is that response should be planned rather than improvised."
        },

        {
            keywords: [
                "siem",
                "logs",
                "logging"
            ],
            title: "SIEM and Security Logs",
            response:
                "Security logs are records of events that can help defenders understand what happened.\n\nA SIEM can collect and correlate security-related events from multiple sources.\n\nExamples include authentication events, endpoint alerts, firewall events and application logs.\n\nThe important analyst skill is correlation: one event may look harmless, but several related events can reveal a larger pattern."
        },

        {
            keywords: [
                "owasp",
                "top 10",
                "web security"
            ],
            title: "OWASP Top 10",
            response:
                "The OWASP Top 10 is a widely used awareness resource for major web application security risks.\n\nThe current released version is OWASP Top 10:2025.\n\nImportant areas include broken access control, security misconfiguration, software supply-chain failures, cryptographic failures, injection, insecure design, authentication failures, software/data integrity failures, security logging and alerting failures, and mishandling exceptional conditions.\n\nUse the Materials section to connect these concepts to CyberHunt's Web Shield case."
        },

        {
            keywords: [
                "least privilege",
                "privilege"
            ],
            title: "Least Privilege",
            response:
                "Least privilege means giving a user, application or process only the permissions necessary for its legitimate task.\n\nExample: An employee who only needs to view reports should not automatically receive administrator permissions.\n\nWhy it matters: if an account or application is compromised, unnecessary privileges can increase the potential impact."
        },

        {
            keywords: [
                "zero trust"
            ],
            title: "Zero Trust",
            response:
                "Zero Trust is a security approach centered around not automatically trusting users, devices or network locations.\n\nA simple study idea is:\nVerify explicitly → Use least privilege → Continuously evaluate.\n\nZero Trust is broader than simply adding MFA. It involves identity, device posture, access policies, segmentation, monitoring and continuous evaluation."
        },

        {
            keywords: [
                "forensics",
                "digital forensics"
            ],
            title: "Digital Forensics",
            response:
                "Digital forensics is the disciplined collection and analysis of digital evidence.\n\nImportant concepts include:\n• Evidence preservation\n• Hashes and integrity\n• Timelines\n• Logs\n• Metadata\n• Chain of custody\n• Documentation\n\nA forensic investigation should be evidence-driven rather than based on assumptions."
        },

        {
            keywords: [
                "risk management",
                "nist"
            ],
            title: "NIST Cybersecurity Framework",
            response:
                "NIST CSF 2.0 is a framework for helping organizations manage cybersecurity risk.\n\nThe CSF 2.0 Core organizes cybersecurity outcomes and is designed for organizations of different sizes, sectors and maturity levels.\n\nFor study purposes, remember the six CSF 2.0 Functions:\nGovern → Identify → Protect → Detect → Respond → Recover.\n\nUse the Materials section to open the official NIST resource."
        }

    ];


    function getAIResponse(question) {

        const normalized =
            question.toLowerCase();

        /*
            Search the internal library.
        */

        let bestMatch = null;
        let bestScore = 0;

        aiKnowledge.forEach((item) => {

            let score = 0;

            item.keywords.forEach((keyword) => {

                if (
                    normalized.includes(
                        keyword.toLowerCase()
                    )
                ) {
                    score += keyword.length;
                }

            });

            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }

        });


        if (bestMatch) {

            return {
                title: bestMatch.title,
                text: bestMatch.response
            };

        }


        /*
            Generic study assistant.
        */

        if (
            normalized.includes("exam") ||
            normalized.includes("revision") ||
            normalized.includes("revise")
        ) {

            return {
                title: "Exam Revision",
                text:
                    "For cybersecurity revision, organize your answer using this structure:\n\n1. Definition\n2. Purpose\n3. How it works at a high level\n4. Example\n5. Security importance\n6. Scenario\n\nFor example, if the topic is authentication: define it, explain identity verification, give password + MFA as an example, then distinguish it from authorization."
            };

        }


        if (
            normalized.includes("compare") ||
            normalized.includes("difference")
        ) {

            return {
                title: "Comparison Method",
                text:
                    "When comparing cybersecurity concepts, use:\n\n• Definition of concept A\n• Definition of concept B\n• Main difference\n• Example of A\n• Example of B\n• When each is used\n\nTell me the two exact concepts and CyberHunt will try to match them to its study library."
            };

        }


        if (
            normalized.includes("scenario") ||
            normalized.includes("example")
        ) {

            return {
                title: "Scenario Study",
                text:
                    "Scenario-based cybersecurity questions usually ask you to identify the evidence, determine the security concept involved, assess the risk and choose the appropriate defensive action.\n\nExample: An employee receives an unexpected urgent password-reset link. Evidence: unexpected request + urgency + credential page. Likely concept: phishing. Appropriate response: verify through a trusted channel and report the message."
            };

        }


        return {
            title: "CyberHunt Study Guidance",
            text:
                "I couldn't find a strong match in my built-in cybersecurity library for that exact question.\n\nTry asking me something like:\n\n• Explain CIA Triad simply\n• Difference between authentication and authorization\n• Explain phishing with a scenario\n• Teach me cryptography from basics\n• What is ransomware?\n• Explain hashing vs encryption\n• Explain OWASP Top 10\n• What is Zero Trust?\n• Explain incident response\n\nFor information that may have changed recently, use the Web Search option."
        };

    }


    function addChatMessage(role, text, title = "") {

        const chat =
            $("#chatMessages");

        if (!chat) return;

        const isUser =
            role === "user";

        const message =
            document.createElement("div");

        message.className =
            `chat-message ${isUser ? "user" : "assistant"}`;

        message.innerHTML = `
            <div class="message-avatar">
                ${isUser ? "U" : "C"}
            </div>

            <div class="message-content">

                <strong>
                    ${isUser
                        ? "You"
                        : escapeHTML(
                            title ||
                            "CyberHunt AI"
                        )}
                </strong>

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>
        `;

        chat.appendChild(message);

        chat.scrollTop =
            chat.scrollHeight;

    }


    const aiForm = $("#aiForm");

    if (aiForm) {

        aiForm.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                const input =
                    $("#aiInput");

                if (!input) return;

                const question =
                    input.value.trim();

                if (!question) {
                    showToast(
                        "Ask a question first."
                    );
                    return;
                }

                addChatMessage(
                    "user",
                    question
                );

                input.value = "";

                const response =
                    getAIResponse(question);

                setTimeout(() => {

                    addChatMessage(
                        "assistant",
                        response.text,
                        response.title
                    );

                }, 120);

            }
        );

    }


    $$("[data-prompt]").forEach((button) => {

        button.addEventListener("click", () => {

            const input =
                $("#aiInput");

            if (!input) return;

            input.value =
                button.dataset.prompt;

            input.focus();

        });

    });


    /* =====================================================
       WEB SEARCH
    ===================================================== */

    const webSearchBtn =
        $("#webSearchBtn");

    if (webSearchBtn) {

        webSearchBtn.addEventListener(
            "click",
            () => {

                const input =
                    $("#aiInput");

                const question =
                    input && input.value.trim()
                        ? input.value.trim()
                        : "cybersecurity latest information";

                const url =
                    "https://www.google.com/search?q=" +
                    encodeURIComponent(
                        question + " cybersecurity"
                    );

                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    /* =====================================================
       PRACTICE LABS
    ===================================================== */

    /*
        Base64
    */

    function unicodeToBase64(text) {

        try {

            return btoa(
                unescape(
                    encodeURIComponent(text)
                )
            );

        } catch (error) {

            return "Unable to encode this text.";

        }

    }


    function base64ToUnicode(text) {

        try {

            return decodeURIComponent(
                escape(
                    atob(text)
                )
            );

        } catch (error) {

            return "Invalid Base64 input.";

        }

    }


    const base64Encode =
        $("#base64Encode");

    const base64Decode =
        $("#base64Decode");

    if (base64Encode) {

        base64Encode.addEventListener(
            "click",
            () => {

                const input =
                    $("#base64Input");

                const output =
                    $("#base64Output");

                if (!input || !output) return;

                output.textContent =
                    unicodeToBase64(
                        input.value
                    );

            }
        );

    }


    if (base64Decode) {

        base64Decode.addEventListener(
            "click",
            () => {

                const input =
                    $("#base64Input");

                const output =
                    $("#base64Output");

                if (!input || !output) return;

                output.textContent =
                    base64ToUnicode(
                        input.value.trim()
                    );

            }
        );

    }


    /* URL */

    const urlEncode =
        $("#urlEncode");

    const urlDecode =
        $("#urlDecode");

    if (urlEncode) {

        urlEncode.addEventListener(
            "click",
            () => {

                const input =
                    $("#urlInput");

                const output =
                    $("#urlOutput");

                if (!input || !output) return;

                output.textContent =
                    encodeURIComponent(
                        input.value
                    );

            }
        );

    }


    if (urlDecode) {

        urlDecode.addEventListener(
            "click",
            () => {

                const input =
                    $("#urlInput");

                const output =
                    $("#urlOutput");

                if (!input || !output) return;

                try {

                    output.textContent =
                        decodeURIComponent(
                            input.value
                        );

                } catch {

                    output.textContent =
                        "Invalid URL-encoded input.";

                }

            }
        );

    }


    /* HEX */

    function textToHex(text) {

        return Array.from(
            new TextEncoder().encode(text)
        )
            .map(
                byte =>
                    byte
                        .toString(16)
                        .padStart(2, "0")
            )
            .join(" ");

    }


    function hexToText(hex) {

        try {

            const cleaned =
                hex
                    .replace(/0x/gi, "")
                    .replace(/\s+/g, "");

            if (
                cleaned.length === 0 ||
                cleaned.length % 2 !== 0 ||
                !/^[0-9a-f]+$/i.test(cleaned)
            ) {
                return "Invalid hexadecimal input.";
            }

            const bytes =
                new Uint8Array(
                    cleaned.length / 2
                );

            for (
                let i = 0;
                i < cleaned.length;
                i += 2
            ) {

                bytes[i / 2] =
                    parseInt(
                        cleaned.substring(
                            i,
                            i + 2
                        ),
                        16
                    );
            }

            return new TextDecoder().decode(bytes);

        } catch {

            return "Unable to decode hexadecimal input.";

        }

    }


    const hexEncode =
        $("#hexEncode");

    const hexDecode =
        $("#hexDecode");

    if (hexEncode) {

        hexEncode.addEventListener(
            "click",
            () => {

                const input =
                    $("#hexInput");

                const output =
                    $("#hexOutput");

                if (!input || !output) return;

                output.textContent =
                    textToHex(
                        input.value
                    );

            }
        );

    }


    if (hexDecode) {

        hexDecode.addEventListener(
            "click",
            () => {

                const input =
                    $("#hexInput");

                const output =
                    $("#hexOutput");

                if (!input || !output) return;

                output.textContent =
                    hexToText(
                        input.value
                    );

            }
        );

    }


    /* ROT13 */

    function rot13(text) {

        return text.replace(
            /[a-zA-Z]/g,
            char => {

                const base =
                    char <= "Z"
                        ? 65
                        : 97;

                return String.fromCharCode(
                    (
                        char.charCodeAt(0) -
                        base +
                        13
                    ) % 26 +
                    base
                );

            }
        );

    }


    const rotRun =
        $("#rotRun");

    if (rotRun) {

        rotRun.addEventListener(
            "click",
            () => {

                const input =
                    $("#rotInput");

                const output =
                    $("#rotOutput");

                if (!input || !output) return;

                output.textContent =
                    rot13(
                        input.value
                    );

            }
        );

    }


    /* SHA-256 */

    const hashBtn =
        $("#hashBtn");

    if (hashBtn) {

        hashBtn.addEventListener(
            "click",
            async () => {

                const input =
                    $("#hashInput");

                const output =
                    $("#hashOutput");

                if (!input || !output) return;


                if (
                    !window.crypto ||
                    !window.crypto.subtle
                ) {

                    output.textContent =
                        "SHA-256 is not available in this browser context.";

                    return;

                }


                try {

                    const data =
                        new TextEncoder().encode(
                            input.value
                        );

                    const buffer =
                        await crypto.subtle.digest(
                            "SHA-256",
                            data
                        );

                    const hashArray =
                        Array.from(
                            new Uint8Array(buffer)
                        );

                    output.textContent =
                        hashArray
                            .map(
                                byte =>
                                    byte
                                        .toString(16)
                                        .padStart(
                                            2,
                                            "0"
                                        )
                            )
                            .join("");

                } catch {

                    output.textContent =
                        "Unable to calculate SHA-256.";

                }

            }
        );

    }


    /* =====================================================
       INITIALIZATION
    ===================================================== */

    checkBadges();

    if (state.loggedIn) {

        updateDashboard();
        renderMaterials();
        renderCases();
        renderBadges();
        initializeQuiz();

    }

});
