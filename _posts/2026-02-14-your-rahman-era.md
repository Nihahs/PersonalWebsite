---
title: "Discover Your Rahman Era"
date: 2026-02-14
tags: [arr, music, quiz]
description: "I built a quiz that maps your musical taste to one of A.R. Rahman's six compositional phases. Here's the idea, the algorithm, and the engineering behind it."
---

[Your Rahman Era](https://yourrahmanera.com) is a quiz that maps your musical preferences to one of A.R. Rahman's six compositional phases. You listen to song pairs, pick the ones you prefer, and the algorithm tells you which era of Rahman's career resonates with you the most.

This post is about why I built it, how it works under the hood, and what I found interesting along the way.

## The Idea

Rahman's career started in 1992 and he's still going strong. IMO, he's even in a purple patch [right now](https://x.com/chingucha/status/2012022788035658135/photo/1). Over 30+ years, his music has gone through distinct creative phases—from the raw electronic energy of his early film scores to the introspective, minimalist compositions of his recent work.

I've lost count of how many times I've heard people say that 90s Rahman was peak Rahman. I don't agree. The 90s work was extraordinary, sure. But I think people conflate nostalgia with quality. Rahman didn't peak. He evolved.

I had an inkling that plenty of people gravitate toward other phases of his career. But how do you find that out? You can't just ask people "which era do you prefer" because most listeners don't think about music in terms of compositional phases.

So I built a quiz that figures it out indirectly. Every round presents you with a pair of songs from different eras. You pick the one you like. Do that enough times, and a pattern emerges. At the end, the algorithm reveals which phase of Rahman's career your taste aligns with.

## The Six Eras

I divided Rahman's career into six eras, each representing a philosophical shift in how he approached composition:

**[Sonic Renaissance & Electronic Disruption](https://yourrahmanera.com/explore/electronic-disruption) (1992–1997).** The era that rewrote the rules of Indian film music. Synthesizers, layered production, and a sound that felt nothing like what came before. Roja, Bombay, Kadhalan—this is where it all started.

**[Melodic-Spiritual Expansion](https://yourrahmanera.com/explore/melodic-spiritual) (1997–2002).** Rahman leaned into melody and spirituality. The compositions became more expansive, more emotionally layered. Dil Se, Taal, Lagaan—the songs from this era have a warmth and grandeur that's hard to replicate.

**[Emotional Orchestration](https://yourrahmanera.com/explore/emotional-orchestration) (2002–2007).** Orchestral arrangements took center stage. The music became more cinematic, more sweeping. Ayutha Ezhuthu, Rang De Basanti, Guru—Rahman was scoring emotions as much as films.

**[Experimental-Conceptual](https://yourrahmanera.com/explore/experimental-conceptual) (2007–2012).** The Oscar years and beyond. Rahman was at his most experimental—pushing boundaries, blending genres, taking risks that didn't always land commercially but were always interesting. Slumdog Millionaire, Raavanan, Rockstar.

**[Global Fusion & Minimalism](https://yourrahmanera.com/explore/global-minimalism) (2012–2019).** A quieter, more restrained Rahman. Less layering, more space. Kadal, OK Kanmani, Kaatru Veliyidai.

**[Reflective Auteur](https://yourrahmanera.com/explore/reflective-auteur) (2019–present).** The most introspective phase. Rahman sounds like he's composing for himself. 99 Songs, Mimi, Cobra.

I should note—these aren't arbitrary time slices. Each one marks a shift in instrumentation, thematic concerns, and production philosophy. The [explore pages](https://yourrahmanera.com/explore) on the site go deeper into what defines each era.

## How the Quiz Works

The quiz has two modes: **Quick** (8 rounds) and **Deep** (16 rounds). If you're a casual listener, Quick gives you a reasonable signal. If you're a Rahmaniac who has opinions about the B-side tracks in Thiruda Thiruda, Deep mode is for you. More rounds means more data points, which means a more confident result.

Each round presents a pair of songs from different eras. You pick the one you prefer. Simple enough.

But not every listener knows every Rahman song. It would be unfair to force a choice between two songs you've never heard. So there's a "don't know these" option for rounds where neither song is familiar. And in the extremely unlikely event that you know both songs but don't like either of them—come on, it's Rahman, but sure—there's a "neither appeals" option too.

### The Seed

When you start a quiz, the server generates a random seed. Just a number. That seed is fed into a pseudo-random number generator called Mulberry32, which produces a deterministic sequence of numbers. The key property: the same seed always produces the same sequence.

This means the entire question order—which song pairs appear, in what order—is fully determined by that one number. The quiz doesn't store your question list anywhere. It stores a single number and regenerates the questions from that number whenever it needs to.

This buys you a few things:

**Cache recovery.** If the Redis session cache expires mid-quiz—which happens, because sessions have TTLs—the server can regenerate the exact same question list from the seed stored in Postgres. No need to cache the questions themselves.

**Reproducibility.** If something looks off with a user's result, I can replay their entire quiz by replaying their seed. Useful for debugging and auditing.

**Less state to manage.** The questions are a function of the seed, not a separate piece of state to keep in sync. One less thing that can go wrong.

On top of the PRNG sequence, there are pairing constraints applied deterministically: no same-era matchups, language parity between songs in a pair, and balanced era representation across rounds. Because the constraints are deterministic functions of the seed, they're reproducible too.

### Scoring and Signal Quality

Each pick is tallied into a win rate per era—how often that era's songs won when they appeared. These raw rates are passed through a [softmax function](https://en.wikipedia.org/wiki/Softmax_function) to produce the percentage breakdown you see on your result card.

The algorithm produces two types of results. A **single-era result** means one era clearly stood out from the rest. A **dual-era result** means two eras are statistically tied. I don't force a coin flip. I treat the tie as a valid result—your taste bridges two phases of Rahman's career. That's worth saying directly instead of pretending one barely edged out the other.

Behind the scenes, there are several checks to keep the results honest:

**Flat distribution detection.** If your picks are spread roughly evenly across all six eras, no single era meaningfully stands out. The algorithm flags this rather than arbitrarily declaring whichever era scored 18% instead of 16% as your "era."

**Nostalgia bias correction.** Some songs are iconic enough that people pick them on recognition alone. If the algorithm detects a pattern consistent with someone choosing the song they've heard more rather than the song they genuinely prefer, it flags a potential nostalgia bias in the result.

**Skip penalties.** If you skipped most of the rounds, the algorithm doesn't have enough signal to give you a confident result. Those results are flagged as low-confidence rather than presented as definitive.

Most personality quizzes give everyone a confident, shareable result regardless of how noisy the data is. I didn't want that. If the signal isn't there, the quiz says "we're not sure" instead of making something up.

## Tech Stack

Your Rahman Era is a fullstack TypeScript app built on **Next.js**. **Tailwind CSS** handles the styling, and **Framer Motion** powers the quiz animations—with all animations respecting `prefers-reduced-motion` for accessibility.

The data layer uses **PostgreSQL** as the source of truth and **Redis** as the cache layer. Postgres stores quiz seeds, responses, and computed results. Redis caches active quiz sessions for fast reads during gameplay.

Nothing exotic. The interesting decisions were in how these pieces fit together.

## Design Decisions

A few choices that shaped the architecture:

**Append-only, immutable result storage.** Once a quiz result is computed and stored, it's never modified. Every result is a permanent record. This simplifies the data model, makes auditing trivial, and means I never have to worry about race conditions on result writes.

**Redis cache miss recovery via seed reconstruction.** I mentioned this earlier, but it's worth calling out as a deliberate design choice. Redis is ephemeral by nature. Sessions expire. Servers restart. When a cache miss happens, the system regenerates the quiz state from the seed in Postgres. The user never notices.

**Idempotent responses and double-click protection.** Submitting the same answer twice doesn't create duplicate records or corrupt state. The quiz also handles the tab-close-and-reopen case: if you accidentally close the browser mid-quiz, reopening the link recovers your progress.

**A three-phase roadmap for question generation.** Phase one (where we are now): observe. Collect telemetry on how users interact with song pairs—which matchups produce quick, confident picks versus long deliberation or skips. Phase two: derive song roles. Use that data to understand which songs are strong discriminators between eras and which are noise. Phase three: optimize. Use the derived roles to generate smarter question sets that reach a confident result in fewer rounds.

The quiz will get better at reading your taste the more people take it. But only if I'm collecting the right data from the start, which is why the telemetry design came first.

## Reflections

This was a different kind of project for me. PurrPilot was born from a practical problem—I needed an app that didn't exist. Your Rahman Era was born from a question I was curious about: do people actually have a favorite Rahman era, or is the "90s was the best" narrative just the loudest one?

Early results suggest the latter. The eras people land on are more evenly distributed than I expected. There are real pockets of listeners whose taste aligns with the Experimental-Conceptual phase, or the Global Fusion & Minimalism years. People whose favorite Rahman doesn't look anything like the Greatest Hits playlist.

The engineering was fun, but that's not the satisfying part. The satisfying part is that the quiz surfaces something people didn't know about their own taste. Someone takes it expecting to get the 90s era—because that's what they've always said—and instead discovers their picks consistently favor the quieter, more restrained work from 2012 onwards. That moment of surprise is the whole point.

## Try It

Head to [yourrahmanera.com](https://yourrahmanera.com) and take the quiz. It takes about 30 seconds for Quick mode, 1 minute for Deep.

If you're a Rahman fan, I'd love to know what era you get. Find me on [Twitter](https://twitter.com/chingucha) or drop me an [email](mailto:shah.in@me.com).

Happy Valentine's Day. Here's to loving music that loves you back. [#EPI](https://x.com/search?q=epi%20from%3Aarrahman&src=typed_query)
