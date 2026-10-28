# Putting this on Emergent

The challenge asks for a portfolio built on Emergent. This site is plain HTML, CSS and JavaScript, so the quickest honest route is to give Emergent the finished build and let it host and extend it. Don't hide that you started from your own files. Say so in your video.

1. Run `python3 build.py`. It writes `portfolio-single.html`, the whole site in one file.
2. Open a new Emergent project and paste the prompt below, attaching `portfolio-single.html`.
3. When Emergent finishes, open the public link in a private window and check it against the list at the bottom.
4. Use Emergent for at least one real change (a new section, a tweak to the scorer, a layout fix) so the build genuinely happened there.

## Prompt to paste

> I'm applying to Wispr Flow's India growth team and need a public portfolio site. I've attached `portfolio-single.html`, a finished static site (HTML, CSS and vanilla JavaScript, no build step). Use it as the base.
>
> Please:
> 1. Serve it as a public single-page site exactly as it looks and behaves now. Don't redesign it or swap the fonts and colours.
> 2. Keep all the data in the `window.SITE_DATA` object so I can edit it later. Don't hard-code content into the markup.
> 3. Keep the features working: the outreach ledger with list and board views, the creator-fit scorer with draft messages, the day-by-day chart, the voice log, and the first-month plan.
> 4. Make sure it works on phone and desktop, and that the page has no horizontal scroll.
> 5. Give me the public URL.
>
> Don't add fake data, testimonials or metrics. Anything not in the data should stay empty.

## Before you submit the link

- [ ] Opens without logging in
- [ ] Looks right on your phone
- [ ] The yellow "Prototype with sample data" banner is gone (`prototype: false` in the data)
- [ ] Every creator, number and reply is real
- [ ] Your name, links and a way to reach you are correct
- [ ] You can explain, in the video, what you built, what voice changed, and what you got wrong
