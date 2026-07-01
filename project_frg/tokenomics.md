# FORGE (FRG) — Tokenomics

> **Draft — Needs issuer confirmation before Launchpad publication.**
> Not financial advice. Final parameters must be verified by HACD Labs.

---

## Formation Model

FORGE uses the HACD Stack formation model. FRG tokens are not deployed arbitrarily — they are **formed** through a two-input cost structure:

| Input | Role |
|---|---|
| HACD unit (PoW-mined) | The container. Each HACD is a unique, mined asset with a permanent on-chain identity. |
| 50 HAC (stack cost) | The formation cost. Paid on-chain at the time of stacking. Not a purchase price — a formation input. |

Every FRG token in existence has a traceable formation record. No FRG can be pre-minted, backdated, or secretly issued outside the Stack mechanism.

---

## Supply Structure

| Parameter | Value |
|---|---|
| Maximum supply | 2,000,000 FRG |
| HACD lots | 200 |
| Units per lot | 10,000 FRG |
| Stack cost per lot | 50 HAC |
| Total formation cost (all lots) | 10,000 HAC |
| Asset type | Fungible Token (FT) |
| All lots equal? | Yes |

---

## Burn Mechanics

- **1 FRG = 1 prepaid AI agent task run**
- Tokens are **burned on use** — each task execution permanently removes 1 FRG from supply
- There is no mint-on-demand mechanism; burned FRG is not replaced
- New supply can only enter through additional HACD Stack lots (up to 200 total)

This creates a **formation floor on new supply** — every new FRG batch requires a new HACD unit and a 50 HAC stack cost.

---

## Supply Ceiling

200 HACD lots × 10,000 FRG = **2,000,000 FRG maximum supply**

Once all 200 lots are stacked, no additional FRG can be formed. Burned supply reduces the circulating total permanently.

---

## Formation Cost Reference

The on-chain formation cost to produce a full lot is:

```
1 HACD unit (PoW-mined) + 50 HAC + network fee
```

This is a **formation cost reference only** — not a price floor, not a guaranteed redemption value. Stack cost does not create or imply a price relationship.

---

## What HACD Adds

- **PoW origin**: Every HACD was mined. The mining cost is a sunk input that cannot be reverse-engineered.
- **Durable formation history**: The formation record (HACD name, formed-at timestamp, stack cost) is permanent and cannot be altered.
- **Supply transparency**: Formation progress is visible on-chain. No hidden minting.
- **Credible scarcity**: 200 HACD lot cap is structurally enforced by the number of HACD units used.

---

## What HACD Does Not Add

- HACD does not guarantee a price.
- HACD does not guarantee utility delivery.
- HACD does not make FRG an investment product.

---

*This is a draft issuance package for review. Final parameters must be confirmed by the issuer and HACD Labs before Launchpad publication.*
