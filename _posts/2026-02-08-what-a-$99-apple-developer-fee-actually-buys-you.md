---
title: "What a $99 Apple Developer Fee Actually Buys You"
date: 2026-02-08
tags: [apple, purrpilot, developer, cloudkit, ios]
description: "CloudKit, Apple Maps, auth, and hosting. What you actually get for $99/year, where it breaks down, and when you should walk away from it."
---

I'm building a feature for PurrPilot that lets users rate and leave notes on stops along their route. Think of it as lightweight, location-anchored reviews, specific to cat-friendly travel.

To build this, I needed a backend that could store user-generated content in a shared database, tie ratings to map locations, and make them visible to other users. I also needed maps. And a way to host all of this without setting up infrastructure.

I didn't pay for any of it. Not the backend. Not the maps. Not storage. Not compute. The only cost was the $99/year Apple Developer Program fee I was already paying to ship the app.

This post is about what that $99 actually gets you from an engineering standpoint, and where the ceiling is.

## What the $99 includes

Most engineers know the developer fee gets you App Store distribution and code signing. What's less obvious is the infrastructure that comes bundled in:

**CloudKit.** Apple's backend-as-a-service. You get private databases (per-user encrypted storage), shared databases, and, critically for PurrPilot, public databases. The public database is readable by anyone with the app, writable by authenticated users.

**Apple Maps.** MapKit and MapKit JS are included at no additional cost for apps in the Apple ecosystem. No per-request billing. No API key management. No usage tiers.

**Implicit identity via iCloud.** CloudKit's public database doesn't require explicit user sign-in. Any device with an iCloud account can write to it. CloudKit automatically attaches a `creatorUserRecordID` to every record, so you get a stable, opaque user identifier for free without building an auth system. If you need real authentication later (user profiles, edit/delete own reviews, moderation), you can layer that on. But for v1, you don't have to.

**Push notifications via APNs.** CloudKit supports CKSubscription for push notifications on record changes. PurrPilot doesn't use this yet. Community annotations are fetched on-demand each time a route is calculated, which keeps things lightweight and avoids needing notification permissions. Real-time sync via subscriptions is available if the product needs it later.

**Asset storage.** CloudKit stores structured data and binary assets (images, etc.) in the public database.

For PurrPilot's ratings feature, this meant I could store each rating as a CKRecord in the public database, keyed to a map location, with CloudKit automatically tracking which iCloud account created it. No REST API to write. No server to deploy. No database to provision. No auth system to build.

## Why CloudKit works well for this use case

CloudKit's public database is a good fit for a specific class of problems: apps where users contribute content that other users consume, where the data model is simple, and where you don't need cross-platform access.

For the ratings feature in PurrPilot, each record is small. A stop ID, a numeric rating, an optional text note, a timestamp, and a user reference. Queries are straightforward: fetch all ratings for a given stop, sorted by recency. There's no relational complexity. No joins. No aggregation pipelines.

CloudKit handles a few things that would otherwise eat real engineering time:

**Conflict resolution.** CloudKit uses server-change-token-based sync. When two users submit ratings for the same stop, there's no conflict. They're separate records. For cases where conflicts do arise (editing the same record), CloudKit provides server-side timestamps and error codes that let you resolve deterministically.

**Indexing.** You define queryable fields in the CloudKit Dashboard or schema, and Apple handles the indexing. For PurrPilot's query patterns (filter by stop ID, sort by date), this works without friction.

**Caching and offline.** CKQueryOperation supports result cursors and quality-of-service settings. Combined with NSPersistentCloudKitContainer for private data or manual local caching for public data, you can handle offline gracefully without bolting on a separate sync layer.

**Automatic scaling (within limits).** Apple manages the infrastructure. You don't provision instances or worry about connection pooling. For an app that might have ten users or ten thousand, this removes a variable.

The result is that I got a functional, multi-user backend for user-generated content without writing a single line of server-side code.

The sync model is simple. When a user saves a rating, it pushes to CloudKit immediately. Other users see it the next time they calculate a route through that stop and the app fetches fresh community data. There's no real-time sync, no background refresh, no "new review available" notification. Just fetch-on-demand. For a product at this stage, that's the right level of complexity.

For a solo developer shipping on a deadline, all of this matters.

## The real limitations and risks

CloudKit is not a general-purpose backend. Treating it as one will burn you.

### Quotas are real

CloudKit's public database comes with quotas that scale with your user base, but they are not unlimited. Apple allocates storage, request rates, and asset transfer limits. The base quotas are generous enough for small apps. As your user count grows, the quotas grow, but the exact scaling is opaque. Apple publishes baseline numbers in their documentation, but the relationship between active users and allocated capacity is not precisely documented.

If PurrPilot suddenly had a hundred thousand users all submitting ratings simultaneously, I'd hit rate limits. Apple doesn't charge overages. They throttle. Your requests start failing with `CKError.requestRateLimited`, and you're expected to back off. There's no way to pay for more capacity. You get what Apple gives you, and you wait.

For PurrPilot's scale, this is fine. For a product with aggressive growth targets, this is a structural risk you cannot engineer around within CloudKit.

### Querying is limited

CloudKit is not a relational database. You can query on indexed fields with basic predicates: equality, comparisons, `IN`, `CONTAINS` for string tokenization. You cannot do joins. You cannot do subqueries. Aggregations like averages or counts are not supported server-side. You'd compute those client-side or maintain denormalized counters.

For PurrPilot, computing an average rating for a stop means fetching all ratings for that stop and averaging on the device. At small scale, this is fine. At large scale, you'd want a server-side aggregation, which CloudKit cannot do.

### No server-side logic

There are no CloudKit equivalents to Firebase Cloud Functions or AWS Lambda triggers. You cannot run code on the server in response to a record being created. If I wanted to moderate review content before it became visible to other users, I'd need an external service.

For now, PurrPilot relies on Apple's built-in content moderation signals and client-side validation. This is a known gap.

### Vendor lock-in is total

CloudKit data lives in Apple's infrastructure. There is no standard export format. There's no migration tool. If you decide to move to Postgres or DynamoDB later, you're writing a custom migration—fetching every record type via CKQueryOperation, paginating through result cursors, and transforming the data yourself.

Your user identity is also locked in. Even without explicit authentication, CloudKit's `creatorUserRecordID` ties every record to an iCloud account via an opaque identifier. There is no portable identity. If you later move to a different backend and want to preserve the association between users and their content, you're building a migration path for identifiers that only have meaning inside CloudKit.

The lock-in is a concrete constraint you accept on day one. For PurrPilot, I accepted it because the speed-to-market tradeoff was worth it. For a product I expected to be cross-platform from the start, I would not have made this choice.

### No Android, no web (mostly)

CloudKit JS exists for web access to public databases, but it's limited and not widely used. There is no Android SDK. If your product needs to work on Android, CloudKit becomes, at best, a cache layer for your iOS client while something else serves as the source of truth.

PurrPilot is iOS-first by design, so this constraint aligns with the product decision. But it's worth being explicit: choosing CloudKit means choosing Apple-only for your data layer.

## How this compares to the alternatives

I'm not going to do a line-item cost comparison because the numbers depend heavily on scale, and most cost comparisons you'll find online are misleading at small scale anyway. Instead, here's the conceptual difference.

**Rolling your own backend (Postgres + API server + auth).** You get full control. You also get full responsibility: provisioning, monitoring, patching, scaling, and paying for all of it from day one. For a solo developer shipping an MVP over a holiday break, this is a tax on shipping speed. For a team building a product with known scale requirements, it's the right call.

**Firebase.** The closest analogue in terms of developer experience. Firestore gives you real-time sync, better querying than CloudKit, and cross-platform SDKs. Firebase Auth is more flexible than iCloud sign-in. But Firebase has usage-based pricing that can surprise you, and you're trading Apple lock-in for Google lock-in. Pick your vendor.

**AWS (DynamoDB + Cognito + API Gateway) or GCP equivalent.** Maximum flexibility. Maximum operational overhead. You'll spend more time on infrastructure than on product, especially early on. This makes sense when you need capabilities CloudKit can't provide. It doesn't make sense when you're validating an idea.

The honest summary: CloudKit's value comes from the fact that it's already there. The marginal cost of using it, when you're already paying for the developer program and shipping on iOS, is zero. That's the real economic argument.

## Decision criteria for other engineers

Use CloudKit's public database when:

- Your app is iOS/macOS-only and will stay that way for the foreseeable future.
- Your data model is flat or lightly hierarchical, not relational.
- Your query patterns are simple: filter on indexed fields, sort, paginate.
- You don't need server-side compute or triggers.
- You're a small team or solo developer optimizing for shipping speed over architectural flexibility.
- Your scale is modest enough that Apple's quotas won't be a ceiling.

Do not use CloudKit when:

- Cross-platform is a requirement, not a maybe.
- You need server-side aggregation, full-text search, or complex queries.
- You need server-side logic (moderation, webhooks, event processing).
- You have predictable high-throughput requirements and need capacity guarantees.
- Your data model will evolve in ways that require schema migrations with rollback support.
- You want a clean exit path to another provider.

You can also start with CloudKit to validate the product and migrate later if the product succeeds. The migration will be painful, but it's a problem you'll only have if things go well. There are worse problems to have.

## Ecosystem leverage vs. control

The $99 Apple Developer Fee buys you a complete infrastructure stack, if you're willing to stay inside the walls. For PurrPilot, those walls align with the product. iOS-only, map-centric, lightweight user-generated content. CloudKit handles it without drama.

But "without drama" only holds while your needs stay within the boundaries Apple has defined. The moment you need something CloudKit wasn't designed for (complex queries, server-side logic, cross-platform data access), you have no recourse within the ecosystem.

You're exchanging control for speed. You're borrowing infrastructure you don't own and can't modify. That's a reasonable deal when you're validating an idea. It becomes less reasonable as the product matures and your requirements grow beyond what Apple anticipated.

For PurrPilot, the math works today. Whether it works in a year depends on where the product goes.
