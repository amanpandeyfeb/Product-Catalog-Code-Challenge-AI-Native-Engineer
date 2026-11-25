import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: ReactNode; description: string }) {
  return <header className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></header>;
}

export function LoadingState() {
  return <div className="state-message" role="status"><span className="loader" /> Gathering the collection...</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="state-message state-message--error" role="alert">{message} Check your connection and try again.</div>;
}

export function EmptyState({ query }: { query: string }) {
  return <div className="empty-state"><span className="empty-state__symbol">0</span><h2>No matches this time.</h2><p>We couldn't find anything for “{query}”. Try a broader search.</p></div>;
}
