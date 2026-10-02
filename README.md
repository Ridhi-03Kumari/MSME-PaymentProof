# PaymentProof

> **Turn scattered payment documents into clear next actions.**

An evidence-backed receivables assistant for Indian MSMEs.

---

## Demo video

**Demo video: To be added before submission.**

---

## Problem

Indian Micro, Small and Medium Enterprises (MSMEs) lose thousands of crores every year to delayed payments. The core challenge is not just slow payers — it is that businesses lack:

- A single place to track all outstanding invoices and their deadlines
- Clear visibility into which invoices have complete evidence and which do not
- A fast way to calculate overdue days and draft professional follow-up messages

Without complete evidence — invoice, purchase order, proof of delivery — payment reminders carry less weight and disputes are harder to resolve.

---

## Solution

PaymentProof is an administrative document and deadline assistant that helps MSMEs:

1. **Upload** invoices and supporting documents (PO, proof of delivery)
2. **Extract** key fields automatically (invoice number, amount, payment terms)
3. **Calculate** due dates and overdue days using deterministic rules — not AI
4. **Track** evidence completeness per invoice
5. **Draft** professional, human-reviewed follow-up messages ready to send

> ⚠️ PaymentProof is an administrative document and deadline assistant. It does not provide legal, tax, accounting, or financial advice. Verify all information before taking action.

---

## Target users

- Indian MSMEs with B2B receivables
- Small business owners managing 5–50 outstanding invoices
- Finance teams tracking payment compliance

---

## MVP features

| Feature | Status |
|---|---|
| Landing page with demo data loader | ✅ |
| Dashboard with summary cards | ✅ |
| Invoice table with search and filters | ✅ |
| Invoice upload (PDF, JPG, PNG) | ✅ |
| Document extraction (mock / AWS Textract) | ✅ |
| Field confirmation with confidence levels | ✅ |
| Deterministic due-date and overdue calculation | ✅ |
| Evidence checklist per invoice | ✅ |
| Invoice detail page with timeline | ✅ |
| Editable follow-up draft | ✅ |
| Mark as paid | ✅ |
| Delete invoice | ✅ |
| Synthetic demo data (3 invoices) | ✅ |
| Demo data mode banner | ✅ |
| AWS adapter interfaces (swap-ready) | ✅ |
| AWS SAM infrastructure template | ✅ |
| Responsive design | ✅ |
| Accessible form labels and keyboard navigation | ✅ |

---

## Local setup

### Prerequisites

- Node.js 20+
- npm 9+

### Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

Click **Load Demo Data** on the landing page or dashboard to see three synthetic invoices.

### Run tests

```bash
cd frontend
npm run test
```

### Type-check

```bash
cd frontend
npm run type-check
```

### Build

```bash
cd frontend
npm run build
```

---

## AWS deployment setup

### Prerequisites

- AWS CLI configured (`aws configure`)
- AWS SAM CLI installed (`brew install aws-sam-cli` or see [AWS docs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html))
- Node.js 20

### 1. Build the backend

```bash
cd backend
npm install
npm run build
```

### 2. Deploy with SAM

```bash
cd infrastructure
sam deploy --guided
```

Follow the prompts. SAM will create:
- S3 private document bucket
- DynamoDB invoice table
- Lambda functions (7 handlers)
- API Gateway with Cognito authorizer
- CloudWatch log groups and alarms

### 3. Configure the frontend

Copy `.env.example` to `.env` and fill in the values from the SAM deployment outputs:

```bash
cp infrastructure/.env.example frontend/.env.local
# Edit frontend/.env.local with the SAM output values
```

Set `VITE_DEMO_MODE=false` to connect to real AWS services.

### 4. Deploy the frontend

Connect the repository to **AWS Amplify Hosting**:

1. Go to AWS Amplify Console
2. Connect your Git repository
3. Use `infrastructure/amplify.yml` as the build specification
4. Add the environment variables from `.env.local`
5. Deploy

The `infrastructure/amplify-rewrites.json` content must be added in Amplify → Rewrites and redirects to support client-side routing.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User's browser                    │
│           React + TypeScript + Vite SPA             │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│              AWS Amplify Hosting                    │
│            (Static site + CDN)                      │
└────────────────────────┬────────────────────────────┘
                         │ API calls
┌────────────────────────▼────────────────────────────┐
│           Amazon API Gateway (REST)                 │
│      Cognito JWT authorizer on all routes           │
└──┬──────────┬────────────┬───────────┬──────────────┘
   │          │            │           │
   ▼          ▼            ▼           ▼
Lambda     Lambda       Lambda      Lambda
GetUpload  ListInvoices  Process    Generate
  URL                   Invoice    Reminder
   │          │            │
   ▼          ▼            ▼
┌──────────┐ ┌──────────┐ ┌──────────────────────────┐
│ Amazon   │ │ Amazon   │ │    Amazon Textract        │
│    S3    │ │DynamoDB  │ │  (document extraction)   │
│(private) │ │          │ └──────────────────────────┘
└──────────┘ └──────────┘
                          ┌──────────────────────────┐
                          │   Amazon CloudWatch      │
                          │  (logs + alarms)         │
                          └──────────────────────────┘
                          ┌──────────────────────────┐
                          │   Amazon Cognito         │
                          │  (user auth + JWT)       │
                          └──────────────────────────┘
```

### Local / Demo mode

In local mode (default), all AWS services are replaced by clean mock adapters:

| AWS Service | Mock Adapter |
|---|---|
| Amazon S3 | `MockStorageAdapter` |
| Amazon DynamoDB | `MockInvoiceRepository` |
| Amazon Textract | `MockDocumentExtractor` |
| Amazon Cognito | `MockAuthAdapter` |

The frontend displays a **DEMO DATA MODE** banner when running in local mode.

---

## AWS services and roles

| Service | Role in PaymentProof |
|---|---|
| **AWS Amplify Hosting** | Hosts and serves the React frontend globally via CDN |
| **Amazon API Gateway** | REST API entry point with rate limiting and CORS |
| **AWS Lambda** | Serverless compute for all business logic (7 functions) |
| **Amazon DynamoDB** | Stores invoice records, evidence, and metadata |
| **Amazon S3** | Private document storage (invoices, POs, delivery proofs) |
| **Amazon Textract** | Extracts structured data (fields, tables) from invoice PDFs and images |
| **Amazon Cognito** | User authentication and JWT authorization |
| **Amazon CloudWatch** | Lambda and API logs, error alarms, tracing |
| **AWS SAM** | Infrastructure as Code for all backend resources |
| **AWS X-Ray** | Distributed tracing for Lambda functions |

---

## API routes

| Method | Path | Description |
|---|---|---|
| `POST` | `/invoices/upload-url` | Get a short-lived S3 presigned upload URL |
| `POST` | `/invoices/{invoiceId}/process` | Run Textract extraction and save invoice |
| `GET` | `/invoices` | List all invoices for the authenticated user |
| `GET` | `/invoices/{invoiceId}` | Get a single invoice |
| `PATCH` | `/invoices/{invoiceId}` | Update invoice fields |
| `DELETE` | `/invoices/{invoiceId}` | Delete invoice and documents |
| `POST` | `/invoices/{invoiceId}/reminder` | Generate a follow-up draft |

---

## Environment variables

| Variable | Description | Required for |
|---|---|---|
| `VITE_API_BASE_URL` | API Gateway endpoint URL | AWS mode |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID | AWS mode |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID | AWS mode |
| `VITE_COGNITO_REGION` | AWS region for Cognito | AWS mode |
| `VITE_DEMO_MODE` | Set `true` for local mock mode | Always |
| `INVOICES_TABLE` | DynamoDB table name (Lambda) | AWS Lambda |
| `DOCUMENTS_BUCKET` | S3 bucket name (Lambda) | AWS Lambda |
| `CORS_ORIGIN` | Allowed frontend origin (Lambda) | AWS Lambda |

See `infrastructure/.env.example` for a full template.

> ⚠️ Never commit `.env` or `.env.local` to version control. They are listed in `.gitignore`.

---

## Testing commands

```bash
# Run all unit tests
cd frontend && npm run test

# TypeScript type check
cd frontend && npm run type-check

# Lint
cd frontend && npm run lint

# Build (production)
cd frontend && npm run build

# Backend type check
cd backend && npm run type-check
```

### Test coverage

Unit tests cover:

- Due-date calculation (multiple date scenarios)
- Days-overdue calculation
- Due-soon status (within 7 days)
- Overdue status detection
- Missing payment terms → needs_confirmation
- Missing proof of delivery warning
- Loading demo data (3 invoices)
- Invoice status verification for all 3 demo invoices
- Reminder draft generation (with and without due date)
- Indian number formatting

---

## Privacy and security

- **Private S3 bucket** — no public access. All objects are private by default.
- **Short-lived presigned URLs** — upload and download URLs expire in 5 minutes.
- **User ownership checks** — Lambda functions verify the file key matches the authenticated user's ID before any S3 or DynamoDB operation.
- **Input validation** — file type (PDF/JPG/PNG only), file size (10 MB max), field sanitization in all Lambda handlers.
- **No secrets in source code** — all credentials and ARNs come from environment variables.
- **No secrets in Git** — `.env`, `.env.local`, and `samconfig.toml` are gitignored.
- **No permanent document URLs** — documents are only accessible via time-limited presigned URLs.
- **Delete functionality** — users can delete their invoices at any time.
- **Least-privilege IAM** — Lambda functions only have the minimum permissions needed (see `infrastructure/policies/`).
- **Cognito JWT authorization** — all API routes are protected by Cognito user pool authorizer.
- **HTTPS only** — S3 bucket policy denies non-SSL access.
- **DynamoDB encryption at rest** — SSE enabled on the invoice table.

### Privacy notice

Documents uploaded to PaymentProof are stored privately in your AWS S3 bucket. In Demo mode, no real documents are uploaded or stored. Synthetic demo data contains only fictional invoice information.

---

## AI limitations

PaymentProof uses **deterministic application code** (not AI) for all financial calculations:

- Due dates are calculated as: Invoice date + Payment terms (days)
- Overdue days are calculated as: Today − Due date
- Invoice status is determined by fixed rules, not machine learning

The Amazon Textract adapter performs optical character recognition (OCR) to extract text from uploaded documents. This is not generative AI — it reads text from documents. Extracted values always show a confidence level, and users must confirm any uncertain fields before the invoice is saved.

PaymentProof does **not**:
- Use large language models for calculations
- Automatically determine legal status
- Provide legal, tax, accounting, or financial advice
- Automatically send reminder messages

---

## Synthetic data notice

Demo data (loaded by the "Load demo data" button) contains **three fictional invoices** with made-up company names, amounts, and dates. This data does not represent any real business, transaction, or legal document. It is included solely to demonstrate the application's features.

A visible label "**Synthetic demo data — not real customer information.**" is shown whenever demo data is active.

---

## Credits and licenses

- **React** — MIT License, Meta Platforms
- **Vite** — MIT License
- **Tailwind CSS** — MIT License
- **React Router** — MIT License, Remix Software
- **AWS SDK for JavaScript v3** — Apache 2.0, Amazon Web Services
- **Vitest** — MIT License

---

## Known limitations

1. **Demo mode only** — AWS integration requires manual configuration of credentials and SAM deployment. The application ships in demo mode by default.
2. **No real-time sync** — In demo mode, data is held in memory and resets on page refresh.
3. **Textract field mapping** — The Textract parser uses heuristic key name matching. Unusual invoice formats may require manual field entry.
4. **No multi-user** — The demo mode has a single shared in-memory store. AWS mode supports multi-user via Cognito.
5. **No automatic reminders** — Follow-up drafts must be copied and sent manually. Automated sending is not implemented (by design, to keep humans in the loop).
6. **Currency** — Currently optimized for INR (Indian Rupee). Other currencies display correctly but the number formatter uses the Indian locale.

---

## Future improvements

- [ ] Amazon Bedrock integration for smarter reminder tone suggestions
- [ ] AWS Step Functions for multi-step document processing pipeline
- [ ] Amazon EventBridge + SNS for automated reminder scheduling (human-approved)
- [ ] Bulk invoice upload
- [ ] PDF generation for formal demand letters
- [ ] MSME Samadhaan portal integration reference
- [ ] Export to CSV / Excel
- [ ] Payment receipt matching
- [ ] Multi-currency support
- [ ] Mobile app (React Native)

---

## Project structure

```
paymentproof/
├── frontend/                    # React + TypeScript + Vite + Tailwind
│   ├── src/
│   │   ├── types/               # TypeScript data model
│   │   ├── data/                # Synthetic demo data
│   │   ├── lib/                 # Calculation engine
│   │   ├── adapters/            # Mock + AWS adapter interfaces
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Landing, Dashboard, InvoiceDetail, Upload
│   │   ├── context/             # App-wide React context
│   │   └── test/                # Unit tests (Vitest)
│   └── package.json
├── backend/                     # AWS Lambda functions (Node.js + TypeScript)
│   └── src/
│       ├── handlers/            # API Gateway Lambda handlers
│       └── lib/                 # Shared utilities and business logic
├── infrastructure/              # AWS SAM template + IAM policies
│   ├── template.yaml            # SAM CloudFormation template
│   ├── amplify.yml              # Amplify build spec
│   ├── policies/                # IAM policy documents
│   └── .env.example             # Environment variable template
└── README.md
```
