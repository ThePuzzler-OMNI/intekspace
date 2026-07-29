/**
 * Intek Space — unified header + footer.
 * Place empty #site-header and #site-footer; set data-page on <body>.
 */
(function () {
  'use strict';

  var LINKS = [
    { id: 'home', href: '/', label: 'Home' },
    { id: 'philosophy', href: '/philosophy', label: 'Philosophy' },
    { id: 'projects', href: '/projects', label: 'Projects' },
    { id: 'education', href: '/education', label: 'Education' },
    { id: 'launch', href: '/launch', label: 'Launch', cta: true },
    { id: 'contact', href: '/#contact', label: 'Contact' },
  ];

  function pageId() {
    var b = document.body;
    if (b && b.getAttribute('data-page')) return b.getAttribute('data-page');
    var path = (location.pathname || '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    if (path === '/' || path === '') return 'home';
    var leaf = path.split('/').pop();
    return leaf || 'home';
  }

  function isActive(link, page) {
    if (link.id === page) return true;
    if (page === 'education-apply' && link.id === 'education') return true;
    if ((page === 'hive-king' || page === 'yard-to-loop' || page === 'poop-to-loop') && link.id === 'projects')
      return true;
    return false;
  }

  function navLinks(page, drawer) {
    return LINKS.map(function (L) {
      var active = isActive(L, page);
      var cls = [];
      if (active) cls.push('is-active');
      if (L.cta && !drawer) cls.push('site-nav__cta');
      return (
        '<a href="' +
        L.href +
        '"' +
        (cls.length ? ' class="' + cls.join(' ') + '"' : '') +
        (active ? ' aria-current="page"' : '') +
        '>' +
        L.label +
        '</a>'
      );
    }).join('');
  }

  function renderHeader(el, page) {
    el.innerHTML =
      '<header class="site-header">' +
      '<div class="site-header__inner">' +
      '<a class="site-brand" href="/">' +
      '<span class="site-brand__mark" aria-hidden="true">IS</span>' +
      '<span class="min-w-0">' +
      '<span class="site-brand__name">Intek Space</span>' +
      '<span class="site-brand__tag">Engineering · Education · Continuity</span>' +
      '</span></a>' +
      '<nav class="site-nav" aria-label="Primary">' +
      navLinks(page, false) +
      '</nav>' +
      '<button type="button" class="site-menu-btn" id="site-menu-btn" aria-expanded="false" aria-controls="site-drawer" aria-label="Open menu">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '</button>' +
      '</div>' +
      '<div class="site-drawer" id="site-drawer" hidden>' +
      navLinks(page, true) +
      '</div>' +
      '</header>';

    var btn = document.getElementById('site-menu-btn');
    var drawer = document.getElementById('site-drawer');
    if (btn && drawer) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        var next = !open;
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
        if (next) {
          drawer.removeAttribute('hidden');
          drawer.classList.add('is-open');
        } else {
          drawer.setAttribute('hidden', '');
          drawer.classList.remove('is-open');
        }
        btn.setAttribute('aria-label', next ? 'Close menu' : 'Open menu');
      });
    }
  }

  function renderFooter(el, page) {
    var year = new Date().getFullYear();
    var footLinks = LINKS.filter(function (L) {
      return L.id !== 'home';
    })
      .map(function (L) {
        var active = isActive(L, page);
        return (
          '<a href="' +
          L.href +
          '"' +
          (active ? ' class="is-active" aria-current="page"' : '') +
          '>' +
          L.label +
          '</a>'
        );
      })
      .join('');

    el.innerHTML =
      '<footer class="site-footer">' +
      '<div class="site-footer__inner">' +
      '<div class="site-footer__row">' +
      '<div>© ' +
      year +
      ' Intek Space / Intek Inc. · intekspace.com</div>' +
      '<div class="site-footer__links">' +
      footLinks +
      '<a href="https://onemissionnetworkandinstitute.org/" rel="noopener">One Mission</a>' +
      '</div></div>' +
      '<p class="site-footer__privacy">' +
      '<strong style="color:rgba(139,154,171,0.65);font-weight:500">Privacy & analytics.</strong> ' +
      'This site uses Google Analytics 4 for traffic (pages, approximate location/device, referrals). ' +
      'We do not use this tag to collect names, emails, or phone numbers from forms. See ' +
      '<a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Google’s Privacy Policy</a>. ' +
      'Contact: <a href="mailto:tharpster@intekspace.com">tharpster@intekspace.com</a>.' +
      '</p></div></footer>';
  }

  function boot() {
    var page = pageId();
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if (h) renderHeader(h, page);
    if (f) renderFooter(f, page);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
