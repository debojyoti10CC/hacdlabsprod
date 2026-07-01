# FORGE (FRG) — Project Summary

> **HACD Labs Incubator Cohort 2 — Draft submission. Not for publication.**

---

## One-Liner

FORGE (FRG) is a PoW-backed AI agent compute token formed through HACD Stack — every token has a verifiable on-chain formation origin, and burns permanently on task execution.

---

## Category

AI agent utility token · HACD Stack Asset

---

## The Problem

AI agent compute credits are typically soft commitments — tokens with no verifiable supply origin that can be minted, rebased, or diluted at will. For AI developers and protocol users, a compute credit with a freely minted supply is structurally identical to a promise.

There is no existing mechanism to give AI compute credits a PoW-anchored supply origin at issuance.

---

## The Asset Concept

FRG is a fungible token formed through HACD Stack:

- **1 FRG = 1 prepaid AI agent task run** (summarize, classify, transform)
- Tokens **burn on use** — each task execution permanently removes 1 FRG
- New supply **only through HACD Stack minting** — no free minting, no admin mint function
- Every formation batch has a **permanent on-chain record** tied to the HACD unit that contained it

---

## Why HACD

HACD Stack provides the credible formation mechanism that compute credits require:

1. Each HACD was **PoW-mined** — the mining cost is a sunk, verifiable input
2. The **50 HAC stack cost** is paid on-chain at formation time
3. The **formed-at timestamp** is permanent and cannot be backdated
4. Supply is **capped at 200 lots** (2,000,000 FRG) — enforced by HACD unit scarcity

This is not decorative blockchain use. The PoW origin makes the supply origin credible without requiring trust in the issuer.

---

## Target Users

- AI developers building agent workflows who need verifiable compute access credits
- HACD Stack participants interested in utility-focused Stack Assets
- Protocol users seeking burn-on-use token mechanics with transparent supply history

---

## Launch Readiness

| Item | Status |
|---|---|
| Issuance package (8 docs) | Draft — ready for review |
| launch_spec.json | Validated (0 errors, 2 expected draft warnings) |
| Demo app | Built — runs with `npm run dev` |
| AI integration | Mock fallback live; Groq/OpenAI configurable |
| Launchpad parameters | Needs issuer confirmation |
| Legal review | Not yet completed |
| HACD Labs review | Pending |

---

## Formation Reference

```
1 HACD unit (PoW-mined)
+ 50 HAC stack cost
+ network fee
= 10,000 FRG formed on-chain
```

This is a **formation cost reference only** — not a price floor, not a guaranteed redemption value.

---

*This is a draft project summary for review. Final parameters must be confirmed by the issuer and HACD Labs before Launchpad publication.*
