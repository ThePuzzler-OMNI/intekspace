/**
 * Education Exchange track catalog — SSOT for landing + apply form.
 * Source: Notion “Education Exchange — Track Descriptions & Application Spec (2026-07-27)”
 * + Harpster kit themes. Keep blurbs aligned with that page.
 */
(function (global) {
  var TRACKS = [
    {
      id: 'electrons-code',
      name: 'Electrons & code',
      short: 'Circuits · MCU',
      blurb:
        'Circuit basics and microcontroller control (Elenco / playground kits, ESP8266 wireless starter). Build simple sensing and wireless nodes. Evidence: working circuit demo, power path explained, one failure fixed on camera.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'sun-water',
      name: 'Sun → water & charge',
      short: 'Solar',
      blurb:
        'Solar watering electronics with selectable planters; solar battery charging. Evidence: panel/input → stored or pumped output measured; cloudy-day limitation named.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'heat-engines',
      name: 'Heat engines',
      short: 'ICE · Stirling',
      blurb:
        'ICE and Stirling engine build kits. Evidence: assembly complete, energy in (heat/fuel) vs motion out, efficiency honesty.',
      safetyNote: 'Heat and fuel hazards — adult present for heat/fuel steps.',
      guardian: true,
    },
    {
      id: 'thermo-peltier',
      name: 'Thermo (Peltier)',
      short: 'Peltier',
      blurb:
        'Peltier kits and Peltier water cooler. Evidence: heat moved both directions, power budget, what the kit cannot do.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'flight-impulse',
      name: 'Flight & impulse (supervised)',
      short: 'Rockets · drones',
      blurb:
        'DIY model rockets and assemble drones. Evidence: checklist safety, sector awareness (flight path), energy and recovery.',
      safetyNote: 'Guardian required for minors. Flight path and local rules apply.',
      guardian: true,
    },
    {
      id: 'yard-coop',
      name: 'Yard edge / coop automation',
      short: 'Sensors · HA',
      blurb:
        'Chicken-coop sensing and local automation (Home Assistant on-site). Links Poop-to-Loop. Evidence: one automated report or sensor path; no storm-drain discharge understood.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'body-signal',
      name: 'Body signal (e-stethoscope)',
      short: 'BLE audio',
      blurb:
        'Bluetooth chest-sound device → iPhone/earbuds; optional Watch alerts. Evidence: BLE link demo, one recorded session, app or test notes.',
      safetyNote:
        'Not a medical device. Not for diagnosis. Educational / tinkering only.',
      guardian: false,
    },
    {
      id: 'presence-home',
      name: 'Presence / Grok Family Home',
      short: 'Advanced',
      blurb:
        'Speak-aloud, low-screen home node direction; transcripts; extended battery body tech. Evidence: architecture sketch or prototype log — not consumer medical claims.',
      safetyNote: 'Advanced track — steward review may apply.',
      guardian: false,
    },
    {
      id: 'ai-tv',
      name: 'AI TV (product team)',
      short: 'Attention product',
      blurb:
        'Host-managed AI-curated speaker video + context panels + Spaces-class web room. Evidence: panel mock or host-control storyboard; philosophy of attention (not parrot talk).',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'yard-to-loop',
      name: 'Yard-to-Loop / Poop-to-Loop',
      short: 'Field project seats',
      blurb:
        'Physical yard instruments under sector overlays and DMAIC (peer scope/cost to Hive King R&D—not toy kits). Evidence: measurement sheet, Phase 1 build or test log, refusals listed. Full pages: yard-to-loop / poop-to-loop.',
      safetyNote:
        'Outdoor / organic materials — hygiene protocols required. Hard refusals: no storm-drain fantasy; no human-food claims from uncontrolled residual.',
      guardian: false,
    },
  ];

  /** Advanced R&D — not default education SKUs (shown as note, not apply cards) */
  var ADVANCED_NOTE =
    'Electrolysis torch (strict protocol only) · water-tattoo body-scan research · atom/light models · Hive King (steward invitation after safety and IP review).';

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  /**
   * Paint #track-cards bubbles on Education landing.
   * Was missing on first ship — data lived in TRACKS but never rendered.
   */
  function renderTrackCards(root) {
    var el =
      root ||
      (typeof document !== 'undefined' ? document.getElementById('track-cards') : null);
    if (!el || !TRACKS.length) return;

    var html = TRACKS.map(function (t, i) {
      var badges = [];
      if (t.guardian) {
        badges.push(
          '<span class="text-[10px] uppercase tracking-wider text-amber-200/90 border border-amber-500/35 rounded-full px-2 py-0.5">Guardian</span>'
        );
      }
      if (t.safetyNote) {
        badges.push(
          '<span class="text-[10px] uppercase tracking-wider text-mist/70 border border-white/10 rounded-full px-2 py-0.5">Safety note</span>'
        );
      }
      var badgeRow = badges.length
        ? '<div class="flex flex-wrap gap-1.5 mb-2">' + badges.join('') + '</div>'
        : '';
      var safety = t.safetyNote
        ? '<p class="mt-3 text-xs text-amber-100/75 leading-relaxed border-t border-white/5 pt-3">' +
          escapeHtml(t.safetyNote) +
          '</p>'
        : '';
      return (
        '<article class="panel rounded-2xl p-5 md:p-6 flex flex-col h-full" data-track="' +
        escapeHtml(t.id) +
        '">' +
        '<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">' +
        '<h3 class="font-display text-xl text-parchment leading-snug">' +
        escapeHtml(t.name) +
        '</h3>' +
        '<span class="text-[10px] uppercase tracking-[0.14em] text-hive shrink-0">' +
        escapeHtml(t.short) +
        '</span>' +
        '</div>' +
        badgeRow +
        '<p class="text-sm text-mist/90 leading-relaxed flex-1">' +
        escapeHtml(t.blurb) +
        '</p>' +
        safety +
        '<div class="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">' +
        '<span class="text-[10px] uppercase tracking-wider text-mist/45">Track ' +
        (i + 1) +
        ' of ' +
        TRACKS.length +
        '</span>' +
        '<a class="btn-gold-soft text-xs px-3 py-1.5 min-h-0" href="education-apply.html?track=' +
        encodeURIComponent(t.id) +
        '">Apply</a>' +
        '</div>' +
        '</article>'
      );
    }).join('');

    el.innerHTML = html;

    var adv = typeof document !== 'undefined' ? document.getElementById('track-advanced') : null;
    if (adv) {
      adv.innerHTML =
        '<p class="text-xs text-mist/65 leading-relaxed"><strong class="text-parchment/80 font-medium">Advanced / R&D (not default education SKUs):</strong> ' +
        escapeHtml(ADVANCED_NOTE) +
        '</p>';
    }
  }

  global.INTEK_EDU_TRACKS = TRACKS;
  global.INTEK_EDU_STEWARD_MAIL = 'tharpster@intekspace.com';
  global.INTEK_EDU_ADVANCED_NOTE = ADVANCED_NOTE;
  global.INTEK_renderTrackCards = renderTrackCards;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        renderTrackCards();
      });
    } else {
      renderTrackCards();
    }
  }
})(typeof window !== 'undefined' ? window : this);
