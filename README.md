# ☁️ AWS Certified Solutions Architect Associate (SAA-C03) Practice Exam & Quiz Platform

An interactive, high-performance study and exam simulation platform built from the official 684-question exam dump and detailed solution rationales.

---

## 🚀 Quick Start

### 1. Launch the Modern Web Practice Application (Recommended)

From the project root:

```bash
# Run the local development server (Vite + React)
npm run dev
```

Then open your browser at **`http://localhost:5173`** (or network URL shown in console).

Alternatively, to serve the pre-compiled production build:
```bash
npm run preview
# or serve directly with Python:
python3 -m http.server 3000 --directory web/dist
```

---

### 2. Practice in your Terminal (CLI Quiz Runner)

If you prefer studying directly from your command-line terminal:

```bash
# Start from Question #1
python3 scripts/cli_quiz.py

# Or jump directly to a specific question (e.g. Question 142)
python3 scripts/cli_quiz.py --jump 142

# Or run with randomized questions
python3 scripts/cli_quiz.py --random
```

---

## 🎯 Key Features

### 1. Three Dedicated Practice Modes
- **📖 Practice Mode (Default):**
  - Instant visual feedback on every selection.
  - Correct answer highlighted in **Green**, incorrect choices in **Red**.
  - Architectural breakdown and AWS explanation unfolds immediately.
  - Retry / re-attempt questions anytime.
- **🏆 Exam Simulation Mode:**
  - 65 questions randomly drawn across all AWS domains.
  - Official 130-minute countdown timer with pause/resume controls.
  - Pass/Fail grading based on the official AWS scaled score model (100–1000 scale, 720 pass threshold).
  - Full domain-by-domain performance analysis and question review upon submission.
- **🔖 Review & Mistakes Mode:**
  - Automatically isolates questions you answered incorrectly or flagged for review.
  - Strengthen weak areas before your test date.

### 2. Rich Navigation & Search
- **Quick Jump:** Type any question number (1 to 684) and press enter to jump instantly.
- **Keyword & Service Search:** Search across all questions by service name (e.g., `DynamoDB Accelerator`, `Transit Gateway`, `Aurora Serverless`, `Snowball`).
- **Domain Filter:** Filter by AWS Architectural domains:
  - *Storage* (S3, EBS, EFS, Glacier, Storage Gateway, FSx)
  - *Compute* (EC2, Lambda, ECS, EKS, Fargate, Batch, Auto Scaling)
  - *Database* (RDS, DynamoDB, Aurora, Redshift, ElastiCache, DocumentDB)
  - *Networking & Content Delivery* (VPC, Route 53, Direct Connect, CloudFront, ALB/NLB)
  - *Security, Identity & Compliance* (IAM, KMS, WAF, Shield, Secrets Manager, Cognito)
  - *Application Integration & Serverless* (SQS, SNS, EventBridge, Step Functions)
  - *Management & Governance* (CloudWatch, CloudTrail, Organizations, Systems Manager)

### 3. Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `A`, `B`, `C`, `D`, `E` | Select / toggle option |
| `Enter` | Submit / Check answer |
| `→` or `K` | Next question |
| `←` or `J` | Previous question |
| `B` or `F` | Bookmark / Flag question |
| `Q` | Open / close Question Navigator drawer |
| `?` | Show Keyboard Shortcuts help dialog |
| `Esc` | Close open dialogs or drawers |

### 4. Progress Persistence (`localStorage`)
Your practice history, submitted answers, flags/bookmarks, and dark/light mode preferences are automatically preserved in your browser's local storage—so your study progress is never lost across tab closes or reboots.

---

## 📁 Repository Structure

```
aws-saa-c03/
├── data/
│   └── questions.json                # Normalized JSON dataset (all 684 questions, choices, answers, explanations)
├── scripts/
│   ├── parse_dataset.py              # Parser extracting from PDF and Solution.txt with domain classification
│   └── cli_quiz.py                   # Terminal CLI quiz practice tool
├── web/                              # Modern React + Tailwind CSS Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Header, mode switcher, exam timer, stats
│   │   │   ├── QuestionCard.tsx      # Interactive question card with instant answer reveal
│   │   │   ├── QuestionDrawer.tsx    # Slide-over navigator with 684-question grid and search
│   │   │   ├── ExamSummaryModal.tsx  # Exam score calculation, domain breakdown, pass/fail
│   │   │   └── KeyboardHelpModal.tsx # Shortcuts reference dialog
│   │   ├── App.tsx                   # Main state & study engine
│   │   ├── types.ts                  # TypeScript definitions
│   │   └── index.css                 # Custom styling
│   └── dist/                         # Compiled, production-ready static assets
├── resources/                        # Source materials (PDF & Solution.txt)
└── package.json                      # Root scripts (npm run dev, npm run build, npm run cli)
```

---

## 🛠️ Data Pipeline & Integrity

The dataset (`data/questions.json`) was extracted from the resources repository and verified with 100% test coverage:
- **684 / 684** questions extracted with complete scenarios and multiple choices.
- Fixed mistyped numbering (Question #315).
- Filled in solutions and architectural explanations for questions #191–#200 and image-based questions #423, #429, #477.
- Verified single-select (598 questions) and multi-select (86 questions with "Choose two" or "Choose three").

To regenerate the dataset from scratch anytime:
```bash
python3 scripts/parse_dataset.py
```
