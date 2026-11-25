import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";
import { catalogApi, type EnquiryInput, type Product } from "../api";

export default function EnquiryDialog({ product, onClose }: { product: Product; onClose: () => void }) {
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const enquiry: EnquiryInput = {
      productId: product.id,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      message: String(formData.get("message") ?? ""),
    };
    try {
      await catalogApi.submitEnquiry(enquiry);
      setSent(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your enquiry could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="enquiry-dialog" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close enquiry form"><X size={20} /></button>
        {sent ? <div className="thank-you"><span className="thank-you__mark">✓</span><p className="eyebrow">MESSAGE RECEIVED</p><h2>Thank you.</h2><p>Your enquiry about <strong>{product.title}</strong> has been sent. Our team will be in touch.</p><button className="button button--primary" onClick={onClose}>Continue browsing <ArrowRight size={17} /></button></div> : <>
          <p className="eyebrow">LET'S TALK DETAILS</p><h2 id="enquiry-title">Enquire about<br /><em>{product.title}</em></h2><p className="dialog-intro">Leave your details and our team will get back to you about this piece.</p>
          <form className="enquiry-form" onSubmit={submit}>
            <label>Your name<input name="name" autoComplete="name" required minLength={2} maxLength={80} /></label>
            <div className="enquiry-form__row"><label>Email address<input name="email" type="email" autoComplete="email" required /></label><label>Phone <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label></div>
            <label>Your message<textarea name="message" required minLength={10} maxLength={1000} defaultValue={`I'm interested in the ${product.title}.`} /></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button--primary" type="submit" disabled={sending}>{sending ? "Sending..." : "Send enquiry"}<ArrowRight size={17} /></button>
          </form>
        </>}
      </section>
    </div>
  );
}