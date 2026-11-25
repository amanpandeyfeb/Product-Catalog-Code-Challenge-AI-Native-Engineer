# ShopYourself Product Catalogue

A product catalogue proof of concept for the AI-Native Engineer code challenge. Customers can browse featured products, filter by category, search, view a product, and send an enquiry that is emailed to a sales inbox.

## Technology choices and why

- **Client: React 19 + TypeScript (Vite).** The brief prefers TypeScript, and sharing one language with the backend keeps the types and tooling consistent. Vite gives a fast dev server.
- **Backend: Node.js + TypeScript (Express).** The browser only ever calls this API. The backend adapts the Fake Store API, so the product source can be swapped without touching the client. It also owns search, category filtering, validation and email.
- **Product data: [Fake Store API](https://fakestoreapi.com/docs)**, isolated in `Backend/src/fakeStore.ts`.
- **Email: Nodemailer over SMTP**, isolated in `Backend/src/emailSender.ts`. Locally it points at [Mailpit](https://github.com/axllent/mailpit), a free test inbox, so no paid service or account is needed.
- **State:** React Context shares the category list; the search term lives in the URL (`/search?q=...`). Redux is not used because there is little shared client state.

## Run it locally

### 1. Prerequisites

- [Node.js 24 or later](https://nodejs.org/) (includes npm)
- Optional, only to receive enquiry emails: Docker, or the standalone Mailpit program (step 3)

### 2. Install and start the app

Open a terminal in the repository root and run:

```bash
npm install
npm run dev
```

This starts the backend (port `3001`) and the frontend together. Open the address Vite prints, usually <http://localhost:5173> (it may pick another port, such as `5174`, if that one is busy). Keep this terminal open; press `Ctrl+C` to stop.

No `.env` file is needed for local use because the defaults match `Backend/.env.example`. To change settings, copy that file to `Backend/.env` and edit it.

### 3. Start the email inbox (needed for enquiry emails)

Browsing, category filtering, search and product pages work without this step. Submitting an enquiry needs an SMTP server on port `1025`. Open a **second** terminal and use one option:

**Option A: Docker**

```bash
docker compose up -d mailpit
```

**Option B: standalone Mailpit (no Docker)**

Download the program for your system from [Mailpit releases](https://github.com/axllent/mailpit/releases/latest), extract it, and run it. On Windows PowerShell, if it is extracted to `%LOCALAPPDATA%\Programs\Mailpit`:

```powershell
& "$env:LOCALAPPDATA\Programs\Mailpit\mailpit.exe"
```

Keep it running. Mailpit receives mail on port `1025` and shows it at <http://localhost:8025>. Stop it with `Ctrl+C` (Option B) or `docker compose down` (Option A).

### 4. Check that everything works

1. **Discover** shows 5 featured products.
2. Click **Category**, then pick a category: the top-rated products appear first, followed by the rest.
3. Type a term (for example `ring`) in the search bar and press the search button: only matching products appear.
4. Click a product tile to open its details page.
5. Click **Enquire**, fill in the form and submit: a "Thank you" message appears and the email shows in Mailpit at <http://localhost:8025>, addressed to `sales@catalog.local`.

If the enquiry shows an error, check that Mailpit is running.

## Test and build

```bash
npm test
npm run build
```

- `Backend/tests`: unit tests for ranking and search, and HTTP route tests that use fake product and email services (no internet or Mailpit needed).
- `client/tests`: tests that the client calls only the backend, with correct URLs and error handling.

## Optional AWS deployment with Jenkins

Local development does not require AWS, Terraform or Jenkins. The optional deployment in `terraform/` serves the client from private S3 through CloudFront and forwards `/api/*` to API Gateway and Lambda on the same domain. Lambda uses Amazon SES for enquiries. AWS resources and usage may incur charges.

To configure a production Jenkins multibranch pipeline:

1. Prepare a Jenkins agent labelled `linux` with Node.js 24, npm, Terraform 1.10 or later, `zip` and `unzip`. Prepare a separate agent labelled `production-deploy` with Terraform and AWS CLI. Create a multibranch pipeline pointing at this repository and its `Jenkinsfile`.
2. Provide the deployment agent with an AWS role or other securely managed credentials that can manage the Terraform resources, upload to the website bucket and invalidate CloudFront. Do not commit credentials. Restrict access to the deployment agent, production credentials and approval step to trusted jobs and users; do not expose them to untrusted pull request builds.
3. Create a separate, versioned S3 bucket for Terraform state, with access restricted to the deployment role. Configure Jenkins environment variables `TF_STATE_BUCKET` and `TF_STATE_REGION` for that bucket. Terraform uses an S3 lock file; the role also needs permission to read and write it. The state bucket is not created by this Terraform configuration.
4. Verify the sender identity in SES in the deployment region and configure Jenkins environment variables `TF_VAR_aws_region`, `TF_VAR_mail_from`, `TF_VAR_sales_inbox` and `TF_VAR_ses_identity_arn`. See `terraform/production.example.tfvars` for example values. SES sandbox accounts also require verified recipients; request production access before sending to unverified recipients.
5. Run the `main` branch pipeline. It installs dependencies, tests, builds, packages Lambda and validates Terraform. To deploy, enable `DEPLOY_PRODUCTION`, review the Terraform plan in the console, and approve the deployment. The pipeline applies the plan, uploads the frontend and invalidates CloudFront. The final output is the website URL.

The initial deployment can take several minutes. API Gateway's direct endpoint remains public; its throttling applies to direct requests too. This is a starting point, not a complete production security setup: add abuse protection, monitoring, a deployment rollback strategy and a custom domain as needed. Test a real enquiry after deployment; SES acceptance does not guarantee delivery.

## Project structure

```text
Backend/src   index.ts (server), app.ts (routes, validation), catalog.ts (ranking and search),
              fakeStore.ts (product source), emailSender.ts (email)
Backend/tests API unit and route tests
client/src    pages/, components/, hooks/ (data loading), utils/, api.ts (backend client)
client/tests  client API tests
```

## API routes

- `GET /api/products/featured`: the 5 featured products. Products with a rating rank first by rating; products without one are ranked by price.
- `GET /api/products`: all products, ranked the same way (used by the "Trending" view).
- `GET /api/categories`: category names, each with its product count.
- `GET /api/categories/:category/products`: products in a category, ranked.
- `GET /api/products/search?q=...`: products whose title, description or category contains the term.
- `GET /api/products/:id`: one product.
- `POST /api/enquiries`: validates an enquiry and emails the sales inbox.

## More information

- [DECISIONS.md](DECISIONS.md): assumptions, simplifications, growth path, and next steps.
- [AI_USAGE.md](AI_USAGE.md): how AI was used and reviewed.
- [instruction.md](instruction.md): the project guidance given to AI tools.
