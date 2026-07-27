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

## Hive King (R&D)

| Path | Page |
|------|------|
| `/hive-king` | System layers · BOM summary · KiCAD checklist |

**Not** a default Education SKU. SSOT design files under `One Mission\OMNI 2\Design Documents from Intek\`.

## Deploy

Same Vercel flow as IMI: import repo → deploy → add domain → GoDaddy DNS.
