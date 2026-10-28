# Outreach sprint portfolio

A static site with no build step. Open `index.html`, or deploy the folder anywhere.
`python3 build.py` bundles everything into one file, `portfolio-single.html`.

## Views
- `/` is what visitors see. It shows only what is in `data.js`.
- `/?edit` unlocks your tools. Changes live in your browser until you click **Export data.js** and replace the file.

## Edit-mode tools
- **Today**: messages sent against the 4-a-day limit, whether you've dictated a log entry, follow-ups due (with copy-ready text), and days left.
- **Fit scorer**: score a creator, draft a message, add them to the pipeline.
- **Voice log**: dictate into the box with Wispr Flow (or press Dictate). Don't tidy it up.
- **Hinglish test runner** (in the Hinglish section): say 20 phrases, it marks each right or wrong and saves the results.
- **Checklist**: 18 items that show what is still missing before you submit.
- **Video script**: a 3-minute script built from your current numbers.

## Before you submit
1. Replace the sample data with real data and set `profile.prototype` to `false`.
2. Fill the dashed "your turn" boxes: the iters.live story, your own post, a screen recording.
3. Rebuild with `python3 build.py`, then follow `EMERGENT.md`.

The sample data (creators, messages, replies, log entries, Hinglish results) is invented. Don't submit it as real.
