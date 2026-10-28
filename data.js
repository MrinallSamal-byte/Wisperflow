// PROTOTYPE DATA. The creators, numbers, messages, replies, log entries and Hinglish results below are
// invented so the site can be previewed. They are NOT real results and must not be submitted as such.
// Replace this file with the output of "Export data.js" (open the site with ?edit) and set
// profile.prototype to false to remove the banner.
(() => {
  // Dates are generated relative to today so the prototype always looks mid-sprint (day 7 of 8).
  const base = new Date(); base.setHours(0, 0, 0, 0); base.setDate(base.getDate() - 6);
  const at = (day, h, m = 0) => { const d = new Date(base); d.setDate(d.getDate() + day); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const ymd = day => { const d = new Date(base); d.setDate(d.getDate() + day); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const disclose = "To be upfront: I'm not on the Wispr Flow team. I've applied to their India growth team, and this outreach is part of my application. I'm only pitching creators I think are a real fit.";

  window.SITE_DATA = {
    profile: {
      prototype: true,
      name: "Mrinall Samal",
      headline: "",
      lede: "Hi, I'm Mrinall, a CS student from Bhubaneswar who builds software people actually use. For a week I've been pitching real creators on Wispr Flow, keeping score of what works, and talking my decisions out loud as I go. It's all below, including what went wrong.",
      city: "Bhubaneswar, Odisha",
      startDate: "Immediately",
      relocation: "Yes, I can relocate to Bangalore",
      interest: "Internship",
      website: "mrinall.dev",
      linkedin: "linkedin.com/in/mrinall-samal-34004233b",
      github: "github.com/MrinallSamal-byte",
      x: "",
      email: "samalmrinall9@gmail.com",
      about: [
        "I'm a B.Tech CSE student at Siksha 'O' Anusandhan University in Bhubaneswar (2024 to 2028). I build full-stack and AI systems that real people use, and I like measuring whether they work.",
        "I maintain iters.live on my own, a campus platform for about 12,000 students that takes around 100K API requests a day, and I built WriteOnce, a scheduler that posts across five social networks. Both taught me the same thing: getting something in front of people is half the job.",
        "I'm applying to the growth team because I want to treat creator marketing the way I treat software. Find who is worth reaching, write down why, send it, measure the replies, and keep what works."
      ],
      built: [
        { name: "iters.live", line: "Campus platform for about 12,000 students. Solo-maintained, around 100K daily API hits." },
        { name: "WriteOnce", line: "Social media scheduler for five networks, with retries and approval links." },
        { name: "Sanket", line: "Anti-scam tool for WhatsApp and web with multilingual verdicts." },
        { name: "CodeMentor AI", line: "Agentic coding tutor with an in-browser code runner and 17 algorithm visualizers." },
        { name: "Smart India Hackathon 2026", line: "Top 50 nationally." }
      ],
      mistakes: [],
      post: null,
      videos: [],
      casestudy: {
        title: "How iters.live reached a campus",
        intro: "The only growth I've done so far is for something I built myself. These numbers are from my own platform.",
        stats: [
          { n: "12,000", label: "students on the platform" },
          { n: "~100K", label: "API requests a day" },
          { n: "1", label: "person maintaining it" }
        ],
        story: [
          { q: "How did the first students find it?", a: "Through college and club announcements." }
        ]
      },
      hinglish: {
        runs: [
          { said: "Kal ki meeting ko reschedule kar dena", wrote: "Kal ki meeting ko reschedule kar dena", ok: true },
          { said: "Client ko ek follow up email bhej do", wrote: "Client ko ek follow-up email bhej do", ok: true },
          { said: "Send me the PR description by evening", wrote: "Send me the PR description by evening", ok: true },
          { said: "Aaj ka standup skip karte hain", wrote: "Aaj ka stand-up skip karte hain", ok: true },
          { said: "Mera Next.js build fail ho gaya", wrote: "Mera next JS build fail ho gaya", ok: false, note: "Tech names get split up" },
          { said: "Iska API response kaafi slow hai", wrote: "Iska API response kaafi slow hai", ok: true },
          { said: "Bhubaneswar mein kal baarish hogi", wrote: "Bhubaneshwar mein kal baarish hogi", ok: false, note: "City spelled differently from how I write it" },
          { said: "Ye invoice kal tak clear kar dena", wrote: "Ye invoice kal tak clear kar dena", ok: true },
          { said: "Pehle login flow test karo phir deploy", wrote: "Pehle login flow test karo fir deploy", ok: false, note: "Spelling variant, meaning intact" },
          { said: "Please sync with Rohan about the Hinglish pitch", wrote: "Please sync with Rohan about the Hinglish pitch", ok: true },
          { said: "Iss quarter ka OKR doc share kar do", wrote: "Iss quarter ka OKR dock share kar do", ok: false, note: "\"doc\" heard as \"dock\"" },
          { said: "Mujhe Postgres ka index samajh nahi aaya", wrote: "Mujhe postgres ka index samajh nahi aaya", ok: true, note: "Capital letter only" },
          { said: "Aap kal tak review kar sakte ho kya", wrote: "Aap kal tak review kar sakte ho kya", ok: true },
          { said: "Deploy hone ke baad Slack pe ping kar dena", wrote: "Deploy hone ke baad Slack pe ping kar dena", ok: true },
          { said: "Ye PR merge karne se pehle tests chala lo", wrote: "Ye PR merge karne se pehle tests chala lo", ok: true },
          { said: "Sunday ko family function hai, Monday se start karte hain", wrote: "Sunday ko family function hai, Monday se start karte hain", ok: true },
          { said: "Wispr Flow se email likhna kaafi fast hai", wrote: "Whisper Flow se email likhna kaafi fast hai", ok: false, note: "The product's own name came out as \"Whisper\"" },
          { said: "Budget ka sheet Priya ko forward kar do", wrote: "Budget ka sheet Priya ko forward kar do", ok: true },
          { said: "Ye feature Q4 mein ship karenge", wrote: "Ye feature Q4 mein ship karenge", ok: true },
          { said: "Mere ko thoda time chahiye, kal reply karta hoon", wrote: "Mere ko thoda time chahiye, kal reply karta hoon", ok: true }
        ],
        takeaways: [
          "Everyday Hinglish came out well. The sentence structure and the language mixing weren't the problem.",
          "Tech names, place names and the product's own name were where it slipped. I'd show those honestly in any demo instead of only showing the easy sentences.",
          "Some misses are spelling choices for Hindi words in Roman letters (phir or fir), which varies from person to person and isn't really an accuracy problem."
        ]
      },
      context: [
        { text: "India is Wispr Flow's big expansion bet, starting with Hinglish, with other Indian languages planned.", source: "TechCrunch, May 2026", url: "https://techcrunch.com/2026/05/09/voice-ai-in-india-is-hard-wispr-flow-is-betting-on-it-anyway/" },
        { text: "India-specific pricing was reported at ₹320 a month on annual plans, against about $12 a month globally.", source: "Press coverage of the India launch", url: "https://techcrunch.com/2026/05/09/voice-ai-in-india-is-hard-wispr-flow-is-betting-on-it-anyway/" },
        { text: "One report says India is about 14% of installs but about 2% of revenue. That's a single secondary source, so I'd confirm it, but it's why my experiments measure paying users and not just installs.", source: "Ecosistema Startup (unverified)", url: "https://ecosistemastartup.com/?p=80323" }
      ],
      plan: [
        { when: "Week 1", title: "Swap my assumptions for Wispr's real numbers", body: "Put Wispr Flow's real click, signup and paid rates into the scorer so creators are ranked by cost per paying user, not by follower count." },
        { when: "Weeks 2 to 3", title: "Build a bench of 40 creators", body: "Ten each in coding, students, founders and writing. Pitch Hinglish creators in Hinglish. Start with mid-size creators, who were easiest to reach in my sprint." },
        { when: "Week 4", title: "Ship one proof-of-use campaign", body: "Ask five creators to use Flow for a week and share an honest before and after. Track installs, activations and what they say without being asked." },
        { when: "Month 2", title: "Automate what I did by hand", body: "Turn the spreadsheet work into a small internal tool for scoring, outreach tracking and follow-up reminders, so the team's time goes into conversations with creators." }
      ],
      experiments: [
        { effort: "1 week, no budget", title: "Pitch Hinglish creators in Hinglish", hypothesis: "Creators with a Hinglish audience reply more, and sooner, when the first message sounds like them.", how: "Send the same offer to 10 creators in English and 10 in Hinglish, matched by size and niche.", metric: "Reply rate and hours to first reply for each group." },
        { effort: "3 weeks, small budget", title: "Free trial before any paid deal", hypothesis: "Creators who use Flow for a week make more honest, better-performing content than ones paid cold, and more of their audience converts to paid.", how: "Offer a week of use to 15 mid-size creators, then offer paid slots only to those who keep using it.", metric: "Share still using it after 7 days, and cost per paying user for this group against cold paid deals." },
        { effort: "2 weeks, my own time", title: "One short clip per profession", hypothesis: "A 30-second clip of a student, a developer or a lawyer doing a real task converts better than a general demo.", how: "Make three clips, give each to creators in the matching niche, and use a separate tracked link for each.", metric: "Clicks, signups and paid conversions per clip." }
      ],
      brief: {
        title: "Creator brief: Wispr Flow for your audience",
        angle: "Show one real task you do every day, done by speaking instead of typing, with a clear before and after.",
        deliverables: ["One 30 to 60 second video or reel", "One story or post with a tracked link", "A follow-up after 7 days with an honest verdict"],
        hooks: ["Write a full email in 20 seconds", "Answer 10 messages without touching the keyboard", "Take notes in Hindi, English or both, just by talking"],
        measure: ["Clicks on the tracked link", "Installs, activations and paid conversions", "Comments that mention a specific use"],
        avoid: ["Scripted praise", "Claims about accuracy you haven't tested yourself", "Hiding that it's a partnership"]
      }
    },
    sprint: { start: ymd(0), end: ymd(7), target: 20 },
    creators: [
      { id: "c01", name: "Chai & Code", handle: "@chaiandcode", platform: "YouTube", niche: "Coding / dev", language: "Hinglish", contentType: "Tutorials / workflows", followers: 142000, avgViews: 31000, comments: 118, price: 7000, risk: 0, status: "won", pitchedOn: ymd(1),
        message: `Hi,\n\nYour video on setting up a Next.js project had a minute where you stop to write the commit message and PR description by hand. That's the exact moment I'd use dictation.\n\nDevelopers spend a surprising share of the day writing things that aren't code: PR descriptions, Slack threads, docs, and prompts to AI tools.\n\n${disclose}\n\nWould you try it for a week and tell me honestly what you think, including if it isn't for you?\n\nMrinall Samal`,
        reply: "bro i actually type a lot of commit msgs and docs so will try it for a week. if it works i'll make a short on it. no payment needed for the trial",
        lesson: "A specific moment from one video, and a small ask, got a yes within a day. He said the trial was enough and didn't ask for money." },
      { id: "c02", name: "Notes Wali Didi", handle: "@noteswalididi", platform: "Instagram", niche: "Students / exam prep (UPSC, CAT, JEE…)", language: "Hinglish", contentType: "Talking-head commentary", followers: 268000, avgViews: 61000, comments: 240, price: 22000, risk: 0, status: "talking", pitchedOn: ymd(1),
        message: `Hi Didi!\n\nAapki reel jisme aap bolti hain ki "pehle bolo, phir likho" mujhe bahut pasand aayi. Wahi idea dictation ka hai.\n\nNotes, answer-writing practice aur lambe messages bolkar kaafi tez ho jaate hain.\n\nSeedhi baat: abhi main Wispr Flow team ka hissa nahi hoon. Maine unki India growth team ke liye apply kiya hai, aur ye outreach meri application ka hissa hai.\n\nKya aapka media kit ya rate card mil sakta hai?\n\n- Mrinall Samal`,
        reply: "hi! i handle collabs for her. can you send a 45 sec demo with hindi notes first? then we can talk rates",
        lesson: "Replied the same evening, but from her manager. Anyone with a manager wants a demo before they discuss money." },
      { id: "c03", name: "The Odia Dev", handle: "@theodiadev", platform: "YouTube", niche: "Coding / dev", language: "Bengali / Marathi / other", contentType: "Tutorials / workflows", followers: 38000, avgViews: 9000, comments: 64, price: 2000, risk: 0, status: "talking", pitchedOn: ymd(2),
        message: `Hi,\n\nI'm also from Odisha. Your video on building a REST API in Odia was the first one I've seen that explains it in the language people actually think in.\n\nTyping in Odia or in a mix of Odia and English is slow on most keyboards, and speaking isn't.\n\n${disclose}\n\nWould you be open to a 10-minute chat this week?\n\nMrinall Samal`,
        reply: "yes sure, call tomorrow evening?",
        lesson: "A shared home state helped, but the real hook was a video in his language. I have no idea yet whether Flow handles Odia well, so I need to test that before the call." },
      { id: "c04", name: "Startup Sutra", handle: "@startupsutra", platform: "LinkedIn", niche: "Startups / founders", language: "English", contentType: "Talking-head commentary", followers: 71000, avgViews: 11000, comments: 48, price: 8000, risk: -20, status: "replied", pitchedOn: ymd(2),
        message: `Hi,\n\nYour post about founders spending three hours a day in email stayed with me.\n\nFounders live in email, Slack and investor updates, which is a lot of typing that doesn't need to be typed.\n\n${disclose}\n\nCan I send you a 60-second demo tailored to your audience?\n\nMrinall Samal`,
        reply: "Interesting, thanks. We're tied up with another dictation tool till March but happy to look again after.",
        lesson: "I didn't check for a competing partnership first. The scorer now has a penalty for that, and I'll check before writing the message, not after." },
      { id: "c05", name: "Placement Pathshala", handle: "@placementpathshala", platform: "YouTube", niche: "Students / exam prep (UPSC, CAT, JEE…)", language: "Hinglish", contentType: "Tutorials / workflows", followers: 520000, avgViews: 74000, comments: 310, price: 60000, risk: 0, status: "passed", pitchedOn: ymd(1),
        message: `Hi,\n\nYour mock interview series is the best I've found for placement prep.\n\nNotes, answer practice and long messages all go faster when you can talk them out first.\n\n${disclose}\n\nWould you be open to a 10-minute chat this week?\n\nMrinall Samal`,
        reply: "not for us right now, thanks",
        lesson: "A polite no from the biggest channel I tried. I started with the largest names on day one, and the mid-size ones were easier to reach." },
      { id: "c06", name: "Excel Guru Ravi", handle: "@excelgururavi", platform: "YouTube", niche: "Productivity / workflow", language: "Hinglish", contentType: "Tutorials / workflows", followers: 205000, avgViews: 22000, comments: 85, price: 12000, risk: 0, status: "passed", pitchedOn: ymd(2),
        message: `Hi Ravi,\n\nAapka pivot table wala video kaafi clear tha. Aap already dikhate hain ki din ka friction kaise kam karein.\n\nKya is hafte 10 minute ki quick baat ho sakti hai?\n\n- Mrinall Samal`,
        reply: "", lesson: "No reply after one follow-up. I asked for a call in the very first line, which is a big ask from a stranger." },
      { id: "c07", name: "Law Notes by Kavya", handle: "@lawnoteskavya", platform: "Instagram", niche: "Law / CA / professional services", language: "English", contentType: "Talking-head commentary", followers: 58000, avgViews: 8000, comments: 33, price: 4000, risk: 0, status: "passed", pitchedOn: ymd(3),
        message: `Hi,\n\nLong client emails and notices are exactly where speaking beats typing.\n\nCan I send you a 60-second demo tailored to your audience?\n\nMrinall Samal`,
        reply: "", lesson: "My message had no reference to any of her content, and it shows. That one is on me." },
      { id: "c08", name: "Bangalore Founder Diaries", handle: "@blrfounderdiaries", platform: "LinkedIn", niche: "Startups / founders", language: "English", contentType: "Talking-head commentary", followers: 46000, avgViews: 7000, comments: 29, price: 5000, risk: 0, status: "passed", pitchedOn: ymd(3),
        message: `Hi,\n\nFounders type a lot of things that don't need to be typed.\n\n${disclose}\n\nWould you try it for a week and tell me honestly what you think?\n\nMrinall Samal`,
        reply: "", lesson: "Another message with no specific hook. Two for two on the generic ones getting ignored." },
      { id: "c09", name: "Sneaker Sahil", handle: "@sneakersahil", platform: "Instagram", niche: "Lifestyle / vlog", language: "Hinglish", contentType: "Vlog / lifestyle", followers: 380000, avgViews: 52000, comments: 190, price: 30000, risk: 0, status: "passed", pitchedOn: ymd(2),
        message: `Hi Sahil!\n\nHonestly the fit is thinner for your niche, so I'd keep any collaboration small and specific.\n\nKya aap ek hafta try karke honestly bata sakte hain?\n\n- Mrinall Samal`,
        reply: "", lesson: "It scored low before I sent it. I pitched anyway to hit a number, and it used up a slot." },
      { id: "c10", name: "Prompt Pandit", handle: "@promptpandit", platform: "X", niche: "Productivity / workflow", language: "English", contentType: "Tutorials / workflows", followers: 52000, avgViews: 7500, comments: 41, price: 3000, risk: 0, status: "pitched", pitchedOn: ymd(3),
        message: `Hi,\n\nYour thread on writing better prompts mentioned that the hard part is explaining what you want. Speaking it is usually faster than typing it.\n\n${disclose}\n\nWould you try it for a week and tell me honestly what you think?\n\nMrinall Samal`, reply: "", lesson: "" },
      { id: "c11", name: "Marathi Code Mitra", handle: "@marathicodemitra", platform: "YouTube", niche: "Coding / dev", language: "Bengali / Marathi / other", contentType: "Tutorials / workflows", followers: 33000, avgViews: 6000, comments: 52, price: 1500, risk: 0, status: "pitched", pitchedOn: ymd(3),
        message: `Hi,\n\nYour Java series in Marathi is rare and useful. Developers who think in a regional language usually type in a mix of two.\n\n${disclose}\n\nCan I send you a 60-second demo tailored to your audience?\n\nMrinall Samal`, reply: "", lesson: "" },
      { id: "c12", name: "Pitch Deck Priya", handle: "@pitchdeckpriya", platform: "LinkedIn", niche: "Startups / founders", language: "English", contentType: "Tool reviews", followers: 29000, avgViews: 5000, comments: 20, price: 3500, risk: 0, status: "pitched", pitchedOn: ymd(5),
        message: `Hi Priya,\n\nYour comparison of three pitch-deck tools was clear and fair, which is rare.\n\n${disclose}\n\nWould you try it for a week and tell me honestly what you think?\n\nMrinall Samal`, reply: "", lesson: "" },
      { id: "c13", name: "StudySprint India", handle: "@studysprintindia", platform: "Instagram", niche: "Students / exam prep (UPSC, CAT, JEE…)", language: "Hinglish", contentType: "Talking-head commentary", followers: 175000, avgViews: 38000, comments: 150, price: 14000, risk: 0, status: "pitched", pitchedOn: ymd(5),
        message: `Hi!\n\nAapki "30 din mein notes ka system" wali reel mein aap bolte hain ki likhna sabse slow hissa hai. Wahin dictation madad kar sakta hai.\n\nKya is hafte 10 minute ki quick baat ho sakti hai?\n\n- Mrinall Samal`, reply: "", lesson: "" },
      { id: "c14", name: "Tamil Tech Talk", handle: "@tamiltechtalk", platform: "YouTube", niche: "Tech reviews / gadgets", language: "Tamil / Telugu / Kannada / Malayalam", contentType: "Tool reviews", followers: 88000, avgViews: 14000, comments: 70, price: 4500, risk: 0, status: "pitched", pitchedOn: ymd(5),
        message: `Hi,\n\nYour keyboard comparison video had a section on typing speed in Tamil. Dictation makes a good before-and-after for exactly that.\n\n${disclose}\n\nCan I send you a 60-second demo tailored to your audience?\n\nMrinall Samal`, reply: "", lesson: "" },
      { id: "c15", name: "Notion with Nikhil", handle: "@notionwithnikhil", platform: "YouTube", niche: "Productivity / workflow", language: "English", contentType: "Tutorials / workflows", followers: 96000, avgViews: 15000, comments: 88, price: 6000, risk: -6, status: "pitched", pitchedOn: ymd(6),
        message: `Hi Nikhil,\n\nYour "second brain in an afternoon" video is the reason I finally set mine up. Capturing notes by voice fits straight into that.\n\n${disclose}\n\nWould you be open to a 10-minute chat this week?\n\nMrinall Samal`, reply: "", lesson: "" },
      { id: "c16", name: "Hinglish Hacker", handle: "@hinglishhacker", platform: "YouTube", niche: "Coding / dev", language: "Hinglish", contentType: "Tutorials / workflows", followers: 61000, avgViews: 12000, comments: 77, price: 3500, risk: 0, status: "pitched", pitchedOn: ymd(6),
        message: `Hi,\n\nAapka Docker wala video bahut clear tha. Aap bolte hain ki "sab kuch type karna padta hai", aur wahin dictation kaam aata hai.\n\nKya aap ek hafta try karke honestly bata sakte hain?\n\n- Mrinall Samal`, reply: "", lesson: "" },
      { id: "c17", name: "Newsletter Nisha", handle: "@newsletternisha", platform: "X", niche: "Writing / journalism / newsletters", language: "English", contentType: "Talking-head commentary", followers: 24000, avgViews: 3200, comments: 15, price: 0, risk: 0, status: "pitched", pitchedOn: ymd(6),
        message: `Hi Nisha,\n\nYour last issue said first drafts are the hardest part. Getting a draft out at speaking speed and then editing it is a different way to write.\n\n${disclose}\n\nWould you try it for a week and tell me honestly what you think?\n\nMrinall Samal`, reply: "", lesson: "" },
      { id: "c18", name: "UPSC Daily Writer", handle: "@upscdailywriter", platform: "Instagram", niche: "Students / exam prep (UPSC, CAT, JEE…)", language: "Hindi", contentType: "Talking-head commentary", followers: 140000, avgViews: 33000, comments: 170, price: 9000, risk: 0, status: "identified", pitchedOn: "", message: "", reply: "", lesson: "Waiting until I've tested Hindi accuracy myself." },
      { id: "c19", name: "Finance with Faiz", handle: "@financewithfaiz", platform: "Instagram", niche: "Personal finance / investing", language: "Hinglish", contentType: "Talking-head commentary", followers: 230000, avgViews: 41000, comments: 130, price: 15000, risk: 0, status: "identified", pitchedOn: "", message: "", reply: "", lesson: "" },
      { id: "c20", name: "GigGuru Anand", handle: "@gigguruanand", platform: "YouTube", niche: "Tech reviews / gadgets", language: "English", contentType: "Tool reviews", followers: 310000, avgViews: 36000, comments: 140, price: 25000, risk: -6, status: "identified", pitchedOn: "", message: "", reply: "", lesson: "" }
    ],
    log: [
      { id: "l01", ts: at(0, 20, 30), kind: "decision", title: "Why I'm doing outreach and not building a game",
        takeaway: "A portfolio that does the job beats one that describes it.",
        raw: "Okay so I've read the whole brief, and, um, I already know what most people are going to build. A game, or a chatbot version of themselves. And I just think that's not what the job is. The job is picking creators and writing to them and seeing who answers. So I'm going to do that for real and show what happens, including when nobody replies." },
      { id: "l02", ts: at(0, 23, 5), kind: "decision", title: "Rules I set for myself",
        takeaway: "No invented numbers. Honest disclosure in every message.",
        raw: "Rules. One, I don't make up a single number. Two, every message says I'm not on the Wispr team, because otherwise it feels like I'm pretending to be someone I'm not. Three, I write down the failures. If it's embarrassing it still goes in the log. Okay, that's it, going to sleep." },
      { id: "l03", ts: at(1, 11, 15), kind: "mistake", title: "I started with the biggest names",
        takeaway: "Big channels are slow to reply and rarely say yes to a stranger.",
        raw: "So I sent my first three messages and, honestly, I picked the biggest creators first. Because that felt like the impressive thing to do. But a channel with half a million subscribers has a manager and a queue, and I'm a student with a Gmail address. I think I got the order backwards. Start small, learn, then go up." },
      { id: "l04", ts: at(1, 22, 40), kind: "learning", title: "Writing the message takes longer than finding the creator",
        takeaway: "The research for one good opening line is about fifteen minutes.",
        raw: "I timed myself. Finding a creator takes me two minutes. Watching enough of their video to find one specific thing to say takes like fifteen. And that's the part that matters, because the generic ones, you can tell, they read like a template. So fewer messages, but each one actually has to be about the person." },
      { id: "l05", ts: at(2, 9, 50), kind: "pivot", title: "I built the scorer so I'd stop guessing",
        takeaway: "Five criteria, adjustable weights, decided before I send anything.",
        raw: "Right, I keep choosing creators on gut feeling and gut feeling just told me to message a gaming channel, so, no. I'm going to write down what a good fit actually means. Does their audience type a lot. Do they make tutorials. Are the views healthy for their size. Is the price sensible. Is there a competitor. Five things. And I'll make the weights adjustable so I can argue with myself." },
      { id: "l06", ts: at(2, 21, 30), kind: "learning", title: "Hinglish openers got replies faster",
        takeaway: "Casual, specific Hinglish beat polished English for the Hinglish audiences.",
        raw: "Two of the Hinglish messages got an answer within a day. One was from a manager, but still. And one of them actually said it read like a person wrote it. Which, I did. But I think the point is it didn't sound like a pitch." },
      { id: "l07", ts: at(3, 12, 10), kind: "mistake", title: "I pitched someone who already has a dictation partner",
        takeaway: "Check for a competing partnership before writing a word.",
        raw: "The founder one replied, which is nice, and they're tied up with another dictation tool until March. Which I could have found out in two minutes by scrolling their last few posts. I just didn't. So now there's a penalty in the scorer for that, and I check first." },
      { id: "l08", ts: at(3, 19, 45), kind: "decision", title: "Fewer, better messages",
        takeaway: "Four careful messages a day, not ten quick ones.",
        raw: "Okay so the ones I rushed are the ones that got nothing. So the new rule is four messages a day, maximum, and each one has to have something I could only know if I watched their stuff. If I can't find that thing, I skip them. Quality over, yeah, over the number." },
      { id: "l09", ts: at(4, 8, 55), kind: "learning", title: "Follow-ups should be shorter than the first message",
        takeaway: "Two lines, one question.",
        raw: "I sent a follow-up and it was longer than my original. Why would anyone want a longer message from someone who didn't reply? Cutting it down to two lines with just the question. Hey, did you get a chance to look, would a short demo be easier." },
      { id: "l10", ts: at(4, 23, 20), kind: "mistake", title: "I pitched a lifestyle creator just to hit a number",
        takeaway: "A low score before sending means don't send.",
        raw: "I need to be honest, I messaged a sneaker and lifestyle creator yesterday because I wanted the count to be higher. The scorer said it was a bad fit. I knew. I sent it anyway. That's a wasted slot and a worse reason. The number isn't the point." },
      { id: "l11", ts: at(5, 10, 5), kind: "learning", title: "Flow wrote 'Wispr' as 'Whisper' twice today",
        takeaway: "Proper nouns and the product's own name are where I still correct by hand.",
        raw: "Small thing, but when I say Wispr it came out as whisper, the other one, twice this morning. I fixed both by hand. Everything else in this paragraph it got right, including the Hindi bit. So it's not the sentences that slip, it's names. I'm going to note that for the Hinglish test." },
      { id: "l12", ts: at(5, 18, 30), kind: "pivot", title: "First ask is now small",
        takeaway: "Ask for a chat or a one-week trial. Rates come later.",
        raw: "Looking at who replied, the ones that said yes had a small ask. Try it for a week. Or a short call. The ones where I opened with a rate card question went nowhere. So the first message never mentions money anymore. That comes after they've actually used it." },
      { id: "l13", ts: at(6, 9, 10), kind: "decision", title: "Testing Hindi and Odia before I pitch more of them",
        takeaway: "Two creators asked about regional languages. I should know the answer.",
        raw: "The Odia creator said yes to a call, and a Hindi one asked straight away if it works in Hindi, and I don't actually know how well it handles my accent and the mixed Hindi English I speak. So before I pitch anyone else in that segment, I'm going to test it properly and write down exactly what breaks." },
      { id: "l14", ts: at(6, 14, 25), kind: "learning", title: "Anyone with a manager wants a demo first",
        takeaway: "Prepare a 45-second demo before the rate conversation.",
        raw: "The student creator's manager wrote back and asked for a forty five second demo before we talk rates. Fair. So I need one that's tailored, in Hinglish, with notes. Not a generic screen recording. I'll record it tonight and send it tomorrow morning." }
    ]
  };
})();
