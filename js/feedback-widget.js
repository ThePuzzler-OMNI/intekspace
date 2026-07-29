/**
 * Sitewide bug / feature request — multi-site Bug Desk.
 * postToBugDesk uses text/plain to skip SWA CORS preflight.
 */
(function () {
  if (window.__omniFeedbackLoaded) return;
  window.__omniFeedbackLoaded = true;

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  function ensureDeps(cb) {
    function next() {
      if (!window.OmniBugs) return loadScript('js/bugs-store.js', cb);
      cb();
    }
    if (!window.OMNI_SITE) loadScript('js/site-config.js', next);
    else next();
  }

  function detectSite() {
    var h = (location.hostname || '').toLowerCase();
    if (h.indexOf('intekspace') !== -1) return 'intekspace';
    if (h.indexOf('instituteofmatureimagination') !== -1 || h.indexOf('imi') !== -1) return 'imi';
    if (h.indexOf('onemission') !== -1) return 'onemission';
    return h || 'unknown';
  }

  function detectMembership(cb) {
    var result = { role: 'guest', member: false, name: '', email: '', userId: '', provider: '' };
    function finish(p) {
      if (p) {
        result.userId = p.userId || '';
        result.name = p.name || p.userDetails || '';
        result.email = p.email || (p.userDetails && p.userDetails.indexOf('@') !== -1 ? p.userDetails : '') || '';
        result.provider = p.identityProvider || p.provider || '';
        result.role = result.email || result.userId ? 'member' : 'guest';
        result.member = result.role === 'member' || result.role === 'steward';
      }
      cb(result);
    }
    try {
      var raw = localStorage.getItem('omni_auth') || sessionStorage.getItem('omni_auth');
      if (raw) {
        var s = JSON.parse(raw);
        finish({ userId: s.userId, userDetails: s.userDetails || s.email, name: s.name, email: s.email, identityProvider: s.provider || 'google' });
        return;
      }
    } catch (e) {}
    finish(null);
  }

  function collectContext(membership) {
    return {
      site: detectSite(),
      pageUrl: location.href,
      pageTitle: document.title || '',
      referrer: document.referrer || '',
      userAgent: navigator.userAgent || '',
      language: navigator.language || '',
      viewport: (window.innerWidth || 0) + 'x' + (window.innerHeight || 0),
      screen: (screen.width || 0) + 'x' + (screen.height || 0),
      timezone: (Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      member: !!(membership && membership.member),
      role: (membership && membership.role) || 'guest',
      reporterName: (membership && membership.name) || '',
      reporterEmail: (membership && membership.email) || '',
      reporterUserId: (membership && membership.userId) || '',
      provider: (membership && membership.provider) || '',
      capturedAt: new Date().toISOString(),
    };
  }

  function postToBugDesk(f, ctx, item) {
    var desk = (window.OMNI_SITE && window.OMNI_SITE.bugDesk) || {};
    var api = desk.api || desk.apiAzure || 'https://onemissionnetworkandinstitute.org/api/bugs';
    var siteId = 'other';
    if (ctx.site && ctx.site.indexOf('intek') !== -1) siteId = 'intekspace';
    else if (ctx.site && ctx.site.indexOf('onemission') !== -1) siteId = 'onemission';
    else if (ctx.site && (ctx.site.indexOf('imi') !== -1 || ctx.site.indexOf('mature') !== -1)) siteId = 'imi';

    var payload = {
      siteId: siteId,
      type: f.type === 'feature' ? 'feature' : f.type === 'other' ? 'other' : 'bug',
      severity: f.severity || 'medium',
      title: f.title,
      description: f.desc,
      steps: f.steps || '',
      isMember: !!ctx.member,
      member: !!ctx.member,
      userId: ctx.reporterUserId || '',
      reporterName: ctx.reporterName || (f.email ? f.email.split('@')[0] : 'Guest'),
      reporterEmail: ctx.reporterEmail || f.email || '',
      pageUrl: ctx.pageUrl || location.href,
      pageTitle: ctx.pageTitle || document.title || '',
      userAgent: ctx.userAgent || navigator.userAgent || '',
      viewport: ctx.viewport || '',
      screen: ctx.screen || '',
      language: ctx.language || '',
      timezone: ctx.timezone || '',
      referrer: ctx.referrer || '',
      context: ctx,
    };

    // text/plain skips CORS preflight (SWA edge strips OPTIONS when Origin present)
    return fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', Accept: 'application/json' },
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || (j && j.ok === false)) {
          throw new Error((j && j.error) || ('bug-desk ' + r.status));
        }
        return j;
      });
    });
  }

  function inject() {
    var css = document.createElement('style');
    css.textContent = [
      '#omni-fb-btn{position:fixed;right:1rem;bottom:1rem;z-index:9999;padding:.75rem 1.1rem;border-radius:9999px;',
      'background:#059669;color:#fff;font:600 13px/1 system-ui,sans-serif;border:0;cursor:pointer;',
      'box-shadow:0 10px 25px rgba(0,0,0,.35)}',
      '#omni-fb-btn:hover{background:#10b981}',
      '#omni-fb-backdrop{position:fixed;inset:0;background:rgba(2,6,23,.72);z-index:10000;display:none;align-items:flex-end;justify-content:center;padding:1rem}',
      '#omni-fb-backdrop.open{display:flex}',
      '#omni-fb-panel{background:#0f172a;border:1px solid #1e293b;border-radius:1.25rem;width:100%;max-width:30rem;padding:1.25rem;color:#e2e8f0;max-height:92vh;overflow:auto}',
      '#omni-fb-panel h2{margin:0 0 .25rem;font-size:1.15rem}',
      '#omni-fb-panel p.hint{margin:0 0 1rem;font-size:.75rem;color:#94a3b8}',
      '#omni-fb-panel label{display:block;font-size:.7rem;text-transform:uppercase;letter-spacing:.04em;color:#94a3b8;margin:.65rem 0 .25rem}',
      '#omni-fb-panel input,#omni-fb-panel select,#omni-fb-panel textarea{width:100%;background:#020617;border:1px solid #334155;border-radius:.75rem;padding:.6rem .75rem;color:#e2e8f0;font:14px system-ui,sans-serif}',
      '#omni-fb-panel textarea{min-height:4.5rem;resize:vertical}',
      '#omni-fb-ctx{font-size:.65rem;color:#64748b;margin-top:.5rem;line-height:1.4}',
      '#omni-fb-actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1rem}',
      '#omni-fb-actions button,#omni-fb-actions a{flex:1;min-width:6.5rem;text-align:center;padding:.65rem;border-radius:9999px;font:600 12px system-ui,sans-serif;text-decoration:none;border:0;cursor:pointer}',
      '#omni-fb-submit{background:#059669;color:#fff}',
      '#omni-fb-board{background:transparent;color:#94a3b8;border:1px solid #334155!important}',
      '#omni-fb-close{background:#334155;color:#e2e8f0}',
      '#omni-fb-status{font-size:.75rem;margin-top:.75rem;color:#34d399;min-height:1rem}',
    ].join('');
    document.head.appendChild(css);

    var btn = document.createElement('button');
    btn.id = 'omni-fb-btn';
    btn.type = 'button';
    btn.textContent = 'Bug / idea';
    btn.setAttribute('aria-label', 'Report a bug or request a feature');
    document.body.appendChild(btn);

    var backdrop = document.createElement('div');
    backdrop.id = 'omni-fb-backdrop';
    backdrop.innerHTML =
      '<div id="omni-fb-panel" role="dialog" aria-modal="true">' +
      '<h2>Report bug or idea</h2>' +
      '<p class="hint">Goes to the shared multi-site Bug Desk. You stay on this page.</p>' +
      '<label for="omni-fb-type">Type</label>' +
      '<select id="omni-fb-type"><option value="bug">Bug</option><option value="feature">Feature request</option><option value="other">Other</option></select>' +
      '<label for="omni-fb-severity">Severity</label>' +
      '<select id="omni-fb-severity"><option value="medium">Medium</option><option value="low">Low</option><option value="high">High</option><option value="critical">Critical</option></select>' +
      '<label for="omni-fb-title-in">Title *</label>' +
      '<input id="omni-fb-title-in" maxlength="120" placeholder="Short summary" />' +
      '<label for="omni-fb-desc">Details *</label>' +
      '<textarea id="omni-fb-desc" maxlength="4000" placeholder="What happened?"></textarea>' +
      '<label for="omni-fb-steps">Steps / Expected vs actual</label>' +
      '<textarea id="omni-fb-steps" maxlength="2000" placeholder="1. … Expected: … Actual: …"></textarea>' +
      '<label for="omni-fb-email">Email (recommended)</label>' +
      '<input id="omni-fb-email" type="email" placeholder="so we can reply" />' +
      '<div id="omni-fb-ctx"></div>' +
      '<div id="omni-fb-actions">' +
      '<button type="button" id="omni-fb-submit">Send report</button>' +
      '<a id="omni-fb-board" href="https://onemissionnetworkandinstitute.org/bugs" target="_blank" rel="noopener">Public board</a>' +
      '<button type="button" id="omni-fb-close">Close</button>' +
      '</div>' +
      '<div id="omni-fb-status"></div></div>';
    document.body.appendChild(backdrop);

    var cachedMembership = null;
    var cachedCtx = null;

    function refreshContextDisplay() {
      detectMembership(function (m) {
        cachedMembership = m;
        cachedCtx = collectContext(m);
        var el = document.getElementById('omni-fb-ctx');
        if (el) {
          el.textContent =
            'Site: ' + cachedCtx.site + ' · ' +
            (cachedCtx.member ? 'Member' : 'Non-member') + ' · ' +
            cachedCtx.viewport + (m.email ? ' · ' + m.email : '');
        }
        var emailIn = document.getElementById('omni-fb-email');
        if (emailIn && !emailIn.value && m.email) emailIn.value = m.email;
      });
    }

    function open() {
      backdrop.classList.add('open');
      refreshContextDisplay();
      document.getElementById('omni-fb-title-in').focus();
    }
    function close() {
      backdrop.classList.remove('open');
    }
    function fields() {
      return {
        type: document.getElementById('omni-fb-type').value,
        severity: document.getElementById('omni-fb-severity').value,
        title: (document.getElementById('omni-fb-title-in').value || '').trim(),
        desc: (document.getElementById('omni-fb-desc').value || '').trim(),
        steps: (document.getElementById('omni-fb-steps').value || '').trim(),
        email: (document.getElementById('omni-fb-email').value || '').trim(),
      };
    }

    btn.addEventListener('click', open);
    document.getElementById('omni-fb-close').addEventListener('click', close);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) close();
    });

    document.getElementById('omni-fb-submit').addEventListener('click', function () {
      ensureDeps(function () {
        var f = fields();
        var statusEl = document.getElementById('omni-fb-status');
        if (!f.title || !f.desc) {
          statusEl.style.color = '#fbbf24';
          statusEl.textContent = 'Please add a title and details.';
          return;
        }
        var ctx = cachedCtx || collectContext(cachedMembership || {});
        if (f.email) ctx.reporterEmail = f.email;

        var item = { id: 'INB-' + Date.now(), reporterName: ctx.reporterName || 'Guest' };
        if (window.OmniBugs && typeof window.OmniBugs.addInbox === 'function') {
          item = window.OmniBugs.addInbox({
            type: f.type, severity: f.severity, title: f.title, description: f.desc,
            steps: f.steps, pageUrl: ctx.pageUrl, pageTitle: ctx.pageTitle, site: ctx.site,
            member: ctx.member, role: ctx.role, reporterEmail: ctx.reporterEmail || f.email,
            reporterName: ctx.reporterName || (f.email ? f.email.split('@')[0] : 'anonymous'),
            reporterUserId: ctx.reporterUserId, status: 'inbox', source: 'widget', context: ctx,
          }) || item;
        }

        statusEl.style.color = '#94a3b8';
        statusEl.textContent = 'Saving to Bug Desk…';

        postToBugDesk(f, ctx, item)
          .then(function (saved) {
            statusEl.style.color = '#34d399';
            var deskId = (saved && saved.id) || item.id;
            statusEl.innerHTML =
              'Saved to shared Bug Desk <strong style="color:#a7f3d0">' +
              deskId + '</strong>. Stays on this page — steward sees it under Cmd Cntr → Bugs.';
            setTimeout(function () { try { close(); } catch (e) {} }, 2200);
            try {
              var endpoint =
                (window.OMNI_SITE && window.OMNI_SITE.formSubmitEndpoint) ||
                'https://formsubmit.co/ajax/techsupport@onemissionnetworkandinstitute.org';
              var fd = new FormData();
              fd.append('_subject', '[OMNI ' + f.type + '][' + ctx.site + '] ' + f.title);
              fd.append('_template', 'table');
              fd.append('_captcha', 'false');
              fd.append('type', f.type);
              fd.append('severity', f.severity);
              fd.append('title', f.title);
              fd.append('message', f.desc);
              fd.append('page', ctx.pageUrl);
              fd.append('site', ctx.site);
              fd.append('bug_desk_id', deskId);
              fd.append('email', ctx.reporterEmail || f.email || 'anonymous@feedback.local');
              fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } }).catch(function () {});
            } catch (e) {}
          })
          .catch(function () {
            statusEl.style.color = '#94a3b8';
            statusEl.textContent = 'Bug Desk unavailable — sending email…';
            var endpoint =
              (window.OMNI_SITE && window.OMNI_SITE.formSubmitEndpoint) ||
              'https://formsubmit.co/ajax/techsupport@onemissionnetworkandinstitute.org';
            var fd = new FormData();
            fd.append('_subject', '[OMNI ' + f.type + '][' + ctx.site + '] ' + f.title);
            fd.append('_template', 'table');
            fd.append('_captcha', 'false');
            fd.append('type', f.type);
            fd.append('title', f.title);
            fd.append('message', f.desc);
            fd.append('page', ctx.pageUrl);
            fd.append('site', ctx.site);
            fd.append('email', ctx.reporterEmail || f.email || 'anonymous@feedback.local');
            fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } })
              .then(function (r) {
                if (!r.ok) throw new Error('send failed');
                statusEl.style.color = '#34d399';
                statusEl.textContent = 'Sent via email (' + item.id + ').';
              })
              .catch(function () {
                statusEl.style.color = '#fbbf24';
                statusEl.textContent = 'Could not reach Bug Desk. Email techsupport@intekspace.com';
              });
          });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
