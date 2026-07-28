/**
 * Education Exchange track catalog — SSOT for landing + apply form.
 * Keep in sync with Notion Education Exchange + Harpster kit themes.
 */
(function (global) {
  var TRACKS = [
    {
      id: 'electrons-code',
      name: 'Electrons & code',
      short: 'Circuits · MCU',
      blurb:
        'Circuit basics and microcontroller control. Sensing and simple wireless nodes. Evidence: working demo, power path explained, one failure fixed on camera.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'sun-water',
      name: 'Sun → water & charge',
      short: 'Solar',
      blurb:
        'Solar watering electronics; solar battery charging. Evidence: input → stored or pumped output measured; cloudy-day limits named.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'heat-engines',
      name: 'Heat engines',
      short: 'ICE · Stirling',
      blurb:
        'ICE and Stirling engine build kits. Evidence: assembly complete, heat/fuel in vs motion out, efficiency honesty.',
      safetyNote: 'Heat and fuel hazards — adult present for heat/fuel steps.',
      guardian: true,
    },
    {
      id: 'thermo-peltier',
      name: 'Thermo (Peltier)',
      short: 'Peltier',
      blurb:
        'Peltier kits and coolers. Evidence: heat moved both directions, power budget, what the kit cannot do.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'flight-impulse',
      name: 'Flight & impulse (supervised)',
      short: 'Rockets · drones',
      blurb:
        'Model rockets and assemble drones. Evidence: safety checklist, sector awareness, energy and recovery.',
      safetyNote: 'Guardian required for minors. Flight path and local rules apply.',
      guardian: true,
    },
    {
      id: 'yard-coop',
      name: 'Yard edge / coop automation',
      short: 'Sensors · HA',
      blurb:
        'Chicken-coop sensing and local automation. Links Poop-to-Loop. Evidence: one automated report or sensor path; no storm-drain discharge.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'body-signal',
      name: 'Body signal (e-stethoscope)',
      short: 'BLE audio',
      blurb:
        'Bluetooth chest-sound device → phone/earbuds. Evidence: BLE link demo, one recorded session, notes.',
      safetyNote:
        'Not a medical device. Not for diagnosis. Educational / tinkering only.',
      guardian: false,
    },
    {
      id: 'presence-home',
      name: 'Presence / Grok Family Home',
      short: 'Advanced',
      blurb:
        'Speak-aloud, low-screen home node direction; transcripts. Evidence: architecture sketch or prototype log — not consumer medical claims.',
      safetyNote: 'Advanced track — steward review may apply.',
      guardian: false,
    },
    {
      id: 'ai-tv',
      name: 'AI TV (product team)',
      short: 'Attention product',
      blurb:
        'Host-managed AI-curated video + context panels + Spaces-class room. Evidence: panel mock or host-control storyboard.',
      safetyNote: '',
      guardian: false,
    },
    {
      id: 'yard-to-loop',
      name: 'Yard-to-Loop / Poop-to-Loop',
      short: 'Field project seats',
      blurb:
        'Education seats into substantial field projects (peer scope/cost to Hive King R&D—not toy kits). Sector overlays, DMAIC, refused lists. Evidence: measurement sheet, Phase 1 build or test log, refusals listed. Full project pages: yard-to-loop / poop-to-loop.',
      safetyNote: 'Outdoor / organic materials — hygiene protocols required. Hard refusals: no storm-drain fantasy; no human-food claims from uncontrolled residual.',
      guardian: false,
    },
    {
      id: 'interspecies-comms',
      name: 'Interspecies Communication Systems',
      short: 'LLM · Hardware',
      blurb:
        'Build the communication language models and the hardware that carries them so we can learn to speak with and listen to other species. Full stack under direct direction. Funded. Philosophy first, then constraints, then working systems and clear documentation others can follow. Open to model design, signal work, hardware integration, or educational materials.',
      safetyNote: '',
      guardian: false,
    },
  ];

  global.INTEK_EDU_TRACKS = TRACKS;
  global.INTEK_EDU_STEWARD_MAIL = 'tharpster@intekspace.com';
})(typeof window !== 'undefined' ? window : this);
