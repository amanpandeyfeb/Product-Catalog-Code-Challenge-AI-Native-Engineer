import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { sendEnquiryEmail } from "../src/emailSender.ts";

test("SES sends the enquiry to the configured inbox with the customer as reply-to", async () => {
  const previous = { ...process.env };
  process.env.EMAIL_PROVIDER = "ses";
  process.env.MAIL_FROM = "catalog@example.com";
  process.env.SALES_INBOX = "sales@example.com";
  process.env.AWS_REGION = "us-east-1";
  const send = mock.method(SESv2Client.prototype, "send", async () => ({}));

  try {
    await sendEnquiryEmail(
      { id: 1, title: "Bag", price: 20, description: "", category: "bags", image: "" },
      { name: "Sam", email: "sam@example.com", message: "Tell me more" },
    );
    assert.equal(send.mock.callCount(), 1);
    const command = send.mock.calls[0].arguments[0] as unknown as SendEmailCommand;
    assert.equal(command.input.FromEmailAddress, "catalog@example.com");
    assert.deepEqual(command.input.Destination?.ToAddresses, ["sales@example.com"]);
    assert.deepEqual(command.input.ReplyToAddresses, ["sam@example.com"]);
    assert.match(command.input.Content?.Simple?.Body?.Text?.Data ?? "", /Tell me more/);
  } finally {
    send.mock.restore();
    for (const key of ["EMAIL_PROVIDER", "MAIL_FROM", "SALES_INBOX", "AWS_REGION"]) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});