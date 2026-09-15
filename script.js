```javascript
(() => {
'use strict';

/* =========================================================
   CYBERHUNT — CYBERSECURITY STUDY PLATFORM
   Plain JavaScript / GitHub Pages compatible
   ========================================================= */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const STORAGE_KEY = 'cyberhuntStudyStateV3';

const defaultState = {
  user: null,
  xp: 0,
  completedCases: [],
  quizBest: 0,
  quizAttemptAwarded: false,
  badges: [],
  aiHistory: [],
  completedLabs: [],
  viewedMaterials: [],
  streak: 1,
  currentSection: 'dashboard'
};

let state = { ...defaultState };


/* =========================================================
   STORAGE
   ========================================================= */

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not save progress.');
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved) {
      state = {
        ...defaultState,
        ...saved
      };
    }
  } catch (e) {
    state = { ...defaultState };
  }
}


/* =========================================================
   HELPERS
   ========================================================= */

function esc(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    c => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[c])
  );
}

function toast(message) {
  const box = $('#toast');

  if (!box) return;

  box.textContent = message;
  box.classList.add('show');

  clearTimeout(window.__cyberToast);

  window.__cyberToast = setTimeout(() => {
    box.classList.remove('show');
  }, 2400);
}

function xpLevel() {
  return Math.max(1, Math.floor(state.xp / 250) + 1);
}

function isCaseDone(id) {
  return state.completedCases.includes(id);
}

function isLabDone(id) {
  return state.completedLabs.includes(id);
}

function addXP(amount, message) {
  state.xp += amount;
  save();
  updateHeader();

  if (message) {
    toast(`+${amount} XP · ${message}`);
  }
}


/* =========================================================
   MATERIALS
   ========================================================= */

const materials = [
  {
    id:'foundations',
    level:'Beginner',
    title:'Cybersecurity Foundations',
    short:'The core ideas behind protecting people, data, devices and systems.',
    detail:'Cybersecurity is the practice of protecting information and technology from unauthorized access, misuse, disruption, modification and destruction. A defender thinks about assets, threats, vulnerabilities, risk and controls.',
    why:'Everything else in cybersecurity builds on this vocabulary.',
    keys:['Asset = something valuable','Threat = possible source of harm','Vulnerability = weakness','Risk = likelihood + impact','Control = safeguard'],
    example:'A company database is an asset. Weak access control is a vulnerability. An attacker is a threat. The possibility and consequence of compromise create risk.',
    scenario:'A server is running old software with a known security weakness. The old software is the vulnerability.',
    remember:'Ask: What are we protecting? What can harm it? What weakness exists? What is the impact? What control reduces the risk?',
    tags:['beginner','foundations','risk']
  },
  {
    id:'cia',
    level:'Beginner',
    title:'CIA Triad',
    short:'Confidentiality, Integrity and Availability—the three classic security objectives.',
    detail:'Confidentiality prevents unauthorized disclosure. Integrity protects information from unauthorized modification. Availability keeps systems and data accessible when required.',
    why:'The CIA triad helps identify which security objective an incident affects.',
    keys:['Confidentiality = secrecy','Integrity = correctness','Availability = access'],
    example:'A leaked customer database affects confidentiality. Changed transaction records affect integrity. A service outage affects availability.',
    scenario:'A hospital database is online, but patient records have been changed incorrectly. Integrity is the main concern.',
    remember:'C = Confidentiality, I = Integrity, A = Availability.',
    tags:['beginner','cia','security']
  },
  {
    id:'threat-risk',
    level:'Beginner',
    title:'Threats, Vulnerabilities & Risk',
    short:'Learn the difference between a threat, a weakness and security exposure.',
    detail:'A threat is a potential cause of harm. A vulnerability is a weakness. Risk describes the potential loss created by the likelihood and impact of a harmful event.',
    why:'Scenario questions often deliberately mix these terms.',
    keys:['Threat = possible harm source','Vulnerability = weakness','Risk = potential exposure','Impact = consequence','Likelihood = probability'],
    example:'A phishing attacker is a threat. Poor employee awareness can be a vulnerability. Account compromise is a risk.',
    scenario:'An attacker attempts to exploit an unpatched server. The unpatched weakness is the vulnerability.',
    remember:'Weakness = vulnerability. Harm source = threat. Exposure = risk.',
    tags:['beginner','risk','threat']
  },
  {
    id:'assets-controls',
    level:'Beginner',
    title:'Assets & Security Controls',
    short:'Identify valuable assets and choose appropriate safeguards.',
    detail:'Assets include data, applications, devices, identities, services and reputation. Controls can be administrative, technical or physical and may be preventive, detective or corrective.',
    why:'Security begins by protecting valuable assets with appropriate controls.',
    keys:['Administrative = people/process','Technical = technology','Physical = environment','Preventive = stop','Detective = discover','Corrective = restore'],
    example:'Training is administrative. MFA is technical. A locked server room is physical.',
    scenario:'A company installs badge access for its server room. This is a physical security control.',
    remember:'First identify the asset, then select the control that addresses the risk.',
    tags:['beginner','controls']
  },
  {
    id:'auth',
    level:'Beginner',
    title:'Authentication & Authorization',
    short:'Authentication proves identity; authorization determines permissions.',
    detail:'Authentication verifies who a user is. Authorization determines what an authenticated user is allowed to access or perform.',
    why:'The difference appears frequently in security exams and real systems.',
    keys:['Authentication = Who are you?','Authorization = What may you do?','MFA strengthens authentication','Least privilege limits permissions'],
    example:'Password + security key is authentication. Permission to access payroll is authorization.',
    scenario:'An employee signs in successfully but cannot open the finance folder. That is an authorization decision.',
    remember:'AuthN = identity. AuthZ = permission.',
    tags:['beginner','authentication','authorization']
  },
  {
    id:'mfa',
    level:'Beginner',
    title:'Password Security & MFA',
    short:'Use strong passwords and multiple authentication factors.',
    detail:'Good password security uses long, unique passwords and avoids reuse. MFA combines different factor categories such as knowledge, possession and inherence.',
    why:'Password theft is common, while MFA can reduce the impact of stolen credentials.',
    keys:['Use unique passwords','Prefer long passwords','Never store passwords in plaintext','MFA uses multiple factors'],
    example:'A password manager creates unique passwords while a security key provides another authentication factor.',
    scenario:'An attacker has obtained a reused password. MFA creates an additional barrier.',
    remember:'Long + unique + MFA = stronger authentication.',
    tags:['beginner','passwords','mfa']
  },
  {
    id:'phishing',
    level:'Beginner',
    title:'Social Engineering & Phishing',
    short:'Recognize deceptive messages and human manipulation techniques.',
    detail:'Phishing uses deceptive communication to make people reveal information, open malicious content or perform unsafe actions. Social engineering exploits trust, urgency, fear, authority or curiosity.',
    why:'Many attacks target human decisions rather than technical weaknesses.',
    keys:['Check sender','Inspect links','Be suspicious of urgency','Verify unusual requests','Report suspicious messages'],
    example:'An email requests an urgent payment and contains a link to an unfamiliar domain.',
    scenario:'A manager supposedly asks for gift cards through email. The employee should verify through another trusted channel.',
    remember:'Pause → inspect → verify → report.',
    tags:['beginner','phishing','social engineering']
  },
  {
    id:'malware',
    level:'Beginner',
    title:'Malware Fundamentals',
    short:'Understand malicious software and defensive response.',
    detail:'Malware is software designed to perform unauthorized or harmful actions. Examples include ransomware, spyware, worms, trojans and destructive malware.',
    why:'Understanding malware behavior helps defenders choose containment and recovery actions.',
    keys:['Ransomware','Spyware','Worms','Trojans','Destructive malware'],
    example:'Ransomware may encrypt files and demand payment.',
    scenario:'Many computers suddenly show unfamiliar file extensions. This should trigger investigation and containment.',
    remember:'Detect → contain → investigate → eradicate → recover.',
    tags:['beginner','malware']
  },
  {
    id:'network',
    level:'Beginner',
    title:'Network Security Basics',
    short:'Understand IP addresses, ports, protocols and segmentation.',
    detail:'Network security protects communications and networked systems. Concepts include IP addressing, ports, protocols, segmentation and secure communication.',
    why:'Network knowledge is essential for understanding attacks and defenses.',
    keys:['IP address','Port','Protocol','Segmentation','Secure communication'],
    example:'HTTPS normally uses TCP port 443.',
    scenario:'A sensitive server is separated from general user devices using network segmentation.',
    remember:'Know what communicates, where it communicates and what protocol it uses.',
    tags:['beginner','network']
  },
  {
    id:'firewalls',
    level:'Intermediate',
    title:'Firewalls, IDS & IPS',
    short:'Understand three important network security technologies.',
    detail:'A firewall controls traffic according to rules. IDS detects suspicious activity and alerts. IPS can detect and actively block or prevent certain traffic.',
    why:'These technologies are frequently compared in exams.',
    keys:['Firewall = traffic control','IDS = detect + alert','IPS = detect + prevent/block'],
    example:'An IDS detects suspicious traffic and sends an alert to the security team.',
    scenario:'A security device detects a malicious connection and automatically blocks it. This resembles IPS behavior.',
    remember:'IDS watches. IPS watches + acts.',
    tags:['intermediate','firewall','ids','ips']
  },
  {
    id:'crypto',
    level:'Intermediate',
    title:'Cryptography Basics',
    short:'Learn encryption, keys and secure communication concepts.',
    detail:'Cryptography provides techniques for confidentiality, integrity, authentication and non-repudiation. Encryption transforms plaintext into ciphertext using a key.',
    why:'Cryptography protects information during storage and transmission.',
    keys:['Plaintext','Ciphertext','Key','Encryption','Decryption'],
    example:'HTTPS uses cryptographic mechanisms to protect web communication.',
    scenario:'A company encrypts sensitive files so unauthorized readers cannot understand their contents.',
    remember:'Encryption protects confidentiality; hashing is mainly for integrity/fingerprints.',
    tags:['intermediate','cryptography','encryption']
  },
  {
    id:'hashing',
    level:'Intermediate',
    title:'Hashing & SHA-256',
    short:'Understand one-way hashing and integrity verification.',
    detail:'A cryptographic hash converts input into a fixed-length digest. SHA-256 is a widely used cryptographic hash function. A small input change produces a substantially different digest.',
    why:'Hashes are useful for integrity checks, file identification and password-storage systems when used appropriately.',
    keys:['One-way function','Fixed-length digest','Integrity verification','SHA-256','Avalanche effect'],
    example:'An investigator hashes a file before and after transfer to compare its integrity.',
    scenario:'Two files have different SHA-256 values. Their contents are not identical.',
    remember:'Hash = fingerprint, not reversible encryption.',
    tags:['intermediate','hashing','sha256']
  },
  {
    id:'signatures',
    level:'Intermediate',
    title:'Digital Signatures & PKI',
    short:'Learn how digital signatures support authenticity and integrity.',
    detail:'Digital signatures use asymmetric cryptography to provide evidence that data was signed by a holder of a private key and was not altered after signing. PKI supports certificate-based trust.',
    why:'Digital signatures are important for software, documents, certificates and secure communication.',
    keys:['Private key','Public key','Certificate','Digital signature','Certificate authority'],
    example:'Software publishers can digitally sign releases so users can verify authenticity.',
    scenario:'A user verifies a signed software package before installation.',
    remember:'Private key signs. Public key verifies.',
    tags:['intermediate','pki','signatures']
  },
  {
    id:'web',
    level:'Intermediate',
    title:'Web Security Fundamentals',
    short:'Understand how browsers, servers, sessions and inputs create security concerns.',
    detail:'Web security covers authentication, authorization, sessions, input handling, secure cookies, HTTPS, security headers, logging and secure design.',
    why:'Modern applications expose many attack surfaces.',
    keys:['Input validation','Session security','Access control','HTTPS','Secure cookies'],
    example:'A web application validates user input and enforces authorization on the server.',
    scenario:'A user changes an account ID in a URL and can view another customer’s record. This suggests broken access control.',
    remember:'Never trust client-side input or client-side authorization.',
    tags:['intermediate','web']
  },
  {
    id:'injection',
    level:'Intermediate',
    title:'Injection & XSS Concepts',
    short:'Learn the basics of SQL injection and cross-site scripting.',
    detail:'Injection occurs when untrusted data changes the intended meaning of an interpreter command. XSS occurs when attacker-controlled content executes in another user’s browser.',
    why:'Injection and XSS are common web application risks.',
    keys:['Parameterized queries','Input handling','Output encoding','Content Security Policy','Server-side validation'],
    example:'Parameterized SQL queries keep user input separate from SQL instructions.',
    scenario:'An application directly concatenates user input into SQL statements. This creates injection risk.',
    remember:'Separate data from commands.',
    tags:['intermediate','sql injection','xss']
  },
  {
    id:'incident-response',
    level:'Intermediate',
    title:'Incident Response',
    short:'Respond systematically to cybersecurity incidents.',
    detail:'Incident response commonly includes preparation, detection and analysis, containment, eradication, recovery and lessons learned.',
    why:'A structured response reduces damage and improves recovery.',
    keys:['Prepare','Detect','Contain','Eradicate','Recover','Learn'],
    example:'During ransomware, responders isolate affected systems before beginning recovery.',
    scenario:'An infected workstation is isolated from the network to prevent possible spread. This is containment.',
    remember:'Do not panic. Preserve evidence, contain, investigate and recover.',
    tags:['intermediate','incident response']
  },
  {
    id:'logging',
    level:'Intermediate',
    title:'Logging & SIEM',
    short:'Use logs to detect, investigate and understand security events.',
    detail:'Logs record events such as authentication attempts, network activity, application errors and administrative actions. SIEM platforms aggregate and analyze security-relevant logs.',
    why:'Without useful logs, investigation and detection become much harder.',
    keys:['Centralized logs','Time synchronization','Alerts','Correlation','Retention'],
    example:'A SIEM correlates repeated failed logins with a successful login from an unusual location.',
    scenario:'Security analysts combine firewall and authentication logs to investigate suspicious activity.',
    remember:'If you cannot see an event, detecting it becomes difficult.',
    tags:['intermediate','logging','siem']
  },
  {
    id:'risk-management',
    level:'Intermediate',
    title:'Risk Management',
    short:'Identify, assess, treat and monitor cybersecurity risk.',
    detail:'Risk management involves identifying risks, analyzing likelihood and impact, selecting treatments and monitoring changes.',
    why:'Organizations cannot eliminate every risk, so they prioritize.',
    keys:['Identify','Assess','Treat','Monitor','Accept','Transfer','Avoid','Mitigate'],
    example:'A company reduces the risk of account takeover by implementing MFA.',
    scenario:'Management decides to accept a low-impact risk because mitigation would cost more than the expected benefit.',
    remember:'Risk decisions should consider likelihood, impact and business context.',
    tags:['intermediate','risk']
  },
  {
    id:'zero-trust',
    level:'Advanced',
    title:'Zero Trust',
    short:'Never grant trust simply because a user or device is inside a network.',
    detail:'Zero Trust assumes no implicit trust. Access should be continuously evaluated using identity, device, context and policy.',
    why:'Modern environments include cloud services, remote users and many connected devices.',
    keys:['Verify explicitly','Least privilege','Assume breach','Continuous evaluation'],
    example:'A user must authenticate and satisfy policy before accessing a sensitive application even from the corporate network.',
    scenario:'An employee on the internal network is denied access to a sensitive system until identity and device conditions are verified.',
    remember:'Inside the network does not automatically mean trusted.',
    tags:['advanced','zero trust']
  },
  {
    id:'threat-modeling',
    level:'Advanced',
    title:'Threat Modeling',
    short:'Identify threats during system design before deployment.',
    detail:'Threat modeling examines assets, architecture, trust boundaries, data flows and possible abuse cases. STRIDE is one commonly used model.',
    why:'Finding security weaknesses during design is often cheaper than fixing them after deployment.',
    keys:['Assets','Data flows','Trust boundaries','Abuse cases','Mitigations'],
    example:'A team notices that a client-controlled role value could bypass authorization and redesigns the system.',
    scenario:'Developers analyze trust boundaries before writing production code. This is threat modeling.',
    remember:'Think about security before the system is finished.',
    tags:['advanced','threat modeling']
  },
  {
    id:'forensics',
    level:'Advanced',
    title:'Digital Forensics',
    short:'Collect and analyze digital evidence in a defensible way.',
    detail:'Digital forensics involves identifying, collecting, preserving, examining, analyzing and reporting digital evidence.',
    why:'Investigations require reliable evidence and documented procedures.',
    keys:['Preservation','Evidence copy','Hashing','Timeline','Chain of custody'],
    example:'An investigator creates a verified forensic copy and records its hash.',
    scenario:'An analyst documents who collected evidence, when it was collected and who handled it. This supports chain of custody.',
    remember:'Preserve → document → analyze → report.',
    tags:['advanced','forensics']
  },
  {
    id:'cloud',
    level:'Advanced',
    title:'Cloud Security',
    short:'Protect cloud identities, configurations, workloads and data.',
    detail:'Cloud security includes IAM, least privilege, encryption, network controls, monitoring, secrets management, backups and shared responsibility.',
    why:'Cloud incidents frequently involve identity or configuration mistakes.',
    keys:['IAM','Least privilege','Encryption','Logging','Secrets','Shared responsibility'],
    example:'A storage bucket containing sensitive information is accidentally public. Correct access policies reduce exposure.',
    scenario:'A company assumes the cloud provider automatically controls every application permission. This is a shared-responsibility misunderstanding.',
    remember:'Know what the provider secures and what the customer must secure.',
    tags:['advanced','cloud']
  },
  {
    id:'secure-sdlc',
    level:'Advanced',
    title:'Secure SDLC',
    short:'Integrate security throughout software development.',
    detail:'Secure SDLC incorporates security requirements, threat modeling, secure coding, dependency management, code review, testing and secure deployment.',
    why:'Security found early is generally easier and cheaper to fix.',
    keys:['Security requirements','Threat modeling','Secure coding','Code review','Testing','Secure deployment'],
    example:'A CI pipeline checks dependencies for known vulnerabilities before release.',
    scenario:'A development team performs a threat model during architecture planning.',
    remember:'Shift security left—but keep security throughout the lifecycle.',
    tags:['advanced','sdlc','development']
  },
  {
    id:'governance',
    level:'Advanced',
    title:'Security Governance & Compliance',
    short:'Align cybersecurity with policies, responsibilities and organizational goals.',
    detail:'Governance establishes direction, accountability, policies and oversight. Compliance means meeting applicable requirements. Compliance alone does not guarantee strong security.',
    why:'Security needs leadership, ownership and continuous oversight.',
    keys:['Governance','Policies','Accountability','Compliance','Risk oversight'],
    example:'An organization defines an access-control policy and assigns an owner responsible for reviewing it.',
    scenario:'A company passes an audit but still lacks good monitoring. This shows compliance is not identical to security.',
    remember:'Compliance is a requirement, not the entire security program.',
    tags:['advanced','governance','compliance']
  },
  {
    id:'supply-chain',
    level:'Advanced',
    title:'Software Supply Chain Security',
    short:'Protect dependencies, build systems and third-party software.',
    detail:'Software supply-chain security protects source code, dependencies, build pipelines, artifacts and distribution processes.',
    why:'A trusted application can inherit risk from a compromised dependency or build system.',
    keys:['Dependency inventory','Provenance','Protected CI/CD','Signed artifacts','Third-party risk'],
    example:'A team reviews dependency updates before production deployment.',
    scenario:'A malicious package enters an application through a third-party dependency.',
    remember:'Secure what you build—and how you build it.',
    tags:['advanced','supply chain']
  },
  {
    id:'nist',
    level:'Advanced',
    title:'NIST CSF 2.0',
    short:'A flexible framework for managing cybersecurity risk.',
    detail:'NIST Cybersecurity Framework 2.0 organizes cybersecurity outcomes around six Functions: Govern, Identify, Protect, Detect, Respond and Recover.',
    why:'It provides a common language for organizing a cybersecurity program.',
    keys:['Govern','Identify','Protect','Detect','Respond','Recover'],
    example:'Leadership establishes cybersecurity strategy, roles and oversight under Govern.',
    scenario:'A company establishes cybersecurity roles, policies and oversight. This strongly relates to Govern.',
    remember:'GV → ID → PR → DE → RS → RC.',
    tags:['advanced','nist','framework']
  },
  {
    id:'owasp',
    level:'Advanced',
    title:'OWASP Top 10:2025',
    short:'A current awareness resource for major web application security risks.',
    detail:'OWASP Top 10:2025 includes categories covering access control, misconfiguration, supply-chain failures, cryptographic failures, injection, insecure design, authentication failures, software/data integrity failures, logging failures and mishandling exceptional conditions.',
    why:'OWASP provides a common language for discussing major web application risks.',
    keys:['Access control','Misconfiguration','Supply chain','Cryptography','Injection','Design','Authentication','Integrity','Logging','Exceptional conditions'],
    example:'Changing an invoice identifier and seeing another customer’s invoice is an access-control problem.',
    scenario:'A web application exposes sensitive information because authorization is missing.',
    remember:'Use OWASP as an awareness and learning framework.',
    tags:['advanced','owasp','web']
  }
];


/* =========================================================
   CASE STUDIES
   5 TRACKS × 10 UNIQUE LEVELS
   ========================================================= */

const tracks = [
  {
    id:'phishing',
    title:'Phishing Files',
    icon:'✉',
    desc:'Investigate suspicious messages, identity tricks and reporting decisions.',
    levels:[
      ['Urgent Invoice','An employee receives an invoice demanding payment within ten minutes. The sender address is slightly different from the known company address.','What should happen first?',['Pay immediately','Reply for confirmation','Verify through a trusted channel','Forward to everyone'],'C','Independent verification is the safest first step.'],
      ['Suspicious Link','A message says “Open secure portal” but the destination domain is unfamiliar.','Which clue matters most?',['Logo quality','Destination domain','Font style','Signature'],'B','The actual destination is more useful than visual appearance.'],
      ['Unexpected Attachment','Finance receives an unexpected spreadsheet from an unknown sender.','Best response?',['Open it','Disable antivirus','Report it','Upload publicly'],'C','Unexpected attachments should follow the organization reporting process.'],
      ['MFA Prompt','A user receives several MFA prompts without attempting to log in.','What should they do?',['Approve one','Share the code','Deny and report','Ignore all security alerts'],'C','Unexpected prompts can indicate attempted account access.'],
      ['Fake IT Support','Someone calls claiming to be IT and asks for a password reset code.','What is safest?',['Give the code','Verify the caller','Post it in chat','Disable MFA'],'B','Identity should be independently verified before sensitive actions.'],
      ['Smishing Alert','A text message says a package cannot be delivered unless a payment link is opened.','What is the best approach?',['Open immediately','Verify using the official delivery service','Reply to the number','Send card details'],'B','Use a known official channel rather than the message link.'],
      ['Authority Pressure','A message claims to be from a senior executive demanding secrecy and immediate action.','Which tactic is being used?',['Social engineering','Encryption','Hashing','Segmentation'],'A','Authority and urgency are common social-engineering tactics.'],
      ['Report Decision','An employee clicked a suspicious link but entered no information.','What should happen next?',['Hide the event','Report it','Delete browser history only','Ignore it'],'B','Early reporting allows security teams to investigate and protect others.'],
      ['Evidence','A suspicious email may be part of a larger campaign.','What is useful evidence?',['Original message details','Only a screenshot','Nothing','Deleting the message'],'A','Preserving relevant message details supports investigation.'],
      ['Prevention','A company wants to reduce phishing success.','Which combination is strongest?',['Training only','Filtering only','Training, filtering and reporting','No email access'],'C','Defense in depth combines people, technology and procedures.']
    ]
  },

  {
    id:'ransomware',
    title:'Ransomware Response',
    icon:'▣',
    desc:'Practice containment, evidence preservation, recovery and resilience.',
    levels:[
      ['Strange Extensions','Several workstations suddenly show unfamiliar file extensions.','What is the priority?',['Ignore it','Investigate and contain','Delete all files','Pay immediately'],'B','Rapid investigation and containment can reduce spread.'],
      ['Isolation','A workstation is suspected of ransomware activity.','What is an appropriate containment step?',['Connect it to more systems','Isolate it','Publish the files','Disable all backups'],'B','Isolation can reduce further propagation.'],
      ['Backup Check','A company has offline backups available.','Why are they valuable?',['They guarantee no attack','They support recovery','They prevent phishing','They replace logging'],'B','Trusted backups can support recovery after ransomware.'],
      ['Evidence Preservation','An infected system may contain useful forensic evidence.','What should responders avoid?',['Following procedure','Documenting actions','Destroying evidence unnecessarily','Preserving logs'],'C','Evidence should be preserved according to incident procedures.'],
      ['Scope','One department reports encrypted files.','What should analysts determine?',['Only the first computer','The broader affected scope','Who to blame first','Nothing'],'B','Understanding scope helps containment and recovery.'],
      ['Recovery','Systems are ready to be restored.','Best source for recovery?',['Unverified files','Trusted clean backups','Random downloads','Attacker-provided tools'],'B','Recovery should use trusted sources.'],
      ['Root Cause','After recovery, the team investigates how the attack began.','Why?',['To assign random blame','To prevent recurrence','To delete logs','To avoid lessons learned'],'B','Root-cause analysis helps prevent repeat incidents.'],
      ['Communication','A major ransomware event affects business operations.','What is important?',['Unverified rumors','Coordinated incident communication','Posting credentials','Hiding all evidence'],'B','Clear, coordinated communication supports response.'],
      ['Lessons Learned','The incident is closed.','What should happen?',['Forget it','Review what worked and what failed','Delete documentation','Disable monitoring'],'B','Lessons learned improve future resilience.'],
      ['Resilience','The organization wants to reduce future ransomware impact.','Best strategy?',['One backup only','Defense in depth and tested recovery','No patching','Shared passwords'],'B','Layered controls and tested recovery improve resilience.']
    ]
  },

  {
    id:'insider',
    title:'Insider Mystery',
    icon:'◎',
    desc:'Investigate unusual access while respecting least privilege and fairness.',
    levels:[
      ['Least Privilege','An employee has access to many systems unrelated to their job.','Which principle is being violated?',['Least privilege','Availability','Hashing','Encryption'],'A','Users should receive only the access needed for their role.'],
      ['Access Review','A quarterly review finds former employees still have active permissions.','What is needed?',['Ignore them','Remove unnecessary access','Give more access','Disable logging'],'B','Unused and former-user access should be removed.'],
      ['Log Anomaly','An account downloads unusually large amounts of data late at night.','What should analysts do?',['Assume guilt','Investigate the anomaly','Delete logs','Publish the data'],'B','An anomaly should be investigated using evidence.'],
      ['DLP','Sensitive files are being copied to unauthorized locations.','Which control can help detect/prevent this?',['DLP','DNS only','Screen brightness','Printer ink'],'A','Data Loss Prevention can monitor and control sensitive data movement.'],
      ['Separation of Duties','One employee can request and approve the same high-risk transaction.','What principle is weak?',['Separation of duties','Availability','Compression','Encoding'],'A','Separating responsibilities reduces single-person abuse risk.'],
      ['Privileged Access','An administrator uses a powerful account for ordinary browsing.','What is better practice?',['Use privileged account everywhere','Separate privileged and normal activities','Share admin password','Disable MFA'],'B','Privileged access should be restricted and used only when necessary.'],
      ['Due Care','Management ignores repeated access-control warnings.','What security concept is missing?',['Due care','Encoding','Availability','Compression'],'A','Due care means taking reasonable security precautions.'],
      ['Fair Investigation','An employee is suspected of data misuse.','What should investigators do?',['Assume guilt','Use evidence and follow procedure','Delete logs','Publicly accuse them'],'B','Investigations should be evidence-based and procedurally fair.'],
      ['Account Review','An employee changes departments.','What should happen to access?',['Keep everything forever','Review and adjust permissions','Give administrator rights','Disable all security controls'],'B','Role changes should trigger access review.'],
      ['Reporting','A potential insider incident is discovered.','Best response?',['Hide it','Follow the incident reporting process','Post details publicly','Destroy evidence'],'B','Structured reporting supports investigation and response.']
    ]
  },

  {
    id:'web',
    title:'Web Shield',
    icon:'◇',
    desc:'Apply web security concepts to realistic application scenarios.',
    levels:[
      ['Record Ownership','A user changes an invoice ID and views another customer's invoice.','What is the main issue?',['Broken access control','Hashing','Availability','Compression'],'A','The server failed to enforce ownership authorization.'],
      ['SQL Safety','An application builds SQL by concatenating user input.','What is safer?',['Parameterized queries','More concatenation','Client-side validation only','Plaintext passwords'],'A','Parameterized queries separate data from SQL instructions.'],
      ['XSS Defense','A comment is displayed as executable browser content.','Which defense is important?',['Output encoding','Disabling backups','More ports','Shared passwords'],'A','Output encoding helps prevent untrusted content from becoming executable markup.'],
      ['Session Security','A sensitive application uses long-lived session tokens without protection.','What should be improved?',['Session management','Screen resolution','File compression','Printer settings'],'A','Secure session management reduces session abuse risk.'],
      ['CSRF','A browser is tricked into sending an unwanted authenticated request.','Which control can help?',['CSRF protection','Password reuse','Open redirects','Plain HTTP'],'A','CSRF defenses help ensure requests originate from legitimate application flows.'],
      ['Input Validation','An application accepts unexpected data types and formats.','What should developers do?',['Validate input server-side','Trust the browser','Disable logging','Share database access'],'A','Server-side validation is important because clients cannot be trusted.'],
      ['Secure Design','A system gives every user administrator privileges.','What principle should change?',['Least privilege','Maximum privilege','No authentication','Public access'],'A','Least privilege reduces unnecessary permissions.'],
      ['Logging','A web application cannot determine who changed important records.','What is missing?',['Useful audit logging','More colors','Less authentication','Public database access'],'A','Audit logs should capture important security events.'],
      ['Patching','A web framework has a known security update.','What is appropriate?',['Assess and patch according to process','Ignore it','Delete the server','Publish credentials'],'A','Security updates should be assessed and applied appropriately.'],
      ['Defense in Depth','A team wants multiple layers protecting a web application.','Which approach is best?',['Defense in depth','One password','One firewall only','No monitoring'],'A','Multiple complementary controls improve resilience.']
    ]
  },

  {
    id:'forensics',
    title:'Digital Forensics Hunt',
    icon:'⌘',
    desc:'Learn evidence preservation, hashes, timelines and investigation.',
    levels:[
      ['File Hash','An investigator needs to verify a file has not changed.','What can help?',['Cryptographic hash','File name only','Screen size','Username only'],'A','A cryptographic hash can provide an integrity fingerprint.'],
      ['Metadata','A document contains useful creation information.','What is this information called?',['Metadata','Firewall','MFA','Encryption key'],'A','Metadata can contain information about a file or object.'],
      ['DNS Logs','An endpoint contacted a suspicious domain.','Which logs may help?',['DNS logs','Keyboard brightness','Printer logs only','Wallpaper history'],'A','DNS records can help establish domain-resolution activity.'],
      ['Firewall Event','Investigators need evidence of network connections.','Which source may help?',['Firewall logs','Desktop wallpaper','Battery percentage','Screen saver'],'A','Firewall logs can show allowed or blocked network activity.'],
      ['Timeline','Analysts need to reconstruct event order.','What technique is useful?',['Timeline analysis','Password sharing','Random guessing','Deleting timestamps'],'A','A timeline helps correlate events in sequence.'],
      ['Chain of Custody','Evidence changes hands during an investigation.','What should be documented?',['Who handled it and when','Only the filename','Nothing','Public comments'],'A','Chain-of-custody records support evidence integrity and accountability.'],
      ['Evidence Copy','An investigator needs to examine storage media.','Best approach?',['Use a forensic copy when appropriate','Modify the original repeatedly','Delete files first','Upload everything publicly'],'A','A forensic copy allows examination while preserving the original.'],
      ['Integrity Check','An evidence image is transferred to another system.','What can verify integrity?',['Compare cryptographic hashes','Rename the file','Change timestamps','Compress randomly'],'A','Matching hashes provide evidence that content remained unchanged.'],
      ['Facts vs Assumptions','An analyst writes an incident report.','What should the report distinguish?',['Facts and assumptions','Passwords and usernames','Colors and fonts','Old and new laptops only'],'A','Clear separation prevents speculation from being presented as fact.'],
      ['Final Report','An investigation is complete.','What should the report contain?',['Methods, evidence, findings and conclusions','Only guesses','Passwords','Unverified rumors'],'A','A defensible report explains methods, evidence and findings.']
    ]
  }
];


/* =========================================================
   MINI QUIZZES
   ========================================================= */

const quizQuestions = [
  {
    q:'A database remains online, but unauthorized users can modify records. Which CIA objective is primarily affected?',
    o:['Confidentiality','Integrity','Availability','Authentication'],
    a:'B',
    e:'Integrity means information remains accurate and protected from unauthorized modification.'
  },
  {
    q:'A company requires a password plus a security key. What does this provide?',
    o:['MFA','Compression','Hashing','Authorization'],
    a:'A',
    e:'A password and security key represent different authentication factor categories.'
  },
  {
    q:'A user can change an ID in a URL and access another user’s private record. What is the likely issue?',
    o:['Broken access control','Availability','Hash collision','Encryption'],
    a:'A',
    e:'The application is failing to enforce authorization for the requested resource.'
  },
  {
    q:'A security device detects suspicious network activity and automatically blocks it. Which technology best fits?',
    o:['IDS','IPS','SIEM only','Password manager'],
    a:'B',
    e:'An IPS can detect suspicious traffic and take preventive action.'
  },
  {
    q:'Which is primarily used as a fixed-length fingerprint of data?',
    o:['Hashing','Encryption','Authorization','MFA'],
    a:'A',
    e:'Cryptographic hashes produce a digest that can be used to check integrity.'
  },
  {
    q:'An email creates urgency and asks a user to enter credentials through an unfamiliar link. What is the strongest first response?',
    o:['Click quickly','Verify independently','Forward to everyone','Disable security tools'],
    a:'B',
    e:'Independent verification is a strong defense against phishing and social engineering.'
  },
  {
    q:'During an incident, an infected endpoint is disconnected from the network. What phase/action does this represent?',
    o:['Containment','Governance','Hashing','Authorization'],
    a:'A',
    e:'Isolation is a common containment action.'
  },
  {
    q:'A user receives only the permissions needed for their job. Which principle is this?',
    o:['Least privilege','Maximum privilege','Open access','Availability'],
    a:'A',
    e:'Least privilege limits permissions to what is necessary.'
  },
  {
    q:'In NIST CSF 2.0, establishing cybersecurity strategy, roles and oversight most closely belongs to which Function?',
    o:['Govern','Detect','Recover','Protect'],
    a:'A',
    e:'Govern establishes and monitors cybersecurity strategy, expectations and oversight.'
  },
  {
    q:'Which approach is preferred for safely incorporating user input into SQL statements?',
    o:['String concatenation','Parameterized queries','Plaintext passwords','Client-side checks only'],
    a:'B',
    e:'Parameterized queries separate SQL instructions from user-controlled data.'
  }
];


/* =========================================================
   PRACTICE LABS
   ========================================================= */

const labs = [
  {
    id:'base64',
    title:'Base64 Encode / Decode',
    icon:'B64',
    type:'base64',
    theory:'Base64 represents binary data using a text-friendly character set. It is an encoding scheme, not encryption.',
    why:'Base64 appears in email, web data and many technical formats.',
    steps:[
      'Enter text.',
      'Choose Encode to convert it to Base64.',
      'Use Decode to convert valid Base64 back to text.',
      'Remember that Base64 does not provide secrecy.'
    ],
    example:'Text: Hello\nBase64: SGVsbG8=',
    remember:'Encoding changes representation. It does not make data secret.'
  },
  {
    id:'url',
    title:'URL Encode / Decode',
    icon:'URL',
    type:'url',
    theory:'URL encoding converts characters into a representation safe for use inside URLs.',
    why:'Web applications frequently encode spaces and special characters in URLs.',
    steps:[
      'Enter text.',
      'Choose Encode URL.',
      'Use Decode URL on an encoded value.',
      'Compare the original and encoded forms.'
    ],
    example:'Hello World → Hello%20World',
    remember:'URL encoding is not encryption.'
  },
  {
    id:'hex',
    title:'Hex Encode / Decode',
    icon:'HEX',
    type:'hex',
    theory:'Hexadecimal represents bytes using hexadecimal digits from 0–9 and A–F.',
    why:'Hex is common in hashes, debugging, binary analysis and network/security tools.',
    steps:[
      'Enter text.',
      'Encode it into hexadecimal bytes.',
      'Copy a hexadecimal value.',
      'Decode it back into text.'
    ],
    example:'Hi → 48 69',
    remember:'Two hexadecimal digits commonly represent one byte.'
  },
  {
    id:'rot13',
    title:'ROT13',
    icon:'R13',
    type:'rot13',
    theory:'ROT13 replaces each letter with the letter 13 positions away in the alphabet.',
    why:'It is useful for learning basic substitution transformations.',
    steps:[
      'Enter text.',
      'Apply ROT13.',
      'Apply it again to return to the original text.'
    ],
    example:'HELLO → URYYB',
    remember:'ROT13 is not secure cryptography.'
  },
  {
    id:'sha256',
    title:'SHA-256 Hashing',
    icon:'SHA',
    type:'sha',
    theory:'SHA-256 is a cryptographic hash function that produces a 256-bit digest.',
    why:'Hashes can help verify file integrity and identify data.',
    steps:[
      'Enter text.',
      'Compute the SHA-256 digest.',
      'Change one character.',
      'Hash it again and compare the results.'
    ],
    example:'The same input produces the same SHA-256 digest.',
    remember:'Hashing is designed to be one-way; it is not normal reversible encryption.'
  }
];


/* =========================================================
   BADGES
   ========================================================= */

const badges = [
  ['first','First Case','Complete your first case.','◈'],
  ['foundation','Foundation Complete','Explore five learning materials.','◆'],
  ['phish','Phishing Analyst','Complete all phishing cases.','✉'],
  ['ransom','Ransomware Responder','Complete all ransomware cases.','▣'],
  ['insider','Insider Investigator','Complete all insider cases.','◎'],
  ['web','Web Defender','Complete all web cases.','◇'],
  ['forensics','Forensics Analyst','Complete all forensics cases.','⌘'],
  ['ten','10 Levels','Complete ten case-study levels.','10'],
  ['twentyfive','25 Levels','Complete twenty-five case-study levels.','25'],
  ['fifty','50 Levels','Complete all fifty case-study levels.','50'],
  ['quiz','Quiz Master','Score 10/10 on the mini quiz.','✓'],
  ['lab','Lab Explorer','Complete all five practice labs.','⌁'],
  ['graduate','CyberHunt Graduate','Complete all cases and labs.','★']
];


/* =========================================================
   NAVIGATION
   ========================================================= */

const sectionNames = {
  dashboard:'Dashboard',
  ai:'AI Study Studio',
  materials:'Materials',
  cases:'Case Studies',
  quizzes:'Mini Quizzes',
  labs:'Practice Labs',
  badges:'Badges'
};

function showSection(section) {

  if (!sectionNames[section]) {
    section = 'dashboard';
  }

  $$('.page-section').forEach(el => {
    el.classList.toggle(
      'active-section',
      el.id === section
    );
  });

  $$('.nav-item').forEach(btn => {
    btn.classList.toggle(
      'active',
      btn.dataset.section === section
    );
  });

  const crumb = $('#crumb');

  if (crumb) {
    crumb.textContent = sectionNames[section];
  }

  state.currentSection = section;
  save();

  if (section === 'dashboard') renderDashboard();
  if (section === 'ai') renderChat();
  if (section === 'materials') renderMaterials();
  if (section === 'cases') renderCases();
  if (section === 'quizzes') renderQuiz();
  if (section === 'labs') renderLabs();
  if (section === 'badges') renderBadges();

  $('#sidebar')?.classList.remove('open');
}


/* =========================================================
   HEADER / DASHBOARD
   ========================================================= */

function updateHeader() {

  const level = xpLevel();

  if ($('#xpTop')) $('#xpTop').textContent = state.xp;
  if ($('#levelTop')) $('#levelTop').textContent = level;
  if ($('#dashXP')) $('#dashXP').textContent = state.xp;
  if ($('#casesDone')) $('#casesDone').textContent = state.completedCases.length;
  if ($('#labsDone')) $('#labsDone').textContent = state.completedLabs.length;
  if ($('#quizBest')) $('#quizBest').textContent = state.quizBest;

  if ($('#welcomeName')) {
    $('#welcomeName').textContent =
      state.user?.name || 'Detective';
  }

  if ($('#profileTop')) {
    $('#profileTop').textContent =
      (state.user?.name || 'D').charAt(0).toUpperCase();
  }
}

function renderDashboard() {

  const total =
    tracks.length * 10 + labs.length + 10;

  const progress =
    Math.min(
      100,
      Math.round(
        (
          state.completedCases.length +
          state.completedLabs.length +
          (state.quizBest > 0 ? 1 : 0)
        ) /
        total * 100
      )
    );

  if ($('#overallProgress')) {
    $('#overallProgress').style.width = `${progress}%`;
  }

  if ($('#progressPill')) {
    $('#progressPill').textContent = `${progress}%`;
  }

  const next = materials.find(
    m => !state.viewedMaterials.includes(m.id)
  );

  if ($('#nextTitle')) {
    $('#nextTitle').textContent =
      next ? next.title : 'Keep testing your knowledge';
  }

  if ($('#nextDesc')) {
    $('#nextDesc').textContent =
      next
        ? 'Open a material, learn the concept, then test yourself with a case.'
        : 'Review case studies, practice labs and the mini quiz to strengthen your skills.';
  }
}


/* =========================================================
   WEB SEARCH
   ========================================================= */

function webSearch(query) {

  query = (query || '').trim();

  if (!query) {
    toast('Enter a topic to research.');
    return;
  }

  const url =
    'https://www.google.com/search?q=' +
    encodeURIComponent(query + ' cybersecurity');

  window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  );

  toast('Web research opened.');
}


/* =========================================================
   YOUTUBE SEARCH
   ========================================================= */

function youtubeSearch(query) {

  query = (query || '').trim();

  if (!query) {
    toast('Enter a topic for YouTube research.');
    return;
  }

  const url =
    'https://www.youtube.com/results?search_query=' +
    encodeURIComponent(
      query + ' cybersecurity tutorial'
    );

  window.open(
    url,
    '_blank',
    'noopener,noreferrer'
  );

  toast('YouTube study videos opened.');
}


/* =========================================================
   AI STUDY LIBRARY
   ========================================================= */

function findMaterial(query) {

  const q = query.toLowerCase();

  let best = null;
  let bestScore = 0;

  materials.forEach(m => {

    let score = 0;

    if (q.includes(m.title.toLowerCase())) {
      score += 10;
    }

    m.tags.forEach(tag => {
      if (q.includes(tag.toLowerCase())) {
        score += 5;
      }
    });

    m.title
      .toLowerCase()
      .split(/\s+/)
      .forEach(word => {
        if (word.length > 3 && q.includes(word)) {
          score += 2;
        }
      });

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  });

  return best;
}

function genericAIAnswer(query) {

  return `Cybersecurity Study Guidance

Your question:
${query}

A good way to study this topic is to identify:

1. What the concept means.
2. Why it matters.
3. What security problem it addresses.
4. A practical example.
5. How it may appear in a scenario-based question.

Try opening Materials for detailed notes, then use Case Studies to test whether you can apply the concept.

For deeper and current research, use Connect to Web or Find on YouTube.`;
}

function answerFromLibrary(query) {

  const material = findMaterial(query);

  if (!material) {
    return genericAIAnswer(query);
  }

  return `${material.title}

WHAT IT MEANS
${material.detail}

WHY IT MATTERS
${material.why}

KEY POINTS
${material.keys.map(x => '• ' + x).join('\n')}

EXAMPLE
${material.example}

SCENARIO
${material.scenario}

REMEMBER
${material.remember}`;
}


/* =========================================================
   AI CHAT
   ========================================================= */

function renderChat() {

  const box = $('#chatMessages');

  if (!box) return;

  if (!state.aiHistory.length) {

    box.innerHTML = `
      <div class="msg ai">
        Hi ${esc(state.user?.name || 'Detective')}! 👋

        I can help you study cybersecurity concepts using the CyberHunt knowledge library.

        Ask me about CIA Triad, phishing, ransomware, hashing, encryption, authentication, SQL injection, XSS, NIST CSF, OWASP and more.

        For current information, the same topic can also be researched on the live Web and YouTube.
      </div>
    `;

    return;
  }

  box.innerHTML = state.aiHistory
    .map(msg => `
      <div class="msg ${msg.role === 'user' ? 'user' : 'ai'}">
        ${esc(msg.text)}
      </div>
    `)
    .join('');

  box.scrollTop = box.scrollHeight;
}

function askAI(query) {

  query = query.trim();

  if (!query) return;

  state.aiHistory.push({
    role:'user',
    text:query
  });

  const answer = answerFromLibrary(query);

  state.aiHistory.push({
    role:'ai',
    text:answer
  });

  if (state.aiHistory.length > 30) {
    state.aiHistory =
      state.aiHistory.slice(-30);
  }

  save();
  renderChat();

  const webInput = $('#webQuery');

  if (webInput) {
    webInput.value = query;
  }
}


/* =========================================================
   MATERIAL FILTERS
   ========================================================= */

function initMaterialFilters() {

  const box = $('#materialFilters');

  if (!box) return;

  const levels = [
    'All',
    'Beginner',
    'Intermediate',
    'Advanced'
  ];

  box.innerHTML = levels
    .map(
      (level, index) =>
        `<button class="${index === 0 ? 'active' : ''}" data-level-filter="${level}">
          ${level}
        </button>`
    )
    .join('');
}

let selectedMaterialLevel = 'All';

function renderMaterials() {

  const grid = $('#materialsGrid');

  if (!grid) return;

  const search =
    ($('#materialSearch')?.value || '')
      .trim()
      .toLowerCase();

  const filtered = materials.filter(m => {

    const levelMatch =
      selectedMaterialLevel === 'All' ||
      m.level === selectedMaterialLevel;

    const text =
      (
        m.title +
        ' ' +
        m.short +
        ' ' +
        m.tags.join(' ')
      ).toLowerCase();

    return levelMatch && text.includes(search);
  });

  grid.innerHTML = filtered.map(m => `
    <article
      class="material-card"
      data-material="${m.id}"
    >

      <div class="tagline">
        <span class="level-tag">${esc(m.level)}</span>
        <span class="level-tag">
          ${state.viewedMaterials.includes(m.id) ? '✓ VIEWED' : 'STUDY'}
        </span>
      </div>

      <h3>${esc(m.title)}</h3>

      <p>${esc(m.short)}</p>

      <div class="learn">
        OPEN DETAILED NOTES →
      </div>

    </article>
  `).join('');

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="panel">
        No materials found for that search.
      </div>
    `;
  }
}


/* =========================================================
   MATERIAL DETAIL
   ========================================================= */

function openDetail(html) {

  const overlay = $('#detailOverlay');
  const content = $('#detailContent');

  if (!overlay || !content) return;

  content.innerHTML = html;
  overlay.classList.remove('hidden');
}

function closeDetail() {

  $('#detailOverlay')?.classList.add('hidden');
}

function materialDetail(id) {

  const m = materials.find(x => x.id === id);

  if (!m) return;

  if (!state.viewedMaterials.includes(id)) {
    state.viewedMaterials.push(id);
    save();
  }

  openDetail(`
    <p class="eyebrow">
      ${esc(m.level)} · CYBERHUNT MATERIAL
    </p>

    <h2 class="detail-title">
      ${esc(m.title)}
    </h2>

    <p class="detail-sub">
      ${esc(m.short)}
    </p>

    <div class="detail-section">
      <h4>Theory</h4>
      <p>${esc(m.detail)}</p>
    </div>

    <div class="detail-section">
      <h4>Why it matters</h4>
      <p>${esc(m.why)}</p>
    </div>

    <div class="detail-section">
      <h4>Key concepts</h4>
      <ul>
        ${m.keys.map(k => `<li>${esc(k)}</li>`).join('')}
      </ul>
    </div>

    <div class="detail-section">
      <h4>Example</h4>
      <p>${esc(m.example)}</p>
    </div>

    <div class="detail-section">
      <h4>Exam-style scenario</h4>
      <p>${esc(m.scenario)}</p>
    </div>

    <div class="detail-section">
      <h4>Remember</h4>
      <p>${esc(m.remember)}</p>
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
        data-web-topic="${esc(m.title)}"
      >
        Search Web ↗
      </button>

      <button
        class="ghost-btn"
        data-youtube-topic="${esc(m.title)}"
      >
        Find YouTube ↗
      </button>

    </div>
  `);
}


/* =========================================================
   CASE STUDIES
   ========================================================= */

function renderCases() {

  const grid = $('#casesGrid');

  if (!grid) return;

  grid.innerHTML = tracks.map(track => {

    const done =
      track.levels.filter(
        (_, i) =>
          isCaseDone(`${track.id}-${i + 1}`)
      ).length;

    const percent =
      Math.round(done / 10 * 100);

    return `
      <article
        class="case-card"
        data-track="${track.id}"
      >

        <div class="case-num">
          TRACK ${track.id.toUpperCase()}
        </div>

        <h3>
          ${esc(track.icon)} ${esc(track.title)}
        </h3>

        <p>
          ${esc(track.desc)}
        </p>

        <div class="case-progress">
          <small>${done}/10 completed</small>

          <div class="progress">
            <i style="width:${percent}%"></i>
          </div>
        </div>

      </article>
    `;
  }).join('');

  $('#caseLevels')?.classList.add('hidden');
}

function showLevels(trackId) {

  const track = tracks.find(t => t.id === trackId);

  if (!track) return;

  const box = $('#caseLevels');

  if (!box) return;

  box.classList.remove('hidden');

  box.innerHTML = `
    <div class="panel">

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

      <p style="color:#777;font-size:11px;line-height:1.6">
        Choose a level. Every level contains a different
        cybersecurity scenario and question.
      </p>

      <div class="levels-grid">

        ${track.levels.map((level, i) => {

          const key =
            `${track.id}-${i + 1}`;

          return `
            <button
              class="level-btn ${isCaseDone(key) ? 'done' : ''}"
              data-level="${key}"
            >

              <strong>
                Level ${i + 1}
              </strong>

              <small>
                ${isCaseDone(key) ? '✓ Completed' : 'Start case'}
              </small>

            </button>
          `;

        }).join('')}

      </div>

    </div>
  `;

  box.scrollIntoView({
    behavior:'smooth',
    block:'start'
  });
}


/* =========================================================
   CASE DETAIL
   ========================================================= */

function caseDetail(key) {

  const parts = key.split('-');

  const trackId =
    parts.slice(0, -1).join('-');

  const number =
    parseInt(parts[parts.length - 1], 10);

  const track =
    tracks.find(t => t.id === trackId);

  if (!track) return;

  const data =
    track.levels[number - 1];

  if (!data) return;

  const [
    title,
    scenario,
    question,
    options,
    answer,
    explanation
  ] = data;

  openDetail(`
    <p class="eyebrow">
      ${esc(track.title)} · LEVEL ${number}
    </p>

    <h2 class="detail-title">
      ${esc(title)}
    </h2>

    <p class="detail-sub">
      Read the briefing before answering.
    </p>

    <div class="detail-section">

      <h4>Cyber event briefing</h4>

      <p>
        ${esc(scenario)}
      </p>

    </div>

    <div class="detail-section">

      <h4>Clues</h4>

      <span class="clue">
        Identify the security concept
      </span>

      <span class="clue">
        Think about the safest defensive action
      </span>

      <span class="clue">
        Avoid assumptions
      </span>

    </div>

    <div class="detail-section">

      <h4>Question</h4>

      <p style="font-size:15px;color:#fff">
        ${esc(question)}
      </p>

    </div>

    <div class="option-list">

      ${options.map((option, i) => {

        const letter =
          String.fromCharCode(65 + i);

        return `
          <button
            class="case-option"
            data-case-answer="${key}"
            data-opt="${letter}"
          >
            <strong>${letter}.</strong>
            ${esc(option)}
          </button>
        `;
      }).join('')}

    </div>

    <div
      id="caseResult"
      class="case-result"
      style="display:none"
    ></div>

    <div
      id="caseExplanation"
      class="detail-section"
      style="display:none"
    >
      <h4>Explanation</h4>
      <p>${esc(explanation)}</p>
    </div>
  `);
}

function answerCase(key, selected) {

  const parts = key.split('-');

  const trackId =
    parts.slice(0, -1).join('-');

  const number =
    parseInt(parts[parts.length - 1], 10);

  const track =
    tracks.find(t => t.id === trackId);

  if (!track) return;

  const data =
    track.levels[number - 1];

  if (!data) return;

  const answer = data[4];
  const explanation = data[5];

  const result = $('#caseResult');
  const explanationBox = $('#caseExplanation');

  if (!result) return;

  result.style.display = 'block';

  $$('.case-option').forEach(btn => {

    const option =
      btn.dataset.opt;

    if (option === answer) {
      btn.classList.add('correct');
    }

    if (
      option === selected &&
      option !== answer
    ) {
      btn.classList.add('wrong');
    }
  });

  if (selected === answer) {

    result.className = 'case-result good';

    if (!isCaseDone(key)) {

      state.completedCases.push(key);

      addXP(25, 'Case solved');

    } else {

      result.innerHTML =
        'Correct! You already completed this case.';
    }

    result.innerHTML =
      '✓ Correct! Excellent security reasoning.';

  } else {

    result.className = 'case-result bad';

    result.innerHTML =
      `✗ Not quite. The best answer is <strong>${answer}</strong>.`;
  }

  if (explanationBox) {
    explanationBox.style.display = 'block';
  }

  save();
  updateHeader();
  renderCases();
  renderBadges();
}


/* =========================================================
   QUIZ
   ========================================================= */

window.quizState = {
  i:0,
  score:0,
  answered:false,
  finished:false
};

function renderQuiz() {

  const area = $('#quizArea');

  if (!area) return;

  if (
    !window.quizState ||
    window.quizState.finished
  ) {
    window.quizState = {
      i:0,
      score:0,
      answered:false,
      finished:false
    };
  }

  const q =
    quizQuestions[window.quizState.i];

  if (!q) {
    finishQuiz();
    return;
  }

  area.innerHTML = `
    <div class="quiz-top">
      <span>
        Question ${window.quizState.i + 1}
        / ${quizQuestions.length}
      </span>

      <span>
        Score: ${window.quizState.score}
      </span>
    </div>

    <div class="quiz-q">
      ${esc(q.q)}
    </div>

    <div class="quiz-options">

      ${q.o.map((option, i) => {

        const letter =
          String.fromCharCode(65 + i);

        return `
          <button
            class="quiz-option"
            data-qopt="${letter}"
          >
            <strong>${letter}.</strong>
            ${esc(option)}
          </button>
        `;

      }).join('')}

    </div>

    <div id="quizExplanation"></div>

    <div
      id="quizNext"
      style="margin-top:18px"
    ></div>
  `;
}

function answerQuiz(letter) {

  if (window.quizState.answered) return;

  window.quizState.answered = true;

  const q =
    quizQuestions[window.quizState.i];

  const correct =
    letter === q.a;

  if (correct) {
    window.quizState.score++;
  }

  $$('.quiz-option').forEach(btn => {

    if (btn.dataset.qopt === q.a) {
      btn.classList.add('correct');
    }

    if (
      btn.dataset.qopt === letter &&
      !correct
    ) {
      btn.classList.add('wrong');
    }
  });

  $('#quizExplanation').innerHTML = `
    <div class="quiz-explain">
      ${correct ? '✓ Correct!' : '✗ Incorrect.'}

      <br><br>

      ${esc(q.e)}
    </div>
  `;

  $('#quizNext').innerHTML = `
    <button
      class="primary-btn"
      id="nextQuiz"
    >
      ${
        window.quizState.i === quizQuestions.length - 1
          ? 'Finish Quiz'
          : 'Next Question →'
      }
    </button>
  `;
}

function nextQuiz() {

  if (!window.quizState.answered) return;

  window.quizState.i++;

  if (
    window.quizState.i >= quizQuestions.length
  ) {
    finishQuiz();
    return;
  }

  window.quizState.answered = false;

  renderQuiz();
}

function finishQuiz() {

  const score =
    window.quizState.score;

  const oldBest =
    state.quizBest;

  if (score > state.quizBest) {

    state.quizBest = score;

    if (score > oldBest) {
      state.xp += 10;
    }

    save();
  }

  window.quizState.finished = true;

  const area = $('#quizArea');

  if (!area) return;

  area.innerHTML = `
    <div class="quiz-result">

      <p class="eyebrow">
        QUIZ COMPLETE
      </p>

      <strong>
        ${score}/10
      </strong>

      <h3>
        ${
          score === 10
            ? 'Excellent work!'
            : score >= 7
              ? 'Strong understanding!'
              : 'Keep studying and try again!'
        }
      </h3>

      <p style="color:#777;font-size:12px;line-height:1.6">
        ${
          score > oldBest
            ? 'New best score recorded. +10 XP.'
            : 'Review the missed concepts and try again.'
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

  updateHeader();
  renderBadges();
}


/* =========================================================
   PRACTICE LABS
   ========================================================= */

function renderLabs() {

  const grid = $('#labsGrid');

  if (!grid) return;

  grid.innerHTML = labs.map(lab => `
    <article
      class="material-card lab-card"
      data-lab="${lab.id}"
    >

      <div class="lab-symbol">
        ${esc(lab.icon)}
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
          isLabDone(lab.id)
            ? '✓ COMPLETED · REVIEW LAB'
            : 'OPEN LEARNING PANEL →'
        }
      </div>

    </article>
  `).join('');
}

function labDetail(id, start = false) {

  const lab =
    labs.find(x => x.id === id);

  if (!lab) return;

  openDetail(`
    <p class="eyebrow">
      PRACTICE LAB
      ${isLabDone(id) ? '· COMPLETED' : ''}
    </p>

    <h2 class="detail-title">
      ${esc(lab.title)}
    </h2>

    <p class="detail-sub">
      Learn first. Practice second.
    </p>

    <div class="detail-section">
      <h4>Theory</h4>
      <p>${esc(lab.theory)}</p>
    </div>

    <div class="detail-section">
      <h4>Why it matters</h4>
      <p>${esc(lab.why)}</p>
    </div>

    <div class="detail-section">
      <h4>How to do it</h4>
      <ol>
        ${lab.steps.map(s => `<li>${esc(s)}</li>`).join('')}
      </ol>
    </div>

    <div class="detail-section">
      <h4>One worked example</h4>
      <p style="white-space:pre-line">
        ${esc(lab.example)}
      </p>
    </div>

    <div class="detail-section">
      <h4>Remember</h4>
      <p>${esc(lab.remember)}</p>
    </div>

    ${
      start
        ? `
          <div class="detail-section">
            <h4>Practice</h4>
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

function practiceUI(lab) {

  if (lab.type === 'base64') {

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

      <div
        id="labOutput"
        class="practice-output"
      >
        Your result will appear here.
      </div>
    `;
  }

  if (lab.type === 'url') {

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

      <div
        id="labOutput"
        class="practice-output"
      >
        Your result will appear here.
      </div>
    `;
  }

  if (lab.type === 'hex') {

    return `
      <label>
        Text / hexadecimal
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

      <div
        id="labOutput"
        class="practice-output"
      >
        Your result will appear here.
      </div>
    `;
  }

  if (lab.type === 'rot13') {

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

      <div
        id="labOutput"
        class="practice-output"
      >
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

    <div
      id="labOutput"
      class="practice-output"
    >
      Your result will appear here.
    </div>
  `;
}


/* =========================================================
   LAB FUNCTIONS
   ========================================================= */

function base64Encode(text) {

  const bytes =
    new TextEncoder().encode(text);

  let binary = '';

  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64Decode(text) {

  const binary = atob(text);

  const bytes =
    Uint8Array.from(
      binary,
      char => char.charCodeAt(0)
    );

  return new TextDecoder().decode(bytes);
}

function hexEncode(text) {

  return [
    ...new TextEncoder().encode(text)
  ]
    .map(
      byte =>
        byte.toString(16).padStart(2,'0')
    )
    .join(' ');
}

function hexDecode(text) {

  const clean =
    text.trim().replace(/\s+/g,'');

  if (
    clean.length % 2 !== 0 ||
    !/^[0-9a-fA-F]*$/.test(clean)
  ) {
    throw new Error('Invalid hex');
  }

  const bytes = [];

  for (
    let i = 0;
    i < clean.length;
    i += 2
  ) {
    bytes.push(
      parseInt(clean.slice(i,i + 2),16)
    );
  }

  return new TextDecoder().decode(
    new Uint8Array(bytes)
  );
}

function rot13(text) {

  return text.replace(
    /[a-zA-Z]/g,
    char => {

      const base =
        char <= 'Z'
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

async function sha256(text) {

  const buffer =
    await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(text)
    );

  return [
    ...new Uint8Array(buffer)
  ]
    .map(
      byte =>
        byte.toString(16).padStart(2,'0')
    )
    .join('');
}

async function labAction(action) {

  const input = $('#labInput');
  const output = $('#labOutput');

  if (!input || !output) return;

  try {

    const value =
      input.value;

    let result = '';

    if (action === 'b64e') {
      result = base64Encode(value);
    }

    if (action === 'b64d') {
      result = base64Decode(value);
    }

    if (action === 'urle') {
      result = encodeURIComponent(value);
    }

    if (action === 'urld') {
      result = decodeURIComponent(value);
    }

    if (action === 'hexe') {
      result = hexEncode(value);
    }

    if (action === 'hexd') {
      result = hexDecode(value);
    }

    if (action === 'rot') {
      result = rot13(value);
    }

    if (action === 'sha') {
      result = await sha256(value);
    }

    output.textContent = result;

    const currentTitle =
      $('#detailContent h2')?.textContent || '';

    const lab =
      labs.find(
        l => l.title === currentTitle
      );

    if (
      lab &&
      !isLabDone(lab.id)
    ) {

      state.completedLabs.push(lab.id);

      state.xp += 30;

      save();

      updateHeader();
      renderLabs();
      renderBadges();

      toast('+30 XP · Lab completed');
    }

  } catch (error) {

    output.textContent =
      'Please check the input format and try again.';
  }
}


/* =========================================================
   BADGES
   ========================================================= */

function trackCompleted(trackId) {

  const track =
    tracks.find(t => t.id === trackId);

  if (!track) return false;

  return track.levels.every(
    (_, index) =>
      isCaseDone(
        `${trackId}-${index + 1}`
      )
  );
}

function renderBadges() {

  const box = $('#badgesGrid');

  if (!box) return;

  const cases =
    state.completedCases.length;

  const conditions = {

    first:
      cases >= 1,

    foundation:
      state.viewedMaterials.length >= 5,

    phish:
      trackCompleted('phishing'),

    ransom:
      trackCompleted('ransomware'),

    insider:
      trackCompleted('insider'),

    web:
      trackCompleted('web'),

    forensics:
      trackCompleted('forensics'),

    ten:
      cases >= 10,

    twentyfive:
      cases >= 25,

    fifty:
      cases >= 50,

    quiz:
      state.quizBest >= 10,

    lab:
      state.completedLabs.length >= 5,

    graduate:
      cases >= 50 &&
      state.completedLabs.length >= 5
  };

  const earned =
    new Set(state.badges);

  badges.forEach(badge => {

    const id = badge[0];

    if (conditions[id]) {
      earned.add(id);
    }
  });

  state.badges =
    [...earned];

  save();

  box.innerHTML =
    badges.map(badge => {

      const id = badge[0];
      const earnedBadge =
        earned.has(id);

      return `
        <article
          class="badge-card ${
            earnedBadge ? 'earned' : ''
          }"
        >

          <div class="badge-icon">
            ${esc(badge[3])}
          </div>

          <h3>
            ${esc(badge[1])}
          </h3>

          <p>
            ${esc(badge[2])}
          </p>

          <span class="earned-label">
            ${
              earnedBadge
                ? 'EARNED'
                : 'LOCKED'
            }
          </span>

        </article>
      `;
    }).join('');
}


/* =========================================================
   LOGIN
   ========================================================= */

function login() {

  const email =
    $('#email').value.trim();

  const username =
    $('#username').value.trim();

  const password =
    $('#password').value;

  const error =
    $('#loginError');

  error.textContent = '';

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(email)
  ) {

    error.textContent =
      'Enter a valid email address.';

    return;
  }

  if (
    !/^[A-Za-z0-9]+$/.test(username)
  ) {

    error.textContent =
      'Username can contain only letters and numbers.';

    return;
  }

  if (password.length < 8) {

    error.textContent =
      'Password must be at least 8 characters.';

    return;
  }

  state.user = {
    name:username,
    email:email
  };

  state.currentSection =
    'dashboard';

  save();

  sessionStorage.setItem(
    'cyberhuntLoggedIn',
    '1'
  );

  $('#loginPage')
    .classList.add('hidden');

  $('#app')
    .classList.remove('hidden');

  updateHeader();
  renderDashboard();
  showSection('dashboard');
  renderChat();
}

function logout() {

  sessionStorage.removeItem(
    'cyberhuntLoggedIn'
  );

  $('#app')
    .classList.add('hidden');

  $('#loginPage')
    .classList.remove('hidden');

  $('#password').value = '';
}


/* =========================================================
   EVENT HANDLING
   ========================================================= */

function setupEvents() {

  /* Login */
  $('#loginForm')?.addEventListener(
    'submit',
    event => {
      event.preventDefault();
      login();
    }
  );


  /* Logout */
  $('#logoutBtn')?.addEventListener(
    'click',
    logout
  );


  /* Close modal */
  $('#closeDetail')?.addEventListener(
    'click',
    closeDetail
  );


  $('#detailOverlay')?.addEventListener(
    'click',
    event => {

      if (
        event.target.id ===
        'detailOverlay'
      ) {
        closeDetail();
      }

    }
  );


  /* Escape closes modal */
  document.addEventListener(
    'keydown',
    event => {

      if (event.key === 'Escape') {
        closeDetail();
      }

    }
  );


  /* Navigation and dynamic buttons */
  document.addEventListener(
    'click',
    event => {

      const nav =
        event.target.closest(
          '[data-section]'
        );

      if (nav) {
        showSection(
          nav.dataset.section
        );
        return;
      }


      const go =
        event.target.closest(
          '[data-go]'
        );

      if (go) {
        showSection(
          go.dataset.go
        );
        return;
      }


      const material =
        event.target.closest(
          '[data-material]'
        );

      if (material) {
        materialDetail(
          material.dataset.material
        );
        return;
      }


      const track =
        event.target.closest(
          '[data-track]'
        );

      if (track) {
        showLevels(
          track.dataset.track
        );
        return;
      }


      const level =
        event.target.closest(
          '[data-level]'
        );

      if (level) {
        caseDetail(
          level.dataset.level
        );
        return;
      }


      const caseAnswer =
        event.target.closest(
          '[data-case-answer]'
        );

      if (caseAnswer) {

        $$('.case-option')
          .forEach(btn =>
            btn.classList.remove(
              'selected'
            )
          );

        caseAnswer.classList.add(
          'selected'
        );

        answerCase(
          caseAnswer.dataset.caseAnswer,
          caseAnswer.dataset.opt
        );

        return;
      }


      const quizOption =
        event.target.closest(
          '[data-qopt]'
        );

      if (quizOption) {

        answerQuiz(
          quizOption.dataset.qopt
        );

        return;
      }


      if (
        event.target.id ===
        'nextQuiz'
      ) {

        nextQuiz();
        return;
      }


      if (
        event.target.id ===
        'restartQuiz'
      ) {

        window.quizState = {
          i:0,
          score:0,
          answered:false,
          finished:false
        };

        renderQuiz();
        return;
      }


      const lab =
        event.target.closest(
          '[data-lab]'
        );

      if (lab) {

        labDetail(
          lab.dataset.lab
        );

        return;
      }


      const startLab =
        event.target.closest(
          '[data-start-lab]'
        );

      if (startLab) {

        labDetail(
          startLab.dataset.startLab,
          true
        );

        return;
      }


      const labActionButton =
        event.target.closest(
          '[data-lab-action]'
        );

      if (labActionButton) {

        labAction(
          labActionButton.dataset.labAction
        );

        return;
      }


      const askTopic =
        event.target.closest(
          '[data-ask-topic]'
        );

      if (askTopic) {

        const topic =
          askTopic.dataset.askTopic;

        closeDetail();
        showSection('ai');

        setTimeout(() => {

          const input =
            $('#aiInput');

          if (input) {
            input.value =
              `Explain ${topic} in detail with an exam scenario.`;

            input.focus();
          }

        },100);

        return;
      }


      const webTopic =
        event.target.closest(
          '[data-web-topic]'
        );

      if (webTopic) {

        webSearch(
          webTopic.dataset.webTopic
        );

        return;
      }


      const youtubeTopic =
        event.target.closest(
          '[data-youtube-topic]'
        );

      if (youtubeTopic) {

        youtubeSearch(
          youtubeTopic.dataset.youtubeTopic
        );

        return;
      }


      const webButton =
        event.target.closest(
          '[data-web]'
        );

      if (webButton) {

        $('#webQuery').value =
          webButton.dataset.web;

        webSearch(
          webButton.dataset.web
        );

        return;
      }


      const youtubeButton =
        event.target.closest(
          '[data-youtube]'
        );

      if (youtubeButton) {

        $('#webQuery').value =
          youtubeButton.dataset.youtube;

        youtubeSearch(
          youtubeButton.dataset.youtube
        );

        return;
      }


      const suggestion =
        event.target.closest(
          '[data-prompt]'
        );

      if (suggestion) {

        showSection('ai');

        const prompt =
          suggestion.dataset.prompt;

        $('#aiInput').value =
          prompt;

        askAI(prompt);

        /*
          User explicitly clicked a study suggestion,
          so live Web + YouTube research is opened too.
        */
        webSearch(prompt);
        youtubeSearch(prompt);

        return;
      }


      if (
        event.target.id ===
        'hideLevels'
      ) {

        $('#caseLevels')
          ?.classList.add('hidden');

        return;
      }


      const levelFilter =
        event.target.closest(
          '[data-level-filter]'
        );

      if (levelFilter) {

        selectedMaterialLevel =
          levelFilter.dataset.levelFilter;

        $$('#materialFilters button')
          .forEach(btn =>
            btn.classList.remove('active')
          );

        levelFilter.classList.add(
          'active'
        );

        renderMaterials();
      }

    }
  );


  /* AI form */

  $('#aiForm')?.addEventListener(
    'submit',
    event => {

      event.preventDefault();

      const query =
        $('#aiInput').value.trim();

      if (!query) return;

      askAI(query);

      $('#aiInput').value = '';

      /*
        The user asked that study-related AI questions
        should also provide live research.
      */
      webSearch(query);
      youtubeSearch(query);
    }
  );


  /* Web search */

  $('#webSearchBtn')?.addEventListener(
    'click',
    () => {

      webSearch(
        $('#webQuery').value
      );

    }
  );


  /* YouTube search */

  $('#youtubeSearchBtn')?.addEventListener(
    'click',
    () => {

      youtubeSearch(
        $('#webQuery').value
      );

    }
  );


  /* Material search */

  $('#materialSearch')?.addEventListener(
    'input',
    renderMaterials
  );


  /* Mobile menu */

  $('#menuBtn')?.addEventListener(
    'click',
    () => {

      $('#sidebar')
        ?.classList.toggle('open');

    }
  );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function init() {

  load();

  initMaterialFilters();

  setupEvents();

  updateHeader();

  renderDashboard();

  renderMaterials();

  renderCases();

  renderLabs();

  renderBadges();

  renderChat();

  if (
    sessionStorage.getItem(
      'cyberhuntLoggedIn'
    ) === '1' &&
    state.user
  ) {

    $('#loginPage')
      ?.classList.add('hidden');

    $('#app')
      ?.classList.remove('hidden');

    showSection(
      state.currentSection ||
      'dashboard'
    );

  } else {

    $('#loginPage')
      ?.classList.remove('hidden');

    $('#app')
      ?.classList.add('hidden');
  }
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  'DOMContentLoaded',
  init
);

})();
```
