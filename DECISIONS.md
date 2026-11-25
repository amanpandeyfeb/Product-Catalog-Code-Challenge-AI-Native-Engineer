# Decisions and assumptions

## Implementation decisions

- **Backend as the integration boundary:** The React client uses the application API, and the Node.js backend calls Fake Store. This keeps the external product contract out of the UI and gives the application one place for catalogue rules and input validation.
- **Small, replaceable integrations:** Product fetching and email sending are isolated in their own modules. The app factory accepts these dependencies so route tests can use fakes without relying on external services.
- **State proportional to the problem:** React Context shares categories, while search uses URL parameters. This avoids adding Redux for a small amount of shared state and makes searches shareable.
- **Fast local setup:** npm workspaces run the client and backend together; Mailpit provides a local SMTP inbox without a paid email account. Browsing does not depend on Mailpit being running.
- **Focused verification:** Tests cover catalogue ranking and search, backend routes with fake dependencies, and client API requests. Builds and tests are run locally; browser-level automation remains a follow-up.

## Assumptions

- **"Top rated"** means the highest Fake Store `rating.rate`. Products without a rating rank after rated ones, ordered by price (highest first). Ties are broken by product ID. The brief does not say how the 5 products are "chosen", so this rule stands in for a curated list.
- **Home (Discover)** shows the 5 top-ranked products. **Category** pages show the top 3 as highlights, then the remaining products in that category. The **Trending** view lists all products in the same ranking.
- **Search** is a case-insensitive substring match against title, description and category. Empty searches are not submitted.
- **Enquiry** needs a name, a valid email and a message (10+ characters); phone is optional. It refers to the product being viewed. The sales inbox is configured with `SALES_INBOX`.
- **"Thank you"** is shown after the mail server accepts the message. The customer's email is used as the reply-to address; no confirmation email is sent to the customer, since the brief only asks for an on-page message.
- **Navigation:** a product page returns to the listing the customer came from (Discover, a category, or search) and links to its own category.

## Simplified or dropped

- Read-only catalogue from Fake Store: no database, admin, accounts, checkout or inventory, none of which is requested.
- Enquiries are emailed but not stored. If the email fails, the enquiry is lost.
- Email uses Mailpit locally and can use Amazon SES in the optional AWS deployment. Delivery monitoring remains a follow-up.
- The optional AWS infrastructure is separate from local setup and is not required by reviewers.
- The look and feel is an initial direction, because the brief says creative work is happening separately.

## How the design can grow

- `Backend/src/fakeStore.ts` is the only code that knows about Fake Store. Replacing it with a database or another supplier keeps the API and client unchanged.
- `Backend/src/emailSender.ts` is the only code that sends email, so a different provider is a small change.
- The client only calls `/api` (see `client/src/api.ts`); the base URL can be set with `VITE_API_BASE_URL`, for example to point at a deployed API.
- `createApp()` in `Backend/src/app.ts` accepts its product source and email sender, which makes route tests possible and makes swapping them easy.
- `Backend/src/lambda.ts` adapts the Express app for AWS Lambda; API Gateway forwards requests to the same routes.

## Known limits

- Search and the featured list fetch the whole product list from Fake Store on every request, then filter in Node. Fine for about 20 products; a larger catalogue needs pagination, caching or a search-capable store.
- The Fake Store API is a public demo service and may be slow or unavailable. The API returns a generic error in that case.
- The local enquiry endpoint has no rate limiting. API Gateway applies basic shared throttling in AWS, but additional abuse protection is needed.

## What I would do with another day

- Add browser-level tests for the main customer flows.
- Add pagination and caching for product data.
- Add a confirmation email to the customer, and rate limiting or spam protection on enquiries.
- Confirm the production email provider and product source with the entrepreneur, and add delivery monitoring.
- Add browser-level deployment smoke tests and a rollback strategy.

## Time spent

Approximately 2-3 hours in total, including planning, implementation, testing and review.
