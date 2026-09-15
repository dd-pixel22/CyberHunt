/* =========================================================
   CYBERHUNT STUDY STUDIO
   Plain JavaScript - GitHub Pages compatible
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    /* =====================================================
       STORAGE
       ===================================================== */

    const STORAGE_KEY = "cyberhuntStudyStateV4";
    const LOGIN_KEY = "cyberhuntLoggedIn";

    const defaultState = {
        user: {
            name: "",
            email: ""
        },
        xp: 0,
        completedCases: [],
        quizBest: 0,
        quizCompleted: false,
        completedLabs: [],
        badges: [],
        aiHistory: [],
        currentSection: "dashboard",
        streak: 1
    };

    let state = loadState();

    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return JSON.parse(JSON.stringify(defaultState));
            }

            const parsed = JSON.parse(saved);

            return {
                ...JSON.parse(JSON.stringify(defaultState)),
                ...parsed,
                user: {
                    ...defaultState.user,
                    ...(parsed.user || {})
                },
                completedCases: Array.isArray(parsed.completedCases) ? parsed.completedCases : [],
                completedLabs: Array.isArray(parsed.completedLabs) ? parsed.completedLabs : [],
                badges: Array.isArray(parsed.badges) ? parsed.badges : [],
                aiHistory: Array.isArray(parsed.aiHistory) ? parsed.aiHistory : []
            };

        } catch (error) {
            return JSON.parse(JSON.stringify(defaultState));
        }
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (error) {
            console.warn("Could not save CyberHunt state.");
        }
    }


    /* =====================================================
       MATERIAL LIBRARY
       ===================================================== */

    const materialData = [

        {
            id: "cybersecurity-foundations",
            level: "Beginner",
            title: "Cybersecurity Foundations",
            short: "Understand what cybersecurity protects and how security decisions are made.",
            tags: ["Security", "Foundations", "Risk"],
            detail: `
                Cybersecurity is the practice of protecting information, systems,
                networks, applications and digital services from unauthorized access,
                misuse, disruption, alteration or destruction.

                A good cybersecurity program does not only focus on attackers.
                It also considers accidental mistakes, technical failures,
                natural events, weak processes and poor security design.
            `,
            sections: [
                {
                    title: "What cybersecurity protects",
                    text: `
                        Organizations depend on assets such as databases, applications,
                        employee accounts, intellectual property, servers, cloud services
                        and customer information. Cybersecurity protects these assets by
                        reducing the likelihood and impact of security incidents.
                    `
                },
                {
                    title: "Threat, vulnerability and risk",
                    text: `
                        A threat is a potential cause of harm. A vulnerability is a weakness
                        that could be exploited or could contribute to an incident.
                        Risk combines the possibility of an unwanted event with its potential
                        impact.
                    `
                },
                {
                    title: "Security controls",
                    text: `
                        Security controls are safeguards used to reduce risk. Examples include
                        access controls, MFA, backups, encryption, security awareness training,
                        logging, firewalls and incident-response procedures.
                    `
                }
            ],
            remember: [
                "Asset = something valuable that needs protection.",
                "Threat = potential source or cause of harm.",
                "Vulnerability = weakness.",
                "Risk = possibility and impact of harm.",
                "Control = safeguard used to reduce risk."
            ],
            scenario: `
                A university stores student records in a database. An employee accidentally
                sends a database export to the wrong person. There was no malicious attacker,
                but confidential information was still exposed. This is why cybersecurity
                includes human error as well as deliberate attacks.
            `
        },

        {
            id: "cia-triad",
            level: "Beginner",
            title: "CIA Triad",
            short: "Learn confidentiality, integrity and availability — the three core security goals.",
            tags: ["CIA", "Security Goals"],
            detail: `
                The CIA Triad describes three fundamental goals of information security:
                Confidentiality, Integrity and Availability.

                Security controls are often evaluated by asking which part of the CIA
                Triad they protect.
            `,
            sections: [
                {
                    title: "Confidentiality",
                    text: `
                        Confidentiality means information should only be accessible to
                        authorized people, systems or processes.

                        Examples include access controls, encryption, MFA and permissions.
                    `
                },
                {
                    title: "Integrity",
                    text: `
                        Integrity means information should remain accurate, complete and
                        protected from unauthorized alteration.

                        Hashes, digital signatures, access controls and change monitoring
                        can help protect integrity.
                    `
                },
                {
                    title: "Availability",
                    text: `
                        Availability means authorized users should be able to access systems
                        and information when they need them.

                        Backups, redundancy, disaster recovery and monitoring can support
                        availability.
                    `
                }
            ],
            remember: [
                "Confidentiality = only authorized people can see it.",
                "Integrity = information remains correct and trustworthy.",
                "Availability = authorized users can access it when needed."
            ],
            scenario: `
                A hospital database becomes unavailable during an emergency.
                Even though nobody changed the patient records, the incident primarily
                affects Availability.
            `
        },

        {
            id: "threat-vulnerability-risk",
            level: "Beginner",
            title: "Threats, Vulnerabilities & Risk",
            short: "Learn how security professionals distinguish threats, weaknesses and risk.",
            tags: ["Threat", "Vulnerability", "Risk"],
            detail: `
                Security analysis becomes easier when you separate the source of danger
                from the weakness and the resulting risk.
            `,
            sections: [
                {
                    title: "Threat",
                    text: `
                        A threat is anything that has the potential to cause harm.
                        It can be a malicious actor, malware, human mistake, natural disaster
                        or technical failure.
                    `
                },
                {
                    title: "Vulnerability",
                    text: `
                        A vulnerability is a weakness that could contribute to compromise.
                        Examples include outdated software, excessive permissions,
                        weak authentication and insecure application design.
                    `
                },
                {
                    title: "Risk",
                    text: `
                        Risk represents the possibility that a threat will cause harm
                        through a vulnerability and the consequences that may follow.
                    `
                }
            ],
            remember: [
                "Threat asks: What could cause harm?",
                "Vulnerability asks: What weakness exists?",
                "Risk asks: What could happen and how serious would it be?"
            ],
            scenario: `
                An organization has an internet-facing server running outdated software.
                The outdated software is the vulnerability. A malicious actor attempting
                to exploit it represents a threat. The possibility of service disruption
                or data exposure represents risk.
            `
        },

        {
            id: "authentication-authorization",
            level: "Beginner",
            title: "Authentication vs Authorization",
            short: "Understand identity verification and permission decisions.",
            tags: ["Identity", "Access", "MFA"],
            detail: `
                Authentication and authorization are related but different.

                Authentication answers: "Who are you?"

                Authorization answers: "What are you allowed to do?"
            `,
            sections: [
                {
                    title: "Authentication",
                    text: `
                        Authentication verifies an identity. Passwords, security keys,
                        biometrics and multi-factor authentication can be used for this purpose.
                    `
                },
                {
                    title: "Authorization",
                    text: `
                        Authorization determines what an authenticated identity is allowed
                        to access or perform.
                    `
                },
                {
                    title: "Why the distinction matters",
                    text: `
                        A user can successfully authenticate but still be denied access to
                        a sensitive administrative function because they are not authorized
                        for it.
                    `
                }
            ],
            remember: [
                "Authentication = identity.",
                "Authorization = permission.",
                "MFA strengthens authentication.",
                "Least privilege limits authorization."
            ],
            scenario: `
                An employee signs into the company's application successfully but cannot
                open the payroll administration page. Authentication succeeded;
                authorization denied the requested action.
            `
        },

        {
            id: "passwords-mfa",
            level: "Beginner",
            title: "Passwords & MFA",
            short: "Learn stronger authentication practices and why multiple factors matter.",
            tags: ["Passwords", "MFA", "Identity"],
            detail: `
                Authentication security depends on how identities are verified.
                Strong passwords help, but relying on passwords alone creates a single
                authentication barrier.
            `,
            sections: [
                {
                    title: "Password fundamentals",
                    text: `
                        Longer and unique passwords or passphrases are generally preferable.
                        Reusing the same password across services increases the impact of
                        a password compromise.
                    `
                },
                {
                    title: "Multi-factor authentication",
                    text: `
                        MFA combines multiple factor categories, such as something you know,
                        something you have or something you are.
                    `
                },
                {
                    title: "Security awareness",
                    text: `
                        Users should be taught to recognize suspicious authentication prompts,
                        unexpected login requests and social-engineering attempts.
                    `
                }
            ],
            remember: [
                "Use unique credentials.",
                "MFA adds another authentication factor.",
                "Authentication prompts should be treated carefully.",
                "Least privilege complements strong authentication."
            ],
            scenario: `
                An employee receives an unexpected MFA approval request while not signing in.
                The employee should not approve it and should report the suspicious activity.
            `
        },

        {
            id: "phishing-social-engineering",
            level: "Beginner",
            title: "Phishing & Social Engineering",
            short: "Identify manipulation techniques used to trick people into unsafe actions.",
            tags: ["Phishing", "Social Engineering"],
            detail: `
                Social engineering targets human decision-making rather than relying only
                on technical vulnerabilities. Phishing is a common form in which a message
                attempts to persuade a person to reveal information, open content or take
                an unsafe action.
            `,
            sections: [
                {
                    title: "Common warning signs",
                    text: `
                        Unexpected urgency, unusual sender addresses, suspicious links,
                        requests for credentials, unexpected attachments and messages that
                        bypass normal business procedures are useful warning signs.
                    `
                },
                {
                    title: "Why phishing works",
                    text: `
                        Attackers may exploit urgency, authority, fear, curiosity or trust.
                        Security awareness helps users slow down and verify unusual requests.
                    `
                },
                {
                    title: "Defensive response",
                    text: `
                        Avoid interacting with suspicious content, report the message through
                        the organization's process and verify important requests through
                        trusted channels.
                    `
                }
            ],
            remember: [
                "Urgency is a common manipulation technique.",
                "Check the sender and destination before trusting a request.",
                "Unexpected credential requests deserve extra scrutiny.",
                "Report suspicious messages."
            ],
            scenario: `
                A finance employee receives an urgent email asking them to change a vendor's
                bank details. The safest response is to verify the request through a trusted
                communication channel before making any change.
            `
        },

        {
            id: "malware",
            level: "Beginner",
            title: "Malware Fundamentals",
            short: "Understand malware categories and the defensive concepts used to reduce risk.",
            tags: ["Malware", "Threats"],
            detail: `
                Malware is malicious software designed to perform unwanted or harmful actions.
                Common categories include viruses, worms, trojans, ransomware and spyware.
            `,
            sections: [
                {
                    title: "Ransomware",
                    text: `
                        Ransomware commonly attempts to deny access to data or systems and
                        demands payment. Defenses include backups, segmentation, monitoring,
                        access controls and incident-response planning.
                    `
                },
                {
                    title: "Trojan",
                    text: `
                        A trojan is malicious software presented or disguised as something
                        legitimate. The defensive lesson is to validate software sources and
                        monitor unusual behavior.
                    `
                },
                {
                    title: "Defensive controls",
                    text: `
                        Endpoint protection, patching, least privilege, application control,
                        backups and security monitoring can reduce malware risk.
                    `
                }
            ],
            remember: [
                "Malware = malicious software.",
                "Ransomware targets availability/access to data.",
                "Backups are important for recovery.",
                "Least privilege limits the impact of compromise."
            ],
            scenario: `
                Several employees report that documents suddenly cannot be opened and new
                file extensions appear. The security team should treat the event as a
                potential ransomware incident and follow the organization's incident-response
                process.
            `
        },

        {
            id: "network-security",
            level: "Intermediate",
            title: "Network Security",
            short: "Understand how networks are protected through segmentation, filtering and monitoring.",
            tags: ["Networks", "Firewall", "IDS"],
            detail: `
                Network security protects communication paths, network devices, services
                and connected systems. It combines preventive, detective and corrective controls.
            `,
            sections: [
                {
                    title: "Firewalls",
                    text: `
                        Firewalls enforce traffic rules between networks or systems based
                        on defined security policies.
                    `
                },
                {
                    title: "Network segmentation",
                    text: `
                        Segmentation separates systems or network zones. It can limit how far
                        an incident spreads and reduce unnecessary communication paths.
                    `
                },
                {
                    title: "IDS and IPS",
                    text: `
                        Intrusion Detection Systems monitor for suspicious activity and
                        generate alerts. Intrusion Prevention Systems can also take automated
                        blocking or prevention actions depending on their configuration.
                    `
                }
            ],
            remember: [
                "Firewall = traffic control.",
                "Segmentation = limit unnecessary reach.",
                "IDS = detect and alert.",
                "IPS = detect and help prevent/block."
            ],
            scenario: `
                A company places public web servers in a separate network zone from internal
                employee systems. This segmentation reduces the direct exposure of internal
                systems if the public-facing environment is compromised.
            `
        },

        {
            id: "cryptography",
            level: "Intermediate",
            title: "Cryptography Basics",
            short: "Learn encryption, keys, hashing and digital signatures.",
            tags: ["Encryption", "Keys", "Crypto"],
            detail: `
                Cryptography provides mechanisms for protecting information and establishing
                trust. Important concepts include encryption, hashing, key management and
                digital signatures.
            `,
            sections: [
                {
                    title: "Encryption",
                    text: `
                        Encryption transforms readable information into a protected form
                        using a cryptographic key. Decryption reverses the transformation
                        when the appropriate key is available.
                    `
                },
                {
                    title: "Symmetric encryption",
                    text: `
                        Symmetric cryptography uses the same shared secret key for encryption
                        and decryption.
                    `
                },
                {
                    title: "Asymmetric cryptography",
                    text: `
                        Asymmetric cryptography uses a key pair: a public key and a private key.
                        This supports applications such as digital signatures and secure key exchange.
                    `
                }
            ],
            remember: [
                "Encryption protects confidentiality.",
                "Symmetric = shared secret key.",
                "Asymmetric = public/private key pair.",
                "Key management is critical."
            ],
            scenario: `
                A company encrypts sensitive data stored on a laptop so that someone who
                obtains the physical device cannot simply read the stored information.
            `
        },

        {
            id: "hashing",
            level: "Intermediate",
            title: "Hashing & SHA-256",
            short: "Understand one-way hashing, integrity checking and password-storage concepts.",
            tags: ["Hash", "SHA-256", "Integrity"],
            detail: `
                A cryptographic hash function takes input data and produces a fixed-length
                output called a hash or digest.

                A secure cryptographic hash is designed so that small changes to the input
                produce a substantially different digest.
            `,
            sections: [
                {
                    title: "Hashing is not encryption",
                    text: `
                        Encryption is designed to be reversible with the appropriate key.
                        Cryptographic hashing is designed as a one-way transformation for
                        integrity and related security applications.
                    `
                },
                {
                    title: "Integrity checking",
                    text: `
                        A known trusted hash can be compared with a newly calculated hash.
                        If they differ, the data has changed or a different object is being
                        compared.
                    `
                },
                {
                    title: "Password storage",
                    text: `
                        Passwords should not be stored as plain text. Real password systems
                        normally use password-specific hashing approaches with salts and
                        appropriate work factors rather than simply applying a fast general
                        purpose hash.
                    `
                }
            ],
            remember: [
                "Hashing is generally one-way.",
                "Hashing is different from encryption.",
                "Same input → same digest.",
                "Small input changes should change the digest."
            ],
            scenario: `
                A downloaded file's trusted SHA-256 digest does not match the digest calculated
                for the file received by a user. The mismatch is a reason to investigate the
                file's integrity before using it.
            `
        },

        {
            id: "web-security",
            level: "Intermediate",
            title: "Web Application Security",
            short: "Learn the defensive concepts behind secure web applications.",
            tags: ["Web", "OWASP", "Applications"],
            detail: `
                Web applications process untrusted input, manage user identities and
                expose business functionality. Secure design therefore requires controls
                at multiple layers.
            `,
            sections: [
                {
                    title: "Input validation",
                    text: `
                        Applications should validate data according to expected type,
                        length, format and business rules.
                    `
                },
                {
                    title: "Access control",
                    text: `
                        Applications must ensure users can only access functions and data
                        they are authorized to use.
                    `
                },
                {
                    title: "Secure development",
                    text: `
                        Secure coding, code review, dependency management, logging,
                        testing and security requirements should be integrated throughout
                        the development lifecycle.
                    `
                }
            ],
            remember: [
                "Never assume client input is trustworthy.",
                "Authentication does not automatically provide authorization.",
                "Secure design should happen before deployment.",
                "Dependencies also create security risk."
            ],
            scenario: `
                A normal employee successfully signs into an application but attempts to
                access an administrator-only function. The server must perform an
                authorization check rather than relying on the user interface to hide the button.
            `
        },

        {
            id: "sql-injection",
            level: "Intermediate",
            title: "SQL Injection",
            short: "Understand the vulnerability concept and the defensive use of parameterized queries.",
            tags: ["SQL", "Injection", "Secure Coding"],
            detail: `
                SQL injection occurs when untrusted input is incorrectly incorporated into
                database queries and changes the intended meaning of the query.

                The primary defensive lesson is to separate data from executable query structure.
            `,
            sections: [
                {
                    title: "Why it happens",
                    text: `
                        Dynamically constructing database queries from untrusted strings can
                        cause user-controlled data to be interpreted as part of the query language.
                    `
                },
                {
                    title: "Primary defense",
                    text: `
                        Parameterized queries or prepared statements allow applications to
                        keep data separate from the SQL command structure.
                    `
                },
                {
                    title: "Additional controls",
                    text: `
                        Appropriate input validation, least-privilege database accounts,
                        secure error handling, logging and security testing add defense in depth.
                    `
                }
            ],
            remember: [
                "SQL injection is an injection vulnerability.",
                "Use parameterized queries.",
                "Do not build SQL by unsafe string concatenation.",
                "Database accounts should follow least privilege."
            ],
            scenario: `
                A developer creates a login query by directly joining user input into an SQL
                string. A security review identifies the pattern as unsafe. The developer
                should replace it with a parameterized query.
            `
        },

        {
            id: "xss",
            level: "Intermediate",
            title: "Cross-Site Scripting (XSS)",
            short: "Learn why unsafe handling of browser-rendered input can create security issues.",
            tags: ["XSS", "Web", "Browser"],
            detail: `
                Cross-Site Scripting involves untrusted content being interpreted as
                executable browser-side content in an unsafe context.

                The main defensive concepts are output encoding, safe templating,
                input handling and appropriate browser security controls.
            `,
            sections: [
                {
                    title: "Stored XSS",
                    text: `
                        Malicious content may be stored by an application and later presented
                        to other users in an unsafe context.
                    `
                },
                {
                    title: "Reflected XSS",
                    text: `
                        Untrusted input can be reflected immediately into a response in an
                        unsafe way.
                    `
                },
                {
                    title: "Defensive principles",
                    text: `
                        Context-aware output encoding, secure frameworks, safe DOM APIs,
                        Content Security Policy and careful input handling can reduce risk.
                    `
                }
            ],
            remember: [
                "XSS is about unsafe browser-side interpretation.",
                "Context-aware output encoding is important.",
                "Prefer safe DOM APIs.",
                "Defense should happen at the application layer."
            ],
            scenario: `
                A feedback page displays user-submitted text using an unsafe HTML rendering
                method. A secure redesign should treat the submitted content as data rather
                than executable browser content.
            `
        },

        {
            id: "incident-response",
            level: "Intermediate",
            title: "Incident Response",
            short: "Learn how organizations detect, contain, investigate and recover from incidents.",
            tags: ["IR", "Response", "Recovery"],
            detail: `
                Incident response provides an organized approach to handling security incidents.
                The exact framework can differ, but common activities include preparation,
                detection and analysis, containment, eradication, recovery and lessons learned.
            `,
            sections: [
                {
                    title: "Preparation",
                    text: `
                        Organizations prepare people, processes, tools, contacts, backups and
                        response procedures before an incident occurs.
                    `
                },
                {
                    title: "Containment",
                    text: `
                        Containment aims to limit the spread or impact of an incident while
                        preserving enough information for investigation.
                    `
                },
                {
                    title: "Recovery and lessons learned",
                    text: `
                        Recovery restores normal operations. Lessons learned help improve
                        controls and reduce the chance or impact of similar incidents.
                    `
                }
            ],
            remember: [
                "Prepare before incidents happen.",
                "Containment limits impact.",
                "Evidence and documentation matter.",
                "Every incident should teach the organization something."
            ],
            scenario: `
                A workstation shows signs of compromise. The security team isolates the
                system from the network, preserves relevant evidence and begins investigation
                according to the incident-response plan.
            `
        },

        {
            id: "logging-siem",
            level: "Intermediate",
            title: "Logging & SIEM",
            short: "Understand how security logs support detection, investigation and response.",
            tags: ["Logs", "SIEM", "Monitoring"],
            detail: `
                Security logs provide records of events occurring across systems.
                Centralized analysis helps security teams identify patterns that may not
                be visible from one device alone.
            `,
            sections: [
                {
                    title: "Useful security logs",
                    text: `
                        Authentication events, administrative actions, network events,
                        application errors and security alerts can provide valuable evidence.
                    `
                },
                {
                    title: "SIEM",
                    text: `
                        A Security Information and Event Management platform can collect,
                        normalize, correlate and analyze security-related events.
                    `
                },
                {
                    title: "Good logging",
                    text: `
                        Logs should be useful, protected against unauthorized modification,
                        appropriately retained and monitored. Excessive noise can make
                        important alerts harder to notice.
                    `
                }
            ],
            remember: [
                "Logs support detection and investigation.",
                "SIEM helps centralize and correlate events.",
                "Protect logs from unauthorized modification.",
                "Useful logging is more important than collecting meaningless noise."
            ],
            scenario: `
                A user account shows a successful login followed by an unusual administrative
                action from a location that does not match normal activity. Correlating
                authentication and application logs can help investigators understand the event.
            `
        },

        {
            id: "zero-trust",
            level: "Advanced",
            title: "Zero Trust",
            short: "Learn the principle of continuously evaluating access instead of assuming trust.",
            tags: ["Zero Trust", "Architecture"],
            detail: `
                Zero Trust is a security approach based on the idea that access should not
                automatically be trusted simply because a request comes from inside a
                traditional network boundary.
            `,
            sections: [
                {
                    title: "Verify explicitly",
                    text: `
                        Access decisions can consider identity, device posture, application,
                        resource, context and other relevant signals.
                    `
                },
                {
                    title: "Least privilege",
                    text: `
                        Users and systems should receive only the access necessary to perform
                        their intended tasks.
                    `
                },
                {
                    title: "Assume breach",
                    text: `
                        Architecture should be designed with the expectation that compromise
                        can occur. Segmentation, monitoring and strong access controls reduce
                        potential impact.
                    `
                }
            ],
            remember: [
                "Do not automatically trust based on network location.",
                "Verify explicitly.",
                "Use least privilege.",
                "Design assuming compromise is possible."
            ],
            scenario: `
                An employee working remotely requests access to a sensitive application.
                The system evaluates identity, device status and authorization rather than
                granting access merely because the employee has connected through a corporate network.
            `
        },

        {
            id: "threat-modeling",
            level: "Advanced",
            title: "Threat Modeling",
            short: "Learn how security teams identify threats during system design.",
            tags: ["Threat Modeling", "Design"],
            detail: `
                Threat modeling is a structured process for identifying what could go wrong
                in a system and deciding which risks deserve controls.
            `,
            sections: [
                {
                    title: "Start with the system",
                    text: `
                        Identify assets, users, trust boundaries, data flows and important
                        components before considering specific threats.
                    `
                },
                {
                    title: "Think about abuse",
                    text: `
                        Ask how legitimate functionality could be misused or how an attacker
                        could cross a trust boundary.
                    `
                },
                {
                    title: "Use the results",
                    text: `
                        Threat-model findings can influence architecture, requirements,
                        controls, testing and monitoring before deployment.
                    `
                }
            ],
            remember: [
                "Threat modeling starts during design.",
                "Identify assets and trust boundaries.",
                "Think about misuse as well as normal use.",
                "Use findings to improve architecture."
            ],
            scenario: `
                A development team is designing a banking application. Before coding,
                the team maps data flows and identifies where sensitive customer information
                crosses trust boundaries. Security requirements are then created around those risks.
            `
        },

        {
            id: "digital-forensics",
            level: "Advanced",
            title: "Digital Forensics",
            short: "Learn how investigators preserve and analyze digital evidence.",
            tags: ["Forensics", "Evidence", "Investigation"],
            detail: `
                Digital forensics involves collecting, preserving, examining and interpreting
                digital evidence in a controlled manner.
            `,
            sections: [
                {
                    title: "Evidence preservation",
                    text: `
                        Investigators should preserve relevant evidence while minimizing
                        unnecessary changes to the original material.
                    `
                },
                {
                    title: "Hashing evidence",
                    text: `
                        Hashes can help demonstrate that a digital object has remained unchanged
                        between collection and later examination.
                    `
                },
                {
                    title: "Chain of custody",
                    text: `
                        Chain of custody documents who collected, handled, transferred and
                        stored evidence so its history can be accounted for.
                    `
                }
            ],
            remember: [
                "Preserve evidence carefully.",
                "Hashes help verify integrity.",
                "Document evidence handling.",
                "Separate facts from assumptions during analysis."
            ],
            scenario: `
                Investigators collect a disk image during an internal investigation.
                They calculate a hash and document who collected and transferred the evidence.
                This supports evidence integrity and accountability.
            `
        },

        {
            id: "cloud-security",
            level: "Advanced",
            title: "Cloud Security",
            short: "Understand identity, configuration, data protection and shared responsibility in cloud environments.",
            tags: ["Cloud", "IAM", "Security"],
            detail: `
                Cloud security involves protecting cloud-hosted applications, identities,
                data, infrastructure and configurations.
            `,
            sections: [
                {
                    title: "Identity is central",
                    text: `
                        Cloud environments rely heavily on identity and access management.
                        Strong authentication and least privilege are essential.
                    `
                },
                {
                    title: "Configuration matters",
                    text: `
                        Misconfigured storage, excessive permissions and exposed services can
                        create significant risk even when the underlying cloud provider is secure.
                    `
                },
                {
                    title: "Shared responsibility",
                    text: `
                        Cloud security responsibilities are divided between the provider and
                        customer depending on the service model. Organizations must understand
                        which controls they are responsible for.
                    `
                }
            ],
            remember: [
                "Cloud security heavily depends on identity.",
                "Misconfiguration is a major risk area.",
                "Least privilege applies in cloud environments too.",
                "Know your shared-responsibility boundaries."
            ],
            scenario: `
                A cloud storage resource containing internal documents is accidentally configured
                with broader access than intended. The issue is a security configuration and
                authorization problem, not necessarily a failure of the cloud provider's physical security.
            `
        },

        {
            id: "nist-csf",
            level: "Advanced",
            title: "NIST Cybersecurity Framework",
            short: "Understand a structured way to manage cybersecurity risk across an organization.",
            tags: ["NIST", "Framework", "Risk"],
            detail: `
                The NIST Cybersecurity Framework provides a structured way for organizations
                to think about cybersecurity risk and desired security outcomes.

                Its core functions are Govern, Identify, Protect, Detect, Respond and Recover.
            `,
            sections: [
                {
                    title: "Govern",
                    text: `
                        Establish and monitor the organization's cybersecurity strategy,
                        expectations, roles and risk-management approach.
                    `
                },
                {
                    title: "Identify & Protect",
                    text: `
                        Understand assets, risks and organizational context, then establish
                        safeguards that reduce cybersecurity risk.
                    `
                },
                {
                    title: "Detect, Respond & Recover",
                    text: `
                        Detect potential incidents, take action to contain and manage them,
                        and restore capabilities while improving future resilience.
                    `
                }
            ],
            remember: [
                "Govern",
                "Identify",
                "Protect",
                "Detect",
                "Respond",
                "Recover"
            ],
            scenario: `
                An organization begins by identifying critical assets and risks, establishes
                safeguards, monitors for suspicious events, maintains incident-response plans
                and tests recovery procedures. These activities fit naturally into a cybersecurity
                risk-management framework.
            `
        },

        {
            id: "owasp-top-10",
            level: "Advanced",
            title: "OWASP Top 10",
            short: "Explore major web application security risk categories and their defensive lessons.",
            tags: ["OWASP", "Web Security"],
            detail: `
                The OWASP Top 10 is a widely used awareness resource for web application security.
                It helps developers and security teams understand important categories of web
                application risk.
            `,
            sections: [
                {
                    title: "Important categories",
                    text: `
                        The 2025 list includes Broken Access Control, Security Misconfiguration,
                        Software Supply Chain Failures, Cryptographic Failures, Injection,
                        Insecure Design and Authentication Failures, among others.
                    `
                },
                {
                    title: "How to use it",
                    text: `
                        The list can be used for awareness, secure development discussions,
                        design reviews, testing plans and security training.
                    `
                },
                {
                    title: "Think defensively",
                    text: `
                        The goal is not memorizing names alone. Learn why each category occurs,
                        what business impact it can create and which secure-design practices
                        reduce the risk.
                    `
                }
            ],
            remember: [
                "Access control decides what authenticated users can do.",
                "Injection happens when data is incorrectly treated as instructions.",
                "Secure design prevents entire classes of problems.",
                "Dependencies and supply chains also create security risk."
            ],
            scenario: `
                A web application correctly verifies a user's identity but does not check
                whether the user is allowed to access another customer's record. The issue
                is primarily an authorization/access-control failure.
            `
        }

    ];


    /* =====================================================
       CASE STUDIES
       ===================================================== */

    const caseTracks = [

        {
            id: "phishing-files",
            icon: "✉",
            title: "Phishing Files",
            description: "Investigate suspicious messages and identify safe defensive responses.",
            levels: [
                {
                    title: "The Urgent Email",
                    story: "A finance employee receives an email claiming that an invoice must be paid within 30 minutes. The message contains a link to review the invoice.",
                    clues: ["The message creates unusual urgency.", "The sender address differs slightly from the known vendor.", "The employee was not expecting an invoice."],
                    question: "What should the employee do first?",
                    options: ["Click the link immediately", "Verify the request through a trusted channel", "Forward it to everyone", "Enter credentials to inspect the invoice"],
                    answer: 1,
                    explanation: "Urgent financial requests should be independently verified through a trusted channel before action is taken.",
                    hint: "Think about how to verify an unusual request safely."
                },
                {
                    title: "The Fake Login",
                    story: "An employee receives a message saying their account will be suspended unless they sign in immediately.",
                    clues: ["The message asks for credentials.", "The request is unexpected.", "The message attempts to create fear."],
                    question: "Which security concept best describes the manipulation?",
                    options: ["Social engineering", "Data compression", "Load balancing", "Network segmentation"],
                    answer: 0,
                    explanation: "The message uses psychological pressure to influence the user's decision, which is social engineering."
                },
                {
                    title: "Unexpected Attachment",
                    story: "A colleague sends an unexpected document with a request to enable unusual document functionality.",
                    clues: ["The attachment was not expected.", "The request asks for an unusual action.", "The sender's account may have been compromised."],
                    question: "What is the safest response?",
                    options: ["Enable everything", "Verify with the colleague through another channel", "Forward the document", "Disable antivirus"],
                    answer: 1,
                    explanation: "Unexpected attachments should be verified independently before opening or enabling risky functionality."
                },
                {
                    title: "MFA Surprise",
                    story: "An employee receives several MFA approval prompts despite not attempting to log in.",
                    clues: ["The employee did not initiate the login.", "Multiple prompts arrive.", "Approving one would authorize authentication."],
                    question: "What should the employee do?",
                    options: ["Approve one", "Ignore and report the suspicious prompts", "Share the code", "Turn off MFA"],
                    answer: 1,
                    explanation: "Unexpected MFA requests can indicate an attempted account compromise. They should be denied and reported."
                },
                {
                    title: "The Lookalike Domain",
                    story: "A security analyst notices that an email uses a domain visually similar to the organization's normal domain.",
                    clues: ["The domain is not the organization's normal domain.", "The difference is subtle.", "The message requests sensitive action."],
                    question: "What is the key warning sign?",
                    options: ["Domain impersonation", "Disk fragmentation", "Hash collision", "Network latency"],
                    answer: 0,
                    explanation: "Lookalike domains are commonly used to impersonate legitimate organizations."
                },
                {
                    title: "Verify the Caller",
                    story: "Someone claiming to be an executive calls an employee and requests confidential information immediately.",
                    clues: ["The caller relies on authority.", "The request is unusual.", "There is pressure to act quickly."],
                    question: "What principle should guide the employee?",
                    options: ["Trust authority automatically", "Verify identity and request through approved processes", "Share only half the information", "Ignore all security policies"],
                    answer: 1,
                    explanation: "Authority claims do not replace identity verification and established procedures."
                },
                {
                    title: "Report the Message",
                    story: "An employee recognizes a phishing email before interacting with it.",
                    clues: ["The employee has identified suspicious indicators.", "No interaction occurred.", "The organization has a reporting mechanism."],
                    question: "What action improves organizational defense?",
                    options: ["Delete silently", "Report it through the security process", "Reply to the attacker", "Post it publicly"],
                    answer: 1,
                    explanation: "Reporting allows the security team to investigate and potentially protect other users."
                },
                {
                    title: "Evidence Matters",
                    story: "A security analyst investigates a suspicious message and needs information about the sender and links.",
                    clues: ["The original message contains useful metadata.", "Investigation may require documentation.", "The message is part of a security incident."],
                    question: "Why is preserving relevant evidence useful?",
                    options: ["It makes emails larger", "It supports investigation and understanding", "It prevents all future attacks", "It changes the sender"],
                    answer: 1,
                    explanation: "Relevant evidence helps analysts understand what happened and improve future defenses."
                },
                {
                    title: "Awareness Training",
                    story: "An organization sees repeated phishing attempts against employees.",
                    clues: ["Technical controls alone have not stopped every message.", "Employees are frequent targets.", "Training can improve recognition."],
                    question: "Which additional control is valuable?",
                    options: ["Security awareness training", "Removing all email", "Disabling backups", "Sharing passwords"],
                    answer: 0,
                    explanation: "Security awareness training helps employees recognize and report suspicious activity."
                },
                {
                    title: "Response Decision",
                    story: "An employee clicked a suspicious link and entered credentials before realizing it was fraudulent.",
                    clues: ["Credentials may have been exposed.", "The incident is now more serious.", "A response process exists."],
                    question: "What is the appropriate next step?",
                    options: ["Hide the incident", "Immediately report it and follow incident-response procedures", "Reuse the same password", "Send the credentials to IT"],
                    answer: 1,
                    explanation: "Fast reporting allows defenders to investigate, protect the account and reduce potential impact."
                }
            ]
        },

        {
            id: "ransomware-response",
            icon: "▣",
            title: "Ransomware Response",
            description: "Learn how defenders identify, contain and recover from ransomware incidents.",
            levels: [
                {
                    title: "Strange Extensions",
                    story: "Several office computers suddenly show unfamiliar file extensions and employees cannot open documents.",
                    clues: ["Multiple systems are affected.", "Documents are inaccessible.", "The change happened unexpectedly."],
                    question: "What type of incident should the team consider?",
                    options: ["Potential ransomware", "Normal maintenance", "Printer failure", "Password expiration"],
                    answer: 0,
                    explanation: "Sudden widespread file inaccessibility is a classic indicator that ransomware may be involved."
                },
                {
                    title: "Containment",
                    story: "The security team confirms suspicious activity on one workstation.",
                    clues: ["The system may communicate with other systems.", "The incident is still being investigated.", "Spread must be limited."],
                    question: "What is a reasonable containment action?",
                    options: ["Connect more devices", "Isolate the affected system according to procedure", "Disable every backup", "Publish the evidence"],
                    answer: 1,
                    explanation: "Isolation can limit further spread while the security team investigates."
                },
                {
                    title: "Backup Check",
                    story: "The organization discovers that offline backups exist from before the incident.",
                    clues: ["Backups predate the incident.", "They were protected from normal network access.", "Recovery is being planned."],
                    question: "Why are these backups valuable?",
                    options: ["They increase malware", "They can support recovery", "They remove all vulnerabilities", "They replace incident response"],
                    answer: 1,
                    explanation: "Known-good backups can provide an important recovery path."
                },
                {
                    title: "Preserve Evidence",
                    story: "An analyst wants to immediately wipe an affected machine before recording relevant evidence.",
                    clues: ["The machine may contain useful evidence.", "The incident requires investigation.", "Wiping destroys information."],
                    question: "What should happen before destructive actions when feasible?",
                    options: ["Preserve relevant evidence", "Delete all logs", "Share the disk publicly", "Ignore the incident"],
                    answer: 0,
                    explanation: "Evidence preservation helps investigators understand the incident and its scope."
                },
                {
                    title: "Access Review",
                    story: "Investigators discover that a compromised account had access to many shared folders.",
                    clues: ["The account had broad permissions.", "Only some resources were required for the user's role.", "The compromise increased in impact."],
                    question: "Which security principle should be strengthened?",
                    options: ["Least privilege", "Open access", "Password reuse", "No logging"],
                    answer: 0,
                    explanation: "Least privilege limits unnecessary access and can reduce the impact of account compromise."
                },
                {
                    title: "Communication",
                    story: "An organization is handling a significant security incident affecting business operations.",
                    clues: ["Many teams need coordinated information.", "Customers may eventually be affected.", "Uncontrolled communication can create confusion."],
                    question: "What is important?",
                    options: ["Use an established incident communication process", "Let everyone post publicly", "Hide every detail forever", "Disable all communication"],
                    answer: 0,
                    explanation: "A coordinated communication process helps keep incident information accurate and controlled."
                },
                {
                    title: "Recovery",
                    story: "The affected systems have been investigated and clean recovery sources are available.",
                    clues: ["Recovery sources are trusted.", "Security controls are being reviewed.", "Systems need to return to operation."],
                    question: "What should recovery include?",
                    options: ["Restore systems carefully and monitor them", "Immediately reconnect everything", "Ignore security findings", "Delete all documentation"],
                    answer: 0,
                    explanation: "Recovery should restore operations while verifying systems and monitoring for continued issues."
                },
                {
                    title: "Lessons Learned",
                    story: "The incident is over and the security team is conducting a review.",
                    clues: ["A control failed to prevent the incident.", "Several improvements are possible.", "The team wants to reduce recurrence."],
                    question: "Why conduct a lessons-learned review?",
                    options: ["To assign random blame", "To improve future security and response", "To delete evidence", "To remove all controls"],
                    answer: 1,
                    explanation: "Lessons learned turn an incident into improvements in controls, procedures and preparedness."
                },
                {
                    title: "Segmentation",
                    story: "A company wants to reduce the possibility that a compromise of one network area affects everything else.",
                    clues: ["The organization has several security zones.", "Some systems do not need direct communication.", "Containment is a goal."],
                    question: "Which architecture principle helps?",
                    options: ["Network segmentation", "Universal access", "Shared passwords", "No monitoring"],
                    answer: 0,
                    explanation: "Segmentation limits unnecessary connectivity and can restrict incident spread."
                },
                {
                    title: "Preparedness",
                    story: "An organization had rehearsed its ransomware response before the incident occurred.",
                    clues: ["Roles were already defined.", "Backups had been tested.", "Teams knew how to report incidents."],
                    question: "What security capability helped most before the incident?",
                    options: ["Preparation", "Password sharing", "Ignoring alerts", "Removing backups"],
                    answer: 0,
                    explanation: "Preparation improves response speed and coordination when an incident actually occurs."
                }
            ]
        },

        {
            id: "insider-mystery",
            icon: "◎",
            title: "Insider Mystery",
            description: "Study access control, privilege misuse, monitoring and investigation.",
            levels: [
                {
                    title: "Unusual Access",
                    story: "An employee accesses a sensitive database at an unusual time from a workstation they rarely use.",
                    clues: ["The time is unusual.", "The resource is sensitive.", "The behavior differs from the employee's normal pattern."],
                    question: "What should the security team do?",
                    options: ["Ignore it", "Investigate the event and surrounding logs", "Delete the logs", "Give the account more access"],
                    answer: 1,
                    explanation: "Unusual behavior should be investigated using appropriate monitoring and context."
                },
                {
                    title: "Least Privilege",
                    story: "A marketing employee has permanent administrator privileges despite never needing them.",
                    clues: ["The employee's role does not require admin access.", "Excess privileges increase potential impact.", "Access should match job requirements."],
                    question: "Which principle applies?",
                    options: ["Least privilege", "Maximum privilege", "Anonymous access", "Password reuse"],
                    answer: 0,
                    explanation: "Least privilege gives users only the access required for their responsibilities."
                },
                {
                    title: "Access Review",
                    story: "An organization performs quarterly reviews of user permissions.",
                    clues: ["Employees change roles.", "Old access can remain.", "Reviews identify unnecessary permissions."],
                    question: "Why are access reviews useful?",
                    options: ["They increase unnecessary access", "They help remove inappropriate permissions", "They eliminate authentication", "They replace monitoring"],
                    answer: 1,
                    explanation: "Periodic reviews help ensure access remains appropriate as roles change."
                },
                {
                    title: "Data Movement",
                    story: "An employee suddenly transfers a large amount of sensitive data to an unusual location.",
                    clues: ["The volume is unusual.", "The data is sensitive.", "The destination is not normal for the employee."],
                    question: "What should defenders consider?",
                    options: ["Potential data exfiltration", "Normal printing", "Screen brightness", "Disk formatting"],
                    answer: 0,
                    explanation: "Unexpected large data movement can be an indicator of possible data exfiltration and should be investigated."
                },
                {
                    title: "DLP",
                    story: "A company wants to detect and reduce inappropriate movement of sensitive information.",
                    clues: ["Sensitive data needs protection.", "The organization wants policy-based controls.", "Data movement is a concern."],
                    question: "Which control is relevant?",
                    options: ["Data Loss Prevention", "Screen saver", "Disk defragmentation", "Load balancing"],
                    answer: 0,
                    explanation: "DLP technologies and policies can help identify and control sensitive-data movement."
                },
                {
                    title: "Account Review",
                    story: "An employee leaves the company but their account remains active.",
                    clues: ["The person no longer works there.", "The account still has access.", "Unused accounts create risk."],
                    question: "What should happen?",
                    options: ["Keep it forever", "Disable or remove access according to policy", "Share it with another employee", "Publish the password"],
                    answer: 1,
                    explanation: "Access should be removed or disabled when it is no longer required."
                },
                {
                    title: "Separation of Duties",
                    story: "One employee can both create and approve large financial transactions without another review.",
                    clues: ["One person controls multiple critical steps.", "Fraud risk increases.", "Independent review is possible."],
                    question: "Which principle can reduce this risk?",
                    options: ["Separation of duties", "Shared credentials", "No auditing", "Open permissions"],
                    answer: 0,
                    explanation: "Separation of duties prevents one person from having excessive control over sensitive processes."
                },
                {
                    title: "Audit Trail",
                    story: "Investigators need to determine who changed a sensitive record and when.",
                    clues: ["A change occurred.", "The organization needs accountability.", "Events were logged."],
                    question: "What is especially useful?",
                    options: ["Audit logs", "Random guesses", "Deleted records", "Screensavers"],
                    answer: 0,
                    explanation: "Audit logs provide evidence of actions and timestamps."
                },
                {
                    title: "Policy",
                    story: "Employees are unclear about how sensitive information may be copied or shared.",
                    clues: ["Different employees follow different practices.", "Sensitive data is involved.", "Clear expectations are needed."],
                    question: "What can help?",
                    options: ["Clear security policies and training", "No documentation", "Password sharing", "Disable monitoring"],
                    answer: 0,
                    explanation: "Policies and training establish consistent expectations for handling sensitive information."
                },
                {
                    title: "Investigation",
                    story: "A suspicious employee activity alert is generated, but there is not yet enough information to determine whether it is malicious.",
                    clues: ["An alert is not automatically proof.", "Context is needed.", "Investigators should avoid unsupported assumptions."],
                    question: "What is the best approach?",
                    options: ["Immediately accuse the employee", "Investigate objectively using available evidence", "Delete the alert", "Ignore it"],
                    answer: 1,
                    explanation: "Security investigations should be evidence-based and objective."
                }
            ]
        },

        {
            id: "web-shield",
            icon: "</>",
            title: "Web Shield",
            description: "Study common web security weaknesses and defensive development practices.",
            levels: [
                {
                    title: "Unsafe Query",
                    story: "A developer constructs a database query by directly joining user-provided text into the query string.",
                    clues: ["User input reaches a database query.", "The query is built through string concatenation.", "Data and instructions are not separated."],
                    question: "What is the primary security concern?",
                    options: ["SQL injection", "Screen resolution", "Compression", "DNS caching"],
                    answer: 0,
                    explanation: "Unsafe construction of SQL queries from untrusted input can create SQL injection risk."
                },
                {
                    title: "Parameterized Query",
                    story: "A developer changes the database layer to use prepared statements with parameters.",
                    clues: ["Query structure is separated from input.", "Values are passed as parameters.", "The application is being redesigned defensively."],
                    question: "Why is this safer?",
                    options: ["It separates data from query structure", "It disables the database", "It removes authentication", "It makes passwords public"],
                    answer: 0,
                    explanation: "Parameterized queries help prevent data from being interpreted as SQL instructions."
                },
                {
                    title: "Access Control",
                    story: "A normal user changes an object identifier in a request and can view another customer's record.",
                    clues: ["The user is authenticated.", "The server fails to verify ownership/permission.", "Another customer's data becomes accessible."],
                    question: "What failed?",
                    options: ["Authorization/access control", "Authentication only", "Compression", "Encryption of backups"],
                    answer: 0,
                    explanation: "Authentication confirms identity; authorization must determine whether the requested resource is allowed."
                },
                {
                    title: "Unsafe HTML",
                    story: "A website inserts untrusted user comments directly into an HTML page using an unsafe rendering method.",
                    clues: ["User content is rendered in the browser.", "The content is not handled safely.", "Browser interpretation is involved."],
                    question: "What vulnerability class should developers consider?",
                    options: ["XSS", "DDoS only", "Disk failure", "Password expiration"],
                    answer: 0,
                    explanation: "Unsafe rendering of untrusted content can lead to cross-site scripting."
                },
                {
                    title: "Secure Output",
                    story: "A developer uses context-appropriate output encoding when displaying user-generated content.",
                    clues: ["Content is treated as data.", "The output context is considered.", "The browser should not interpret the content as code."],
                    question: "What security goal does this support?",
                    options: ["Reducing XSS risk", "Increasing password reuse", "Disabling logging", "Removing backups"],
                    answer: 0,
                    explanation: "Appropriate output encoding helps prevent untrusted content from being interpreted as executable browser content."
                },
                {
                    title: "Session Security",
                    story: "A web application leaves sensitive sessions active indefinitely.",
                    clues: ["Sessions remain valid for too long.", "Sensitive actions are possible.", "Session lifecycle controls are weak."],
                    question: "What should developers consider?",
                    options: ["Appropriate session expiration and security controls", "Permanent sessions", "Shared sessions", "No authentication"],
                    answer: 0,
                    explanation: "Session management should reduce the opportunity for unauthorized use of long-lived sessions."
                },
                {
                    title: "Security Design",
                    story: "A development team discovers that authorization was never included in the original design.",
                    clues: ["Security was considered late.", "Access rules are unclear.", "Changing architecture now is expensive."],
                    question: "What lesson does this demonstrate?",
                    options: ["Security should be included during design", "Security only matters after launch", "Testing is unnecessary", "Users should manage permissions"],
                    answer: 0,
                    explanation: "Secure design reduces the chance of fundamental security weaknesses being built into a system."
                },
                {
                    title: "Dependency Risk",
                    story: "A web application uses an old third-party library with a known security issue.",
                    clues: ["The dependency is outdated.", "The vulnerability is publicly known.", "The application relies on the library."],
                    question: "What should the team do?",
                    options: ["Assess and update the dependency appropriately", "Ignore it forever", "Publish credentials", "Disable all security tools"],
                    answer: 0,
                    explanation: "Dependency management is an important part of application security."
                },
                {
                    title: "Logging",
                    story: "A critical application has no record of administrative actions.",
                    clues: ["Sensitive actions occur.", "Investigators cannot reconstruct events.", "Accountability is needed."],
                    question: "What control is missing?",
                    options: ["Security logging", "Image compression", "Screen brightness", "Disk cleanup"],
                    answer: 0,
                    explanation: "Useful logging provides visibility and supports investigation."
                },
                {
                    title: "Secure Review",
                    story: "Before deployment, developers review authentication, authorization, input handling and dependencies.",
                    clues: ["Security is checked before release.", "Multiple control areas are reviewed.", "The process is repeatable."],
                    question: "What practice is this?",
                    options: ["Secure development review", "Password sharing", "Open access", "Ignoring risk"],
                    answer: 0,
                    explanation: "Security reviews integrated into the development lifecycle help identify weaknesses before deployment."
                }
            ]
        },

        {
            id: "forensics-network",
            icon: "⌁",
            title: "Forensics & Network Hunt",
            description: "Learn evidence integrity, logs, network indicators and investigation fundamentals.",
            levels: [
                {
                    title: "Hash the Evidence",
                    story: "An investigator creates a cryptographic hash of a collected file before analysis.",
                    clues: ["The evidence should remain verifiable.", "A hash can be recalculated later.", "The original file should not be changed unnecessarily."],
                    question: "What does the hash primarily help demonstrate?",
                    options: ["Integrity", "Availability", "Network speed", "User identity"],
                    answer: 0,
                    explanation: "A hash can help compare whether digital content has changed."
                },
                {
                    title: "DNS Clue",
                    story: "A workstation repeatedly contacts an unusual domain shortly before suspicious behavior occurs.",
                    clues: ["DNS activity is available.", "The domain is unusual.", "Timing may be relevant."],
                    question: "Why might DNS logs be useful?",
                    options: ["They provide evidence of name-resolution activity", "They encrypt all files", "They create passwords", "They replace backups"],
                    answer: 0,
                    explanation: "DNS records can help investigators understand which domains systems attempted to resolve."
                },
                {
                    title: "Firewall Event",
                    story: "A firewall records repeated blocked connection attempts toward an internal service.",
                    clues: ["Connections were blocked.", "There are multiple attempts.", "The destination is an internal service."],
                    question: "What can the event provide?",
                    options: ["A security investigation lead", "Proof of a successful compromise", "A password", "A backup"],
                    answer: 0,
                    explanation: "A blocked connection event can provide a useful lead, but it does not by itself prove successful compromise."
                },
                {
                    title: "Timestamp",
                    story: "Investigators compare authentication, endpoint and application events during an incident.",
                    clues: ["Different systems have different logs.", "Timing matters.", "Events need correlation."],
                    question: "Why are timestamps useful?",
                    options: ["They help establish event sequence", "They encrypt logs", "They remove evidence", "They create users"],
                    answer: 0,
                    explanation: "Timestamps help investigators reconstruct the order of events."
                },
                {
                    title: "Chain of Custody",
                    story: "A digital evidence device is transferred from an analyst to another investigator.",
                    clues: ["Evidence changes hands.", "The transfer should be documented.", "Accountability is important."],
                    question: "What should be maintained?",
                    options: ["Chain of custody", "Password reuse", "Open permissions", "No documentation"],
                    answer: 0,
                    explanation: "Chain-of-custody records document the handling history of evidence."
                },
                {
                    title: "Log Correlation",
                    story: "An authentication event is followed by an unusual database query and a large data transfer.",
                    clues: ["Three systems produced related events.", "The timing is close.", "The combined pattern is more meaningful than one event."],
                    question: "What security capability is useful?",
                    options: ["Log correlation", "Screen locking", "File compression", "Password sharing"],
                    answer: 0,
                    explanation: "Correlating related events can reveal patterns that individual logs may not show."
                },
                {
                    title: "Evidence Integrity",
                    story: "An investigator recalculates the hash of evidence after analysis and compares it with the original value.",
                    clues: ["A trusted hash exists.", "A second hash is calculated.", "The investigator is checking for changes."],
                    question: "What does a matching hash suggest?",
                    options: ["The content is consistent with the original", "The system is definitely safe", "The attacker is identified", "The network is faster"],
                    answer: 0,
                    explanation: "A matching hash supports the conclusion that the content has not changed relative to the original hashed object."
                },
                {
                    title: "Separate Facts",
                    story: "An analyst sees an unusual login but does not yet know whether it was malicious.",
                    clues: ["The event is suspicious.", "There are multiple possible explanations.", "Evidence is still being gathered."],
                    question: "What should the analyst do?",
                    options: ["Separate observed facts from assumptions", "Immediately declare guilt", "Delete the event", "Ignore it"],
                    answer: 0,
                    explanation: "Good investigations distinguish observed evidence from hypotheses."
                },
                {
                    title: "Network Visibility",
                    story: "An organization wants to improve its ability to investigate suspicious network behavior.",
                    clues: ["Network events are important.", "Current visibility is limited.", "Centralized monitoring can help."],
                    question: "Which capability is valuable?",
                    options: ["Network monitoring and logging", "Removing all logs", "Shared accounts", "No alerts"],
                    answer: 0,
                    explanation: "Network monitoring and logging improve visibility into security-relevant activity."
                },
                {
                    title: "Final Report",
                    story: "An investigation has finished and the organization needs to document what happened.",
                    clues: ["Evidence has been reviewed.", "Root causes were identified.", "Future improvements are needed."],
                    question: "What should the final report include?",
                    options: ["Findings, evidence, impact and recommendations", "Only rumors", "Deleted evidence", "Passwords"],
                    answer: 0,
                    explanation: "A good report communicates evidence-based findings, impact and recommended improvements."
                }
            ]
        }

    ];


    /* =====================================================
       QUIZ DATA
       ===================================================== */

    const quizData = [
        {
            q: "A hospital system is available, but an unauthorized person can read confidential patient records. Which CIA property is primarily affected?",
            options: ["Availability", "Confidentiality", "Integrity", "Performance"],
            answer: 1,
            explanation: "Confidentiality is about preventing unauthorized access to information."
        },
        {
            q: "A user successfully signs into a system but cannot access the administrator dashboard. What concept explains this?",
            options: ["Authorization", "Hashing", "Encryption", "Availability"],
            answer: 0,
            explanation: "Authentication establishes identity; authorization determines permissions."
        },
        {
            q: "Which is the best primary defense against SQL injection?",
            options: ["Parameterized queries", "Longer screen timeout", "More RAM", "Disabling logs"],
            answer: 0,
            explanation: "Parameterized queries separate user data from SQL query structure."
        },
        {
            q: "An employee receives an unexpected MFA prompt while not signing in. What is the safest response?",
            options: ["Approve it", "Deny it and report the activity", "Share the code", "Disable MFA"],
            answer: 1,
            explanation: "Unexpected authentication requests may indicate an attempted account compromise."
        },
        {
            q: "What does a cryptographic hash primarily help verify?",
            options: ["Data integrity", "User permissions", "Screen brightness", "Network bandwidth"],
            answer: 0,
            explanation: "Hashes can be used to compare whether digital content has changed."
        },
        {
            q: "Which principle gives a user only the permissions necessary for their job?",
            options: ["Maximum privilege", "Least privilege", "Open trust", "Anonymous access"],
            answer: 1,
            explanation: "Least privilege limits unnecessary permissions."
        },
        {
            q: "A company separates public web servers from internal employee systems. What security concept is this?",
            options: ["Network segmentation", "Password reuse", "Hashing", "Phishing"],
            answer: 0,
            explanation: "Segmentation separates network zones to limit unnecessary communication and potential impact."
        },
        {
            q: "Which activity is most useful after a security incident has been contained and recovered?",
            options: ["Lessons learned", "Delete all logs", "Ignore the event", "Share passwords"],
            answer: 0,
            explanation: "Lessons learned help improve controls and reduce future risk."
        },
        {
            q: "A web application lets a normal user view another customer's record simply by changing an object identifier. What failed?",
            options: ["Authorization/access control", "Compression", "DNS", "Hashing"],
            answer: 0,
            explanation: "The application failed to verify whether the authenticated user was authorized to access the requested object."
        },
        {
            q: "Which NIST CSF function focuses on restoring capabilities after a cybersecurity incident?",
            options: ["Recover", "Identify", "Protect", "Govern"],
            answer: 0,
            explanation: "Recover focuses on restoring affected capabilities and improving resilience."
        }
    ];


    /* =====================================================
       PRACTICE LAB DATA
       ===================================================== */

    const labData = {

        base64: {
            icon: "64",
            title: "Base64 Encoding & Decoding",
            description: "Learn how text can be represented using Base64 before practicing it yourself.",
            theory: `
                Base64 is an encoding scheme that represents binary data using a set of
                printable characters. It is useful when binary data needs to travel through
                systems designed primarily for text.

                Base64 is NOT encryption. Anyone who understands the encoding can decode it.
            `,
            why: `
                You may encounter Base64 while analyzing email data, configuration values,
                web data or other technical content. Understanding the difference between
                encoding and encryption is an important cybersecurity skill.
            `,
            steps: [
                "Start with normal text.",
                "Convert the text into its byte representation.",
                "Base64 maps those bytes into printable characters.",
                "The encoded value can later be decoded back into the original bytes."
            ],
            example: {
                input: "Hello",
                output: "SGVsbG8=",
                explanation: "The word Hello is represented using Base64. It is encoded, not encrypted."
            },
            type: "base64"
        },

        url: {
            icon: "URL",
            title: "URL Encoding & Decoding",
            description: "Learn why special characters are represented safely inside URLs.",
            theory: `
                URL encoding, also called percent-encoding, represents characters that
                have special meanings or cannot safely appear in certain parts of a URL.

                For example, a space can be represented as %20.
            `,
            why: `
                Security analysts frequently encounter encoded URLs in browser requests,
                logs and application data. Understanding encoding helps you read information
                without confusing representation with encryption.
            `,
            steps: [
                "Identify the text that needs to appear inside a URL.",
                "Characters that require special representation are percent-encoded.",
                "The receiving system can decode the representation.",
                "Always understand the original meaning before making security conclusions."
            ],
            example: {
                input: "hello world",
                output: "hello%20world",
                explanation: "The space character is represented as %20."
            },
            type: "url"
        },

        hex: {
            icon: "HEX",
            title: "Hexadecimal",
            description: "Learn how bytes and values can be represented using hexadecimal notation.",
            theory: `
                Hexadecimal is a base-16 number system using 0-9 and A-F.

                One byte contains 8 bits and is commonly represented by two hexadecimal
                digits, from 00 through FF.
            `,
            why: `
                Hexadecimal appears frequently in cybersecurity when examining hashes,
                file bytes, memory values, packet data and other technical information.
            `,
            steps: [
                "Understand that hexadecimal uses sixteen symbols.",
                "Digits 0-9 represent values zero through nine.",
                "A-F represent values ten through fifteen.",
                "Two hexadecimal digits can represent one byte."
            ],
            example: {
                input: "255",
                output: "FF",
                explanation: "Decimal 255 is represented as FF in hexadecimal."
            },
            type: "hex"
        },

        rot13: {
            icon: "R13",
            title: "ROT13",
            description: "Learn a simple substitution encoding technique and practice decoding it.",
            theory: `
                ROT13 replaces each English alphabet letter with the letter thirteen
                positions away.

                Because the alphabet has 26 letters, applying ROT13 twice returns the
                original text.
            `,
            why: `
                ROT13 is useful as a simple learning example for understanding substitution
                and reversible encoding. It should not be considered modern cryptographic security.
            `,
            steps: [
                "Take one alphabet letter.",
                "Move thirteen positions forward.",
                "Wrap around when reaching the end of the alphabet.",
                "Apply the same process again to decode."
            ],
            example: {
                input: "HELLO",
                output: "URYYB",
                explanation: "HELLO becomes URYYB using ROT13."
            },
            type: "rot13"
        },

        sha256: {
            icon: "#",
            title: "SHA-256 Hashing",
            description: "Learn how cryptographic hashes support integrity checking.",
            theory: `
                SHA-256 is a cryptographic hash function that produces a 256-bit digest.

                The same input produces the same digest, while a small change in the input
                should result in a substantially different digest.
            `,
            why: `
                Hashes are useful for checking whether data has changed. They are commonly
                encountered when verifying files and studying digital evidence.

                Hashing is not the same as encryption.
            `,
            steps: [
                "Enter the original text.",
                "The SHA-256 algorithm processes the input.",
                "A fixed-length 256-bit digest is produced.",
                "Change even one character and compare the new digest."
            ],
            example: {
                input: "hello",
                output: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
                explanation: "This is the SHA-256 digest of the text hello."
            },
            type: "sha256"
        }

    };


    /* =====================================================
       BADGES
       ===================================================== */

    const badgesData = [
        {
            id: "first-case",
            icon: "1",
            title: "First Case",
            description: "Complete your first case-study level.",
            condition: () => state.completedCases.length >= 1
        },
        {
            id: "foundation",
            icon: "F",
            title: "Foundation Complete",
            description: "Complete 5 case-study levels.",
            condition: () => state.completedCases.length >= 5
        },
        {
            id: "phishing",
            icon: "P",
            title: "Phishing Analyst",
            description: "Complete all Phishing Files levels.",
            condition: () => trackCompleted("phishing-files")
        },
        {
            id: "ransomware",
            icon: "R",
            title: "Ransomware Responder",
            description: "Complete all Ransomware Response levels.",
            condition: () => trackCompleted("ransomware-response")
        },
        {
            id: "insider",
            icon: "I",
            title: "Insider Investigator",
            description: "Complete all Insider Mystery levels.",
            condition: () => trackCompleted("insider-mystery")
        },
        {
            id: "web",
            icon: "W",
            title: "Web Defender",
            description: "Complete all Web Shield levels.",
            condition: () => trackCompleted("web-shield")
        },
        {
            id: "forensics",
            icon: "D",
            title: "Forensics Analyst",
            description: "Complete all Forensics & Network Hunt levels.",
            condition: () => trackCompleted("forensics-network")
        },
        {
            id: "ten-levels",
            icon: "10",
            title: "10 Levels",
            description: "Complete 10 case-study levels.",
            condition: () => state.completedCases.length >= 10
        },
        {
            id: "twenty-five",
            icon: "25",
            title: "25 Levels",
            description: "Complete 25 case-study levels.",
            condition: () => state.completedCases.length >= 25
        },
        {
            id: "fifty",
            icon: "50",
            title: "CyberHunt Graduate",
            description: "Complete all 50 case-study levels.",
            condition: () => state.completedCases.length >= 50
        },
        {
            id: "quiz",
            icon: "?",
            title: "Quiz Master",
            description: "Complete the mini quiz.",
            condition: () => state.quizCompleted
        },
        {
            id: "labs",
            icon: "⌘",
            title: "Lab Explorer",
            description: "Complete all 5 practice labs.",
            condition: () => state.completedLabs.length >= 5
        }
    ];


    /* =====================================================
       DOM HELPERS
       ===================================================== */

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => document.querySelectorAll(selector);


    /* =====================================================
       LOGIN
       ===================================================== */

    const loginPage = $("#loginPage");
    const app = $("#app");
    const loginForm = $("#loginForm");

    function showApp() {
        loginPage.classList.add("hidden");
        app.classList.remove("hidden");

        renderEverything();
        showSection(state.currentSection || "dashboard");
    }

    function showLogin() {
        app.classList.add("hidden");
        loginPage.classList.remove("hidden");
    }

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = $("#emailInput").value.trim();
        const username = $("#usernameInput").value.trim();
        const password = $("#passwordInput").value;

        const error = $("#loginError");

        error.textContent = "";

        if (!email || !email.includes("@")) {
            error.textContent = "Please enter a valid email address.";
            return;
        }

        if (!/^[A-Za-z0-9]+$/.test(username)) {
            error.textContent = "Username can contain letters and numbers only.";
            return;
        }

        if (username.length < 2) {
            error.textContent = "Username must contain at least 2 characters.";
            return;
        }

        if (password.length < 8) {
            error.textContent = "Password must contain at least 8 characters.";
            return;
        }

        state.user.name = username;
        state.user.email = email;

        /*
            Password is intentionally NOT stored.
        */

        saveState();

        sessionStorage.setItem(LOGIN_KEY, "true");

        showToast("Welcome to CyberHunt, " + username + ".", "success");

        showApp();
    });


    $("#logoutBtn").addEventListener("click", () => {

        sessionStorage.removeItem(LOGIN_KEY);

        state.currentSection = "dashboard";
        saveState();

        showLogin();

        loginForm.reset();
        $("#loginError").textContent = "";

    });


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const sectionTitles = {
        dashboard: "Dashboard",
        ai: "AI Study Studio",
        materials: "Materials",
        cases: "Case Studies",
        quizzes: "Mini Quizzes",
        labs: "Practice Labs",
        badges: "Badges"
    };

    function showSection(section) {

        if (!document.getElementById(section)) {
            section = "dashboard";
        }

        $$(".page-section").forEach((item) => {
            item.classList.remove("active-section");
        });

        const target = document.getElementById(section);

        if (target) {
            target.classList.add("active-section");
        }

        $$(".nav-item").forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.section === section
            );
        });

        $("#pageTitle").textContent = sectionTitles[section] || "Dashboard";

        state.currentSection = section;
        saveState();

        $("#sidebar").classList.remove("open");

        if (section === "ai") {
            renderAI();
        }

        if (section === "materials") {
            renderMaterials();
        }

        if (section === "cases") {
            renderCases();
        }

        if (section === "quizzes") {
            renderQuiz();
        }

        if (section === "labs") {
            renderLabs();
        }

        if (section === "badges") {
            renderBadges();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    $$(".nav-item").forEach((button) => {

        button.addEventListener("click", () => {
            showSection(button.dataset.section);
        });

    });


    $$("[data-section-action]").forEach((button) => {

        button.addEventListener("click", () => {
            showSection(button.dataset.sectionAction);
        });

    });


    $("#mobileMenuBtn").addEventListener("click", () => {
        $("#sidebar").classList.toggle("open");
    });


    /* =====================================================
       HEADER / DASHBOARD
       ===================================================== */

    function calculateLevel() {
        return Math.max(1, Math.floor(state.xp / 250) + 1);
    }

    function updateHeader() {

        const username = state.user.name || "Detective";
        const initials = username
            .slice(0, 2)
            .toUpperCase();

        $("#headerXP").textContent = state.xp;
        $("#headerLevel").textContent = calculateLevel();
        $("#headerUsername").textContent = username;
        $("#profileInitials").textContent = initials;

        $("#welcomeName").textContent = username;

        $("#dashboardXP").textContent = state.xp;
        $("#dashboardCases").textContent =
            `${state.completedCases.length}/50`;

        $("#dashboardQuiz").textContent =
            `${state.quizBest}%`;

        $("#dashboardBadges").textContent =
            state.badges.length;

        $("#caseProgressTop").textContent =
            `${state.completedCases.length}/50`;
    }


    function renderDashboard() {
        updateHeader();
    }


    /* =====================================================
       MATERIALS
       ===================================================== */

    let activeMaterialFilter = "all";

    function renderMaterials() {

        const grid = $("#materialsGrid");

        if (!grid) return;

        const search = ($("#materialSearch")?.value || "")
            .trim()
            .toLowerCase();

        const filtered = materialData.filter((material) => {

            const levelMatch =
                activeMaterialFilter === "all" ||
                material.level === activeMaterialFilter;

            const text = [
                material.title,
                material.short,
                material.level,
                material.tags.join(" ")
            ].join(" ").toLowerCase();

            return levelMatch && text.includes(search);

        });

        if (!filtered.length) {

            grid.innerHTML = `
                <div class="panel" style="grid-column:1/-1;">
                    <h3>No matching materials</h3>
                    <p style="color:var(--muted);margin-top:7px;">
                        Try another cybersecurity topic or filter.
                    </p>
                </div>
            `;

            return;
        }

        grid.innerHTML = filtered.map((material, index) => `

            <article
                class="material-card"
                data-material-id="${material.id}"
            >

                <div class="material-top">
                    <span class="material-level">${material.level}</span>
                    <span class="material-number">${String(index + 1).padStart(2, "0")}</span>
                </div>

                <h3>${escapeHTML(material.title)}</h3>

                <p>${escapeHTML(material.short)}</p>

                <div class="material-tags">
                    ${material.tags.map(tag => `
                        <span class="material-tag">${escapeHTML(tag)}</span>
                    `).join("")}
                </div>

                <div class="material-open">
                    OPEN DETAILED MATERIAL →
                </div>

            </article>

        `).join("");
    }


    $("#materialSearch").addEventListener("input", renderMaterials);

    $$(".filter-btn").forEach((button) => {

        button.addEventListener("click", () => {

            activeMaterialFilter = button.dataset.filter;

            $$(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            renderMaterials();

        });

    });


    $("#materialsGrid").addEventListener("click", (event) => {

        const card = event.target.closest("[data-material-id]");

        if (!card) return;

        openMaterial(card.dataset.materialId);

    });


    function openMaterial(id) {

        const material = materialData.find(item => item.id === id);

        if (!material) return;

        const modal = $("#materialModal");
        const content = $("#materialModalContent");

        content.innerHTML = `

            <article class="material-detail">

                <div class="material-detail-head">

                    <span class="eyebrow">${escapeHTML(material.level)} MATERIAL</span>

                    <h2>${escapeHTML(material.title)}</h2>

                    <p>${escapeHTML(material.short)}</p>

                </div>

                <div class="detail-section">

                    <h3>What is it?</h3>

                    <p>
                        ${formatText(material.detail)}
                    </p>

                </div>

                ${material.sections.map(section => `

                    <div class="detail-section">

                        <h3>${escapeHTML(section.title)}</h3>

                        <p>${formatText(section.text)}</p>

                    </div>

                `).join("")}

                <div class="detail-section">

                    <div class="remember-box">

                        <strong>KEY THINGS TO REMEMBER</strong>

                        <ul>
                            ${material.remember.map(item => `
                                <li>${escapeHTML(item)}</li>
                            `).join("")}
                        </ul>

                    </div>

                </div>

                <div class="detail-section">

                    <h3>Scenario</h3>

                    <div class="detail-example">
                        <strong>Think like a security analyst.</strong>
                        <p>${formatText(material.scenario)}</p>
                    </div>

                </div>

                <div class="detail-actions">

                    <button
                        class="primary-btn"
                        data-ask-topic="${material.id}"
                    >
                        Ask AI About This Topic →
                    </button>

                    <button
                        class="secondary-btn"
                        data-close-modal
                    >
                        Close
                    </button>

                </div>

            </article>

        `;

        modal.classList.remove("hidden");

    }


    $("#materialModal").addEventListener("click", (event) => {

        if (
            event.target.matches("[data-close-modal]") ||
            event.target.closest("[data-close-modal]")
        ) {
            closeMaterialModal();
        }

        const askButton = event.target.closest("[data-ask-topic]");

        if (askButton) {

            const material = materialData.find(
                item => item.id === askButton.dataset.askTopic
            );

            if (material) {
                closeMaterialModal();
                openAITopic(material.title);
            }

        }

    });


    function closeMaterialModal() {
        $("#materialModal").classList.add("hidden");
    }


    /* =====================================================
       AI STUDY STUDIO
       ===================================================== */

    function renderAI() {

        const container = $("#chatMessages");

        if (!container) return;

        if (!state.aiHistory.length) {

            container.innerHTML = `
                <div class="chat-message assistant">

                    <div class="chat-avatar">AI</div>

                    <div class="chat-bubble">

                        <h4>CyberHunt Study Assistant</h4>

                        <p>
                            Welcome to your Study Studio.
                            Ask me about cybersecurity concepts, compare topics,
                            request examples, or prepare for scenario-based questions.
                        </p>

                        <div class="ai-section">
                            <strong>Try asking:</strong>
                            <ul>
                                <li>Explain CIA Triad simply.</li>
                                <li>Teach me hashing.</li>
                                <li>Authentication vs authorization?</li>
                                <li>Give me a phishing scenario.</li>
                            </ul>
                        </div>

                    </div>

                </div>
            `;

            return;
        }

        container.innerHTML = state.aiHistory.map(message => {

            if (message.role === "user") {

                return `
                    <div class="chat-message user">
                        <div class="chat-avatar">YOU</div>
                        <div class="chat-bubble">
                            ${escapeHTML(message.text)}
                        </div>
                    </div>
                `;

            }

            return `
                <div class="chat-message assistant">
                    <div class="chat-avatar">AI</div>
                    <div class="chat-bubble">
                        ${message.text}
                    </div>
                </div>
            `;

        }).join("");

        container.scrollTop = container.scrollHeight;
    }


    function openAITopic(topic) {

        showSection("ai");

        const material = materialData.find(
            item => item.title.toLowerCase() === topic.toLowerCase()
        );

        $("#aiCurrentTopic").textContent = topic;

        if (material) {
            $("#aiCurrentDescription").textContent =
                material.short;
        } else {
            $("#aiCurrentDescription").textContent =
                "Let's study " + topic + ".";
        }

        const input = $("#aiInput");

        input.value = `Teach me ${topic} in detail with a simple explanation and a cybersecurity scenario.`;

        setTimeout(() => {
            input.focus();
        }, 100);

    }


    function addAIMessage(role, text) {

        state.aiHistory.push({
            role,
            text,
            timestamp: Date.now()
        });

        saveState();
        renderAI();

    }


    function answerFromLibrary(query) {

        const lower = query.toLowerCase();

        let material = null;

        const exactMatch = materialData.find(item =>
            lower.includes(item.title.toLowerCase())
        );

        if (exactMatch) {
            material = exactMatch;
        }

        if (!material) {

            const keywordScores = materialData.map(item => {

                let score = 0;

                const combined = [
                    item.title,
                    item.short,
                    item.detail,
                    item.tags.join(" ")
                ].join(" ").toLowerCase();

                lower.split(/\s+/).forEach(word => {

                    if (word.length > 3 && combined.includes(word)) {
                        score++;
                    }

                });

                return {
                    item,
                    score
                };

            }).sort((a, b) => b.score - a.score);

            if (keywordScores[0] && keywordScores[0].score >= 2) {
                material = keywordScores[0].item;
            }

        }


        /* Special conceptual answers */

        if (
            lower.includes("difference") &&
            lower.includes("authentication") &&
            lower.includes("authorization")
        ) {

            return `
                <h4>Authentication vs Authorization</h4>

                <div class="ai-section">
                    <strong>Authentication</strong>
                    Authentication answers: <b>“Who are you?”</b>
                    It verifies identity.
                </div>

                <div class="ai-section">
                    <strong>Authorization</strong>
                    Authorization answers: <b>“What are you allowed to do?”</b>
                    It determines permissions.
                </div>

                <div class="ai-section">
                    <strong>Easy memory trick</strong>
                    <ul>
                        <li>Authentication → Identity</li>
                        <li>Authorization → Permission</li>
                    </ul>
                </div>

                <div class="ai-section">
                    <strong>Scenario</strong>
                    A student successfully logs into a university system but cannot access
                    the administrator dashboard. Authentication succeeded, while authorization
                    prevented the action.
                </div>
            `;

        }


        if (
            lower.includes("cia") ||
            lower.includes("confidentiality") ||
            lower.includes("integrity") ||
            lower.includes("availability")
        ) {

            return `
                <h4>CIA Triad</h4>

                <div class="ai-section">
                    <strong>Confidentiality</strong>
                    Only authorized people or systems should access the information.
                </div>

                <div class="ai-section">
                    <strong>Integrity</strong>
                    Information should remain accurate and protected from unauthorized alteration.
                </div>

                <div class="ai-section">
                    <strong>Availability</strong>
                    Authorized users should be able to access systems and information when needed.
                </div>

                <div class="ai-section">
                    <strong>Memory trick</strong>
                    C = Can people who should see it see it?
                    <br>
                    I = Is the information still correct?
                    <br>
                    A = Are authorized users able to access it?
                </div>
            `;

        }


        if (
            lower.includes("hash") ||
            lower.includes("sha-256") ||
            lower.includes("sha256")
        ) {

            return `
                <h4>Hashing</h4>

                <div class="ai-section">
                    <strong>Definition</strong>
                    A cryptographic hash function converts input data into a fixed-length
                    digest.
                </div>

                <div class="ai-section">
                    <strong>Important</strong>
                    Hashing is different from encryption. Encryption is designed to be
                    reversible with the appropriate key; cryptographic hashing is designed
                    as a one-way transformation.
                </div>

                <div class="ai-section">
                    <strong>Example</strong>
                    The text <b>hello</b> produces a specific SHA-256 digest.
                    If you change even one character, the resulting digest changes.
                </div>

                <div class="ai-section">
                    <strong>Cybersecurity use</strong>
                    Hashes can help verify file integrity and are important in digital forensics.
                </div>
            `;

        }


        if (
            lower.includes("phishing") ||
            lower.includes("social engineering")
        ) {

            return `
                <h4>Phishing & Social Engineering</h4>

                <div class="ai-section">
                    <strong>Definition</strong>
                    Phishing uses deceptive communication to persuade people to reveal
                    information or take an unsafe action.
                </div>

                <div class="ai-section">
                    <strong>Warning signs</strong>
                    <ul>
                        <li>Unexpected urgency</li>
                        <li>Suspicious sender</li>
                        <li>Unexpected attachment</li>
                        <li>Credential request</li>
                        <li>Unusual financial request</li>
                    </ul>
                </div>

                <div class="ai-section">
                    <strong>Best defensive habit</strong>
                    Slow down and verify important or unusual requests through a trusted channel.
                </div>
            `;

        }


        if (
            lower.includes("sql injection") ||
            lower.includes("sql")
        ) {

            return `
                <h4>SQL Injection</h4>

                <div class="ai-section">
                    <strong>Concept</strong>
                    SQL injection can occur when untrusted input is incorrectly incorporated
                    into a database query and changes its intended meaning.
                </div>

                <div class="ai-section">
                    <strong>Primary defense</strong>
                    Use parameterized queries or prepared statements so that data remains
                    separate from SQL query structure.
                </div>

                <div class="ai-section">
                    <strong>Remember</strong>
                    Never rely on unsafe string concatenation to construct SQL from untrusted input.
                </div>
            `;

        }


        if (
            lower.includes("xss") ||
            lower.includes("cross site scripting")
        ) {

            return `
                <h4>Cross-Site Scripting</h4>

                <div class="ai-section">
                    <strong>Concept</strong>
                    XSS occurs when untrusted content is interpreted as executable browser-side
                    content in an unsafe context.
                </div>

                <div class="ai-section">
                    <strong>Defenses</strong>
                    <ul>
                        <li>Context-aware output encoding</li>
                        <li>Safe templating</li>
                        <li>Safe DOM APIs</li>
                        <li>Appropriate browser security controls</li>
                    </ul>
                </div>
            `;

        }


        if (
            lower.includes("ransomware")
        ) {

            return `
                <h4>Ransomware</h4>

                <div class="ai-section">
                    <strong>Concept</strong>
                    Ransomware commonly attempts to deny access to data or systems and
                    demands payment.
                </div>

                <div class="ai-section">
                    <strong>Defensive priorities</strong>
                    <ul>
                        <li>Detect unusual activity</li>
                        <li>Contain affected systems</li>
                        <li>Preserve relevant evidence</li>
                        <li>Use trusted backups for recovery</li>
                        <li>Review lessons learned</li>
                    </ul>
                </div>
            `;

        }


        if (
            lower.includes("zero trust")
        ) {

            return `
                <h4>Zero Trust</h4>

                <div class="ai-section">
                    <strong>Core idea</strong>
                    Do not automatically trust a request simply because it comes from
                    a particular network location.
                </div>

                <div class="ai-section">
                    <strong>Remember</strong>
                    Verify explicitly, use least privilege and design assuming compromise
                    is possible.
                </div>
            `;

        }


        if (material) {

            const rememberHTML = material.remember
                .slice(0, 4)
                .map(item => `<li>${escapeHTML(item)}</li>`)
                .join("");

            return `
                <h4>${escapeHTML(material.title)}</h4>

                <div class="ai-section">
                    <strong>Explanation</strong>
                    ${formatText(material.detail)}
                </div>

                <div class="ai-section">
                    <strong>Remember</strong>
                    <ul>${rememberHTML}</ul>
                </div>

                <div class="ai-section">
                    <strong>Scenario</strong>
                    ${formatText(material.scenario)}
                </div>

                <div class="ai-section">
                    <strong>Related material</strong>
                    ${escapeHTML(material.title)} is available in your Materials library
                    for a deeper explanation.
                </div>
            `;

        }


        return `
            <h4>Let's break that down.</h4>

            <p>
                I couldn't find a strong direct match in the current cybersecurity
                study library, but we can approach your question using the core areas
                of cybersecurity.
            </p>

            <div class="ai-section">
                <strong>Try a more specific question</strong>
                <ul>
                    <li>Explain CIA Triad.</li>
                    <li>What is hashing?</li>
                    <li>Explain phishing.</li>
                    <li>Authentication vs authorization?</li>
                    <li>What is SQL injection?</li>
                    <li>Explain Zero Trust.</li>
                    <li>Teach me incident response.</li>
                </ul>
            </div>

            <div class="ai-section">
                <strong>Study approach</strong>
                Start with the definition, understand the security goal,
                look at a scenario and then test yourself.
            </div>
        `;

    }


    function askAI(query) {

        const cleanQuery = query.trim();

        if (!cleanQuery) return;

        addAIMessage("user", cleanQuery);

        const answer = answerFromLibrary(cleanQuery);

        addAIMessage("assistant", answer);

        $("#aiInput").value = "";

        $("#aiCurrentTopic").textContent = detectTopic(cleanQuery);

        $("#aiCurrentDescription").textContent =
            "Current discussion topic from your Study Studio conversation.";

    }


    function detectTopic(query) {

        const lower = query.toLowerCase();

        const found = materialData.find(item => {

            return (
                lower.includes(item.title.toLowerCase()) ||
                item.tags.some(tag => lower.includes(tag.toLowerCase()))
            );

        });

        return found ? found.title : "Cybersecurity Discussion";

    }


    $("#aiForm").addEventListener("submit", (event) => {

        event.preventDefault();

        askAI($("#aiInput").value);

    });


    $$(".suggestion-btn").forEach((button) => {

        button.addEventListener("click", () => {
            askAI(button.dataset.aiPrompt);
        });

    });


    $("#clearAI").addEventListener("click", () => {

        state.aiHistory = [];
        saveState();

        $("#aiCurrentTopic").textContent = "General Cybersecurity";
        $("#aiCurrentDescription").textContent =
            "Choose a material or practice lab to study a specific topic here.";

        renderAI();

        showToast("Study conversation cleared.", "success");

    });


    /* =====================================================
       CASE STUDIES
       ===================================================== */

    function totalCaseLevels() {
        return caseTracks.reduce(
            (total, track) => total + track.levels.length,
            0
        );
    }


    function trackCompleted(trackId) {

        const track = caseTracks.find(
            item => item.id === trackId
        );

        if (!track) return false;

        return track.levels.every(level => {

            const id = `${track.id}-${track.levels.indexOf(level)}`;

            return state.completedCases.includes(id);

        });

    }


    function renderCases() {

        const grid = $("#caseTracksGrid");

        if (!grid) return;

        grid.innerHTML = caseTracks.map(track => {

            const completed = track.levels.filter(
                (_, index) =>
                    state.completedCases.includes(`${track.id}-${index}`)
            ).length;

            const percentage =
                Math.round((completed / track.levels.length) * 100);

            return `

                <article class="case-track-card">

                    <div class="case-track-icon">${track.icon}</div>

                    <h3>${escapeHTML(track.title)}</h3>

                    <p>${escapeHTML(track.description)}</p>

                    <div class="case-progress">
                        <div
                            class="case-progress-fill"
                            style="width:${percentage}%"
                        ></div>
                    </div>

                    <div class="case-progress-info">
                        <span>${completed}/${track.levels.length} levels</span>
                        <span>${percentage}%</span>
                    </div>

                    <button
                        class="secondary-btn"
                        data-open-track="${track.id}"
                    >
                        View Levels →
                    </button>

                </article>

            `;

        }).join("");

    }


    $("#caseTracksGrid").addEventListener("click", (event) => {

        const button = event.target.closest("[data-open-track]");

        if (!button) return;

        openCaseTrack(button.dataset.openTrack);

    });


    function openCaseTrack(trackId) {

        const track = caseTracks.find(
            item => item.id === trackId
        );

        if (!track) return;

        const panel = $("#caseLevelsPanel");

        panel.classList.remove("hidden");

        panel.innerHTML = `

            <div class="panel-header">

                <div>
                    <span class="eyebrow">CASE TRACK</span>
                    <h2>${escapeHTML(track.title)}</h2>
                </div>

                <button
                    class="secondary-btn"
                    data-close-case-panel
                >
                    Close
                </button>

            </div>

            <p style="color:var(--muted);font-size:11px;line-height:1.7;">
                Study each scenario, examine the clues and select the most appropriate
                cybersecurity response.
            </p>

            <div class="level-grid">

                ${track.levels.map((level, index) => {

                    const complete =
                        state.completedCases.includes(
                            `${track.id}-${index}`
                        );

                    return `

                        <button
                            class="level-btn ${complete ? "completed" : ""}"
                            data-open-level="${track.id}"
                            data-level-index="${index}"
                        >
                            <strong>LEVEL ${index + 1}</strong>
                            <small>
                                ${complete ? "✓ Completed" : escapeHTML(level.title)}
                            </small>
                        </button>

                    `;

                }).join("")}

            </div>

            <div id="selectedLevelContent"></div>

        `;

        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    $("#caseLevelsPanel").addEventListener("click", (event) => {

        if (event.target.closest("[data-close-case-panel]")) {
            $("#caseLevelsPanel").classList.add("hidden");
            return;
        }

        const button = event.target.closest("[data-open-level]");

        if (!button) return;

        openCaseLevel(
            button.dataset.openLevel,
            Number(button.dataset.levelIndex)
        );

    });


    function openCaseLevel(trackId, levelIndex) {

        const track = caseTracks.find(
            item => item.id === trackId
        );

        if (!track || !track.levels[levelIndex]) return;

        const level = track.levels[levelIndex];
        const levelId = `${trackId}-${levelIndex}`;
        const alreadyComplete =
            state.completedCases.includes(levelId);

        const content = $("#selectedLevelContent");

        content.innerHTML = `

            <div class="level-study-card">

                <span class="eyebrow">LEVEL ${levelIndex + 1}</span>

                <h3>${escapeHTML(level.title)}</h3>

                <p class="level-story">
                    ${escapeHTML(level.story)}
                </p>

                <div class="clue-box">

                    ${level.clues.map(clue => `
                        <div class="clue">
                            <strong>CLUE</strong> — ${escapeHTML(clue)}
                        </div>
                    `).join("")}

                </div>

                <div class="case-question">

                    <strong>${escapeHTML(level.question)}</strong>

                    <div
                        class="options-grid"
                        data-options-for="${levelId}"
                    >

                        ${level.options.map((option, index) => `

                            <button
                                class="option-btn"
                                data-case-option="${index}"
                            >
                                ${escapeHTML(option)}
                            </button>

                        `).join("")}

                    </div>

                    <div class="quiz-actions">

                        <button
                            class="secondary-btn"
                            data-show-hint="${levelId}"
                        >
                            Show Hint
                        </button>

                        <button
                            class="primary-btn"
                            data-submit-case="${levelId}"
                            data-track="${trackId}"
                            data-level="${levelIndex}"
                        >
                            Check Answer
                        </button>

                    </div>

                    <div id="hint-${levelId}"></div>

                    <div id="feedback-${levelId}"></div>

                </div>

            </div>

        `;

        if (alreadyComplete) {

            $("#feedback-" + levelId).innerHTML = `
                <div class="answer-feedback correct">
                    ✓ You have already completed this level.
                    You can review the explanation and study it again.
                </div>
            `;

        }

        content.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    $("#caseLevelsPanel").addEventListener("click", (event) => {

        const option = event.target.closest("[data-case-option]");

        if (option) {

            const parent = option.closest(".options-grid");

            parent.querySelectorAll(".option-btn").forEach(btn => {
                btn.classList.remove("selected");
            });

            option.classList.add("selected");

        }


        const hintButton = event.target.closest("[data-show-hint]");

        if (hintButton) {

            const id = hintButton.dataset.showHint;

            const [trackId, indexString] = splitCaseId(id);

            const track = caseTracks.find(
                item => item.id === trackId
            );

            if (!track) return;

            const level = track.levels[Number(indexString)];

            const hintContainer = $("#hint-" + id);

            hintContainer.innerHTML = `
                <div class="answer-feedback"
                     style="border-color:var(--line);background:#0b0b0d;color:var(--muted);">
                    <strong>Hint:</strong> ${escapeHTML(level.hint || "Look carefully at the clues and identify the security principle involved.")}
                </div>
            `;

        }


        const submit = event.target.closest("[data-submit-case]");

        if (submit) {

            submitCaseAnswer(
                submit.dataset.track,
                Number(submit.dataset.level)
            );

        }

    });


    function submitCaseAnswer(trackId, levelIndex) {

        const track = caseTracks.find(
            item => item.id === trackId
        );

        if (!track) return;

        const level = track.levels[levelIndex];

        const levelId = `${trackId}-${levelIndex}`;

        const optionsContainer =
            document.querySelector(
                `[data-options-for="${levelId}"]`
            );

        if (!optionsContainer) return;

        const selected =
            optionsContainer.querySelector(".option-btn.selected");

        if (!selected) {

            showToast("Choose an answer first.", "error");
            return;

        }

        const selectedIndex =
            Number(selected.dataset.caseOption);

        const feedback =
            $("#feedback-" + levelId);

        if (selectedIndex === level.answer) {

            if (!state.completedCases.includes(levelId)) {

                state.completedCases.push(levelId);
                state.xp += 50;

                saveState();

                checkBadges();

                updateHeader();

                showToast("Correct! +50 XP", "success");

            }

            feedback.innerHTML = `
                <div class="answer-feedback correct">
                    <strong>✓ Correct.</strong><br>
                    ${escapeHTML(level.explanation)}
                </div>
            `;

        } else {

            feedback.innerHTML = `
                <div class="answer-feedback incorrect">
                    <strong>Not quite.</strong><br>
                    Review the clues and try again.
                    <br><br>
                    <strong>Hint:</strong>
                    ${escapeHTML(level.hint || "Look for the cybersecurity principle that best matches the scenario.")}
                </div>
            `;

        }

        renderCases();
    }


    function splitCaseId(id) {

        const lastDash = id.lastIndexOf("-");

        return [
            id.slice(0, lastDash),
            id.slice(lastDash + 1)
        ];

    }


    /* =====================================================
       QUIZ
       ===================================================== */

    let quizIndex = 0;
    let quizScore = 0;
    let quizSelected = null;
    let quizFinished = false;

    function renderQuiz() {

        const container = $("#quizContainer");

        if (!container) return;

        if (quizFinished) {

            renderQuizResult();
            return;

        }

        const question = quizData[quizIndex];

        const progress =
            Math.round((quizIndex / quizData.length) * 100);

        container.innerHTML = `

            <div class="quiz-wrapper">

                <div class="quiz-card">

                    <div class="quiz-progress">

                        <span>
                            QUESTION ${quizIndex + 1}/${quizData.length}
                        </span>

                        <span>
                            SCORE ${quizScore}
                        </span>

                    </div>

                    <div class="quiz-progress-bar">
                        <span style="width:${progress}%"></span>
                    </div>

                    <div class="quiz-question">

                        <h2>${escapeHTML(question.q)}</h2>

                        <div class="quiz-options">

                            ${question.options.map((option, index) => `

                                <button
                                    class="quiz-option ${quizSelected === index ? "selected" : ""}"
                                    data-quiz-option="${index}"
                                >
                                    ${escapeHTML(option)}
                                </button>

                            `).join("")}

                        </div>

                    </div>

                    <div class="quiz-actions">

                        <span style="color:var(--muted-2);font-size:10px;">
                            Scenario-based cybersecurity question
                        </span>

                        <button
                            class="primary-btn"
                            id="quizNextBtn"
                        >
                            ${quizIndex === quizData.length - 1 ? "Finish Quiz" : "Next →"}
                        </button>

                    </div>

                </div>

            </div>

        `;

    }


    $("#quizContainer").addEventListener("click", (event) => {

        const option = event.target.closest("[data-quiz-option]");

        if (option) {

            quizSelected =
                Number(option.dataset.quizOption);

            $("#quizContainer")
                .querySelectorAll(".quiz-option")
                .forEach(btn => btn.classList.remove("selected"));

            option.classList.add("selected");

            return;

        }

        if (event.target.closest("#quizNextBtn")) {

            if (quizSelected === null) {

                showToast("Choose an answer first.", "error");
                return;

            }

            const current = quizData[quizIndex];

            if (quizSelected === current.answer) {
                quizScore++;
            }

            quizSelected = null;

            if (quizIndex === quizData.length - 1) {

                quizFinished = true;
                state.quizCompleted = true;

                const percentage =
                    Math.round(
                        (quizScore / quizData.length) * 100
                    );

                if (percentage > state.quizBest) {

                    state.quizBest = percentage;

                    state.xp += Math.round(
                        percentage / 5
                    );

                }

                saveState();
                checkBadges();
                updateHeader();

                renderQuizResult();

            } else {

                quizIndex++;
                renderQuiz();

            }

        }

    });


    function renderQuizResult() {

        const percentage =
            Math.round(
                (quizScore / quizData.length) * 100
            );

        $("#quizContainer").innerHTML = `

            <div class="quiz-wrapper">

                <div class="quiz-card quiz-result">

                    <div class="eyebrow">QUIZ COMPLETE</div>

                    <div class="quiz-result-score">
                        ${percentage}%
                    </div>

                    <h2>
                        ${percentage >= 80
                            ? "Strong cybersecurity understanding."
                            : percentage >= 50
                                ? "Good foundation. Keep practicing."
                                : "Keep studying and try again."}
                    </h2>

                    <p>
                        You answered ${quizScore} out of ${quizData.length}
                        questions correctly.
                    </p>

                    <div style="margin-top:22px;">

                        <button
                            class="primary-btn"
                            id="restartQuiz"
                        >
                            Try Quiz Again
                        </button>

                    </div>

                </div>

            </div>

        `;

    }


    $("#quizContainer").addEventListener("click", (event) => {

        if (event.target.closest("#restartQuiz")) {

            quizIndex = 0;
            quizScore = 0;
            quizSelected = null;
            quizFinished = false;

            renderQuiz();

        }

    });


    /* =====================================================
       PRACTICE LABS
       ===================================================== */

    function renderLabs() {

        const grid = $("#labsGrid");

        if (!grid) return;

        grid.innerHTML = Object.entries(labData).map(
            ([id, lab]) => {

                const completed =
                    state.completedLabs.includes(id);

                return `

                    <article
                        class="lab-card"
                        data-open-lab="${id}"
                    >

                        <div class="lab-card-icon">
                            ${escapeHTML(lab.icon)}
                        </div>

                        <h3>${escapeHTML(lab.title)}</h3>

                        <p>${escapeHTML(lab.description)}</p>

                        <small>
                            ${completed ? "✓ COMPLETED" : "LEARN & PRACTICE →"}
                        </small>

                    </article>

                `;

            }
        ).join("");

    }


    $("#labsGrid").addEventListener("click", (event) => {

        const card = event.target.closest("[data-open-lab]");

        if (!card) return;

        openLab(card.dataset.openLab);

    });


    function openLab(labId) {

        const lab = labData[labId];

        if (!lab) return;

        const panel = $("#labLearningPanel");

        panel.classList.remove("hidden");

        panel.innerHTML = `

            <div class="lab-learning-head">

                <div>

                    <span class="eyebrow">
                        PRACTICE LAB · ${escapeHTML(lab.type.toUpperCase())}
                    </span>

                    <h2>${escapeHTML(lab.title)}</h2>

                    <p>${escapeHTML(lab.description)}</p>

                </div>

                <button
                    class="secondary-btn"
                    data-close-lab
                >
                    Close
                </button>

            </div>


            <div class="lab-content-grid">

                <div class="lab-theory-card">

                    <h3>01 · Theory</h3>

                    <p>${formatText(lab.theory)}</p>

                </div>

                <div class="lab-theory-card">

                    <h3>02 · Why This Matters</h3>

                    <p>${formatText(lab.why)}</p>

                </div>

                <div class="lab-theory-card">

                    <h3>03 · How It Works</h3>

                    <ol>

                        ${lab.steps.map(step => `
                            <li>${escapeHTML(step)}</li>
                        `).join("")}

                    </ol>

                </div>

                <div class="lab-theory-card worked-example">

                    <span class="example-label">
                        04 · WORKED EXAMPLE
                    </span>

                    <h3 style="margin-top:8px;">
                        Learn it before you practice it
                    </h3>

                    <div class="example-code">
Input:
${escapeHTML(lab.example.input)}

Output:
${escapeHTML(lab.example.output)}

Why:
${escapeHTML(lab.example.explanation)}
                    </div>

                </div>

            </div>


            <div class="lab-practice">

                <span class="eyebrow">05 · YOUR TURN</span>

                <h3>Practice ${escapeHTML(lab.title)}</h3>

                <p>
                    Now use the tool below and experiment with your own safe input.
                </p>

                <div class="lab-controls">

                    <textarea
                        id="labInput"
                        placeholder="Enter your text here..."
                    ></textarea>

                    <div class="lab-button-row">

                        ${getLabButtons(lab.type)}

                    </div>

                    <div id="labOutput" class="lab-output">
                        Your result will appear here.
                    </div>

                </div>

                <div class="lab-footer-actions">

                    <button
                        class="secondary-btn"
                        data-ask-lab="${labId}"
                    >
                        Ask AI About This Lab
                    </button>

                    <button
                        class="primary-btn"
                        data-complete-lab="${labId}"
                    >
                        Mark Lab Complete ✓
                    </button>

                </div>

            </div>

        `;

        panel.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }


    function getLabButtons(type) {

        if (type === "base64") {

            return `
                <button class="secondary-btn" data-lab-action="base64-encode">
                    Encode Base64
                </button>
                <button class="secondary-btn" data-lab-action="base64-decode">
                    Decode Base64
                </button>
            `;

        }

        if (type === "url") {

            return `
                <button class="secondary-btn" data-lab-action="url-encode">
                    Encode URL
                </button>
                <button class="secondary-btn" data-lab-action="url-decode">
                    Decode URL
                </button>
            `;

        }

        if (type === "hex") {

            return `
                <button class="secondary-btn" data-lab-action="hex-encode">
                    Text → Hex
                </button>
                <button class="secondary-btn" data-lab-action="hex-decode">
                    Hex → Text
                </button>
            `;

        }

        if (type === "rot13") {

            return `
                <button class="secondary-btn" data-lab-action="rot13">
                    Apply ROT13
                </button>
            `;

        }

        if (type === "sha256") {

            return `
                <button class="secondary-btn" data-lab-action="sha256">
                    Generate SHA-256
                </button>
            `;

        }

        return "";

    }


    $("#labLearningPanel").addEventListener("click", async (event) => {

        if (event.target.closest("[data-close-lab]")) {

            $("#labLearningPanel").classList.add("hidden");
            return;

        }


        const actionButton =
            event.target.closest("[data-lab-action]");

        if (actionButton) {

            await runLabAction(
                actionButton.dataset.labAction
            );

        }


        const askButton =
            event.target.closest("[data-ask-lab]");

        if (askButton) {

            const lab = labData[askButton.dataset.askLab];

            if (lab) {

                openAITopic(lab.title);

            }

        }


        const completeButton =
            event.target.closest("[data-complete-lab]");

        if (completeButton) {

            const id = completeButton.dataset.completeLab;

            if (!state.completedLabs.includes(id)) {

                state.completedLabs.push(id);
                state.xp += 25;

                saveState();

                checkBadges();
                updateHeader();
                renderLabs();

                showToast(
                    "Practice lab completed. +25 XP",
                    "success"
                );

            } else {

                showToast(
                    "You have already completed this lab.",
                    "success"
                );

            }

        }

    });


    async function runLabAction(action) {

        const input = $("#labInput");

        const output = $("#labOutput");

        if (!input || !output) return;

        const value = input.value;

        try {

            switch (action) {

                case "base64-encode":
                    output.textContent = encodeBase64(value);
                    break;

                case "base64-decode":
                    output.textContent = decodeBase64(value);
                    break;

                case "url-encode":
                    output.textContent = encodeURIComponent(value);
                    break;

                case "url-decode":
                    output.textContent = decodeURIComponent(value);
                    break;

                case "hex-encode":
                    output.textContent = textToHex(value);
                    break;

                case "hex-decode":
                    output.textContent = hexToText(value);
                    break;

                case "rot13":
                    output.textContent = rot13(value);
                    break;

                case "sha256":
                    output.textContent = await sha256(value);
                    break;

                default:
                    output.textContent = "Unknown lab action.";

            }

        } catch (error) {

            output.textContent =
                "Could not process the input. Check the format and try again.";

        }

    }


    /* =====================================================
       LAB FUNCTIONS
       ===================================================== */

    function encodeBase64(text) {

        const bytes = new TextEncoder().encode(text);

        let binary = "";

        bytes.forEach(byte => {
            binary += String.fromCharCode(byte);
        });

        return btoa(binary);

    }


    function decodeBase64(value) {

        const binary = atob(value.trim());

        const bytes = Uint8Array.from(
            binary,
            char => char.charCodeAt(0)
        );

        return new TextDecoder().decode(bytes);

    }


    function textToHex(text) {

        const bytes = new TextEncoder().encode(text);

        return Array.from(bytes)
            .map(byte =>
                byte.toString(16).padStart(2, "0")
            )
            .join(" ");

    }


    function hexToText(hex) {

        const cleaned = hex
            .replace(/0x/gi, "")
            .replace(/[^0-9a-fA-F]/g, "");

        if (cleaned.length % 2 !== 0) {
            throw new Error("Invalid hex");
        }

        const bytes = new Uint8Array(
            cleaned.match(/.{1,2}/g)
                .map(byte => parseInt(byte, 16))
        );

        return new TextDecoder().decode(bytes);

    }


    function rot13(text) {

        return text.replace(/[a-zA-Z]/g, char => {

            const base =
                char <= "Z"
                    ? 65
                    : 97;

            return String.fromCharCode(
                ((char.charCodeAt(0) - base + 13) % 26) + base
            );

        });

    }


    async function sha256(text) {

        if (
            !window.crypto ||
            !window.crypto.subtle
        ) {

            return "SHA-256 is not available in this browser.";

        }

        const data =
            new TextEncoder().encode(text);

        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );

        const hashArray =
            Array.from(
                new Uint8Array(hashBuffer)
            );

        return hashArray
            .map(byte =>
                byte.toString(16).padStart(2, "0")
            )
            .join("");

    }


    /* =====================================================
       BADGES
       ===================================================== */

    function checkBadges() {

        let changed = false;

        badgesData.forEach(badge => {

            if (
                badge.condition() &&
                !state.badges.includes(badge.id)
            ) {

                state.badges.push(badge.id);
                changed = true;

                showToast(
                    `Badge unlocked: ${badge.title}`,
                    "success"
                );

            }

        });

        if (changed) {
            saveState();
        }

    }


    function renderBadges() {

        const grid = $("#badgesGrid");

        if (!grid) return;

        checkBadges();

        grid.innerHTML = badgesData.map(badge => {

            const unlocked =
                state.badges.includes(badge.id);

            return `

                <article class="badge-card ${unlocked ? "unlocked" : ""}">

                    <div class="badge-icon">
                        ${escapeHTML(badge.icon)}
                    </div>

                    <h3>${escapeHTML(badge.title)}</h3>

                    <p>${escapeHTML(badge.description)}</p>

                    <span class="badge-status">
                        ${unlocked ? "UNLOCKED" : "LOCKED"}
                    </span>

                </article>

            `;

        }).join("");

    }


    /* =====================================================
       GENERAL
       ===================================================== */

    function renderEverything() {

        updateHeader();
        renderDashboard();
        renderMaterials();
        renderCases();
        renderQuiz();
        renderLabs();
        renderBadges();
        renderAI();

    }


    function showToast(message, type = "") {

        const container = $("#toastContainer");

        if (!container) return;

        const toast =
            document.createElement("div");

        toast.className =
            `toast ${type}`;

        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {

            toast.style.opacity = "0";
            toast.style.transform = "translateY(8px)";

            setTimeout(() => {
                toast.remove();
            }, 200);

        }, 2600);

    }


    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function formatText(value) {

        return escapeHTML(value)
            .replace(/\n/g, "<br>");

    }


    /* =====================================================
       INITIAL LOGIN STATE
       ===================================================== */

    if (
        sessionStorage.getItem(LOGIN_KEY) === "true" &&
        state.user.name
    ) {

        showApp();

    } else {

        showLogin();

    }

});
