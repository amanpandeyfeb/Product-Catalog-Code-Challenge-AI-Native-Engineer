# AI usage notes

## Tools and models

- GitHub Copilot Chat in VS Code (agent mode), using Claude Sonnet 5.5, Auto to explain the challenge, plan, write code and docs, and run builds and tests.
- Node.js/npm for builds and tests; the Fake Store API docs for the product contract.

## Agent instruction files

- [instruction.md](instruction.md) describes the folder layout, API boundary, state approach and testing expectations.

## Plan

No separate spec file. The working plan was:

1. Read the brief and list assumptions.
2. Build the backend boundary (product source adapter, ranking, search, enquiry endpoint).
3. Build the React pages, shared search and category navigation.
4. Add tests, then documentation.

## Prompts and decisions that shaped the solution

The following are representative summaries of the prompts and follow-up requests, not verbatim transcripts:

- **Understand the brief:** "Explain the challenge step by step and identify the requirements, assumptions, and deliverables before writing code."
- **Design the architecture:** "Build a React and TypeScript frontend with a Node.js backend. Keep Fake Store and email integrations separate, and ensure the frontend calls only our backend."
- **Choose state management:** "For this app, should I use React Context? Keep shared state simple and make search URLs shareable."
- **Implement the catalogue:** "Show five featured products, rank category products by rating, and use price to order products without ratings. Add search and product detail pages."
- **Test and improve:** "Add focused tests for ranking, search, API routes, and client requests. Run the tests and build, investigate failures, and check dependencies for vulnerabilities."

I used follow-up requests and test/build results to review and refine the generated work. The AI also helped explain possible AWS deployment, authentication and payment approaches; those are ideas for future work, not implemented features.

## Where the AI got something wrong, and how it was caught

- **Missing Vite types:** the first client build failed with `Property 'env' does not exist on type 'ImportMeta'`. Fixed by adding `vite-env.d.ts`.
- **Wrong test expectation:** a generated test expected `method: undefined` on a GET request. The failing test run showed the client omits it; the assertion was corrected.
- **Vulnerable dependencies:** `npm audit` flagged the first versions chosen for `nodemailer` and `vitest`. They were upgraded and the audit now reports none.
- **Folder move error:** renaming `server` to `Backend` with one command failed partway and the old folder's files had to be recreated. Caught by listing the directory.
- **Config path:** `.env` was resolved relative to where the command ran, so it would not load from the repository root. Found while reviewing the start command; now resolved relative to the backend file.
- **Test runner:** Node's built-in TypeScript test mode could not resolve the `.js` import paths in the new route tests. Switched the backend tests to `tsx`.

## Time spent

Approximately 1.5 hours in total, including planning, implementation, testing and review.
