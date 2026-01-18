---
title: "The Tradeoffs: Shipping PurrPilot in a Week"
date: 2026-01-18
tags: [purrpilot, ios, product, engineering]
description: "Why I built for cats only and chose Apple Maps over Google while shipping PurrPilot during my Christmas break."
---

I had to make many tradeoffs as I built v1 of PurrPilot.

Before getting into the details, I should mention: I had less than a week to get the app ready and ship it. I was on my Christmas/New Year's break, so the clock was ticking.

## The product tradeoff

Why is the app exclusively targeting cat parents and not pet parents in general? There's a sizeable population of dog lovers out there—addressing them would logically make the app appealing to more people.

But as a cat parent myself, I wanted to validate that this idea actually needed to exist. If I'd gone for breadth instead of depth, the validation would have been diluted. So I decided to solve the problem for me first, and expand later if it made sense.

## The engineering tradeoff

Why did I go with Apple Maps for v1 instead of Google Maps?

Yes, Apple Maps data quality isn't as good as Google's. But it's no longer the meme-level joke it was when it launched last decade—it's improved considerably every year. More importantly, Apple Maps data is free for iOS/macOS apps. And given my time constraint, that made the decision easy.
