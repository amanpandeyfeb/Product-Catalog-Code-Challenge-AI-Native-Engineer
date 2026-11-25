# Project instructions

- Keep the React application in `client` and the Node.js/TypeScript API in `Backend`.
- Keep implementation code under each workspace's `src` directory and tests under its `tests` directory.
- In the client, keep route pages in `client/src/pages`, shared UI in `client/src/components`, and reusable data/state hooks in `client/src/hooks`.
- The browser must use the backend API; never call Fake Store API directly from client code.
- Keep product-provider logic in `Backend/src/fakeStore.ts` and email delivery in `Backend/src/emailSender.ts`.
- Preserve the API boundary when changing the product source or email provider.
- Use TypeScript strict mode, validate external input, and return useful errors without exposing internals.
- Keep search URL-driven and share the app-wide category list through React Context. Do not add Redux unless the client develops substantially more shared state.
- Run `npm test` and `npm run build` after code changes.
- Do not commit `.env` files or credentials. Update `.env.example` when configuration changes.