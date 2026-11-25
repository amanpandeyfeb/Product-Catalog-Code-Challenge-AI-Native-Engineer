import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import nodemailer from "nodemailer";
import type { Product } from "./catalog.js";

interface Enquiry {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function sendEnquiryEmail(product: Product, enquiry: Enquiry): Promise<void> {
  const subject = `Product enquiry: ${product.title}`;
  const text = [
    `Product: ${product.title} (#${product.id})`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Phone: ${enquiry.phone || "Not provided"}`,
    "",
    "Message:",
    enquiry.message,
  ].join("\n");

  if (process.env.EMAIL_PROVIDER === "ses") {
    const from = process.env.MAIL_FROM;
    const to = process.env.SALES_INBOX;
    if (!from || !to) throw new Error("SES sender and sales inbox must be configured.");
    await new SESv2Client({}).send(new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: [enquiry.email],
      Content: { Simple: { Subject: { Data: subject }, Body: { Text: { Data: text } } } },
    }));
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "Product Catalogue <catalogue@localhost>",
    to: process.env.SALES_INBOX ?? "sales@catalog.local",
    replyTo: enquiry.email,
    subject,
    text,
  });
}