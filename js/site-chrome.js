/**
 * Intek Space — shared header/footer (network chrome contract 2026-08-04).
 * Structure matches Foundation / Exchange / IMI: mark · nav · SVG hamburger · sister footer.
 */
(function () {
  if (window.__isSiteChrome) return;
  window.__isSiteChrome = true;

  var REG_URL = 'site-registry.json';
  var HAMBURGER =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  function year() {
    return new Date().getFullYear();
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function buildHeader(chrome) {
    var desktop = (chrome.nav || [])
      .map(function (item) {
        var ext = item.external ? ' target="_blank" rel="noopener"' : '';
        return (
          '<a href="' +
          esc(item.href) +
          '" class="text-sm text-mist hover:text-parchment transition"' +
          ext +
          '>' +
          esc(item.label) +
          '</a>'
        );
      })
      .join('');
    var mobile = (chrome.nav || [])
      .map(function (item) {
        var ext = item.external ? ' target="_blank" rel="noopener"' : '';
        return (
          '<a href="' +
          esc(item.href) +
          '" class="block px-5 py-3 text-sm text-mist border-b border-white/5 hover:text-parchment hover:bg-white/[0.03]"' +
          ext +
          '>' +
          esc(item.label) +
          '</a>'
        );
      })
      .join('');
    return (
      '<div class="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between gap-3">' +
      '<a href="' +
      esc(chrome.home_href || 'index.html') +
      '" class="flex items-center gap-3 min-w-0 text-parchment" title="Intek Space · Intek Inc.">' +
      '<span class="w-8 h-8 shrink-0 rounded-full border border-hive/40 bg-hive/15 text-hive text-xs font-bold flex items-center justify-center">' +
      esc(chrome.mark || 'IS') +
      '</span><span class="flex flex-col leading-tight min-w-0">' +
      '<span class="font-display text-base sm:text-lg truncate">' +
      esc(chrome.brand_primary || 'Intek Space') +
      '</span>' +
      '<span class="text-[10px] sm:text-[11px] text-mist font-sans tracking-wide truncate">' +
      esc(chrome.brand_secondary || 'Intek Inc.') +
      '</span></span></a>' +
      '<nav class="hidden md:flex items-center gap-5 lg:gap-6" aria-label="Primary">' +
      desktop +
      '</nav>' +
      '<button type="button" id="net-nav-toggle" class="md:hidden inline-flex w-10 h-10 items-center justify-center rounded-full border border-hive/30 text-parchment bg-transparent cursor-pointer" aria-label="Open menu" aria-expanded="false" aria-controls="net-mobile-menu">' +
      HAMBURGER +
      '</button></div>' +
      '<div id="net-mobile-menu" class="hidden md:hidden border-t border-white/10 bg-ink/95">' +
      mobile +
      '</div>'
    );
  }

  function buildFooter(chrome) {
    var sisters = (chrome.sister_links || [])
      .map(function (s) {
        return (
          '<a href="' +
          esc(s.href) +
          '" class="hover:text-parchment" target="_blank" rel="noopener">' +
          esc(s.label) +
          '</a>'
        );
      })
      .join(' · ');
    var navBits = (chrome.nav || [])
      .filter(function (n) {
        return !n.external;
      })
      .slice(0, 5)
      .map(function (n) {
        return (
          '<a href="' +
          esc(n.href) +
          '" class="hover:text-parchment">' +
          esc(n.label) +
          '</a>'
        );
      })
      .join(' · ');
    return (
      '<div class="max-w-5xl mx-auto px-5 py-10 text-sm text-mist space-y-4">' +
      '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
      '<div>© <span id="y">' +
      year() +
      '</span> ' +
      esc(chrome.brand_primary || 'Intek Space') +
      ' · ' +
      esc(chrome.brand_secondary || 'Intek Inc.') +
      '</div>' +
      '<div class="flex flex-wrap gap-x-2 gap-y-1 text-xs">' +
      navBits +
      '</div></div>' +
      '<div class="text-xs text-mist/80">Sister network: ' +
      sisters +
      '</div>' +
      '<p class="text-xs text-mist/60">Analytics may be used to improve the site. See One Mission privacy for network practices.</p>' +
      '</div>'
    );
  }

  function bindMobile() {
    var btn = document.getElementById('net-nav-toggle');
    var menu = document.getElementById('net-mobile-menu');
    if (!btn || !menu) return;
    function setOpen(o) {
      menu.classList.toggle('hidden', !o);
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    }
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      setOpen(menu.classList.contains('hidden'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });
  }

  function apply(reg) {
    var chrome = reg.chrome || {};
    var headers = document.querySelectorAll(
      'header[data-site-chrome], header.site-chrome, body > header'
    );
    if (!headers.length) {
      var h = document.createElement('header');
      h.setAttribute('data-site-chrome', 'ready');
      h.className =
        'sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur';
      h.innerHTML = buildHeader(chrome);
      document.body.insertBefore(h, document.body.firstChild);
    } else {
      headers.forEach(function (el, i) {
        if (el.getAttribute('data-site-chrome') === 'skip') return;
        if (i > 0 && el.getAttribute('data-site-chrome') !== 'force') return;
        el.className =
          'sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur';
        el.setAttribute('data-site-chrome', 'ready');
        el.innerHTML = buildHeader(chrome);
      });
    }
    bindMobile();

    var footers = document.querySelectorAll('footer');
    if (!footers.length) {
      var f = document.createElement('footer');
      f.className = 'mt-16 border-t border-white/10';
      f.setAttribute('data-site-chrome', 'ready');
      f.innerHTML = buildFooter(chrome);
      document.body.appendChild(f);
    } else {
      footers.forEach(function (f) {
        if (f.getAttribute('data-site-chrome') === 'skip') return;
        f.className = 'mt-16 border-t border-white/10';
        f.setAttribute('data-site-chrome', 'ready');
        f.innerHTML = buildFooter(chrome);
      });
    }
  }

  function boot() {
    if (document.documentElement.getAttribute('data-site-chrome') === 'skip') return;
    fetch(REG_URL, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then(apply)
      .catch(function (e) {
        console.warn('[intek site-chrome]', e);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
