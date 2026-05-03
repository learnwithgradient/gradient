import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import { parse } from "csv-parse/sync";

const DEFAULT_CC = ["hello@learnwithgradient.app"];

const DEFAULT_SUBJECT = "Request for feedback on Gradient's ML curriculum survey";
const DEFAULT_CAMPAIGN_ID = "gradient-professor-survey";
const DEFAULT_BATCH_SIZE = 50;

const REQUIRED_COLUMNS = ["school", "name", "email", "role"];
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_LOG_PATH = path.join(SCRIPT_DIR, "send-history.jsonl");

function loadEnvFile(filePath) {
  return fs
    .readFile(filePath, "utf8")
    .then((raw) => {
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) {
          continue;
        }

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) {
          continue;
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1).trim();
        const unquotedValue = rawValue.replace(/^(['"])(.*)\1$/, "$2");

        if (!(key in process.env)) {
          process.env[key] = unquotedValue;
        }
      }
    })
    .catch((error) => {
      if (error.code !== "ENOENT") {
        throw error;
      }
    });
}

async function loadLocalEnv() {
  await loadEnvFile(path.join(SCRIPT_DIR, ".env"));
  await loadEnvFile(path.join(SCRIPT_DIR, ".env.local"));
}

function parseArgs(argv) {
  const options = {
    csvPath: process.env.OUTREACH_CSV_PATH ?? "",
    subject: process.env.OUTREACH_SUBJECT ?? DEFAULT_SUBJECT,
    campaignId: process.env.OUTREACH_CAMPAIGN_ID ?? DEFAULT_CAMPAIGN_ID,
    batchSize: Number.parseInt(
      process.env.OUTREACH_BATCH_SIZE ?? `${DEFAULT_BATCH_SIZE}`,
      10
    ),
    shouldSend: false,
    limit: null,
    only: null,
    confirm: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--csv") {
      options.csvPath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--subject") {
      options.subject = argv[index + 1] ?? DEFAULT_SUBJECT;
      index += 1;
      continue;
    }

    if (arg === "--campaign") {
      options.campaignId = argv[index + 1] ?? DEFAULT_CAMPAIGN_ID;
      index += 1;
      continue;
    }

    if (arg === "--batch-size") {
      const nextValue = Number.parseInt(argv[index + 1] ?? "", 10);
      options.batchSize = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : DEFAULT_BATCH_SIZE;
      index += 1;
      continue;
    }

    if (arg === "--limit") {
      const nextValue = Number.parseInt(argv[index + 1] ?? "", 10);
      options.limit = Number.isFinite(nextValue) && nextValue > 0 ? nextValue : null;
      index += 1;
      continue;
    }

    if (arg === "--only") {
      const value = argv[index + 1] ?? "";
      options.only = value
        .split(",")
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (arg === "--confirm") {
      options.confirm = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (arg === "--send") {
      options.shouldSend = true;
    }
  }

  return options;
}

function normalizeToken(token) {
  return token.toLowerCase().replace(/[.,]/g, "");
}

function extractLastName(fullName) {
  const trimmedName = fullName.trim();
  if (!trimmedName) {
    return null;
  }

  if (trimmedName.includes(",")) {
    return trimmedName.split(",")[0].trim() || null;
  }

  const honorifics = new Set(["dr", "prof", "professor", "mr", "mrs", "ms"]);
  const suffixes = new Set(["phd", "md", "jd", "jr", "sr", "ii", "iii", "iv"]);

  const parts = trimmedName.split(/\s+/).filter(Boolean);
  while (parts.length > 0 && honorifics.has(normalizeToken(parts[0]))) {
    parts.shift();
  }
  while (parts.length > 1 && suffixes.has(normalizeToken(parts[parts.length - 1]))) {
    parts.pop();
  }

  return parts[parts.length - 1] ?? null;
}

function renderEmailBody({ lastName }) {
  const greetingName = lastName ? `Professor ${lastName}` : "Professor";

  return `Hello ${greetingName},

I hope this message finds you well! Our names are Aryan & Yax, and we're reaching out because we noticed you had a background which directly related to a project we're working on. A while back, we made our first prototype of Gradient, a machine learning education platform inspired by Scratch & Khan Academy to help students of all ages learn data science and machine learning in a more intuitive, interactive way. We hope a platform like this can (1) get more people interested in real machine learning, (2) help students ranging from elementary school to PhD-level get a deep understanding of topics & ML Theory, and (3) help people prepare for job interviews in ML-related fields.

We're currently refining the platform's curriculum structure, including sections, topics, and subtopics across areas like ML Fundamentals, Data Science, and Machine Learning. We've put together a survey to gather input from Professors, researchers, PhD students, and industry engineers on what content is most valuable for learners entering the field. If you're open to it, we'd really appreciate your perspective:

https://learnwithgradient.app

https://forms.gle/unFVKm7wbPN8ZnFP6

The survey is fairly broad, but you absolutely do not need to complete all of it. Please feel free to answer the sections that are most relevant to your background or area of expertise, or which you hope to shape in order to improve the overall quality of future researchers and engineers in your field. Additionally, feel free to share this survey & email with any members of faculty or research groups that you believe could also provide further insights, and let us know if you have any questions. If you're still reading, thank you for your time!

Best,

Yax & Aryan`;
}

async function readRecipients(csvPath) {
  const rawCsv = await fs.readFile(csvPath, "utf8");
  const records = parse(rawCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for (const column of REQUIRED_COLUMNS) {
    if (!records[0] || !(column in records[0])) {
      throw new Error(`CSV is missing required column: ${column}`);
    }
  }

  return records
    .map((record, index) => ({
      rowNumber: index + 2,
      school: record.school?.trim() ?? "",
      name: record.name?.trim() ?? "",
      email: record.email?.trim() ?? "",
      role: record.role?.trim() ?? "",
    }))
    .filter((record) => record.email);
}

function buildMessages(recipients, options) {
  const cc = (process.env.OUTREACH_CC ?? DEFAULT_CC.join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const fromEmail = process.env.OUTREACH_FROM_EMAIL ?? "aryan.cs.app@gmail.com";
  const fromName = process.env.OUTREACH_FROM_NAME ?? "Aryan Gupta";

  return recipients.map((recipient) => {
    const lastName = extractLastName(recipient.name);
    const text = renderEmailBody({ lastName });

    return {
      ...recipient,
      campaignId: options.campaignId,
      subject: options.subject,
      from: `${fromName} <${fromEmail}>`,
      to: recipient.email,
      cc,
      text,
    };
  });
}

function filterMessages(messages, options) {
  let nextMessages = messages;

  if (options.only?.length) {
    const allowed = new Set(options.only);
    nextMessages = nextMessages.filter((message) => allowed.has(message.email.toLowerCase()));
  }

  const effectiveLimit = options.limit ?? options.batchSize ?? DEFAULT_BATCH_SIZE;
  if (effectiveLimit) {
    nextMessages = nextMessages.slice(0, effectiveLimit);
  }

  return nextMessages;
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function readSendHistory() {
  try {
    const rawHistory = await fs.readFile(
      process.env.OUTREACH_LOG_PATH || DEFAULT_LOG_PATH,
      "utf8"
    );

    return rawHistory
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line));
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

function buildHistoryKey(campaignId, email) {
  return `${campaignId}::${normalizeEmail(email)}`;
}

function splitAlreadySent(messages, history) {
  const sentKeys = new Set(
    history.map((entry) => buildHistoryKey(entry.campaignId, entry.email))
  );

  const alreadySent = [];
  const unsent = [];

  for (const message of messages) {
    if (sentKeys.has(buildHistoryKey(message.campaignId, message.to))) {
      alreadySent.push(message);
    } else {
      unsent.push(message);
    }
  }

  return { alreadySent, unsent };
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function printPreview({ messages, skippedCount, totalCount, campaignId, batchSize }) {
  console.log(`Campaign: ${campaignId}`);
  console.log(`Recipients in CSV: ${totalCount}`);
  console.log(`Already sent in this campaign: ${skippedCount}`);
  console.log(`Prepared next batch: ${messages.length} email(s) (batch size ${batchSize}).`);
  console.log("Dry run only. No emails were sent.\n");

  for (const [index, message] of messages.slice(0, 3).entries()) {
    console.log(`--- Preview ${index + 1} ---`);
    console.log(`To: ${message.to}`);
    console.log(`CC: ${message.cc.join(", ")}`);
    console.log(`Subject: ${message.subject}`);
    console.log("");
    console.log(message.text);
    console.log("");
  }

  if (messages.length > 3) {
    console.log(`...and ${messages.length - 3} more in this batch.`);
  }

  console.log("\nTo actually send, set OUTREACH_ENABLE_SEND=true and run with --send --confirm SEND.");
}

function createTransporter() {
  const host = process.env.OUTREACH_SMTP_HOST ?? "smtp.gmail.com";
  const port = Number.parseInt(process.env.OUTREACH_SMTP_PORT ?? "465", 10);
  const secure = (process.env.OUTREACH_SMTP_SECURE ?? "true").toLowerCase() === "true";
  const user = process.env.OUTREACH_SMTP_USER ?? process.env.OUTREACH_FROM_EMAIL;
  const pass = process.env.OUTREACH_SMTP_PASS ?? "";

  if (!user || !pass) {
    throw new Error(
      "Missing SMTP credentials. Set OUTREACH_SMTP_USER and OUTREACH_SMTP_PASS in outreacher/.env.local."
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

async function sendMessages(messages) {
  const sendingEnabled = (process.env.OUTREACH_ENABLE_SEND ?? "false").toLowerCase() === "true";
  if (!sendingEnabled) {
    throw new Error("Sending is disabled. Set OUTREACH_ENABLE_SEND=true when you are ready.");
  }

  const transporter = createTransporter();
  await transporter.verify();

  const delayMs = Number.parseInt(process.env.OUTREACH_SEND_DELAY_MS ?? "1500", 10);
  const logPath = process.env.OUTREACH_LOG_PATH || DEFAULT_LOG_PATH;

  for (const [index, message] of messages.entries()) {
    const result = await transporter.sendMail({
      from: message.from,
      to: message.to,
      cc: message.cc,
      subject: message.subject,
      text: message.text,
    });

    await fs.appendFile(
      logPath,
      `${JSON.stringify({
        campaignId: message.campaignId,
        email: message.to,
        subject: message.subject,
        messageId: result.messageId,
        sentAt: new Date().toISOString(),
        rowNumber: message.rowNumber,
        school: message.school,
        name: message.name,
      })}\n`
    );

    console.log(`[${index + 1}/${messages.length}] sent to ${message.to} (${result.messageId})`);

    if (index < messages.length - 1 && delayMs > 0) {
      await sleep(delayMs);
    }
  }
}

async function main() {
  await loadLocalEnv();
  const options = parseArgs(process.argv.slice(2));

  if (!options.csvPath) {
    throw new Error(
      "Missing CSV path. Pass --csv or set OUTREACH_CSV_PATH in outreacher/.env.local."
    );
  }

  const recipients = await readRecipients(path.resolve(options.csvPath));
  const allMessages = buildMessages(recipients, options);
  const history = await readSendHistory();
  const { alreadySent, unsent } = splitAlreadySent(allMessages, history);
  const messages = filterMessages(unsent, options);

  if (messages.length === 0) {
    throw new Error(
      alreadySent.length > 0
        ? `No unsent recipients remain for campaign "${options.campaignId}".`
        : "No recipients matched the current filters."
    );
  }

  if (!options.shouldSend) {
    printPreview({
      messages,
      skippedCount: alreadySent.length,
      totalCount: allMessages.length,
      campaignId: options.campaignId,
      batchSize: options.limit ?? options.batchSize ?? DEFAULT_BATCH_SIZE,
    });
    return;
  }

  if (options.confirm !== "SEND") {
    throw new Error('Refusing to send without --confirm SEND.');
  }

  await sendMessages(messages);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
