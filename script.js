(() => {
"use strict";

/* =========================
   HELPERS
========================= */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const STORAGE_KEY = "cyberhuntStudyStateV4";

const defaultState = {
  user:null,
  xp:0,
  completedCases:[],
  completedLabs:[],
  quizBest:0,
  badges:[],
  aiHistory:[],
  currentSection:"dashboard",
  streak:1
};

let state = {...defaultState};

const esc = (value) =>
  String(value ?? "")
  .replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[char]));

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load(){
  try{
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if(saved){
      state = {
        ...defaultState,
        ...saved
      };
    }
  }catch{
    state = {...defaultState};
  }
}

function toast(message){
  const el = $("#toast");

  if(!el) return;

  el.textContent = message;
  el.classList.add("show");

  clearTimeout(window.cyberToast);

  window.cyberToast = setTimeout(() => {
    el.classList.remove("show");
  },2300);
}

function xpLevel(){
  return Math.max(1, Math.floor(state.xp / 250) + 1);
}

function caseDone(id){
  return state.completedCases.includes(id);
}

function labDone(id){
  return state.completedLabs.includes(id);
}


/* =========================
   MATERIAL LIBRARY
========================= */

const materials = [

{
 id:"foundations",
 level:"Beginner",
 title:"Cybersecurity Foundations",
 short:"The core vocabulary behind cybersecurity.",
 detail:"Cybersecurity is the practice of protecting information, systems, devices, applications and services from unauthorized access, misuse, disruption, modification or destruction.",
 why:"Every cybersecurity topic builds on a small set of ideas: assets, threats, vulnerabilities, risk and controls.",
 keys:[
  "Asset = something valuable",
  "Threat = potential cause of harm",
  "Vulnerability = weakness",
  "Risk = possibility and consequence of harm",
  "Control = safeguard"
 ],
 example:"A customer database is an asset. An outdated application may contain a vulnerability. An attacker attempting to exploit that weakness represents a threat. The resulting possible loss is risk.",
 scenario:"A university discovers that a server is running software with a known security weakness. The outdated software is the vulnerability.",
 remember:"Ask: What are we protecting? What can harm it? What weakness exists? What is the risk? What control reduces the risk?",
 tags:["beginner"]
},

{
 id:"cia",
 level:"Beginner",
 title:"CIA Triad",
 short:"Confidentiality, Integrity and Availability.",
 detail:"The CIA triad represents three fundamental security objectives. Confidentiality means preventing unauthorized disclosure. Integrity means protecting information from unauthorized or improper alteration. Availability means ensuring authorized users can access systems and information when required.",
 why:"CIA is one of the most frequently used frameworks for analyzing security incidents.",
 keys:[
  "Confidentiality = secrecy",
  "Integrity = correctness",
  "Availability = access",
  "One incident can affect multiple objectives"
 ],
 example:"A leaked employee database primarily affects confidentiality. Altered salary records affect integrity. A long service outage affects availability.",
 scenario:"A hospital database remains online, but patient records have been modified incorrectly. The main CIA objective affected is integrity.",
 remember:"C = Confidential. I = Intact. A = Accessible.",
 tags:["beginner"]
},

{
 id:"threat-risk",
 level:"Beginner",
 title:"Threats, Vulnerabilities & Risk",
 short:"Learn the difference between threats, weaknesses and risk.",
 detail:"A threat is a potential actor or event capable of causing harm. A vulnerability is a weakness that could be exploited or triggered. Risk represents potential loss resulting from a threat exploiting a vulnerability.",
 why:"Exam scenarios often intentionally mix these three concepts.",
 keys:[
  "Threat is not the same as vulnerability",
  "Vulnerability is a weakness",
  "Likelihood describes possibility",
  "Impact describes consequence"
 ],
 example:"A phishing attacker is a threat. Lack of user awareness may be a vulnerability. Account compromise and financial loss are possible risks.",
 scenario:"A server has a known unpatched weakness. The weakness is the vulnerability.",
 remember:"Weakness = vulnerability. Harm source = threat. Exposure = risk.",
 tags:["beginner"]
},

{
 id:"controls",
 level:"Beginner",
 title:"Security Controls",
 short:"Administrative, technical and physical safeguards.",
 detail:"Security controls reduce cybersecurity risk. Administrative controls include policies and training. Technical controls include MFA, encryption and firewalls. Physical controls include locks and secure facilities.",
 why:"Security is not one technology. It is a layered combination of people, processes and technology.",
 keys:[
  "Administrative = policy/process",
  "Technical = technology",
  "Physical = environment",
  "Preventive = prevents",
  "Detective = detects",
  "Corrective = restores"
 ],
 example:"Security awareness training is administrative. MFA is technical. A locked server room is physical. An IDS is primarily detective.",
 scenario:"An organization introduces badge-controlled access to its server room. This is a physical control.",
 remember:"Think people + process + technology + physical protection.",
 tags:["beginner"]
},

{
 id:"authentication",
 level:"Beginner",
 title:"Authentication & Authorization",
 short:"Authentication proves identity; authorization determines permissions.",
 detail:"Authentication verifies who a user is. Authorization determines what an authenticated user is allowed to access or perform.",
 why:"Confusing these terms can cause serious access-control mistakes.",
 keys:[
  "Authentication = Who are you?",
  "Authorization = What can you do?",
  "MFA strengthens authentication",
  "Least privilege limits authorization"
 ],
 example:"Entering a password and authenticator code is authentication. Permission to open the payroll database is authorization.",
 scenario:"An employee logs in successfully but cannot open the finance folder because they lack permission. This is authorization.",
 remember:"AuthN = identity. AuthZ = permissions.",
 tags:["beginner"]
},

{
 id:"passwords",
 level:"Beginner",
 title:"Password Security & MFA",
 short:"Strong passwords and multi-factor authentication.",
 detail:"Good password security includes unique passwords, sufficient length, password managers and protection against reuse. MFA uses multiple authentication factor categories.",
 why:"Password reuse can allow a compromise at one service to affect another service.",
 keys:[
  "Use unique passwords",
  "Prefer long passwords",
  "Use a password manager",
  "MFA adds another barrier",
  "Passwords should not be stored in plaintext"
 ],
 example:"A password manager generates a unique password for every website. A hardware security key can add another authentication factor.",
 scenario:"A password from an old breach is reused on a company account. MFA can reduce the impact of that password compromise.",
 remember:"Unique passwords + MFA = stronger authentication.",
 tags:["beginner"]
},

{
 id:"phishing",
 level:"Beginner",
 title:"Social Engineering & Phishing",
 short:"Detect manipulation through email, SMS, calls and fake websites.",
 detail:"Phishing attempts to manipulate people into revealing information, clicking unsafe links, opening attachments or performing unauthorized actions. Social engineering exploits trust, urgency, authority or curiosity.",
 why:"Humans remain an important part of the security boundary.",
 keys:[
  "Urgency can be a warning sign",
  "Verify unusual requests",
  "Inspect links",
  "Be careful with attachments",
  "Report suspicious messages"
 ],
 example:"A message says an account will be closed within ten minutes and asks the user to log in through a link. The user should verify the account through its known official channel.",
 scenario:"A manager supposedly emails asking for an urgent gift-card purchase. The employee should verify the request through another trusted channel.",
 remember:"Pause → inspect → verify → report.",
 tags:["beginner"]
},

{
 id:"malware",
 level:"Beginner",
 title:"Malware Fundamentals",
 short:"Understand malware categories and defensive response.",
 detail:"Malware is software designed to perform unauthorized or harmful actions. Common categories include ransomware, spyware, trojans, worms and destructive malware.",
 why:"Recognizing suspicious behavior helps defenders select appropriate containment and investigation steps.",
 keys:[
  "Ransomware can disrupt data availability",
  "Worms can spread automatically",
  "Trojans disguise malicious functionality",
  "Spyware can collect information"
 ],
 example:"If multiple computers suddenly show unfamiliar file-extension changes, the security team should investigate and contain affected systems.",
 scenario:"Several endpoints begin displaying identical suspicious changes. This is an indicator that should trigger investigation.",
 remember:"Detect → contain → investigate → eradicate → recover.",
 tags:["beginner"]
},

{
 id:"network",
 level:"Beginner",
 title:"Network Security Basics",
 short:"IP addresses, ports, protocols and segmentation.",
 detail:"Networks allow systems to communicate using protocols. IP addresses identify network endpoints. Ports identify communication endpoints for services. Segmentation separates systems to reduce unnecessary communication and limit the spread of incidents.",
 why:"Security analysts need basic networking knowledge to understand logs and incidents.",
 keys:[
  "IP identifies a network endpoint",
  "Ports identify service endpoints",
  "Protocols define communication rules",
  "Segmentation limits exposure"
 ],
 example:"A company separates employee computers from critical servers using network segmentation.",
 scenario:"A security team places sensitive servers in a separate network segment so ordinary user devices cannot directly communicate with them.",
 remember:"Know IP + ports + protocols + segmentation.",
 tags:["beginner"]
},

{
 id:"firewalls",
 level:"Intermediate",
 title:"Firewalls, IDS & IPS",
 short:"Understand three important network-defense technologies.",
 detail:"A firewall controls network traffic according to defined rules. An IDS detects suspicious activity and generates alerts. An IPS can detect and actively block or prevent certain suspicious traffic.",
 why:"These technologies help organizations control and monitor network activity.",
 keys:[
  "Firewall = traffic control",
  "IDS = detection",
  "IPS = detection + prevention",
  "Rules should follow security requirements"
 ],
 example:"An IDS detects unusual traffic and alerts the security team. An IPS may block matching malicious traffic.",
 scenario:"A device detects suspicious traffic and automatically prevents it from reaching protected systems. This is consistent with IPS behavior.",
 remember:"IDS tells. IPS can stop.",
 tags:["intermediate"]
},

{
 id:"cryptography",
 level:"Intermediate",
 title:"Cryptography",
 short:"Encryption, decryption and the role of keys.",
 detail:"Cryptography protects information using mathematical techniques. Encryption transforms readable plaintext into ciphertext. Decryption converts ciphertext back into readable data using the appropriate key.",
 why:"Cryptography supports confidentiality, integrity, authentication and non-repudiation depending on the mechanism.",
 keys:[
  "Plaintext = readable data",
  "Ciphertext = transformed data",
  "Encryption protects confidentiality",
  "Keys control cryptographic operations"
 ],
 example:"HTTPS uses cryptographic mechanisms to protect communications between a browser and a server.",
 scenario:"A company encrypts sensitive files so unauthorized people cannot read them without the required key.",
 remember:"Encryption is reversible with the appropriate key; hashing is designed differently.",
 tags:["intermediate"]
},

{
 id:"hashing",
 level:"Intermediate",
 title:"Hashing",
 short:"One-way transformation used for integrity and verification.",
 detail:"A cryptographic hash function transforms input into a fixed-size digest. Good cryptographic hash functions make it computationally difficult to find another input producing the same digest.",
 why:"Hashes are widely used for integrity checks, signatures and secure password systems.",
 keys:[
  "Hashing is not encryption",
  "Same input gives same digest",
  "Small input changes produce major output changes",
  "SHA-256 produces a 256-bit digest"
 ],
 example:"A downloaded file's SHA-256 hash can be compared with a trusted published hash to check integrity.",
 scenario:"Two copies of a file produce different SHA-256 values. This indicates their contents differ.",
 remember:"Hash = fingerprint, not reversible encryption.",
 tags:["intermediate"]
},

{
 id:"web-security",
 level:"Intermediate",
 title:"Web Security",
 short:"Core concepts for protecting websites and web applications.",
 detail:"Web security includes authentication, authorization, session security, input validation, output encoding, secure configuration, logging and safe error handling.",
 why:"Web applications process user input and sensitive information, making secure design essential.",
 keys:[
  "Validate input",
  "Enforce authorization server-side",
  "Protect sessions",
  "Use secure defaults",
  "Log security-relevant events"
 ],
 example:"An application verifies that a logged-in user is authorized to access a specific record instead of relying only on a hidden button in the interface.",
 scenario:"A user changes an ID in a URL and can view another customer's record. This indicates an access-control problem.",
 remember:"Never trust the browser to enforce security.",
 tags:["intermediate"]
},

{
 id:"injection",
 level:"Intermediate",
 title:"Injection Concepts",
 short:"Understand why untrusted input must be handled safely.",
 detail:"Injection vulnerabilities occur when untrusted data is interpreted as part of a command or query. Examples include SQL injection and command injection. Secure design separates data from instructions.",
 why:"Injection is a foundational web-security concept.",
 keys:[
  "Treat external input as untrusted",
  "Use parameterized queries",
  "Validate input",
  "Avoid building commands from raw input"
 ],
 example:"A database application uses parameterized queries instead of concatenating user input into SQL statements.",
 scenario:"A developer constructs database queries by directly concatenating a form field into SQL. This design increases injection risk.",
 remember:"Data should remain data—not become instructions.",
 tags:["intermediate"]
},

{
 id:"xss",
 level:"Intermediate",
 title:"Cross-Site Scripting",
 short:"Understand the concept of unsafe script execution in web applications.",
 detail:"Cross-Site Scripting, or XSS, can occur when an application places untrusted content into a web page in a way that causes it to be interpreted as executable script.",
 why:"XSS can affect users of an otherwise trusted website.",
 keys:[
  "Untrusted output must be handled safely",
  "Context matters",
  "Output encoding is important",
  "Content Security Policy can add defense"
 ],
 example:"A comment system safely displays user text instead of allowing submitted content to become executable browser code.",
 scenario:"A website displays user-provided content without appropriate output handling. This creates potential XSS risk.",
 remember:"Validate input and safely encode output.",
 tags:["intermediate"]
},

{
 id:"incident-response",
 level:"Intermediate",
 title:"Incident Response",
 short:"A structured process for handling security incidents.",
 detail:"Incident response commonly includes preparation, detection and analysis, containment, eradication, recovery and lessons learned.",
 why:"A good response reduces damage while preserving evidence and restoring trustworthy operations.",
 keys:[
  "Prepare",
  "Detect and analyze",
  "Contain",
  "Eradicate",
  "Recover",
  "Learn"
 ],
 example:"During a suspected ransomware event, defenders isolate affected systems, preserve evidence, investigate the incident and recover from trusted backups.",
 scenario:"The team separates an affected workstation from the network to limit possible spread. This is containment.",
 remember:"Do not rush to destroy evidence.",
 tags:["intermediate"]
},

{
 id:"logging",
 level:"Intermediate",
 title:"Logging & SIEM",
 short:"Turn security events into useful evidence and alerts.",
 detail:"Logs record events such as authentication attempts, network activity, application errors and administrative changes. SIEM platforms can collect, correlate and analyze security-relevant events.",
 why:"Without useful logs, investigations can become guesswork.",
 keys:[
  "Centralize important logs",
  "Protect log integrity",
  "Use timestamps",
  "Correlate related events",
  "Alert on meaningful patterns"
 ],
 example:"A SIEM correlates repeated login failures with a successful login from an unusual location.",
 scenario:"An analyst notices hundreds of failed logins followed by a successful login. Correlating these events can reveal suspicious authentication activity.",
 remember:"Good logs turn events into evidence.",
 tags:["intermediate"]
},

{
 id:"risk-management",
 level:"Intermediate",
 title:"Risk Management",
 short:"Identify, assess, prioritize and treat cybersecurity risk.",
 detail:"Risk management identifies assets, threats, vulnerabilities, likelihood and impact, then prioritizes responses. Treatments may include mitigation, transfer, avoidance or acceptance.",
 why:"Organizations cannot eliminate every risk, so they must prioritize.",
 keys:[
  "Identify risk",
  "Assess likelihood and impact",
  "Prioritize",
  "Select treatment",
  "Monitor"
 ],
 example:"A critical internet-facing vulnerability with high business impact receives priority over a low-impact issue on an isolated test machine.",
 scenario:"Two vulnerabilities exist, but one affects a critical public service. The higher-impact risk should generally receive greater priority.",
 remember:"Security decisions should be risk-based.",
 tags:["intermediate"]
},

{
 id:"zero-trust",
 level:"Advanced",
 title:"Zero Trust",
 short:"Never automatically trust users, devices or network locations.",
 detail:"Zero Trust is an approach that assumes trust should not be granted merely because a user or device is inside a network boundary. Access decisions should consider identity, device state, context and policy.",
 why:"Modern environments are distributed across cloud, remote work and multiple devices.",
 keys:[
  "Verify explicitly",
  "Use least privilege",
  "Assume breach",
  "Continuously evaluate access"
 ],
 example:"An employee accessing a sensitive application may need strong authentication and device compliance even when working from the company network.",
 scenario:"A company stops automatically trusting devices simply because they are on the internal network.",
 remember:"Inside the network does not automatically mean trusted.",
 tags:["advanced"]
},

{
 id:"threat-modeling",
 level:"Advanced",
 title:"Threat Modeling",
 short:"Identify security threats during system design.",
 detail:"Threat modeling systematically examines a system, its assets, trust boundaries, data flows and potential threats. The goal is to identify and address security risks before they become incidents.",
 why:"Security is more effective when designed into systems instead of added at the end.",
 keys:[
  "Identify assets",
  "Map data flows",
  "Find trust boundaries",
  "Identify threats",
  "Choose mitigations"
 ],
 example:"A team diagrams how customer data moves between browser, API and database and then evaluates threats at each trust boundary.",
 scenario:"Developers identify that an API trusts data from an external client without adequate authorization checks. Threat modeling can reveal this design weakness.",
 remember:"Find security problems during design—not after deployment.",
 tags:["advanced"]
},

{
 id:"forensics",
 level:"Advanced",
 title:"Digital Forensics",
 short:"Collect and analyze digital evidence responsibly.",
 detail:"Digital forensics involves identifying, preserving, collecting, examining and reporting digital evidence. Evidence integrity and chain of custody are important.",
 why:"Investigations must be repeatable and defensible.",
 keys:[
  "Preserve evidence",
  "Maintain integrity",
  "Document actions",
  "Use chain of custody",
  "Report findings clearly"
 ],
 example:"An investigator creates a forensic copy of a storage device and calculates a hash to verify that the evidence image remains unchanged.",
 scenario:"An analyst records who handled evidence and when it changed hands. This supports chain of custody.",
 remember:"Preserve first. Analyze carefully. Document everything.",
 tags:["advanced"]
},

{
 id:"cloud",
 level:"Advanced",
 title:"Cloud Security",
 short:"Security concepts for cloud infrastructure and services.",
 detail:"Cloud security involves identity management, configuration, data protection, logging, network controls and understanding the shared-responsibility model.",
 why:"Cloud environments can scale quickly, making secure configuration and identity management essential.",
 keys:[
  "Identity is critical",
  "Secure configuration matters",
  "Protect cloud data",
  "Monitor activity",
  "Understand responsibility boundaries"
 ],
 example:"A cloud storage service is accidentally configured for public access. Correct permissions and monitoring reduce this risk.",
 scenario:"Sensitive cloud storage is accidentally exposed to the public. This is a configuration and access-control issue.",
 remember:"Cloud security starts with identity and configuration.",
 tags:["advanced"]
},

{
 id:"secure-sdlc",
 level:"Advanced",
 title:"Secure SDLC",
 short:"Build security into the software development lifecycle.",
 detail:"Secure software development integrates security requirements, threat modeling, secure coding, testing, dependency management and monitoring throughout development.",
 why:"Fixing security issues during design is usually easier than fixing them after deployment.",
 keys:[
  "Security requirements",
  "Threat modeling",
  "Secure coding",
  "Security testing",
  "Dependency management"
 ],
 example:"A development team reviews authentication design during planning rather than waiting for a penetration test after release.",
 scenario:"Security requirements are added during project planning. This is part of a secure development lifecycle.",
 remember:"Security should exist at every development stage.",
 tags:["advanced"]
},

{
 id:"governance",
 level:"Advanced",
 title:"Security Governance",
 short:"Policies, responsibilities, risk decisions and accountability.",
 detail:"Security governance establishes how an organization directs and oversees cybersecurity through policies, roles, risk decisions, standards and accountability.",
 why:"Technical security cannot work without organizational direction.",
 keys:[
  "Policies",
  "Roles and responsibilities",
  "Risk decisions",
  "Compliance",
  "Accountability"
 ],
 example:"An organization defines who can approve privileged access and requires periodic reviews.",
 scenario:"Management establishes a formal policy requiring regular review of administrator accounts.",
 remember:"Governance answers who decides, who is responsible and what rules apply.",
 tags:["advanced"]
},

{
 id:"nist",
 level:"Advanced",
 title:"NIST Cybersecurity Framework",
 short:"A structured approach to managing cybersecurity risk.",
 detail:"The NIST Cybersecurity Framework provides a common structure for managing cybersecurity risk. Its CSF 2.0 Core is organized around Govern, Identify, Protect, Detect, Respond and Recover.",
 why:"The framework helps organizations communicate and organize cybersecurity outcomes.",
 keys:[
  "Govern",
  "Identify",
  "Protect",
  "Detect",
  "Respond",
  "Recover"
 ],
 example:"An organization uses the framework to identify important assets, establish protections, monitor events and plan recovery.",
 scenario:"An organization establishes cybersecurity policies and accountability before selecting technical controls. This aligns with the Govern function.",
 remember:"G-I-P-D-R-R.",
 tags:["advanced"]
},

{
 id:"owasp",
 level:"Advanced",
 title:"OWASP Top 10",
 short:"A widely used awareness resource for major web application security risks.",
 detail:"The OWASP Top 10 is an awareness document for web application security. It helps developers and security professionals understand common categories of application risk.",
 why:"It provides useful vocabulary for discussing web security risks.",
 keys:[
  "Broken Access Control",
  "Security Misconfiguration",
  "Software Supply Chain Failures",
  "Cryptographic Failures",
  "Injection",
  "Insecure Design",
  "Authentication Failures",
  "Software or Data Integrity Failures",
  "Security Logging and Alerting Failures",
  "Mishandling of Exceptional Conditions"
 ],
 example:"A web application that lets one user access another user's private record without authorization demonstrates an access-control problem.",
 scenario:"An application exposes administrative functionality to unauthorized users. The primary concern is broken access control.",
 remember:"Use OWASP as an awareness and secure-development reference.",
 tags:["advanced"]
}

];


/* =========================
   CASE STUDIES
========================= */

const trackInfo = [

{
 id:"phishing",
 title:"Phishing Files",
 icon:"✉",
 description:"Investigate suspicious messages, social engineering and account-security incidents."
},

{
 id:"ransomware",
 title:"Ransomware Response",
 icon:"▣",
 description:"Practice defensive decisions during a ransomware-style incident."
},

{
 id:"insider",
 title:"Insider Mystery",
 icon:"◉",
 description:"Analyze identity, privilege, logging and unusual internal activity."
},

{
 id:"web",
 title:"Web Shield",
 icon:"⌘",
 description:"Apply secure web-development and application-security concepts."
},

{
 id:"forensics",
 title:"Digital Forensics",
 icon:"⌕",
 description:"Examine hashes, logs, metadata and evidence-handling decisions."
}

];

const caseTopics = {

phishing:[
["Suspicious sender","An employee receives an urgent message asking them to verify an account.","What should the employee do first?","Verify the request through a trusted official channel.","Click the link immediately.","Forward it to everyone.","Ignore every email."],
["Urgency tactic","A message says the account will be deleted in 15 minutes.","Which social-engineering technique is being used?","Urgency and pressure.","Encryption.","Hashing.","Network segmentation."],
["Fake login","A login page looks almost identical to a familiar service.","What is the main concern?","Credential phishing.","Data compression.","Physical theft.","Backup failure."],
["Attachment","An unexpected invoice arrives as an attachment.","What is the safest first response?","Verify the sender and attachment through a trusted channel.","Open it immediately.","Disable antivirus.","Upload it publicly."],
["MFA request","A user receives repeated unexpected MFA prompts.","What should they do?","Deny the request and report the suspicious activity.","Approve one to stop the prompts.","Share the MFA code.","Disable all authentication."],
["Executive impersonation","A message appears to come from a senior manager requesting confidential data.","What is the strongest response?","Independently verify the request.","Assume senior staff cannot be impersonated.","Send the data immediately.","Post the message publicly."],
["Reporting","An employee clicked a suspicious link but did not enter credentials.","What is the best next step?","Report the event promptly according to the organization's process.","Hide the incident.","Delete all browser history.","Ignore it."],
["Evidence","A suspicious email is being investigated.","What can help investigators?","Preserving the original message and relevant metadata.","Editing the email before sending it.","Deleting the sender information.","Forwarding it to random contacts."],
["Prevention","An organization wants to reduce phishing success.","Which combination is strongest?","Awareness training, MFA, reporting and technical controls.","Only changing desktop wallpaper.","Removing all email.","Using one password everywhere."],
["Response","Several employees entered credentials into a fake page.","What should the security team prioritize?","Contain affected accounts, investigate and follow incident response procedures.","Blame the employees and stop there.","Delete all security logs.","Ignore the event."]
],

ransomware:[
["File changes","Multiple workstations suddenly show unfamiliar file extensions.","What should happen first?","Investigate and contain affected systems.","Open every changed file.","Disable all backups.","Ignore the alert."],
["Containment","An endpoint appears compromised.","What defensive action can limit spread?","Isolate the affected endpoint.","Connect it to more systems.","Share its files.","Turn off logging."],
["Backups","The organization has tested offline backups.","Why are they valuable?","They can support recovery after destructive incidents.","They prevent every attack automatically.","They replace incident response.","They eliminate vulnerabilities."],
["Indicators","A security analyst sees unusual file-renaming activity.","What is this?","A potential indicator of compromise.","Proof that nothing happened.","A security policy.","A password factor."],
["Preservation","During an incident, an analyst wants to immediately wipe a suspicious computer.","Why can this be problematic?","It may destroy evidence needed for investigation.","Wiping always improves evidence.","It creates more logs.","It guarantees recovery."],
["Recovery","Systems have been contained and investigated.","What is an important recovery step?","Restore from trusted backups and verify systems.","Restore from unknown copies.","Disable monitoring.","Remove all access controls."],
["Communication","A major security incident affects business operations.","Why is communication important?","Stakeholders need accurate information for coordinated response.","It replaces technical investigation.","It makes evidence unnecessary.","It prevents all malware."],
["Lessons learned","The incident is resolved.","What should happen next?","Review what happened and improve controls.","Forget the incident.","Delete all records.","Never update procedures."],
["Prevention","An organization wants stronger ransomware resilience.","Which approach is best?","Backups, patching, least privilege, segmentation, monitoring and training.","One antivirus scan per year.","No backups.","Shared administrator passwords."],
["Final response","A confirmed ransomware incident affected several systems.","What describes a mature response?","Contain, investigate, eradicate, recover and learn.","Pay automatically without investigation.","Delete evidence.","Continue normal operations."]
],

insider:[
["Least privilege","An employee has access to systems unrelated to their job.","What principle is being violated?","Least privilege.","Availability.","Hashing.","Compression."],
["Access logs","An account accesses sensitive data outside normal working hours.","What should analysts do?","Investigate the activity using appropriate logs and context.","Immediately accuse the employee.","Delete the logs.","Publish the username."],
["Privilege review","A user changes departments.","What security action is appropriate?","Review and adjust their access permissions.","Give them every permission.","Keep old access forever.","Disable all logging."],
["Data access","A user downloads unusually large amounts of sensitive information.","What should this trigger?","Investigation based on policy and contextual evidence.","Automatic public disclosure.","Deletion of the account without review.","Ignoring the event."],
["DLP","An organization wants to detect sensitive-data movement.","Which technology can help?","Data Loss Prevention controls.","Screen brightness settings.","A video player.","A password hint."],
["Account review","A privileged account is no longer needed.","What should happen?","Remove or disable unnecessary access according to policy.","Share the account.","Increase privileges.","Publish credentials."],
["Separation of duties","One person can approve and execute the same sensitive transaction.","What risk exists?","Insufficient separation of duties.","Too much availability.","Strong hashing.","Network latency."],
["Investigation","An employee is suspected of misuse.","What should investigators emphasize?","Evidence, authorization, policy and documented procedures.","Rumors.","Public accusations.","Deleting records."],
["Due care","Management regularly reviews privileged access.","What does this demonstrate?","A proactive security practice and due care.","A network protocol.","Encryption.","Malware."],
["Final analysis","An investigation confirms excessive privileges contributed to an incident.","What is an appropriate lesson?","Improve access governance and least-privilege controls.","Give everyone more access.","Stop maintaining logs.","Remove authentication."]
],

web:[
["Input validation","A web form accepts arbitrary input.","What security practice is important?","Validate and safely handle untrusted input.","Trust all input.","Disable logging.","Give users administrator access."],
["SQL injection","A developer concatenates raw user input into SQL.","What is the safer design?","Use parameterized queries.","Build larger SQL strings.","Store passwords in URLs.","Disable authentication."],
["XSS","A comment is displayed as executable browser content.","What concept applies?","Cross-Site Scripting.","Network segmentation.","Backup rotation.","Physical security."],
["Authorization","A user changes a record identifier and sees another customer's record.","What is the main problem?","Broken access control.","Strong encryption.","High availability.","Compression."],
["Authentication","A web application accepts weak identity verification.","What area should be improved?","Authentication controls.","Database indexing.","Screen resolution.","File compression."],
["Session security","A web application does not adequately protect sessions.","Why is this important?","Session compromise can allow unauthorized access.","It only affects page design.","It improves availability.","It prevents backups."],
["CSRF concept","A trusted browser is tricked into sending an unwanted state-changing request.","What is this related to?","Cross-Site Request Forgery.","Hash collision.","Physical intrusion.","Data recovery."],
["Secure coding","A developer wants to reduce web vulnerabilities before release.","What is a good approach?","Secure coding, code review and security testing.","Wait for an incident.","Disable all users.","Remove logs."],
["Logging","An application records important authentication and security events.","Why?","Logs support detection and investigation.","Logs are only for decoration.","Logs eliminate vulnerabilities.","Logs replace authorization."],
["Patch management","A web server uses outdated software with known vulnerabilities.","What should the organization do?","Prioritize appropriate patching and risk remediation.","Ignore the issue.","Expose more services.","Remove security controls."]
],

forensics:[
["Hash","An investigator calculates a SHA-256 value for an evidence image.","Why?","To help verify evidence integrity.","To decrypt the image.","To assign permissions.","To compress it."],
["Metadata","A document contains timestamps and author information.","What is this called?","Metadata.","Encryption.","Authorization.","Firewalling."],
["Chain of custody","An investigator records every evidence transfer.","Why?","To document evidence handling and support integrity.","To speed up Wi-Fi.","To encrypt passwords.","To create malware."],
["Logs","An investigation needs to know when an account logged in.","What source may help?","Authentication and system logs.","Wallpaper settings.","Keyboard color.","Screen brightness."],
["DNS","An analyst wants to understand which domain a device resolved.","Which evidence can help?","DNS logs.","Printer toner.","CPU temperature only.","Screen resolution."],
["Firewall","A firewall log shows repeated blocked connections.","What can it provide?","Evidence about network activity.","Proof that malware definitely exists.","A password.","A backup."],
["Integrity","Two copies of an evidence file have different hashes.","What does this suggest?","The contents differ and should be investigated.","They are definitely identical.","The network is faster.","Authentication succeeded."],
["Evidence preservation","An analyst wants to modify the original evidence file.","What is the better practice?","Preserve the original and analyze an appropriate copy.","Modify it immediately.","Delete it.","Rename it repeatedly."],
["Reporting","The investigation is complete.","What should the report contain?","Methods, evidence, findings and conclusions.","Only rumors.","Only a screenshot.","No documentation."],
["Final investigation","The evidence supports a security incident.","What is the most professional conclusion?","Document evidence and findings objectively.","Make unsupported accusations.","Delete contradictory evidence.","Publish private information."]
]

};


/* Build 50 unique levels */

const tracks = trackInfo.map(track => {

  const raw = caseTopics[track.id];

  return {
    ...track,
    levels: raw.map((item,index) => ({
      id:`${track.id}-${index+1}`,
      number:index+1,
      title:item[0],
      scenario:item[1],
      question:item[2],
      answer:item[3],
      options:[item[3],item[4],item[5],item[6]].sort(
        () => Math.random() - 0.5
      ),
      hint:`Think about the safest defensive cybersecurity practice related to ${item[0].toLowerCase()}.`,
      explanation:`The strongest answer is "${item[3]}" because it follows a defensive, risk-aware cybersecurity approach.`
    }))
  };

});


/* =========================
   QUIZ
========================= */

const quizData = [

{
 q:"A hospital database is online, but patient records were changed incorrectly. Which CIA objective is primarily affected?",
 options:["Confidentiality","Integrity","Availability","Authentication"],
 answer:"Integrity",
 explain:"Integrity protects information from unauthorized or improper modification."
},

{
 q:"An employee receives an unexpected request to buy gift cards for a manager. What should they do?",
 options:["Verify through another trusted channel","Send the gift cards immediately","Share their password","Forward the request publicly"],
 answer:"Verify through another trusted channel",
 explain:"Independent verification reduces the risk of impersonation and social engineering."
},

{
 q:"A company wants to give employees only the access needed for their jobs. Which principle applies?",
 options:["Least privilege","Availability","Compression","Hashing"],
 answer:"Least privilege",
 explain:"Least privilege limits permissions to what is necessary."
},

{
 q:"A SHA-256 value is used to compare two files. What is the main purpose?",
 options:["Verify integrity","Decrypt the files","Authenticate a person","Compress the files"],
 answer:"Verify integrity",
 explain:"Cryptographic hashes can act like digital fingerprints for integrity checking."
},

{
 q:"A system automatically blocks suspicious network traffic after detecting it. Which technology best fits?",
 options:["IDS","IPS","DNS","SIEM"],
 answer:"IPS",
 explain:"An IPS can detect and actively prevent or block suspicious traffic."
},

{
 q:"A user successfully logs in but cannot access a restricted folder. Which security concept determines this?",
 options:["Authorization","Encryption","Hashing","Availability"],
 answer:"Authorization",
 explain:"Authorization determines what an authenticated user is allowed to access."
},

{
 q:"A developer directly concatenates user input into a database query. What risk should be considered?",
 options:["SQL injection","Physical theft","Power failure","Shoulder surfing"],
 answer:"SQL injection",
 explain:"Parameterized queries help keep user-controlled data separate from SQL instructions."
},

{
 q:"An organization separates critical servers from ordinary user devices. What security technique is this?",
 options:["Network segmentation","Hashing","Phishing","Authentication"],
 answer:"Network segmentation",
 explain:"Segmentation limits unnecessary communication and can reduce incident spread."
},

{
 q:"A security team isolates a compromised workstation from the network. Which incident-response phase does this represent?",
 options:["Containment","Recovery","Governance","Training"],
 answer:"Containment",
 explain:"Isolation limits potential spread while the incident is investigated."
},

{
 q:"An organization establishes security policies, responsibilities and risk decisions. Which NIST CSF 2.0 function is especially relevant?",
 options:["Govern","Detect","Recover","Protect"],
 answer:"Govern",
 explain:"Govern focuses on cybersecurity strategy, policy, roles and organizational direction."
}

];

let quizState = {
  index:0,
  score:0,
  answered:false,
  finished:false
};


/* =========================
   LABS
========================= */

const labs = [

{
 id:"base64",
 title:"Base64 Encoding & Decoding",
 icon:"01",
 theory:"Base64 converts binary data into a text representation using a defined character set. It is encoding, not encryption.",
 why:"It is commonly encountered when analyzing data formats, APIs, email content and other technical data.",
 steps:[
  "Choose the text you want to encode.",
  "Convert the text into bytes.",
  "Represent those bytes using Base64.",
  "To decode, reverse the process.",
  "Remember that Base64 does not provide confidentiality."
 ],
 example:"Text: Hello\nBase64: SGVsbG8=",
 remember:"Base64 = encoding, not encryption.",
 type:"base64"
},

{
 id:"url",
 title:"URL Encoding",
 icon:"02",
 theory:"URL encoding represents characters in a format suitable for use inside URLs. Characters that have special meanings in URLs can be percent-encoded.",
 why:"Security analysts frequently encounter encoded URLs in logs, applications and web traffic.",
 steps:[
  "Start with readable text.",
  "Identify characters that need URL encoding.",
  "Convert them into percent-encoded form.",
  "Decode the value to recover the original text."
 ],
 example:"Text: hello world\nEncoded: hello%20world",
 remember:"URL encoding changes representation; it does not encrypt the information.",
 type:"url"
},

{
 id:"hex",
 title:"Hexadecimal",
 icon:"03",
 theory:"Hexadecimal represents bytes using hexadecimal digits from 0 to F. It is often used when inspecting binary data, hashes and low-level technical information.",
 why:"Security tools and forensic outputs frequently display byte values in hexadecimal.",
 steps:[
  "Convert each byte into two hexadecimal digits.",
  "Separate bytes with spaces for readability.",
  "For decoding, convert each pair back into a byte.",
  "Interpret the resulting bytes as text when appropriate."
 ],
 example:"Text: Hi\nHex: 48 69",
 remember:"Hex is a representation of bytes.",
 type:"hex"
},

{
 id:"rot13",
 title:"ROT13",
 icon:"04",
 theory:"ROT13 replaces each English letter with the letter 13 positions away in the alphabet. Applying ROT13 twice returns the original text.",
 why:"It is useful for understanding simple substitution transformations and recognizing that obfuscation is not encryption.",
 steps:[
  "Take each alphabetic character.",
  "Move it 13 positions forward.",
  "Wrap around after Z.",
  "Leave numbers and punctuation unchanged."
 ],
 example:"HELLO → URYYB",
 remember:"ROT13 is simple transformation, not secure encryption.",
 type:"rot13"
},

{
 id:"sha256",
 title:"SHA-256 Hashing",
 icon:"05",
 theory:"SHA-256 is a cryptographic hash function that produces a 256-bit digest from input data. It is designed to be one-way and sensitive to changes in the input.",
 why:"Hashes are useful for integrity verification, evidence handling and many security systems.",
 steps:[
  "Choose the input.",
  "Convert it into bytes.",
  "Run the SHA-256 hash function.",
  "Record the resulting hexadecimal digest.",
  "Compare hashes when verifying integrity."
 ],
 example:"The SHA-256 hash of a file can be compared with a trusted reference value.",
 remember:"Hashing is not encryption and does not provide a way to recover the original input.",
 type:"sha256"
}

];


/* =========================
   BADGES
========================= */

const badgeData = [

["first","First Case","Complete your first case study.","◈"],
["foundation","Foundation Complete","Study at least five materials.","◆"],
["phish","Phishing Analyst","Complete the Phishing Files track.","✉"],
["ransom","Ransomware Responder","Complete the Ransomware Response track.","▣"],
["insider","Insider Investigator","Complete the Insider Mystery track.","◉"],
["web","Web Defender","Complete the Web Shield track.","⌘"],
["forensics","Forensics Analyst","Complete the Digital Forensics track.","⌕"],
["ten","10 Case Levels","Complete ten case levels.","10"],
["twentyfive","25 Case Levels","Complete twenty-five case levels.","25"],
["fifty","50 Case Levels","Complete all fifty case levels.","50"],
["quiz","Quiz Master","Score 10/10 in the mini quiz.","✓"],
["labs","Lab Explorer","Complete all five practice labs.","⌘"],
["graduate","CyberHunt Graduate","Complete all case tracks and labs.","★"]

];


/* =========================
   NAVIGATION
========================= */

function showSection(id){

  $$(".page-section").forEach(section => {
    section.classList.remove("active-section");
  });

  const target = document.getElementById(id);

  if(target){
    target.classList.add("active-section");
  }

  $$(".nav-item").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.section === id
    );
  });

  const labels = {
    dashboard:"Dashboard",
    ai:"AI Study Studio",
    materials:"Materials",
    cases:"Case Studies",
    quizzes:"Mini Quizzes",
    labs:"Practice Labs",
    badges:"Badges"
  };

  if($("#crumb")){
    $("#crumb").textContent = labels[id] || "CyberHunt";
  }

  state.currentSection = id;
  save();

  if(id === "materials") renderMaterials();
  if(id === "cases") renderCases();
  if(id === "quizzes") renderQuiz();
  if(id === "labs") renderLabs();
  if(id === "badges") renderBadges();

  $("#sidebar")?.classList.remove("open");
}


/* =========================
   HEADER / DASHBOARD
========================= */

function updateHeader(){

  const level = xpLevel();

  $("#xpTop").textContent = state.xp;
  $("#levelTop").textContent = level;
  $("#dashXP").textContent = state.xp;
  $("#casesDone").textContent = state.completedCases.length;
  $("#labsDone").textContent = state.completedLabs.length;
  $("#quizBest").textContent = state.quizBest;

  const totalActivities = 50 + 5 + 10;
  const done =
    state.completedCases.length +
    state.completedLabs.length +
    state.quizBest;

  const percentage =
    Math.min(100,Math.round((done / totalActivities) * 100));

  $("#overallProgress").style.width = percentage + "%";
  $("#progressPill").textContent = percentage + "%";

  if(state.user){

    $("#welcomeName").textContent = state.user.name;

    $("#profileTop").textContent =
      state.user.name.charAt(0).toUpperCase();

  }

  renderDashboardNext();
}

function renderDashboardNext(){

  if(state.completedCases.length < 50){

    const next =
      state.completedCases.length + 1;

    $("#nextTitle").textContent =
      `Case Level ${next}`;

    $("#nextDesc").textContent =
      "Continue your cybersecurity scenario learning.";

  }else if(state.completedLabs.length < 5){

    $("#nextTitle").textContent =
      "Try a Practice Lab";

    $("#nextDesc").textContent =
      "Learn the theory and practice a security transformation.";

  }else{

    $("#nextTitle").textContent =
      "Explore Advanced Materials";

    $("#nextDesc").textContent =
      "Continue learning advanced cybersecurity concepts.";

  }
}


/* =========================
   MATERIALS
========================= */

let activeMaterialFilter = "all";

function initMaterialFilters(){

  const filters = [
    ["all","All"],
    ["beginner","Beginner"],
    ["intermediate","Intermediate"],
    ["advanced","Advanced"]
  ];

  $("#materialFilters").innerHTML =
    filters.map(item => `
      <button
        class="${item[0] === "all" ? "active" : ""}"
        data-filter="${item[0]}"
      >
        ${item[1]}
      </button>
    `).join("");

}

function renderMaterials(){

  const search =
    ($("#materialSearch")?.value || "").toLowerCase();

  const list = materials.filter(material => {

    const matchesSearch =
      material.title.toLowerCase().includes(search) ||
      material.short.toLowerCase().includes(search);

    const matchesFilter =
      activeMaterialFilter === "all" ||
      material.tags.includes(activeMaterialFilter);

    return matchesSearch && matchesFilter;

  });

  $("#materialsGrid").innerHTML =
    list.map(material => `

      <article
        class="material-card"
        data-material="${material.id}"
      >

        <div class="tagline">

          <span class="level-tag">
            ${material.level}
          </span>

        </div>

        <h3>${esc(material.title)}</h3>

        <p>
          ${esc(material.short)}
        </p>

        <div class="learn">
          OPEN DETAILED MATERIAL →
        </div>

      </article>

    `).join("");

}

function openDetail(html){

  $("#detailContent").innerHTML = html;
  $("#detailOverlay").classList.remove("hidden");

}

function closeDetail(){

  $("#detailOverlay").classList.add("hidden");

}

function materialDetail(id){

  const m = materials.find(x => x.id === id);

  if(!m) return;

  openDetail(`

    <p class="eyebrow">
      ${esc(m.level)} MATERIAL
    </p>

    <h2 class="detail-title">
      ${esc(m.title)}
    </h2>

    <p class="detail-sub">
      Detailed CyberHunt learning material
    </p>


    <div class="detail-section">

      <h4>Detailed Explanation</h4>

      <p>
        ${esc(m.detail)}
      </p>

    </div>


    <div class="detail-section">

      <h4>Why It Matters</h4>

      <p>
        ${esc(m.why)}
      </p>

    </div>


    <div class="detail-section">

      <h4>Key Concepts</h4>

      <div class="key-grid">

        ${m.keys.map(k => `
          <div class="key-item">
            ${esc(k)}
          </div>
        `).join("")}

      </div>

    </div>


    <div class="detail-section">

      <h4>Example</h4>

      <p>
        ${esc(m.example)}
      </p>

    </div>


    <div class="detail-section">

      <h4>Scenario</h4>

      <div class="case-story">
        ${esc(m.scenario)}
      </div>

    </div>


    <div class="detail-section">

      <h4>Remember</h4>

      <p>
        ${esc(m.remember)}
      </p>

    </div>


    <div class="button-row">

      <button
        class="primary-btn"
        data-ask-topic="${esc(m.title)}"
      >
        Ask AI About This
      </button>

      <button
        class="ghost-btn"
        data-web-topic="${esc(m.title + " cybersecurity")}"
      >
        Connect to Web ↗
      </button>

    </div>

  `);

}


/* =========================
   CASE STUDIES
========================= */

function renderCases(){

  $("#casesGrid").innerHTML =
    tracks.map(track => {

      const completed =
        track.levels.filter(level =>
          caseDone(level.id)
        ).length;

      const percent =
        Math.round((completed / 10) * 100);

      return `

        <article
          class="case-card"
          data-track="${track.id}"
        >

          <div class="case-num">
            ${track.icon} TRACK
          </div>

          <h3>
            ${esc(track.title)}
          </h3>

          <p>
            ${esc(track.description)}
          </p>

          <div class="case-progress">

            <small>
              ${completed}/10 levels
            </small>

            <div class="progress">
              <i style="width:${percent}%"></i>
            </div>

          </div>

        </article>

      `;

    }).join("");

}

function showLevels(trackId){

  const track =
    tracks.find(t => t.id === trackId);

  if(!track) return;

  const container = $("#caseLevels");

  container.classList.remove("hidden");

  container.innerHTML = `

    <div class="levels-head">

      <div>
        <p class="eyebrow">
          CASE TRACK
        </p>

        <h3>
          ${esc(track.title)}
        </h3>
      </div>

      <button
        class="ghost-btn"
        id="hideLevels"
      >
        Hide
      </button>

    </div>


    <div class="level-grid">

      ${track.levels.map(level => `

        <button
          class="level-btn ${caseDone(level.id) ? "done" : ""}"
          data-level="${level.id}"
        >

          <b>
            Level ${level.number}
          </b>

          <span>
            ${caseDone(level.id)
              ? "✓ Completed"
              : esc(level.title)}
          </span>

        </button>

      `).join("")}

    </div>

  `;

  container.scrollIntoView({
    behavior:"smooth",
    block:"start"
  });

}

function getCase(levelId){

  for(const track of tracks){

    const level =
      track.levels.find(l => l.id === levelId);

    if(level){
      return {
        track,
        level
      };
    }

  }

  return null;
}

function caseDetail(levelId){

  const result = getCase(levelId);

  if(!result) return;

  const {track,level} = result;

  openDetail(`

    <p class="eyebrow">
      ${esc(track.title)} · LEVEL ${level.number}
    </p>

    <h2 class="detail-title">
      ${esc(level.title)}
    </h2>

    <p class="detail-sub">
      Read the incident carefully before answering.
    </p>


    <div class="detail-section">

      <h4>Case Scenario</h4>

      <div class="case-story">
        ${esc(level.scenario)}
      </div>

    </div>


    <div class="detail-section">

      <h4>Investigation Clue</h4>

      <p>
        Look for the security principle that best fits
        the situation rather than choosing the most dramatic option.
      </p>

    </div>


    <div class="detail-section">

      <h4>Question</h4>

      <p class="quiz-question">
        ${esc(level.question)}
      </p>

    </div>


    <div id="caseOptions">

      ${level.options.map(option => `

        <button
          class="case-option"
          data-case-answer="${level.id}"
          data-opt="${esc(option)}"
        >
          ${esc(option)}
        </button>

      `).join("")}

    </div>


    <div class="detail-section">

      <h4>Hint</h4>

      <p>
        ${esc(level.hint)}
      </p>

    </div>

  `);

}

function answerCase(levelId,selected){

  const result = getCase(levelId);

  if(!result) return;

  const {level} = result;

  const existing =
    document.querySelector(".case-result");

  if(existing) existing.remove();

  const correct =
    selected === level.answer;

  const resultBox =
    document.createElement("div");

  resultBox.className =
    "case-result " +
    (correct ? "correct" : "wrong");

  if(correct){

    if(!caseDone(level.id)){

      state.completedCases.push(level.id);
      state.xp += 20;

      save();

      toast("+20 XP · Case completed");

    }

    resultBox.innerHTML = `
      <b>✓ Correct</b><br>
      ${esc(level.explanation)}
    `;

  }else{

    resultBox.innerHTML = `
      <b>✕ Not quite</b><br>
      Review the clue and try again.
    `;

  }

  $("#caseOptions").after(resultBox);

  updateHeader();
  renderCases();
  renderBadges();

}


/* =========================
   QUIZ
========================= */

function renderQuiz(){

  if(quizState.finished){

    $("#quizArea").innerHTML = `

      <div class="quiz-result">

        <p class="eyebrow">
          QUIZ COMPLETE
        </p>

        <strong>
          ${quizState.score}/10
        </strong>

        <p>
          ${
            quizState.score >= 8
            ? "Excellent application of cybersecurity concepts."
            : quizState.score >= 5
            ? "Good foundation. Review the missed concepts."
            : "Review the materials and try again."
          }
        </p>

        <button
          class="primary-btn"
          id="restartQuiz"
        >
          Retake Quiz
        </button>

      </div>

    `;

    return;

  }

  const q =
    quizData[quizState.index];

  $("#quizArea").innerHTML = `

    <div class="quiz-number">
      QUESTION ${quizState.index + 1} / ${quizData.length}
    </div>

    <div class="quiz-question">
      ${esc(q.q)}
    </div>

    <div class="quiz-options">

      ${q.options.map(option => `

        <button
          class="quiz-option"
          data-qopt="${esc(option)}"
        >
          ${esc(option)}
        </button>

      `).join("")}

    </div>

  `;

}

function answerQuiz(selected){

  if(quizState.answered) return;

  const q =
    quizData[quizState.index];

  quizState.answered = true;

  const buttons =
    $$(".quiz-option");

  buttons.forEach(button => {

    if(button.textContent.trim() === q.answer){
      button.classList.add("correct");
    }

    if(button.textContent.trim() === selected &&
       selected !== q.answer){
      button.classList.add("wrong");
    }

  });

  if(selected === q.answer){

    quizState.score++;

  }

  $("#quizArea").insertAdjacentHTML(
    "beforeend",
    `
      <div class="quiz-explanation">
        <b>Explanation:</b>
        ${esc(q.explain)}
        <br><br>
        <button class="primary-btn" id="nextQuiz">
          ${
            quizState.index === quizData.length - 1
            ? "Finish Quiz"
            : "Next Question →"
          }
        </button>
      </div>
    `
  );

}

function nextQuiz(){

  if(
    quizState.index ===
    quizData.length - 1
  ){

    quizState.finished = true;

    if(quizState.score > state.quizBest){

      state.quizBest =
        quizState.score;

      state.xp += quizState.score * 5;

      save();

      toast(
        `Quiz complete · +${quizState.score * 5} XP`
      );

    }

    updateHeader();
    renderBadges();

    renderQuiz();

    return;
  }

  quizState.index++;
  quizState.answered = false;

  renderQuiz();

}


/* =========================
   LABS
========================= */

function renderLabs(){

  $("#labsGrid").innerHTML =
    labs.map(lab => `

      <article
        class="material-card"
        data-lab="${lab.id}"
      >

        <div class="lab-symbol">
          ${lab.icon}
        </div>

        <span class="level-tag">
          SAFE PRACTICE
        </span>

        <h3>
          ${esc(lab.title)}
        </h3>

        <p>
          ${esc(lab.theory.slice(0,150))}…
        </p>

        <div class="lab-cta">
          ${
            labDone(lab.id)
            ? "✓ COMPLETED · REVIEW"
            : "OPEN LEARNING PANEL →"
          }
        </div>

      </article>

    `).join("");

}

function labDetail(id,startPractice=false){

  const lab =
    labs.find(x => x.id === id);

  if(!lab) return;

  openDetail(`

    <p class="eyebrow">
      PRACTICE LAB
    </p>

    <h2 class="detail-title">
      ${esc(lab.title)}
    </h2>

    <p class="detail-sub">
      Learn first. Practice second.
    </p>


    <div class="detail-section">

      <h4>Theory</h4>

      <p>
        ${esc(lab.theory)}
      </p>

    </div>


    <div class="detail-section">

      <h4>Why It Matters</h4>

      <p>
        ${esc(lab.why)}
      </p>

    </div>


    <div class="detail-section">

      <h4>How To Do It</h4>

      <ol>
        ${lab.steps.map(step => `
          <li>${esc(step)}</li>
        `).join("")}
      </ol>

    </div>


    <div class="detail-section">

      <h4>One Worked Example</h4>

      <p style="white-space:pre-line">
        ${esc(lab.example)}
      </p>

    </div>


    <div class="detail-section">

      <h4>Remember</h4>

      <p>
        ${esc(lab.remember)}
      </p>

    </div>


    ${
      startPractice
      ? `
        <div class="detail-section">

          <h4>Your Practice</h4>

          <div class="practice-box">
            ${practiceUI(lab)}
          </div>

        </div>
      `
      : `
        <button
          class="primary-btn"
          data-start-lab="${lab.id}"
        >
          Start Practice
        </button>
      `
    }

  `);

}

function practiceUI(lab){

  if(lab.type === "base64"){

    return `

      <label>
        Text

        <textarea
          id="labInput"
          placeholder="Enter text..."
        ></textarea>

      </label>

      <div class="practice-actions">

        <button
          class="primary-btn"
          data-lab-action="b64e"
        >
          Encode Base64
        </button>

        <button
          class="ghost-btn"
          data-lab-action="b64d"
        >
          Decode Base64
        </button>

      </div>

      <div id="labOutput" class="practice-output">
        Your result will appear here.
      </div>

    `;

  }

  if(lab.type === "url"){

    return `

      <label>
        Text

        <textarea
          id="labInput"
          placeholder="Enter text..."
        ></textarea>

      </label>

      <div class="practice-actions">

        <button
          class="primary-btn"
          data-lab-action="urle"
        >
          Encode URL
        </button>

        <button
          class="ghost-btn"
          data-lab-action="urld"
        >
          Decode URL
        </button>

      </div>

      <div id="labOutput" class="practice-output">
        Your result will appear here.
      </div>

    `;

  }

  if(lab.type === "hex"){

    return `

      <label>
        Text / Hex

        <textarea
          id="labInput"
          placeholder="Text or hex such as 48 69..."
        ></textarea>

      </label>

      <div class="practice-actions">

        <button
          class="primary-btn"
          data-lab-action="hexe"
        >
          Encode Hex
        </button>

        <button
          class="ghost-btn"
          data-lab-action="hexd"
        >
          Decode Hex
        </button>

      </div>

      <div id="labOutput" class="practice-output">
        Your result will appear here.
      </div>

    `;

  }

  if(lab.type === "rot13"){

    return `

      <label>
        Text

        <textarea
          id="labInput"
          placeholder="Enter text..."
        ></textarea>

      </label>

      <div class="practice-actions">

        <button
          class="primary-btn"
          data-lab-action="rot"
        >
          Apply ROT13
        </button>

      </div>

      <div id="labOutput" class="practice-output">
        Your result will appear here.
      </div>

    `;

  }

  return `

    <label>
      Text

      <textarea
        id="labInput"
        placeholder="Enter text to hash..."
      ></textarea>

    </label>

    <div class="practice-actions">

      <button
        class="primary-btn"
        data-lab-action="sha"
      >
        Compute SHA-256
      </button>

    </div>

    <div id="labOutput" class="practice-output">
      Your result will appear here.
    </div>

  `;

}


/* =========================
   LAB FUNCTIONS
========================= */

function base64Encode(text){

  return btoa(
    unescape(
      encodeURIComponent(text)
    )
  );

}

function base64Decode(text){

  return decodeURIComponent(
    escape(atob(text))
  );

}

function hexEncode(text){

  return [...new TextEncoder().encode(text)]
    .map(byte =>
      byte.toString(16).padStart(2,"0")
    )
    .join(" ");

}

function hexDecode(text){

  const clean =
    text.trim().replace(/\s+/g,"");

  if(!/^[0-9a-fA-F]*$/.test(clean) ||
     clean.length % 2 !== 0){

    throw new Error("Invalid hex");

  }

  const bytes = [];

  for(let i=0;i<clean.length;i+=2){

    bytes.push(
      parseInt(clean.slice(i,i+2),16)
    );

  }

  return new TextDecoder().decode(
    new Uint8Array(bytes)
  );

}

function rot13(text){

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
        ) % 26 + base
      );

    }
  );

}

async function labAction(action){

  const input = $("#labInput");
  const output = $("#labOutput");

  if(!input || !output) return;

  const text = input.value;

  try{

    let result = "";

    if(action === "b64e")
      result = base64Encode(text);

    if(action === "b64d")
      result = base64Decode(text);

    if(action === "urle")
      result = encodeURIComponent(text);

    if(action === "urld")
      result = decodeURIComponent(text);

    if(action === "hexe")
      result = hexEncode(text);

    if(action === "hexd")
      result = hexDecode(text);

    if(action === "rot")
      result = rot13(text);

    if(action === "sha"){

      if(!window.crypto?.subtle){
        throw new Error("SHA unavailable");
      }

      const buffer =
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(text)
        );

      result =
        [...new Uint8Array(buffer)]
        .map(byte =>
          byte.toString(16).padStart(2,"0")
        )
        .join("");

    }

    output.textContent = result;

    const title =
      $("#detailContent .detail-title")?.textContent;

    const lab =
      labs.find(x =>
        x.title === title
      );

    if(
      lab &&
      !labDone(lab.id)
    ){

      state.completedLabs.push(lab.id);
      state.xp += 30;

      save();

      updateHeader();
      renderLabs();
      renderBadges();

      toast("+30 XP · Lab completed");

    }

  }catch{

    output.textContent =
      "Please check the input format and try again.";

  }

}


/* =========================
   AI STUDY STUDIO
========================= */

function saveAIHistory(){

  save();

}

function renderChat(){

  const box =
    $("#chatMessages");

  if(!box) return;

  if(!state.aiHistory.length){

    box.innerHTML = `

      <div class="msg ai">
        <b>CyberHunt AI</b><br><br>
        Welcome to your study studio.
        Ask me about cybersecurity concepts,
        exam scenarios, definitions or comparisons.
        You can also connect your topic to the live web.
      </div>

    `;

    return;

  }

  box.innerHTML =
    state.aiHistory.map(message => `

      <div class="msg ${message.role === "user" ? "user" : "ai"}">
        ${esc(message.text)}
      </div>

    `).join("");

  box.scrollTop = box.scrollHeight;

}

function findMaterialForQuery(query){

  const q =
    query.toLowerCase();

  const direct =
    materials.find(material =>
      q.includes(material.title.toLowerCase())
    );

  if(direct) return direct;

  const words =
    q.split(/\W+/).filter(Boolean);

  let best = null;
  let score = 0;

  materials.forEach(material => {

    const text =
      (
        material.title +
        " " +
        material.short +
        " " +
        material.tags.join(" ")
      ).toLowerCase();

    let current = 0;

    words.forEach(word => {

      if(word.length > 2 &&
         text.includes(word)){

        current++;

      }

    });

    if(current > score){

      score = current;
      best = material;

    }

  });

  return best;

}

function generateAIAnswer(query){

  const q =
    query.toLowerCase();

  const material =
    findMaterialForQuery(query);

  if(material){

    return `
Based on the CyberHunt study library:

${material.title}

${material.detail}

WHY IT MATTERS:
${material.why}

KEY POINTS:
${material.keys.map(x => "• " + x).join("\n")}

EXAMPLE:
${material.example}

SCENARIO:
${material.scenario}

REMEMBER:
${material.remember}

You can use "Connect to Web" beside this conversation to research the same topic live.
`;

  }

  if(q.includes("difference") &&
     q.includes("hash") &&
     q.includes("encrypt")){

    return `
Hashing and encryption are different.

HASHING:
• One-way transformation
• Produces a fixed-size digest
• Useful for integrity verification
• Example: SHA-256

ENCRYPTION:
• Designed to protect confidentiality
• Data can be decrypted with the appropriate key
• Used to protect readable information

REMEMBER:
Hash = fingerprint.
Encryption = protected readable data.

For an exam scenario, if the question asks you to verify whether a file changed, think HASH.
If it asks you to keep information secret, think ENCRYPTION.
`;

  }

  if(q.includes("cia")){

    return `
CIA TRIAD:

Confidentiality = prevent unauthorized disclosure.

Integrity = prevent unauthorized or improper modification.

Availability = keep systems and information accessible when required.

Memory trick:
C = secrecy
I = correctness
A = access
`;

  }

  if(q.includes("phishing")){

    return `
PHISHING:

Phishing uses deceptive messages, links, websites or other communication to manipulate people.

Warning signs:
• urgency
• unusual requests
• suspicious links
• unexpected attachments
• requests for credentials or money

Best response:
Pause → inspect → independently verify → report.
`;

  }

  if(q.includes("zero trust")){

    return `
ZERO TRUST:

Do not automatically trust a user, device or network location.

Important principles:
• Verify explicitly
• Use least privilege
• Assume breach
• Continuously evaluate access

Exam memory:
"Inside the network" does not automatically mean "trusted."
`;

  }

  return `
I found several related cybersecurity areas in the CyberHunt library.

Try asking about:
• CIA Triad
• Phishing
• Authentication
• Authorization
• Hashing
• Encryption
• Malware
• Firewalls
• SQL Injection
• XSS
• Incident Response
• SIEM
• Risk Management
• Zero Trust
• Digital Forensics
• Cloud Security
• NIST CSF
• OWASP Top 10

You can also use Connect to Web to research your exact question live.
`;

}

function askAI(query){

  const clean =
    query.trim();

  if(!clean) return;

  state.aiHistory.push({
    role:"user",
    text:clean
  });

  state.aiHistory.push({
    role:"ai",
    text:generateAIAnswer(clean)
  });

  saveAIHistory();

  renderChat();

  $("#chatMessages").scrollTop =
    $("#chatMessages").scrollHeight;

}


/* =========================
   CONNECT TO WEB
========================= */

function webSearch(query){

  const clean =
    query.trim();

  if(!clean){

    toast("Enter a study topic first.");

    return;

  }

  const search =
    encodeURIComponent(
      clean + " cybersecurity"
    );

  window.open(
    "https://www.google.com/search?q=" + search,
    "_blank",
    "noopener,noreferrer"
  );

}


/* =========================
   BADGES
========================= */

function renderBadges(){

  const earned =
    new Set(state.badges);

  const cases =
    state.completedCases.length;

  const trackComplete =
    id => {

      const track =
        tracks.find(x => x.id === id);

      return track &&
        track.levels.every(level =>
          caseDone(level.id)
        );

    };

  const conditions = {

    first:cases >= 1,

    foundation:materials.length >= 5,

    phish:trackComplete("phishing"),

    ransom:trackComplete("ransomware"),

    insider:trackComplete("insider"),

    web:trackComplete("web"),

    forensics:trackComplete("forensics"),

    ten:cases >= 10,

    twentyfive:cases >= 25,

    fifty:cases >= 50,

    quiz:state.quizBest >= 10,

    labs:state.completedLabs.length >= 5,

    graduate:
      cases >= 50 &&
      state.completedLabs.length >= 5

  };

  badgeData.forEach(badge => {

    if(conditions[badge[0]]){

      earned.add(badge[0]);

    }

  });

  state.badges =
    [...earned];

  save();

  $("#badgesGrid").innerHTML =
    badgeData.map(badge => {

      const isEarned =
        earned.has(badge[0]);

      return `

        <article
          class="badge-card ${isEarned ? "earned" : ""}"
        >

          <div class="badge-icon">
            ${badge[3]}
          </div>

          <h3>
            ${esc(badge[1])}
          </h3>

          <p>
            ${esc(badge[2])}
          </p>

          <span class="earned-label">
            ${isEarned ? "EARNED" : "LOCKED"}
          </span>

        </article>

      `;

    }).join("");

}


/* =========================
   LOGIN
========================= */

function login(){

  const email =
    $("#email").value.trim();

  const username =
    $("#username").value.trim();

  const password =
    $("#password").value;

  const error =
    $("#loginError");

  error.textContent = "";

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){

    error.textContent =
      "Enter a valid email address.";

    return;

  }

  if(!/^[A-Za-z0-9]+$/.test(username)){

    error.textContent =
      "Username can contain only letters and numbers.";

    return;

  }

  if(password.length < 8){

    error.textContent =
      "Password must be at least 8 characters.";

    return;

  }

  state.user = {
    name:username,
    email:email
  };

  state.currentSection =
    "dashboard";

  save();

  sessionStorage.setItem(
    "cyberhuntLoggedIn",
    "1"
  );

  $("#loginPage").classList.add("hidden");
  $("#app").classList.remove("hidden");

  updateHeader();
  showSection("dashboard");
  renderChat();

}

function logout(){

  sessionStorage.removeItem(
    "cyberhuntLoggedIn"
  );

  $("#app").classList.add("hidden");
  $("#loginPage").classList.remove("hidden");

  $("#password").value = "";

}


/* =========================
   EVENT HANDLERS
========================= */

function init(){

  load();

  initMaterialFilters();

  $("#loginForm").addEventListener(
    "submit",
    event => {
      event.preventDefault();
      login();
    }
  );

  $("#logoutBtn").addEventListener(
    "click",
    logout
  );

  $("#closeDetail").addEventListener(
    "click",
    closeDetail
  );

  $("#detailOverlay").addEventListener(
    "click",
    event => {

      if(event.target.id === "detailOverlay"){
        closeDetail();
      }

    }
  );

  $("#aiForm").addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const input =
        $("#aiInput");

      const query =
        input.value.trim();

      if(query){

        askAI(query);

        input.value = "";

        /*
          Open live web research from the same
          user action. This gives study queries
          a direct web handoff.
        */

        webSearch(query);

      }

    }
  );


  $("#webSearchBtn").addEventListener(
    "click",
    () => {

      webSearch(
        $("#webQuery").value
      );

    }
  );


  $("#materialSearch").addEventListener(
    "input",
    renderMaterials
  );


  $("#materialFilters").addEventListener(
    "click",
    event => {

      const button =
        event.target.closest("[data-filter]");

      if(!button) return;

      activeMaterialFilter =
        button.dataset.filter;

      $$("#materialFilters button")
        .forEach(btn =>
          btn.classList.remove("active")
        );

      button.classList.add("active");

      renderMaterials();

    }
  );


  $("#menuBtn").addEventListener(
    "click",
    () => {
      $("#sidebar").classList.toggle("open");
    }
  );


  document.addEventListener(
    "keydown",
    event => {

      if(event.key === "Escape"){
        closeDetail();
      }

    }
  );


  document.addEventListener(
    "click",
    event => {

      const nav =
        event.target.closest("[data-section]");

      if(nav){

        showSection(
          nav.dataset.section
        );

        return;

      }


      const go =
        event.target.closest("[data-go]");

      if(go){

        showSection(
          go.dataset.go
        );

        return;

      }


      const material =
        event.target.closest("[data-material]");

      if(material){

        materialDetail(
          material.dataset.material
        );

        return;

      }


      const track =
        event.target.closest("[data-track]");

      if(track){

        showLevels(
          track.dataset.track
        );

        return;

      }


      const level =
        event.target.closest("[data-level]");

      if(level){

        caseDetail(
          level.dataset.level
        );

        return;

      }


      const answer =
        event.target.closest("[data-case-answer]");

      if(answer){

        $$(".case-option")
          .forEach(button =>
            button.classList.remove("selected")
          );

        answer.classList.add("selected");

        answerCase(
          answer.dataset.caseAnswer,
          answer.dataset.opt
        );

        return;

      }


      const qopt =
        event.target.closest("[data-qopt]");

      if(qopt){

        answerQuiz(
          qopt.dataset.qopt
        );

        return;

      }


      if(event.target.id === "nextQuiz"){

        nextQuiz();

        return;

      }


      if(event.target.id === "restartQuiz"){

        quizState = {
          index:0,
          score:0,
          answered:false,
          finished:false
        };

        renderQuiz();

        return;

      }


      const lab =
        event.target.closest("[data-lab]");

      if(lab){

        labDetail(
          lab.dataset.lab
        );

        return;

      }


      const startLab =
        event.target.closest("[data-start-lab]");

      if(startLab){

        labDetail(
          startLab.dataset.startLab,
          true
        );

        return;

      }


      const labActionButton =
        event.target.closest("[data-lab-action]");

      if(labActionButton){

        labAction(
          labActionButton.dataset.labAction
        );

        return;

      }


      const askTopic =
        event.target.closest("[data-ask-topic]");

      if(askTopic){

        const topic =
          askTopic.dataset.askTopic;

        closeDetail();

        showSection("ai");

        setTimeout(() => {

          askAI(
            "Explain " +
            topic +
            " in detail with an exam scenario."
          );

        },50);

        return;

      }


      const webTopic =
        event.target.closest("[data-web-topic]");

      if(webTopic){

        webSearch(
          webTopic.dataset.webTopic
        );

        return;

      }


      const webButton =
        event.target.closest("[data-web]");

      if(webButton){

        $("#webQuery").value =
          webButton.dataset.web;

        webSearch(
          webButton.dataset.web
        );

        return;

      }


      const suggestion =
        event.target.closest("[data-prompt]");

      if(suggestion){

        const prompt =
          suggestion.dataset.prompt;

        showSection("ai");

        $("#aiInput").value = prompt;

        askAI(prompt);

        webSearch(prompt);

        return;

      }


      if(event.target.id === "hideLevels"){

        $("#caseLevels")
          .classList.add("hidden");

      }

    }
  );


  /*
    Existing session?
  */

  if(
    sessionStorage.getItem(
      "cyberhuntLoggedIn"
    ) === "1" &&
    state.user
  ){

    $("#loginPage")
      .classList.add("hidden");

    $("#app")
      .classList.remove("hidden");

    updateHeader();

    showSection(
      state.currentSection || "dashboard"
    );

    renderChat();

  }else{

    $("#loginPage")
      .classList.remove("hidden");

    $("#app")
      .classList.add("hidden");

  }


  renderMaterials();
  renderCases();
  renderLabs();
  renderBadges();
  renderQuiz();
  updateHeader();

}

document.addEventListener(
  "DOMContentLoaded",
  init
);

})();
