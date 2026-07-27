# Intek Space

**Domain:** https://intekspace.com  
**Path on PC:** `sites/intekspace/`  
**GitHub (when created):** `ThePuzzler-OMNI/intekspace`

## What this is

Public business front door for **Intek Inc.** engineering/manufacturing continuity. Replaces GoDaddy “Launching Soon” builder with real static HTML.

## Identity

See workspace `docs/INTEKSPACE_IDENTITY_PLAN.md` for M365 / mail path. This site is web presence only until mail cutover.

## Education Exchange

| Path | Page |
|------|------|
| `/education` | Track landing |
| `/education-apply` | Unified application form |
| `education-tracks.js` | Track catalog SSOT |
| `education-apply.js` | Form → mailto + JSON download + localStorage log |

**Steward mail:** `tharpster@intekspace.com` (change in `education-tracks.js` if needed).  
**Sources:** Notion Education Exchange + Harpster Science and Faith docs (`docs/INTEK_DESIGN_DOCS_COMPREHENSION.md` in Grok workspace).

## Philosophy & nomenclature

| Path | Page |
|------|------|
| `/philosophy` | Coherent writeup + glossary anchors (death-to-life breathe, DMAIC, sector overlays, twin extremes, refused lists, …) |

Unusual terms on the site should hyperlink to `philosophy.html#anchor`.

## Projects (substantial)

| Path | Page |
|------|------|
| `/projects` | Hub — Hive King + Yard-to-Loop + Poop-to-Loop |
| `/hive-king` | Starship-class apiary R&D |
| `/yard-to-loop` | Field project · substantial cost/scope (not a toy kit) |
| `/poop-to-loop` | Field project · peer level · hard refusals |

**Hive King** is the starship. **Yard-to-Loop** and **Poop-to-Loop** are peer-level field projects (budget, sectors, proof)—not “education add-ons.” Smaller kit tracks stay under Education Exchange.

## Form backbone

`form-validate.js` → `OMNI_FORM` (sync with `Grok/js/omni-form-validate.js`).  
Used by Education apply. See `Grok/docs/FORM_VALIDATE.md`.

## Deploy

Same Vercel flow as IMI: import repo → deploy → add domain → GoDaddy DNS.
