/**
 * Intek Space — unified header + footer + sister network UTMs.
 */
(function () {
  'use strict';

  var LINKS = [
    { id: 'home', href: 'index.html', label: 'Home' },
    { id: 'philosophy', href: 'philosophy.html', label: 'Philosophy' },
    { id: 'projects', href: 'projects.html', label: 'Projects' },
    { id: 'education', href: 'education.html', label: 'Education' },
    { id: 'store', href: 'store.html', label: 'Store' },
    { id: 'launch', href: 'launch.html', label: 'Launch', cta: true }
  ];

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

  function renderHeader(page) {
    var el = document.getElementById('site-header');
    if (!el) return;
    el.innerHTML =
      '<header class="site-header">' +
      '<div class="site-header__inner">' +
      '<a class="site-brand" href="index.html">' +
      '<span class="site-brand__mark" aria-hidden="true">IS</span>' +
      '<span><span class="site-brand__name">Intek Space</span>' +
      '<span class="site-brand__tag">Philosophy · Engineering · Education</span></span></a>' +
      '<nav class="site-nav" aria-label="Primary">' +
      navLinks(page, false) +
      '</nav>' +
      '<button type="button" class="site-menu-btn" id="site-menu-btn" aria-expanded="false" aria-controls="site-drawer" aria-label="Open menu">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>' +
      '</button></div>' +
      '<div class="site-drawer" id="site-drawer" hidden>' +
      navLinks(page, true) +
      '</div></header>';

    var btn = document.getElementById('site-menu-btn');
    var drawer = document.getElementById('site-drawer');
    if (btn && drawer) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        if (open) {
          drawer.hidden = true;
          drawer.classList.remove('is-open');
        } else {
          drawer.hidden = false;
          drawer.classList.add('is-open');
        }
      });
    }
  }

  function renderFooter(page) {
    var el = document.getElementById('site-footer');
    if (!el) return;
    var year = new Date().getFullYear();
    el.innerHTML =
      '<footer class="site-footer">' +
      '<div class="site-footer__inner">' +
      '<div class="site-footer__row">' +
      '<div>© ' + year + ' Intek Space / Intek Inc.</div>' +
      '<div class="site-footer__links">' +
      '<a href="index.html"' + (page === 'home' ? ' class="is-active"' : '') + '>Home</a>' +
      '<a href="philosophy.html"' + (page === 'philosophy' ? ' class="is-active"' : '') + '>Philosophy</a>' +
      '<a href="projects.html"' + (page === 'projects' || page === 'omnibot' || page === 'omni-home' || page === 'hive-king' ? ' class="is-active"' : '') + '>Projects</a>' +
      '<a href="education.html"' + (page === 'education' || page === 'education-apply' ? ' class="is-active"' : '') + '>Education</a>' +
      '<a href="store.html"' + (page === 'store' ? ' class="is-active"' : '') + '>Store</a>' +
      '<a href="launch.html"' + (page === 'launch' ? ' class="is-active"' : '') + '>Launch</a>' +
      '</div></div>' +
      '<p class="site-footer__privacy">Philosophy constrains marketing. Evidence over promise. ' +
      '<a href="mailto:tharpster@intekspace.com">tharpster@intekspace.com</a></p>' +
      '<div class="site-footer__network">' +
      '<div class="site-footer__network-label">Sister network</div>' +
      '<div class="site-footer__links">' +
      '<a href="https://onemissionnetworkandinstitute.org/?utm_source=intek&utm_medium=referral&utm_campaign=sister_network&utm_content=footer" rel="noopener">One Mission</a>' +
      '<a href="https://instituteofmatureimagination.org/?utm_source=intek&utm_medium=referral&utm_campaign=sister_network&utm_content=footer" rel="noopener">IMI</a>' +
      '<a href="https://x.com/omni_puzzler" target="_blank" rel="noopener">@omni_puzzler</a>' +
      '</div></div></div></footer>';
  }

  function boot() {
    var page = (document.body && document.body.getAttribute('data-page')) || 'home';
    renderHeader(page);
    renderFooter(page);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
