# Outreacher

Preview personalized survey emails from a CSV without sending anything:

```bash
npm run outreach:preview -- --csv "/Users/aryan/Downloads/Gradient _ Survey Outreach List - Professors.csv" --limit 3
```

Set up `outreacher/.env.local` from `outreacher/.env.example` before sending. The script is dry-run by default and will only send if both of these are true:

1. `OUTREACH_ENABLE_SEND=true` is set in `outreacher/.env.local`
2. you run the script with `--send --confirm SEND`

Example send command:

```bash
npm run outreach:send -- --csv "/Users/aryan/Downloads/Gradient _ Survey Outreach List - Professors.csv" --confirm SEND
```

## Duplicate Protection

The script keeps a local send log at `outreacher/send-history.jsonl`. It will skip anyone already sent for the same `OUTREACH_CAMPAIGN_ID`, so rerunning the command will not resend the same campaign to the same email address.

If you want to start a different outreach campaign later, change `OUTREACH_CAMPAIGN_ID` in `outreacher/.env.local`.

## Batch Sending

The script sends only the next unsent batch, using `OUTREACH_BATCH_SIZE` from `outreacher/.env.local`. It's set to `50`, so each send command will send the next 50 unsent recipients by default.

You can override that for a one-off run:

```bash
npm run outreach:send -- --batch-size 10 --confirm SEND
```
