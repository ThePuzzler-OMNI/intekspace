/**
 * Intek Space — registry chrome
 * Network template kit v1 · Q-NET-ADOPT-INTEK 2026-08-05
 * Explicit CSS (not Tailwind-only). Desktop: text nav + always-on hamburger.
 * Sisters: omit self. Mounts: <header>/<footer> or #site-header / #site-footer.
 * Brand: hive gold family.
 */
(function () {
  if (window.__isSiteChrome) return;
  window.__isSiteChrome = true;

  var KIT = 'network-template-kit-v1';
  var REG_URL = 'site-registry.json';
  var SELF_HOST_MARKERS = ['intekspace.com', 'intek-space'];

  function year() {
    return new Date().getFullYear();
  }
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/"/g, '&quot;');
  }

  function isSelfSister(href) {
    var h = String(href || '').toLowerCase();
    for (var i = 0; i < SELF_HOST_MARKERS.length; i++) {
      if (h.indexOf(SELF_HOST_MARKERS[i]) !== -1) return true;
    }
    return false;
  }

  function filterSisters(list) {
    return (list || []).filter(function (s) {
      return s && s.href && s.label && !isSelfSister(s.href);
    });
  }

  var HAMBURGER =
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  var CHROME_CSS =
    'header[data-site-chrome="ready"]{border-bottom:1px solid rgba(100,150,220,0.14);position:sticky;top:0;z-index:var(--z-header,40);background:rgba(7,11,20,0.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}' +
    '.net-bar{max-width:var(--page-max,var(--max,56rem));margin:0 auto;padding:0 var(--page-pad,1.25rem);height:var(--header-h,3.5rem);display:flex;align-items:center;justify-content:space-between;gap:0.75rem;}' +
    '.net-brand{display:flex;align-items:center;gap:0.75rem;min-width:0;text-decoration:none;color:#eaf0fa;}' +
    '.net-mark{width:2rem;height:2rem;border-radius:9999px;border:1px solid rgba(212,176,86,0.55);display:inline-flex;align-items:center;justify-content:center;color:#d4b056;font-size:0.7rem;font-weight:600;letter-spacing:0.08em;flex-shrink:0;background:linear-gradient(145deg,rgba(74,168,255,0.15),rgba(212,176,86,0.12));}' +
    '.net-title{font-weight:600;font-size:0.875rem;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.net-sub{font-size:10px;color:rgba(154,173,200,0.85);text-transform:uppercase;letter-spacing:0.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.net-actions{display:flex;align-items:center;gap:0.75rem;flex-shrink:0;}' +
    '.net-nav-desktop{display:none;flex-wrap:wrap;justify-content:flex-end;gap:1.1rem;font-size:0.875rem;}' +
    '.net-nav-desktop a{color:rgba(154,173,200,0.9);text-decoration:none;}' +
    '.net-nav-desktop a:hover{color:#eaf0fa;}' +
    '.net-nav-toggle{display:inline-flex;width:2.5rem;height:2.5rem;align-items:center;justify-content:center;border-radius:9999px;border:1px solid rgba(212,176,86,0.4);background:transparent;color:#eaf0fa;cursor:pointer;padding:0;}' +
    '.net-nav-toggle:hover{border-color:rgba(232,200,106,0.75);}' +
    '.net-nav-toggle:focus-visible{outline:2px solid rgba(212,176,86,0.7);outline-offset:2px;}' +
    '#net-mobile-menu{display:none;border-top:1px solid rgba(100,150,220,0.12);background:rgba(7,11,20,0.98);}' +
    '#net-mobile-menu.open{display:block;}' +
    '#net-mobile-menu a{display:block;padding:0.85rem 1.25rem;color:#9aadc8;text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.04);font-size:0.95rem;min-height:44px;}' +
    '#net-mobile-menu a:hover{color:#eaf0fa;background:rgba(212,176,86,0.08);}' +
    'footer[data-site-chrome="ready"]{border-top:1px solid rgba(100,150,220,0.14);margin-top:3rem;}' +
    '.net-foot{max-width:var(--page-max,var(--max,56rem));margin:0 auto;padding:2.5rem var(--page-pad,1.25rem);font-size:0.875rem;color:rgba(154,173,200,0.8);}' +
    '.net-foot a{color:inherit;}' +
    '.net-foot a:hover{color:#eaf0fa;}' +
    '.net-foot-row{display:flex;flex-direction:column;gap:0.75rem;}' +
    '.net-foot-sisters{font-size:0.75rem;color:rgba(154,173,200,0.9);margin-top:1rem;}' +
    '.net-foot-note{font-size:0.75rem;color:rgba(154,173,200,0.55);margin-top:0.75rem;}' +
    '@media (min-width:768px){' +
    '.net-nav-desktop{display:flex;}' +
    '.net-nav-toggle{display:inline-flex !important;}' +
    '.net-foot-row{flex-direction:row;align-items:center;justify-content:space-between;}' +
    '}';

  function ensureCss() {
    if (document.getElementById('net-chrome-css')) return;
    var s = document.createElement('style');
    s.id = 'net-chrome-css';
    s.setAttribute('data-kit', KIT);
    s.textContent = CHROME_CSS;
    document.head.appendChild(s);
  }

  function navLinks(chrome, mobile) {
    return (chrome.nav || [])
      .map(function (item) {
        var ext = item.external ? ' target="_blank" rel="noopener"' : '';
        return (
          '<a href="' + esc(item.href) + '"' + ext + '>' + esc(item.label) + '</a>'
        );
      })
      .join('');
  }

  function buildHeader(chrome) {
    return (
      '<div class="net-bar">' +
      '<a class="net-brand" href="' +
      esc(chrome.home_href || 'index.html') +
      '" title="Intek Space · Intek Inc.">' +
      '<span class="net-mark">' +
      esc(chrome.mark || 'IS') +
      '</span>' +
      '<span><div class="net-title">' +
      esc(chrome.brand_primary || 'Intek Space') +
      '</div><div class="net-sub">' +
      esc(chrome.brand_secondary || 'Intek Inc.') +
      '</div></span></a>' +
      '<div class="net-actions">' +
      '<nav class="net-nav-desktop" aria-label="Primary">' +
      navLinks(chrome, false) +
      '</nav>' +
      '<button type="button" id="net-nav-toggle" class="net-nav-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="net-mobile-menu">' +
      HAMBURGER +
      '</button></div></div>' +
      '<div id="net-mobile-menu" role="navigation" aria-label="Mobile">' +
      navLinks(chrome, true) +
      '</div>'
    );
  }

  function buildFooter(chrome) {
    var sisters = filterSisters(chrome.sister_links)
      .map(function (s) {
        return (
          '<a href="' +
          esc(s.href) +
          '" target="_blank" rel="noopener">' +
          esc(s.label) +
          '</a>'
        );
      })
      .join(' · ');
    var local = (chrome.nav || [])
      .filter(function (n) {
        return !n.external;
      })
      .slice(0, 5)
      .map(function (n) {
        return '<a href="' + esc(n.href) + '">' + esc(n.label) + '</a>';
      })
      .join(' · ');
    return (
      '<div class="net-foot">' +
      '<div class="net-foot-row">' +
      '<div>© <span id="y">' +
      year() +
      '</span> ' +
      esc(chrome.brand_primary || 'Intek Space') +
      ' · ' +
      esc(chrome.brand_secondary || 'Intek Inc.') +
      '</div>' +
      '<div style="font-size:0.75rem">' +
      local +
      '</div></div>' +
      '<div class="net-foot-sisters">Sister network: ' +
      (sisters || '—') +
      '</div>' +
      '<p class="net-foot-note">Analytics may be used to improve the site. · kit ' +
      KIT +
      '</p>' +
      '</div>'
    );
  }

  function bindMobile() {
    var btn = document.getElementById('net-nav-toggle');
    var menu = document.getElementById('net-mobile-menu');
    if (!btn || !menu) return;

    function setOpen(o) {
      if (o) menu.classList.add('open');
      else menu.classList.remove('open');
      btn.setAttribute('aria-expanded', o ? 'true' : 'false');
      btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!menu.classList.contains('open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('open')) return;
      if (menu.contains(e.target) || btn.contains(e.target)) return;
      setOpen(false);
    });
  }

  function mountHeader(html) {
    var slot = document.getElementById('site-header');
    if (slot) {
      var h = document.createElement('header');
      h.setAttribute('data-site-chrome', 'ready');
      h.innerHTML = html;
      slot.replaceWith(h);
      return;
    }
    var headers = document.querySelectorAll(
      'header[data-site-chrome], header.site-chrome, body > header'
    );
    if (!headers.length) {
      var h2 = document.createElement('header');
      h2.setAttribute('data-site-chrome', 'ready');
      h2.innerHTML = html;
      document.body.insertBefore(h2, document.body.firstChild);
      return;
    }
    headers.forEach(function (el, i) {
      if (el.getAttribute('data-site-chrome') === 'skip') return;
      if (i > 0 && el.getAttribute('data-site-chrome') !== 'force') return;
      el.setAttribute('data-site-chrome', 'ready');
      el.innerHTML = html;
    });
  }

  function mountFooter(html) {
    var slot = document.getElementById('site-footer');
    if (slot) {
      var f = document.createElement('footer');
      f.setAttribute('data-site-chrome', 'ready');
      f.innerHTML = html;
      slot.replaceWith(f);
      return;
    }
    var footers = document.querySelectorAll('footer');
    if (!footers.length) {
      var f2 = document.createElement('footer');
      f2.setAttribute('data-site-chrome', 'ready');
      f2.innerHTML = html;
      document.body.appendChild(f2);
      return;
    }
    footers.forEach(function (f) {
      if (f.getAttribute('data-site-chrome') === 'skip') return;
      f.setAttribute('data-site-chrome', 'ready');
      f.innerHTML = html;
    });
  }

  function apply(reg) {
    ensureCss();
    var chrome = reg.chrome || {};
    chrome.sister_links = filterSisters(chrome.sister_links);
    document.documentElement.setAttribute('data-network-kit', KIT);

    mountHeader(buildHeader(chrome));
    bindMobile();
    mountFooter(buildFooter(chrome));
  }

  var FALLBACK_CHROME = {
    chrome: {
      mark: 'IS',
      home_href: 'index.html',
      brand_primary: 'Intek Space',
      brand_secondary: 'Intek Inc.',
      accent: 'hive',
      nav: [
        { href: 'philosophy.html', label: 'Philosophy' },
        { href: 'projects.html', label: 'Projects' },
        { href: 'education.html', label: 'Education' },
        {
          href: 'https://onemissionnetworkandinstitute.org/forge.html',
          label: 'Vision',
          external: true,
        },
        { href: 'hive-king.html', label: 'Hive King' },
        {
          href: 'https://onemissionnetworkandinstitute.org/contact.html',
          label: 'Contact',
          external: true,
        },
      ],
      sister_links: [
        { href: 'https://onemissionnetworkandinstitute.org/', label: 'One Mission' },
        { href: 'https://instituteofmatureimagination.org/', label: 'IMI' },
        { href: 'https://onemissionfoundation.org/', label: 'Foundation' },
        { href: 'https://omniexchange.org/', label: 'Exchange' },
      ],
    },
  };

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
        apply(FALLBACK_CHROME);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
