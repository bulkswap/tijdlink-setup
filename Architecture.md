Architecture Overview

This document serves as a critical, living reference for understanding the architecture of the betaalverzoek.nu / tijdlink-setup codebase. It is intended to enable rapid onboarding, safe modification, and extension of the system without breaking existing, production-critical functionality.

1. Project Structure

This project is a single Next.js application using the Pages Router, deployed on Vercel. There is no explicit backend/frontend split; server-side logic lives in API routes and getServerSideProps.

[Project Root]/
├── pages/
│   ├── api/
│   │   ├── generate-*.js        # Generate new slugs (per operator)
│   │   ├── store-location.js    # Stores geolocation verification logs
│   │   └── conversions.js       # (Planned) create/update conversions
│   │
│   ├── pay/
│   │   └── [slug].js            # Core redirect logic (MOST CRITICAL FILE)
│   │
│   ├── verify/
│   │   └── [slug].js            # Location verification UI + logging
│   │
│   ├── dashboard/
│   │   ├── index.js             # Dashboard overview (logs)
│   │   └── [slug].js            # Slug detail view (logs per slug)
│   │
│   ├── dashboard-login.js       # Cookie-based login for admin/operators
│   ├── e.js                     # Expired / error page
│   ├── fleur.js                 # Operator-specific generate UI
│   ├── nicole.js
│   └── nicole2.js
│
├── lib/
│   ├── redis.js                 # Upstash Redis client (single source)
│   └── (mail.js omitted)        # Email intentionally skipped
│
├── public/
├── README.md
└── ARCHITECTURE.md


Important:
There is no database other than Redis.
There is no background worker, cron, or queue.
Everything happens synchronously during requests.

2. High-Level System Diagram

Text-based overview of data flow:

[User]
  |
  v
[pay/{slug}]
  |
  |-- fetch slug-{slug} from Redis
  |-- log visit / redirect / expired
  |
  +--> [verify/{slug}] (if flow requires)
  |        |
  |        +-- browser geolocation
  |        +-- POST /api/store-location
  |
  +--> [External Payment Provider (Tikkie)]


Dashboard access:

[Admin / Operator]
  |
  v
[/dashboard-login] -> sets cookie
  |
  v
[/dashboard]
  |
  +--> Redis logs:index (sorted set)
       |
       +--> individual log objects

3. Core Components
3.1. Frontend

Name: Web Application (Next.js)

Description:
Single web application providing:

Public payment redirect links

Location verification UI

Admin & operator dashboards

Generate interfaces for operators

Technologies:

Next.js (Pages Router)

React

Browser Geolocation API

Deployment:
Vercel (Serverless)

3.2. Backend Services

There are no separate backend services.
All backend logic runs inside Next.js API routes and SSR functions.

3.2.1. Redirect & Logging Engine

Location: pages/pay/[slug].js

Description:
This is the core of the entire system.

Responsibilities:

Resolve slug → target URL

Enforce expiration (7 minutes)

Handle verify / verify-blocked flows

Log every meaningful event

Redirect user

Technologies:

Node.js (Next.js SSR)

Upstash Redis

Deployment:
Vercel Serverless Functions

⚠️ This file must not be refactored casually.

3.2.2. Location Verification Service

Location:

pages/verify/[slug].js

pages/api/store-location.js

Description:
Handles mandatory geolocation for certain flows.

Key rules:

Location is only requested on /verify/[slug]

Allowed & denied are both logged

Redirect only happens after verification (except bots like WhatsApp)

3.2.3. Dashboard Service

Location: pages/dashboard/*

Description:
Server-side rendered dashboard that reads logs efficiently using Redis indexes.

Key features:

Pagination

Slug search

Admin vs operator filtering

Slug detail pages

4. Data Stores
4.1. Primary Data Store

Name: Upstash Redis

Type: Redis (REST-based)

Purpose:
Stores everything:

Slugs

Logs

Conversions (planned)

Payout requests (planned)

4.2. Redis Data Models (Critical)
Slug

Key:

slug-{slug}


Structure:

{
  target: "https://tikkie.me/...",
  flow: "normal" | "verify" | "verify-blocked",
  firstClick: null | timestamp,

  // multi-user
  source: "fleur" | "nicole" | "nicole2"
}

Log (immutable)

Key:

log-{slug}-{timestamp}-{random}


Structure:

{
  id,
  slug,
  source,
  flow,
  event,              // visit | redirect | expired-hit | allowed | denied
  ip,
  userAgent,
  lat,
  lng,
  accuracy,
  locationStatus,     // allowed | denied | unknown
  time
}

Log Index (MANDATORY)

Key:

logs:index   // Sorted Set


member = log.id

score = time

❗ Dashboards must only read via this index

5. External Integrations / APIs
Payment Provider (Tikkie)

Purpose: Receive payments

Method: HTTP redirect

No API integration

Browser Geolocation API

Purpose: Country verification

Client-side only

6. Deployment & Infrastructure

Cloud Provider: Vercel

Database: Upstash Redis

CI/CD: Vercel GitHub integration

Monitoring: Vercel logs (manual)

7. Security Considerations
Authentication

Cookie-based auth

Admin cookie: dashboard_auth=admin

Operators: dashboard_auth={username}

Authorization

Admin sees all

Operators see only data with matching source

Data Safety

No PII encryption (assumed trusted environment)

HTTPS enforced by Vercel

8. Development & Testing Environment

Local dev via npm run dev

No automated tests

Manual verification via dashboard & Redis inspection

9. Future Considerations / Roadmap
Planned (not yet implemented)

Multi-user dashboards (fully isolated)

Conversions (manual, backend-only)

Commission calculation (25%)

Bonus system (€2.50 per conversion)

Payout requests with admin confirmation

Persistent dashboard notifications (no email)

Explicit Non-Goals

No webhooks

No background jobs

No automatic payouts

No third-party auth

10. Project Identification

Project Name: betaalverzoek.nu / tijdlink-setup

Repository URL: (your private GitHub repo)

Primary Maintainer: You

Date of Last Update: 2026-01-12

11. Glossary / Acronyms

Slug
A short-lived identifier that redirects to a payment URL.

Flow
Defines how a slug behaves (normal, verify, verify-blocked).

Log
Immutable record of a user interaction.

Conversion
A manual backend action representing a successful paid interaction.
Never automatic. Never user-triggered.

Operator
A non-admin user (e.g. fleur, nicole) who manages their own slugs and conversions.

✅ Final note (important)

The system already works.
Any future work must:

Preserve redirect behavior

Preserve logging semantics

Preserve Redis index usage

Add features on top, never by rewriting the core
