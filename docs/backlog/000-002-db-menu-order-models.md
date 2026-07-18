# 000-002 — Database Connection & Menu/Order Models

**Status:** Active

## Description

Connects the API to MongoDB and defines the `MenuItem` and `Order` data models, plus a health check endpoint. This is the persistence foundation later tickets (menu, cart/checkout) build on — no customer-facing behavior yet.

## Acceptance Criteria

```gherkin
Feature: Database connection and core models

  Scenario: Health check confirms a live DB connection
    Given the API is running with a valid MongoDB connection string
    When a request is made to the health check endpoint
    Then it returns a success response confirming the database is reachable

  Scenario: MenuItem model validation
    Given the MenuItem schema
    When a document is created missing a required field (name, price, or category)
    Then the write is rejected with a validation error

  Scenario: Order model validation
    Given the Order schema
    When a document is created with a valid phone number, item list, and subtotal
    Then the write succeeds and the document is retrievable by id
```

## Technical Notes

- Mongoose for schema definition/validation (TypeScript-friendly, standard for Node/Express/Mongo stacks)
- `MenuItem`: name, description, price (integer cents), category
- `Order`: items (menu item ref + qty + price snapshot), subtotal, phone, stripePaymentIntentId (nullable until 000-005), status, createdAt
- `GET /health` — pings the DB connection, returns 200/plain or JSON `{ ok: true }`
- Connection config via env var (`GROVE_MONGO_URI` or similar), following the shared config pattern established in 000-001

## Test Plan

**Automated:** Integration tests against an in-memory/test MongoDB instance (`mongodb-memory-server`) covering: health check with a live connection, MenuItem validation (required fields), Order validation and round-trip create/read.

**Manual:** None — no UI surface.

## Story Points

3

## Suggested Implementation Model

**Sonnet** — typical feature work: schema design plus integration tests, no novel algorithm but more than pure config.
