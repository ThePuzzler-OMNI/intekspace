/**
 * Intek Space — shared header/footer from site-registry.json (public web discipline).
 * Replaces <header data-site-chrome> or first site header; replaces <footer> unless data-site-chrome="skip".
 */
(function () {
  if (window.__isSiteChrome) return;
  window.__isSiteChrome = true;

  var REG_URL = 'site-registry.json';

  function year() {
    return new Date().getFullYear();
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function navLinks(nav, mobile) {
    return (nav || [])
      .map(function (item) {
        var ext = item.external ? ' target="_blank" rel="noopener"' : '';
        var cls = mobile
          ? 'block px-3 py-2 rounded-lg text-parchment/90 hover:bg-white/5'
          : 'text-sm text-mist hover:text-parchment transition';
        return (
          '<a href="' +
          esc(item.href) +
          '" class="' +
          cls +
          '"' +
          ext +
          '>' +
          esc(item.label) +
          '</a>'
        );
      })
      .join(mobile ? '' : '');
  }

  function buildHeader(chrome) {
    var nav = chrome.nav || [];
    var desktop = nav
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
      .join('\n');
    var mobile = navLinks(nav, true);
    return (
      '<div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">' +
      '<a href="' +
      esc(chrome.home_href || 'index.html') +
      '" class="flex items-center gap-2 font-display text-lg text-parchment">' +
      '<span class="w-8 h-8 rounded-lg bg-hive/20 text-hive text-xs font-bold flex items-center justify-center">' +
      esc(chrome.mark || 'IS') +
      '</span><span>Intek Space</span></a>' +
      '<nav class="hidden md:flex items-center gap-6">' +
      desktop +
      '</nav>' +
      '<button type="button" id="is-nav-toggle" class="md:hidden text-parchment p-2" aria-label="Menu" aria-expanded="false" aria-controls="is-mobile-menu">' +
      '<span class="text-xl">☰</span></button></div>' +
      '<div id="is-mobile-menu" class="hidden md:hidden border-t border-white/10 px-4 py-3 space-y-1 bg-ink/95">' +
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
        return '<a href="' + esc(n.href) + '" class="hover:text-parchment">' + esc(n.label) + '</a>';
      })
      .join(' · ');
    return (
      '<div class="max-w-5xl mx-auto px-4 py-10 text-sm text-mist space-y-4">' +
      '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
      '<div>© <span id="y">' +
      year() +
      '</span> Intek Space</div>' +
      '<div class="flex flex-wrap gap-x-2 gap-y-1">' +
      navBits +
      '</div></div>' +
      '<div class="text-xs text-mist/80">Sister network: ' +
      sisters +
      '</div>' +
      '<p class="text-xs text-mist/60">Analytics may be used to improve the site. See One Mission privacy for network practices.</p>' +
      '</div>'
    );
  }

  function bindMobile(root) {
    var btn = document.getElementById('is-nav-toggle');
    var menu = document.getElementById('is-mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.contains('hidden');
      menu.classList.toggle('hidden', !open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function apply(reg) {
    var chrome = reg.chrome || {};
    var headers = document.querySelectorAll('header[data-site-chrome], header.site-chrome, body > header');
    if (!headers.length) {
      var h = document.createElement('header');
      h.setAttribute('data-site-chrome', 'ready');
      h.className = 'sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur';
      h.innerHTML = buildHeader(chrome);
      document.body.insertBefore(h, document.body.firstChild);
      bindMobile(h);
    } else {
      headers.forEach(function (el, i) {
        if (el.getAttribute('data-site-chrome') === 'skip') return;
        if (i > 0 && el.getAttribute('data-site-chrome') !== 'force') return;
        el.className = 'sticky top-0 z-40 border-b border-white/10 bg-ink/90 backdrop-blur';
        el.setAttribute('data-site-chrome', 'ready');
        el.innerHTML = buildHeader(chrome);
        bindMobile(el);
      });
    }

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
        if (!r.ok) throw new Error('registry ' + r.status);
        return r.json();
      })
      .then(apply)
      .catch(function (e) {
        console.warn('[site-chrome] registry load failed', e);
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
