/*
  Littlest Galleries: cookie consent + Google Analytics
  Google Analytics only loads after a visitor clicks "Accept".
  The choice is stored in localStorage (not a cookie).
  Any link with the attribute data-cookie-settings reopens the banner.
*/
(function () {
  var GA_ID = 'G-JPRZPR3G4V';
  var KEY = 'lg-analytics-consent';
  var gaLoaded = false;
  var banner = null;

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function loadAnalytics() {
    if (gaLoaded) return;
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function removeAnalyticsCookies() {
    var host = location.hostname.replace(/^www\./, '');
    var domains = ['', host, '.' + host, location.hostname, '.' + location.hostname];
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        domains.forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
        });
      }
    });
  }

  function addStyles() {
    if (document.getElementById('lg-cc-styles')) return;
    var css =
      '.lg-cc{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:520px;margin:0 auto;' +
      'background:#1c1812;color:#f7f3ee;border-radius:12px;padding:20px 22px;box-shadow:0 10px 40px rgba(0,0,0,.25);' +
      "font-family:'DM Sans',system-ui,sans-serif;font-weight:300;font-size:15px;line-height:1.6}" +
      '.lg-cc[hidden]{display:none}' +
      '.lg-cc p{margin:0 0 16px}' +
      '.lg-cc a{color:#f0ebe2;text-decoration:underline}' +
      '.lg-cc-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '.lg-cc button{flex:1 1 120px;min-height:44px;border-radius:999px;border:1px solid #f7f3ee;cursor:pointer;' +
      "font-family:'DM Sans',system-ui,sans-serif;font-size:15px;font-weight:500;padding:10px 18px}" +
      '.lg-cc-accept{background:#f7f3ee;color:#1c1812}' +
      '.lg-cc-decline{background:#f7f3ee;color:#1c1812}' +
      '.lg-cc button:hover{background:#d4652f;border-color:#d4652f;color:#fff}' +
      '.lg-cc button:focus-visible{outline:2px solid #c9993a;outline-offset:2px}';
    var style = document.createElement('style');
    style.id = 'lg-cc-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function buildBanner() {
    if (banner) return banner;
    addStyles();
    banner = document.createElement('div');
    banner.className = 'lg-cc';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie preferences');
    banner.hidden = true;
    banner.innerHTML =
      '<p>May I use Google Analytics cookies to see how visitors find and use this site? ' +
      'They\'re only set if you say yes. <a href="/privacy.html#cookies">More info</a></p>' +
      '<div class="lg-cc-actions">' +
      '<button type="button" class="lg-cc-decline">Decline</button>' +
      '<button type="button" class="lg-cc-accept">Accept</button>' +
      '</div>';
    banner.querySelector('.lg-cc-accept').addEventListener('click', function () {
      saveChoice('granted');
      hideBanner();
      loadAnalytics();
    });
    banner.querySelector('.lg-cc-decline').addEventListener('click', function () {
      saveChoice('denied');
      hideBanner();
      if (gaLoaded && window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      removeAnalyticsCookies();
    });
    document.body.appendChild(banner);
    return banner;
  }

  function showBanner() {
    buildBanner().hidden = false;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function init() {
    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showBanner();
      });
    });
    var choice = getChoice();
    if (choice === 'granted') {
      loadAnalytics();
    } else if (choice !== 'denied') {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
