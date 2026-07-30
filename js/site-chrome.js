/**
 * Intek Space — unified header + footer + sister network UTMs.
 */
(function () {
  'use strict';

  var UTM = {
    omni: '?utm_source=intek&utm_medium=referral&utm_campaign=sister_network&utm_content=',
    imi: '?utm_source=intek&utm_medium=referral&utm_campaign=sister_network&utm_content=',
  };
  var OMNI = 'https://onemissionnetworkandinstitute.org/';
  var IMI = 'https://instituteofmatureimagination.org/';
  var OMNI_VIDEOS = 'https://instituteofmatureimagination.org/videos';

  var LINKS = [
    { id: 'home', href: '/', label: 'Home' },
    { id: 'philosophy', href: '/philosophy', label: 'Philosophy' },
    { id: 'projects', href: '/projects', label: 'Projects' },
    { id: 'education', href: '/education', label: 'Education' },
    { id: 'store', href: '/store', label: 'OMNI Store' },
    { id: 'launch', href: '/launch', label: 'Launch', cta: true },
    { id: 'contact', href: '/#contact', label: 'Contact' },
  ];

  function pageId() {
    var b = document.body;
    if (b && b.getAttribute('data-page')) return b.getAttribute('data-page');
    var path = (location.pathname || '/').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
    if (path === '/' || path === '') return 'home';
    return path.split('/').pop() || 'home';
  }

  function isActive(link, page) {
    if (link.id === page) return true;
    if (page === 'education-apply' && link.id === 'education') return true;
    if ((page === 'hive-king' || page === 'yard-to-loop' || page === 'poop-to-loop' || page === 'omnibot' || page === 'omni-home') && link.id === 'projects')
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
      '<span><span class="site-brand__name">Intek Space</span>' +
      '<span class="site-brand__tag">Philosophy · Engineering · Education</span></span></a>' +
      '<nav class="site-nav" aria-label="Primary">' +
      navLinks(page, false) +
      '</nav>' +
      '<button type="button" class="site-menu-btn" id="site-menu-btn" aria-expanded="false" aria-controls="site-drawer" aria-label="Open menu">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '</button></div>' +
      '<div class="site-drawer" id="site-drawer">' +
      navLinks(page, true) +
      '</div></header>';

    var btn = document.getElementById('site-menu-btn');
    var drawer = document.getElementById('site-drawer');
    if (btn && drawer) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        drawer.classList.toggle('is-open', !open);
      });
    }
  }

  function renderFooter(el, page) {
    var year = new Date().getFullYear();
    el.innerHTML =
      '<footer class="site-footer">' +
      '<div class="site-footer__inner">' +
      '<div class="site-footer__row">' +
      '<div>© ' +
      year +
      ' Intek Space / Intek Inc.</div>' +
      '<div class="site-footer__links">' +
      '<a href="/"' +
      (page === 'home' ? ' class="is-active"' : '') +
      '>Home</a>' +
      '<a href="/philosophy"' +
      (page === 'philosophy' ? ' class="is-active"' : '') +
      '>Philosophy</a>' +
      '<a href="/projects"' +
      (page === 'projects' || page === 'omnibot' || page === 'omni-home' || page === 'hive-king' || page === 'yard-to-loop' || page === 'poop-to-loop' ? ' class="is-active"' : '') +
      '>Projects</a>' +
      '<a href="/education"' +
      (page === 'education' || page === 'education-apply' ? ' class="is-active"' : '') +
      '>Education</a>' +
      '<a href="/store"' +
      (page === 'store' ? ' class="is-active"' : '') +
      '>OMNI Store</a>' +
      '<a href="/launch"' +
      (page === 'launch' ? ' class="is-active"' : '') +
      '>Launch</a>' +
      '</div></div>' +
      '<p class="site-footer__privacy">Philosophy constrains marketing. Evidence over promise. ' +
      '<a href="mailto:tharpster@intekspace.com">tharpster@intekspace.com</a></p>' +
      '<div class="site-footer__network">' +
      '<div class="site-footer__network-label">Sister network</div>' +
      '<div class="site-footer__links">' +
      '<a href="' +
      OMNI +
      UTM.omni +
      'footer" rel="noopener">One Mission</a>' +
      '<a href="' +
      IMI +
      UTM.imi +
      'footer" rel="noopener">IMI</a>' +
      '<a href="' +
      OMNI_VIDEOS +
      UTM.imi +
      'footer_videos" rel="noopener">OMNI Videos</a>' +
      '<a href="https://x.com/omni_puzzler" target="_blank" rel="noopener">@omni_puzzler</a>' +
      '</div></div></div></footer>';
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
