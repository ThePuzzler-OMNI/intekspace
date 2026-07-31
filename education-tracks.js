/**
 * Education Exchange track catalog — SSOT for landing + apply form.
 * About = live page only; else About · soon. about field is the switch.
 * Identity = track id (+ name + About URL). UI sort is presentation only.
 * Do NOT show "Track N of M" — that is not Notion ### N and not mission rank.
 */
(function (global) {
  var TRACKS = [
    { id: 'electrons-code', name: 'Electrons & code', short: 'Circuits · MCU', about: 'electrons-code.html',
      blurb: 'You need a circuit that works — sensing, control, a small wireless node. Explore electrons and code under that need. Evidence: working demo, power path explained, one failure fixed on camera. Not a kit shopping list.',
      safetyNote: '', guardian: false },
    { id: 'sun-water', name: 'Sun → water & charge', short: 'Solar',
      blurb: 'Kits need power; plants need water — the sun already provides. Explore solar input to stored charge and real loads. Evidence: panel to output measured; cloudy-day limit named. Not free-energy marketing or a fixed parts cart.',
      safetyNote: '', guardian: false },
    { id: 'solar-charge', name: 'Solar charge bank', short: 'Sun · packs · HA', about: 'solar-charge.html',
      blurb: 'Play day needs fresh packs and an honest account of status and health over time. Prefer the sun; monitor the bank locally. Evidence: typed packs, ledger, one limit named. Not a charge-station BOM.',
      safetyNote: 'Mixed chemistries need typed bays and correct charge profiles — no junk-drawer charging. Guardian for outdoor panel work and any mains fallback. Stored energy is not a toy.',
      guardian: true },
    { id: 'heat-engines', name: 'Heat engines', short: 'ICE · Stirling',
      blurb: 'Heat in, motion out — engines as conversion science. Evidence: assembly complete, energy in versus motion out, efficiency honesty. Adult present for heat and fuel steps. Category exploration, not a product SKU.',
      safetyNote: 'Heat and fuel hazards — adult present for heat/fuel steps.', guardian: true },
    { id: 'thermo-peltier', name: 'Thermo (Peltier)', short: 'Peltier',
      blurb: 'Move heat with electricity and name the power budget. Evidence: heat both directions, cost of the move, what the setup cannot do. Category exploration — not a cooler product promise or shopping list.',
      safetyNote: '', guardian: false },
    { id: 'flight-impulse', name: 'Flight & impulse (supervised)', short: 'Rockets · drones',
      blurb: 'Impulse, recovery, and air space as supervised science. Evidence: checklist safety, flight-path awareness, energy and recovery named. Guardian required for minors. Not unsupervised launch or a toy catalog claim.',
      safetyNote: 'Guardian required for minors. Flight path and local rules apply.', guardian: true },
    { id: 'yard-coop', name: 'Yard edge / coop automation', short: 'Sensors · HA',
      blurb: 'Yard and coop need honest sensing and local automation, including on-site Home Assistant. Evidence: one sensor or report path; no storm-drain discharge. Links residual field work without promising a kit cart.',
      safetyNote: '', guardian: false },
    { id: 'body-signal', name: 'Body signal (e-stethoscope)', short: 'BLE audio',
      blurb: 'Body sounds as a signal path — listen, link, record — without medical theater. Evidence: BLE link, one recorded session, notes on what it is not. Educational only; not diagnosis or a device SKU.',
      safetyNote: 'Not a medical device. Not for diagnosis. Educational / tinkering only.', guardian: false },
    { id: 'presence-home', name: 'Presence / Grok Family Home', short: 'Advanced',
      blurb: 'Low-screen home presence under steward review: speak-aloud direction, transcripts, extended body tech. Evidence: architecture sketch or prototype log. Related to OMNI Home. Not consumer medical claims or a kit BOM.',
      safetyNote: 'Advanced track — steward review may apply.', guardian: false, about: 'omni-home.html' },
    { id: 'omni-vision', name: 'OMNI Vision', short: 'Network lens', about: 'omni-vision.html',
      blurb: 'Network information lens: host-managed Spaces-class room, context panels, deliberate publish. Host above the model; open web stays free. Evidence: panel mock or host-control storyboard. Not a product BOM.',
      safetyNote: '', guardian: false },
    { id: 'wearable-low-tech', name: 'Wearable low tech', short: 'Body · educate the animal',
      blurb: 'How can I and AI educate this dumb animal? Low-tech wear and discipline before merge claims. Plans exist; you contribute and win a seat. Public copy is not a wearable shopping list.',
      safetyNote: 'Not a medical device. Not for diagnosis or treatment. Body-worn tech is educational / prototype only; steward review on anything skin-contact or continuous wear.', guardian: false },
    { id: 'omni-home', name: 'OMNI Home', short: 'Five P presence',
      blurb: 'How can I and AI be personal, parental, professional, political, and philosophical? House Vaults and Atticus under One Mission. Full About page; Apply for the seat. Not a kit BOM.',
      safetyNote: 'Advanced product track — steward review. No surveillance theater; host-managed attention only. Not consumer medical claims.', guardian: false, about: 'omni-home.html' },
    { id: 'omnibot', name: 'OMNIbot', short: 'Continuity · command',
      blurb: 'The robot from childhood; the mind-meld goal. Continuity under One Mission — primary goal. Full About page; Apply for the seat. Not medical, not guaranteed identity upload, not a product SKU.',
      safetyNote: 'Advanced continuity track — steward review. Not a medical device. No claim of uploaded consciousness or guaranteed survival of identity. Prototype and architecture only.', guardian: false, about: 'omnibot.html' },
    { id: 'yard-to-loop', name: 'Yard-to-Loop / Poop-to-Loop', short: 'Field project seats',
      blurb: 'A real yard with residual and land cost visible — field conversion as science, not a toy kit. Evidence: measures, build or test log, refusals listed. About opens the field pages.',
      safetyNote: 'Outdoor / organic materials — hygiene protocols required. Hard refusals: no storm-drain fantasy; no human-food claims from uncontrolled residual.', guardian: false, about: 'yard-to-loop.html' }
  ];

  var ADVANCED_NOTE =
    'Electrolysis torch (strict protocol only) · water-tattoo body-scan research · atom/light models · Hive King (steward invitation after safety and IP review).';

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"');
  }

  function renderTrackCards(targetId) {
    var el = typeof document !== 'undefined' ? document.getElementById(targetId || 'track-cards') : null;
    if (!el) return;

    var PROJECT_IDS = {
      'wearable-low-tech': true,
      'omni-home': true,
      'omnibot': true,
      'yard-to-loop': true
    };
    function cardTier(t) {
      if (PROJECT_IDS[t.id]) return 2;
      if (t.guardian || t.safetyNote) return 1;
      return 0;
    }
    var ordered = TRACKS.slice().sort(function (a, b) {
      var d = cardTier(a) - cardTier(b);
      if (d !== 0) return d;
      return TRACKS.indexOf(a) - TRACKS.indexOf(b);
    });
    var html = ordered.map(function (t) {
      var badges = [];
      if (t.guardian) badges.push('<span class="text-[10px] uppercase tracking-wider text-hive border border-hive/40 rounded-full px-2 py-0.5">Guardian</span>');
      if (t.safetyNote) badges.push('<span class="text-[10px] uppercase tracking-wider text-mist/70 border border-white/10 rounded-full px-2 py-0.5">Safety note</span>');
      var badgeRow = badges.length ? '<div class="flex flex-wrap gap-1.5 mb-2">' + badges.join('') + '</div>' : '';
      var safety = t.safetyNote
        ? '<p class="mt-3 text-xs text-amber-100/75 leading-relaxed border-t border-white/5 pt-3">' + escapeHtml(t.safetyNote) + '</p>'
        : '';

      var aboutBtn = t.about
        ? '<a class="btn-ghost text-xs px-3 py-1.5 min-h-0" href="' + escapeHtml(t.about) + '">About</a>'
        : '<span class="inline-flex items-center text-xs px-3 py-1.5 min-h-0 rounded-full border border-white/10 text-mist/40 cursor-default select-none" title="Full About page and implementation videos will land here. Card blurb is the preview — not a kit BOM.">About · soon</span>';

      return (
        '<article class="panel rounded-2xl p-5 md:p-6 flex flex-col h-full" data-track="' + escapeHtml(t.id) + '" id="track-' + escapeHtml(t.id) + '">' +
        '<div class="flex flex-wrap items-baseline justify-between gap-2 mb-1">' +
        '<h3 class="font-display text-xl text-parchment leading-snug">' + escapeHtml(t.name) + '</h3>' +
        '<span class="text-[10px] uppercase tracking-[0.14em] text-hive shrink-0">' + escapeHtml(t.short) + '</span></div>' +
        badgeRow +
        '<p class="text-sm text-mist/90 leading-relaxed flex-1">' + escapeHtml(t.blurb) + '</p>' +
        safety +
        '<div class="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-end gap-2">' +
        aboutBtn +
        '<a class="btn-gold-soft text-xs px-3 py-1.5 min-h-0" href="education-apply.html?track=' + encodeURIComponent(t.id) + '">Apply</a>' +
        '</div></article>'
      );
    }).join('');

    el.innerHTML = html;

    var adv = typeof document !== 'undefined' ? document.getElementById('track-advanced') : null;
    if (adv) {
      adv.innerHTML =
        '<p class="text-xs text-mist/65 leading-relaxed"><strong class="text-parchment/80 font-medium">Advanced / R&D (not default education SKUs):</strong> ' +
        escapeHtml(ADVANCED_NOTE) + '</p>' +
        '<p class="text-xs text-mist/50 leading-relaxed mt-2">About = live page when ready. About · soon = no page yet. Apply = seat and packet. Card order is browse sort only — identity is the track name and Apply link, not a number. Public copy does not promise a specific BOM.</p>';
    }
  }

  global.INTEK_EDU_TRACKS = TRACKS;
  global.INTEK_EDU_STEWARD_MAIL = 'tharpster@intekspace.com';
  global.INTEK_EDU_ADVANCED_NOTE = ADVANCED_NOTE;
  global.INTEK_renderTrackCards = renderTrackCards;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { renderTrackCards(); });
    } else {
      renderTrackCards();
    }
  }
})(typeof window !== 'undefined' ? window : this);
