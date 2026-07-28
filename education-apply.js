/**
 * Education Exchange apply form — mailto + JSON download + local steward log.
 */
(function () {
  var tracks = window.INTEK_EDU_TRACKS || [];
  var stewardMail = window.INTEK_EDU_STEWARD_MAIL || 'tharpster@intekspace.com';
  var form = document.getElementById('edu-form');
  var statusEl = document.getElementById('status');
  var primary = document.getElementById('track_primary');
  var secondary = document.getElementById('track_secondary');
  var safety = document.getElementById('track-safety');
  var ageInput = document.getElementById('age');
  var guardianBlock = document.getElementById('guardian-block');
  var familyPartner = document.getElementById('family_partner');
  var familyWhoWrap = document.getElementById('family_who_wrap');
  var medicalWrap = document.getElementById('c_medical_wrap');
  var medicalCb = document.getElementById('c_medical');
  var mailHint = document.getElementById('mail-hint');
  var LOG_KEY = 'intek_edu_applications_v1';

  if (mailHint) mailHint.textContent = stewardMail;

  function trackById(id) {
    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].id === id) return tracks[i];
    }
    return null;
  }

  function fillSelects() {
    var pre = '';
    try {
      pre = new URLSearchParams(location.search).get('track') || '';
    } catch (_) {}
    tracks.forEach(function (t) {
      var o1 = document.createElement('option');
      o1.value = t.id;
      o1.textContent = t.name;
      if (t.id === pre) o1.selected = true;
      primary.appendChild(o1);
      var o2 = document.createElement('option');
      o2.value = t.id;
      o2.textContent = t.name;
      secondary.appendChild(o2);
    });
    if (!pre && primary.options.length) primary.selectedIndex = 0;
    updateSafety();
  }

  function updateSafety() {
    var t = trackById(primary.value);
    if (!t) {
      safety.classList.add('hidden');
      medicalCb.required = false;
      return;
    }
    var notes = [];
    if (t.safetyNote) notes.push(t.safetyNote);
    if (t.guardian) notes.push('Guardian participation expected for this track when applicant is a minor.');
    if (notes.length) {
      safety.textContent = notes.join(' ');
      safety.classList.remove('hidden');
    } else {
      safety.classList.add('hidden');
    }
    // Medical non-claim required for body-signal track
    var needMed = t.id === 'body-signal';
    medicalCb.required = needMed;
    medicalWrap.style.opacity = needMed ? '1' : '0.55';
  }

  function updateGuardian() {
    var age = parseInt(ageInput && ageInput.value, 10);
    var under = !isNaN(age) && age < 18;
    guardianBlock.classList.toggle('hidden', !under);
    document.getElementById('guardian_name').required = under;
    document.getElementById('guardian_email').required = under;
  }

  function showStatus(msg, ok) {
    statusEl.textContent = msg;
    statusEl.className =
      'mb-4 rounded-xl px-4 py-3 text-sm ' +
      (ok
        ? 'bg-emerald-950/50 border border-emerald-800/50 text-emerald-200'
        : 'bg-amber-950/40 border border-amber-800/40 text-amber-100');
    statusEl.classList.remove('hidden');
    try {
      statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (_) {}
  }

  function collectPacket() {
    var fd = new FormData(form);
    var obj = {};
    fd.forEach(function (v, k) {
      obj[k] = typeof v === 'string' ? v.trim() : v;
    });
    // checkboxes not in FormData if unchecked
    ['c_evidence', 'c_safety', 'c_medical', 'c_review', 'c_ip', 'c_video'].forEach(function (k) {
      var el = form.elements[k];
      obj[k] = !!(el && el.checked);
    });
    var pt = trackById(obj.track_primary);
    var st = trackById(obj.track_secondary);
    return {
      schema: 'intekspace.education_exchange.application.v1',
      submitted_at: new Date().toISOString(),
      steward_mail: stewardMail,
      track_primary_name: pt ? pt.name : obj.track_primary,
      track_secondary_name: st ? st.name : obj.track_secondary || '',
      fields: obj,
    };
  }

  function downloadJson(packet) {
    var blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    var name =
      'intek-edu-apply-' +
      (packet.fields.full_name || 'applicant').replace(/[^\w\-]+/g, '_').slice(0, 40) +
      '-' +
      Date.now() +
      '.json';
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 2000);
  }

  function saveLocal(packet) {
    try {
      var list = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      if (!Array.isArray(list)) list = [];
      list.unshift(packet);
      localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (_) {}
  }

  function mailtoBody(packet) {
    var f = packet.fields;
    var lines = [
      'Education Exchange application (auto-generated)',
      'Submitted: ' + packet.submitted_at,
      '',
      'PRIMARY TRACK: ' + packet.track_primary_name,
      'SECONDARY: ' + (packet.track_secondary_name || '—'),
      '',
      'Name: ' + f.full_name + (f.preferred_name ? ' (' + f.preferred_name + ')' : ''),
      'Age: ' + (f.age || '—'),
      'Email: ' + f.email,
      'Phone: ' + (f.phone || '—'),
      'City/State: ' + (f.city_state || '—'),
      'Guardian: ' + (f.guardian_name || '—') + ' / ' + (f.guardian_email || '—'),
      'Found us: ' + (f.found_us || '—'),
      '',
      'Why track:',
      f.why_track || '—',
      '',
      'Experience:',
      f.experience || '—',
      '',
      'Tools:',
      f.tools || '—',
      '',
      'Availability: ' + (f.availability || '—'),
      'Family partner: ' + (f.family_partner || 'no') + (f.family_who ? ' — ' + f.family_who : ''),
      'Preference: ' + (f.pref_return || '—'),
      '',
      'Ship-to:',
      f.ship_to || '—',
      '',
      'Signature: ' + f.signature + '  Date: ' + f.sign_date,
      '',
      'Consents: evidence=' +
        f.c_evidence +
        ' safety=' +
        f.c_safety +
        ' medical=' +
        f.c_medical +
        ' review=' +
        f.c_review +
        ' ip=' +
        f.c_ip +
        ' video=' +
        f.c_video,
      '',
      'JSON packet also downloaded by applicant.',
    ];
    return lines.join('\n');
  }

  function openMailto(packet) {
    var subj =
      'Education Exchange apply: ' +
      (packet.fields.full_name || 'applicant') +
      ' — ' +
      packet.track_primary_name;
    var href =
      'mailto:' +
      encodeURIComponent(stewardMail) +
      '?subject=' +
      encodeURIComponent(subj) +
      '&body=' +
      encodeURIComponent(mailtoBody(packet));
    // length safety for some clients
    if (href.length > 1800) {
      href =
        'mailto:' +
        encodeURIComponent(stewardMail) +
        '?subject=' +
        encodeURIComponent(subj) +
        '&body=' +
        encodeURIComponent(
          'Application packet is large — see attached download JSON on your device.\n\n' +
            'Name: ' +
            packet.fields.full_name +
            '\nTrack: ' +
            packet.track_primary_name +
            '\nEmail: ' +
            packet.fields.email +
            '\n\nFull JSON was downloaded as a file by the form.'
        );
    }
    window.location.href = href;
  }

  function validateCustom() {
    var t = trackById(primary.value);
    if (t && t.id === 'body-signal' && !medicalCb.checked) {
      showStatus('Please acknowledge the medical non-claim for the body-signal track.', false);
      medicalCb.focus();
      return false;
    }
    var age = parseInt(ageInput && ageInput.value, 10);
    if (!isNaN(age) && age < 18) {
      if (!form.elements.guardian_name.value.trim() || !form.elements.guardian_email.value.trim()) {
        showStatus('Guardian name and email are required for under 18.', false);
        return false;
      }
    }
    return true;
  }

  primary.addEventListener('change', updateSafety);
  if (ageInput) {
    ageInput.addEventListener('input', updateGuardian);
    ageInput.addEventListener('change', updateGuardian);
  }
  familyPartner.addEventListener('change', function () {
    familyWhoWrap.classList.toggle('hidden', familyPartner.value !== 'yes');
  });

  document.getElementById('sign_date').value = new Date().toISOString().slice(0, 10);

  function runSubmitFlow() {
    if (!validateCustom()) return false;
    var packet = collectPacket();
    saveLocal(packet);
    downloadJson(packet);
    openMailto(packet);
    showStatus(
      'Packet saved + downloaded. Email client should open to ' +
        stewardMail +
        '. If mail did not open, attach the JSON file manually.',
      true
    );
    try {
      if (window.gtag) {
        window.gtag('event', 'edu_apply_submit', {
          track: packet.fields.track_primary,
        });
      }
    } catch (_) {}
    return true;
  }

  // Shared validation backbone (email/phone/length/honeypot + blur feedback)
  if (window.OMNI_FORM && OMNI_FORM.bind) {
    OMNI_FORM.bind(form, {
      honeypot: true,
      live: true,
      onInvalid: function (result) {
        showStatus(result.message || 'Please fix the highlighted fields.', false);
      },
      onValid: function () {
        // Form backbone already passed — custom rules + submit side effects
        if (!runSubmitFlow()) return false;
        return false; // prevent native submit (mailto path)
      },
    });
  } else {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        showStatus('Please complete required fields.', false);
        return;
      }
      runSubmitFlow();
    });
  }

  document.getElementById('btn-download').addEventListener('click', function () {
    var ok = true;
    if (window.OMNI_FORM && OMNI_FORM.validateForm) {
      var result = OMNI_FORM.validateForm(form);
      if (!result.ok) {
        showStatus(result.message || 'Fix highlighted fields before download.', false);
        if (result.firstInvalid) {
          try {
            result.firstInvalid.focus();
          } catch (_) {}
        }
        ok = false;
      }
    } else if (!form.checkValidity()) {
      form.reportValidity();
      showStatus('Fill required fields before download, or continue editing.', false);
      ok = false;
    }
    if (!ok || !validateCustom()) return;
    var packet = collectPacket();
    downloadJson(packet);
    saveLocal(packet);
    showStatus('JSON downloaded. Use Submit to also open steward email.', true);
  });

  fillSelects();
  updateGuardian();
})();
