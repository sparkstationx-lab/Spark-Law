import { LegalArticle } from "./types";

export const CATEGORIES = [
  "All Updates",
  "Supreme Court",
  "High Courts",
  "Corporate Law",
  "Law Schools",
  "IBC & Tax",
  "Legal Jobs",
  "Opinions & Columns"
];

export const HIGH_COURTS_LIST = [
  "Delhi High Court",
  "Bombay High Court",
  "Madras High Court",
  "Calcutta High Court",
  "Allahabad High Court",
  "Karnataka High Court",
  "Kerala High Court",
  "Gujarat High Court"
];

export const MOCK_ARTICLES: LegalArticle[] = [
  {
    id: "art-1",
    title: "Supreme Court Holds Right To Be Free From Adverse Effects Of Climate Change Part Of Articles 14 & 21",
    summary: "In a landmark judgment, the Supreme Court has recognized a distinct right to be free from the adverse effects of climate change, placing it under the protective ambit of Article 14 (Equality) and Article 21 (Right to Life) of the Constitution.",
    content: `### Executive Summary
In a monumental step for environmental jurisprudence, a three-judge Bench of the Supreme Court of India, headed by the Chief Justice, has explicitly recognized the **Right to be Free from the Adverse Effects of Climate Change** as a fundamental right protected under Article 14 (Right to Equality) and Article 21 (Right to Life and Personal Liberty) of the Constitution of India.

The judgment was delivered in a batch of petitions seeking to protect the critically endangered **Great Indian Bustard (GIB)** from losing its habitat due to overhead transmission power lines in Rajasthan and Gujarat.

---

### Core Observations by the Court
The Court observed that whilst India has several policies and statutory rules aimed at environmental conservation, the specific threat of climate change intersects directly with the fundamental rights of its citizens:

1. **Interconnection with Right to Health:** The Court noted that the right to a clean environment, which has been recognized as a part of Article 21 for decades, naturally extends to protection from climate-induced disruptions like extreme weather, water shortages, and air pollution.
2. **Equality and Climate Vulnerability:** Under Article 14, the Court noted that climate change affects marginalized communities disproportionately. Thus, a lack of adaptation policies breaches the guarantee of equal protection of the laws.
3. **The Energy Dilemma:** The Court highlighted the delicate balance between transitioning to green solar energy (which requires vast solar parks in GIB habitats) and protecting biodiversity. 

> "It is not a choice between green energy and conservation. Rather, we must implement an integrated policy that serves both goals without causing systemic destruction of either." — *Excerpt from the Judgment*

---

### Directions Issued by the Supreme Court
The Supreme Court has constituted an expert committee consisting of conservationists, power grid engineers, and environmental scientists to:
* Evaluate the feasibility of undergrounding high-voltage power lines in priority areas.
* Standardize the installation of bird-diverters on existing overhead wires.
* Submit a comprehensive action plan within nine weeks.

The matter has been listed for further monitoring in September 2026.`,
    category: "Supreme Court",
    subcategory: "Environmental Law",
    caseDetails: {
      caseName: "M.K. Ranjitsinh & Others v. Union of India & Others",
      citation: "2026 Spark Law (SC) 289",
      bench: "CJI D.Y. Chandrachud, Justice J.B. Pardiwala, Justice Manoj Misra",
      date: "July 2, 2026",
      caseNumber: "Writ Petition (Civil) No. 838 of 2020"
    },
    author: "Suhail Qureshi",
    publishedAt: "2026-07-02T10:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200",
    isBreaking: true,
    tags: ["Supreme Court", "Climate Change", "Article 21", "Great Indian Bustard", "Environmental Law"],
    views: 12450
  },
  {
    id: "art-2",
    title: "Delhi High Court Directs Quick Commerce Platforms To Strictly Comply With FSSAI Rules On Displaying Expiry Dates",
    summary: "The High Court ordered instantaneous delivery apps (quick commerce) to display shelf-life and expiry date information prominently before consumers make purchases.",
    content: `### Summary of Proceedings
The Delhi High Court has issued a series of binding directions to major quick commerce platforms (including Blinkit, Zepto, and Instamart) ensuring absolute compliance with the **Food Safety and Standards (Packaging and Labelling) Regulations**. 

The Division Bench presided by Justice Manmohan was hearing a public interest litigation (PIL) arguing that quick commerce applications frequently ship perishable foods near their expiry date without disclosing this critical parameter to the consumer prior to checkout.

---

### Arguments Placed
* **For the Petitioner:** Argued that physical retail stores allow consumers to inspect labels, and electronic platforms must provide an equivalent digital inspection mechanism to safeguard the Right to Health.
* **For the Platforms:** Stated that warehouse inventories move too rapidly to update real-time expiry dates on dynamic product pages.

---

### The Ruling
The High Court rejected the technical difficulty arguments raised by the platforms, stating:
1. **Digital Transparency:** Consumer awareness is paramount. If a platform can track inventory down to seconds, it can display expiry dates on the user interface.
2. **Mandatory Field:** Quick commerce apps must create a mandatory product field displaying "Minimum Guaranteed Shelf Life" or "Expiry Date" for all perishable food products.

The platforms have been granted an transition window of **30 days** to update their applications and supply chains, failing which they will face punitive action under the Food Safety and Standards Act, 2006.`,
    category: "High Courts",
    subcategory: "Delhi High Court",
    caseDetails: {
      caseName: "Consumer Rights Federation v. Union of India & Ors.",
      citation: "2026 Spark Law (Del) 412",
      bench: "Acting Chief Justice Manmohan, Justice Manmeet Pritam Singh Arora",
      date: "July 4, 2026",
      caseNumber: "W.P.(C) No. 5988/2026"
    },
    author: "Apoorva Mandhani",
    publishedAt: "2026-07-04T08:15:00Z",
    imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    isBreaking: false,
    tags: ["Delhi High Court", "FSSAI", "Quick Commerce", "Consumer Protection"],
    views: 8900
  },
  {
    id: "art-3",
    title: "Insolvency & Bankruptcy Code: NCLAT Rules Homebuyers Can Initiate Insolvency Even If Refund Orders Are Secured",
    summary: "The National Company Law Appellate Tribunal held that homebuyers do not lose their status as financial creditors merely because they obtained a refund decree from RERA.",
    content: `### Background
The National Company Law Appellate Tribunal (NCLAT), Principal Bench, New Delhi, has clarified a pivotal question concerning the rights of homebuyers under the **Insolvency and Bankruptcy Code (IBC), 2016**.

The appellant developer argued that once a homebuyer secures a refund order or recovery certificate from the **Real Estate Regulatory Authority (RERA)**, they transition from "financial creditors" to simple "decree-holders," thereby stripping them of the right to file for Corporate Insolvency Resolution Process (CIRP) under Section 7 of the IBC.

---

### NCLAT's Determination
The Bench presided by Justice Ashok Bhushan flatly rejected the developer's arguments, holding that:
* **No Merger of Status:** The recovery certificate or RERA decree does not wipe away the original transaction's character, which is a financial debt arising from an allotment of residential units.
* **Homebuyers' Protection:** Section 5(8)(f) of the IBC deems real estate allottees as financial creditors. This status is not dissolved by securing a decree in an attempt to recover their hard-earned money.

This ruling provides massive relief to thousands of stalled project buyers who are holding RERA decrees but cannot recover funds due to developer insolvency or non-cooperation.`,
    category: "IBC & Tax",
    subcategory: "NCLAT New Delhi",
    caseDetails: {
      caseName: "Pioneer Urban Land & Infrastructure v. Sanjay Gupta",
      citation: "2026 Spark Law (IBC) 124",
      bench: "Justice Ashok Bhushan (Chairperson), Barun Mitra (Technical Member)",
      date: "June 29, 2026",
      caseNumber: "Company Appeal (AT) (Insolvency) No. 711 of 2026"
    },
    author: "Manu Sebastian",
    publishedAt: "2026-06-29T14:40:00Z",
    imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    isBreaking: false,
    tags: ["NCLAT", "Homebuyers", "IBC", "RERA", "Insolvency"],
    views: 6540
  },
  {
    id: "art-4",
    title: "Bombay High Court Quashes IT Rules Amendment Permitting Govt 'Fact Check Unit' (FCU) To Identify Fake News",
    summary: "In a significant victory for free speech, the High Court struck down the IT Amendment Rules, 2023, observing that the State cannot act as the sole arbiter of truth.",
    content: `### The Constitutional Challenge
In a landmark 2:1 majority, the Bombay High Court has struck down the controversial **Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Amendment Rules, 2023**. 

The amendments had empowered the Union Government's Ministry of Information and Broadcasting to set up a **Fact Check Unit (FCU)** with absolute authority to declare any social media post or news article regarding the "business of the Central Government" as fake, false, or misleading. Under the rules, intermediaries (like X, Facebook, and Google) were forced to pull down such content to retain their safe harbor immunity.

---

### Key Legal Grounds Struck Down
1. **Unreasonable Restriction (Article 19(2)):** The court held that the right to criticize the government is vital to democracy. The state cannot bypass the narrow, constitutional limitations of Article 19(2) by establishing a unilateral administrative fact-checker.
2. **Vagueness and Overbreadth:** The terms "fake, false, or misleading" were found to be excessively vague, threatening to chill investigative journalism.
3. **Principles of Natural Justice:** Making the government the sole prosecutor, judge, and executioner of truth in its own matters violates the core doctrine of *nemo judex in causa sua*.

---

### Reaction from Legal Fraternity
Stand-up comedian Kunal Kamra and the Editors Guild of India, who filed the initial petitions, welcomed the judgment as a robust safeguard for digital journalism and citizen speech in India.`,
    category: "High Courts",
    subcategory: "Bombay High Court",
    caseDetails: {
      caseName: "Kunal Kamra v. Union of India",
      citation: "2026 Spark Law (Bom) 198",
      bench: "Justice G.S. Patel, Justice Neela Gokhale, Justice A.S. Chandurkar (Tie-Breaker)",
      date: "July 1, 2026",
      caseNumber: "Writ Petition No. 1211 of 2023"
    },
    author: "Sharanya Gopinathan",
    publishedAt: "2026-07-01T11:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1505664194779-8bebcb95df84?auto=format&fit=crop&q=80&w=800",
    isBreaking: true,
    tags: ["Bombay High Court", "IT Rules", "Fact Check Unit", "Free Speech", "Article 19"],
    views: 15300
  },
  {
    id: "art-5",
    title: "Shardul Amarchand Mangaldas Advises Adani Green Energy On $400M Co-Issuer Senior Secured Notes Offering",
    summary: "Leading corporate firm Shardul Amarchand Mangaldas & Co acted as local counsel for the multi-million dollar green bond issue on international exchanges.",
    content: `### Deal Announcement
**Shardul Amarchand Mangaldas & Co (SAM)** has advised Adani Green Energy Limited and its co-issuer subsidiaries on their highly anticipated offshore issuance of **$400 Million Senior Secured Notes** (Green Bonds) carrying a 6.7% coupon, listed on the India INX and SGX-ST.

The transaction represents one of the largest corporate green debt transactions in the South Asian renewable sector for the fiscal year 2026-27.

---

### Legal Team Representation
* **SAM Partners:** The capital markets practice group was led by senior partners Prashant Gupta and Monal Mukherjee.
* **International Counsel:** Linklaters LLP acted as the international legal advisor to the joint lead managers and bookrunners.
* **Lenders Counsel:** Cyril Amarchand Mangaldas advised the trustee and domestic lenders.

The proceeds are legally designated to finance and refinance eligible green energy initiatives, aligned with the company's commitment to scale carbon-neutral solar power grids across Gujarat and Rajasthan.`,
    category: "Corporate Law",
    subcategory: "Capital Markets",
    author: "Nupur Dogra",
    publishedAt: "2026-06-30T09:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
    isBreaking: false,
    tags: ["Capital Markets", "Shardul Amarchand Mangaldas", "Green Bonds", "Adani Green"],
    views: 4200
  },
  {
    id: "art-6",
    title: "National Law School Of India University (NLSIU) Bangalore Announces Fully Funded PhD Fellowships In Constitutional Law",
    summary: "NLSIU has invited applications for the 2026-27 academic session for researchers pursuing advanced doctrines in administrative and comparative constitutional law.",
    content: `### Academic Call for Papers & Fellowships
The **National Law School of India University (NLSIU), Bangalore**, has announced the launch of its premier **Constitutional Law PhD Fellowships** for the academic session 2026-27. 

The fully-funded fellowships are sponsored by the *Constitutional Law Trust of India* and aim to encourage high-impact academic research addressing the structural challenges of federalism, judicial appointments, and digital privacy doctrines.

---

### Fellowship Provisions
* **Stipend:** INR 65,000 per month for the first two years, escalating to INR 75,000 for the final year.
* **Research Grant:** Annual contingency grant of INR 1.5 Lakhs for international library access and legal archive research.
* **Mentorship:** Fellows will be directly supervised by NLSIU faculty alongside international visiting professors from Oxford and Harvard Law Schools.

---

### Eligibility Criteria
1. LL.M. degree from a recognized university with a minimum of 60% aggregate marks.
2. Submission of a 3,000-word robust research proposal focusing on comparative administrative or constitutional law.
3. The deadline for receipt of applications is **August 15, 2026**. Interested candidates can apply directly on the NLSIU admissions portal.`,
    category: "Law Schools",
    subcategory: "NLSIU Bangalore",
    author: "Rithika Siddhartha",
    publishedAt: "2026-07-03T07:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800",
    isBreaking: false,
    tags: ["NLSIU Bangalore", "PhD Fellowship", "Constitutional Law", "Law School Admissions"],
    views: 5900
  },
  {
    id: "art-7",
    title: "The Illusion Of Speedy Justice: Assessing The Staggering Backlog In District Judiciaries",
    summary: "An in-depth statistical analysis of the National Judicial Data Grid highlights why systemic vacancies are stalling the delivery of justice at the grassroots level.",
    content: `### The Staggering Reality
While the Supreme Court and High Courts command media spotlight, the true battleground of Indian justice is fought in the overcrowded corridors of our **District and Sessions Judiciaries**. 

According to recent data fetched from the **National Judicial Data Grid (NJDG)**, over **4.4 Crore (44 million) cases** are currently pending across subordinate courts in India. Out of these, nearly **10%** have been languishing for over a decade.

---

### Root Causes of Backlog
Our legal analysis reveals three major choke points:

1. **Judge-to-Population Ratio:** India has roughly 21 judges per million people, compared to over 100 in countries like the United States or Germany.
2. **Infrastructure Deficit:** Over 30% of district courtroom structures operate without dedicated digital video conferencing facilities, forcing physically taxing and slow manual procedures.
3. **State as the Prolific Litigant:** The government is party to nearly 46% of all pending civil suits, frequently filing redundant appeals against well-settled legal principles.

---

### Recommended Remedial Roadmap
To break the logjam, we must implement direct reforms:
* **All-India Judicial Services (AIJS):** Establish a centralized service examination to attract highly competitive, talented young lawyers straight to district benches.
* **Pre-Institution Mediation:** Mandate commercial and domestic disputes to undergo certified mediation prior to court registry filings.
* **Technology Overhaul:** Digitize evidence filing systems so that witnesses can depose remotely without trial delays.`,
    category: "Opinions & Columns",
    subcategory: "Judicial Reforms",
    author: "Prashant Bhushan",
    publishedAt: "2026-06-28T05:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?auto=format&fit=crop&q=80&w=800",
    isBreaking: false,
    tags: ["Judicial Backlog", "District Courts", "Law Reforms", "NJDG"],
    views: 11200
  },
  {
    id: "art-8",
    title: "Khaitan & Co Invites Applications For Senior Associate Position In Competition Law Practice (Mumbai/Delhi)",
    summary: "Khaitan & Co is hiring experienced litigation and advisory professionals with 5+ years of PQE in merger control and abuse of dominance filings.",
    content: `### Job Opportunity
**Khaitan & Co**, one of India's oldest and most prestigious full-service corporate law firms, is currently accepting applications for the position of **Senior Associate** within its tier-1 **Competition Law & Antitrust** practice group.

The role will involve advising Fortune 500 corporations on complex merger control filings before the Competition Commission of India (CCI) and representing clients in enforcement litigations.

---

### Role & Responsibilities
* Draft, structure, and file merger notifications (Form I and Form II) with the CCI.
* Formulate litigation defense briefs for alleged anti-competitive cartels and abuse of dominance investigations.
* Lead and manage junior associates on high-priority transactional due diligences.
* Coordinate seamlessly with international co-counsels on cross-border antitrust filings.

---

### Candidate Qualifications
* **Experience:** Minimum of 5 to 7 years of Post Qualification Experience (PQE) exclusively in competition law practice.
* **Education:** LL.B. or LL.M. from a top-tier domestic or international law school.
* **Skills:** Exceptionally sharp analytical mind, robust drafting command, and comfortable interfacing with regulatory bodies.

### How to Apply
Eligible candidates can submit their updated Curriculum Vitae alongside a cover letter summarizing relevant deal experience to **careers@khaitanco.com** with the subject line *"Application: Sr. Associate - Competition Law"*.`,
    category: "Legal Jobs",
    subcategory: "Law Firm Careers",
    author: "Spark Law Careers Desk",
    publishedAt: "2026-07-05T01:00:00Z",
    imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
    isBreaking: false,
    tags: ["Khaitan & Co", "Legal Jobs", "Competition Law", "Antitrust", "Associate Careers"],
    views: 7400
  }
];
