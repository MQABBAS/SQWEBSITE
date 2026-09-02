/* DriveSQ — shared interactivity (v2, Bootstrap-based) */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- scroll progress + navbar shrink ---- */
  var progress = document.getElementById('scroll-progress');
  var nav = document.getElementById('navbar');
  function onScroll() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progress) progress.style.width = scrolled + '%';
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 30);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- collapse mobile nav after a link is tapped (Bootstrap collapse) ---- */
  var navCollapseEl = document.getElementById('navMain');
  if (navCollapseEl && window.bootstrap) {
    var bsCollapse = window.bootstrap.Collapse.getOrCreateInstance(navCollapseEl, { toggle: false });
    navCollapseEl.querySelectorAll('a.nav-link:not(.dropdown-toggle)').forEach(function (a) {
      a.addEventListener('click', function () {
        if (navCollapseEl.classList.contains('show')) bsCollapse.hide();
      });
    });
  }

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- animated counters ---- */
  var counters = document.querySelectorAll('[data-count]');
  var counted = new WeakSet();
  function animateCounter(el) {
    if (counted.has(el)) return;
    counted.add(el);
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = (el.getAttribute('data-count').split('.')[1] || '').length;
    var dur = 1400, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCounter(entry.target); cio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* ---- 3D tilt on hover (cards, price cards, testimonials) ---- */
  var tiltEls = document.querySelectorAll('.card-x, .price-card, .area-card, .offer-card');
  var hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (hasFinePointer) {
    tiltEls.forEach(function (el) {
      el.style.transformStyle = 'preserve-3d';
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (py * -6) + 'deg) rotateY(' + (px * 8) + 'deg) translateY(-4px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---- price calculator ---- */
  var calcRange = document.getElementById('calcHours');
  var calcHoursLabel = document.getElementById('calcHoursLabel');
  var calcTotal = document.getElementById('calcTotal');
  var calcPerHour = document.getElementById('calcPerHour');
  var calcSave = document.getElementById('calcSave');
  var calcButtons = document.querySelectorAll('.calc-toggle button');
  var calcMode = 'standard';

  function computeStandard(hours) {
    var rate = 35;
    if (hours >= 20) rate = 31;
    else if (hours >= 10) rate = 33;
    return { total: hours * rate, rate: rate, save: (35 - rate) * hours };
  }

  function renderCalc() {
    if (!calcRange) return;
    var hours = parseInt(calcRange.value, 10);
    if (calcMode === 'student') {
      hours = 10;
      calcRange.value = 10;
      calcRange.disabled = true;
      calcTotal.textContent = '£299';
      calcPerHour.textContent = '£29.90 / hour — fixed 10-hour student block';
      calcSave.textContent = 'Save £51 vs standard pay-as-you-go pricing';
    } else {
      calcRange.disabled = false;
      var r = computeStandard(hours);
      calcTotal.textContent = '£' + r.total;
      calcPerHour.textContent = '£' + r.rate + ' / hour at ' + hours + ' hour' + (hours === 1 ? '' : 's');
      calcSave.textContent = r.save > 0 ? ('Save £' + r.save + ' vs single-lesson pricing') : 'Pay as you go, no commitment';
    }
    if (calcHoursLabel) calcHoursLabel.textContent = hours + (hours === 1 ? ' hour' : ' hours');
  }

  if (calcRange) {
    calcRange.addEventListener('input', renderCalc);
    calcButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        calcButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        calcMode = btn.getAttribute('data-mode');
        renderCalc();
      });
    });
    renderCalc();
  }

  /* ---- area / postcode checker ---- */
  var checkerForm = document.getElementById('areaChecker');
  var checkerResult = document.getElementById('checkerResult');
  var AREA_DB = [
    { name: 'Manchester', page: 'manchester.html', keys: ['manchester', 'm1', 'm2', 'm3', 'm4', 'm8', 'm14', 'm15', 'm16'] },
    { name: 'Didsbury', page: 'didsbury.html', keys: ['didsbury', 'm20', 'm21', 'west didsbury'] },
    { name: 'Sale', page: 'sale.html', keys: ['sale', 'm33', 'trafford'] },
    { name: 'Rochdale', page: 'rochdale.html', keys: ['rochdale', 'ol11', 'ol12', 'ol16', 'norden', 'bamford'] },
    { name: 'Eccles', page: 'eccles.html', keys: ['eccles', 'm30', 'patricroft', 'winton', 'monton'] },
    { name: 'Middleton', page: 'middleton.html', keys: ['middleton', 'm24', 'alkrington', 'hopwood'] },
    { name: 'Levenshulme', page: 'levenshulme.html', keys: ['levenshulme', 'm19', 'burnage', 'longsight'] },
  ];
  var GM_PREFIXES = ['m', 'sk', 'bl', 'ol', 'wn'];

  function isRelative() { return window.location.pathname.indexOf('/areas/') !== -1; }

  function checkArea(raw) {
    var q = (raw || '').trim().toLowerCase();
    if (!q) return null;
    for (var i = 0; i < AREA_DB.length; i++) {
      var a = AREA_DB[i];
      for (var j = 0; j < a.keys.length; j++) {
        if (q.indexOf(a.keys[j]) !== -1) return { matched: true, area: a };
      }
    }
    var prefix = q.match(/^[a-z]+/);
    if (prefix && GM_PREFIXES.indexOf(prefix[0]) !== -1) return { matched: true, area: null };
    return { matched: false, area: null };
  }

  if (checkerForm && checkerResult) {
    checkerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = checkerForm.querySelector('input');
      var res = checkArea(input.value);
      checkerResult.classList.remove('yes', 'no');
      if (!res) {
        checkerResult.classList.remove('show');
        return;
      }
      if (res.matched) {
        checkerResult.classList.add('show', 'yes');
        if (res.area) {
          var href = (isRelative() ? '' : 'areas/') + res.area.page;
          checkerResult.innerHTML = '<i class="bi bi-check-circle-fill"></i> Yes! We cover ' + res.area.name + '. <a href="' + href + '" style="color:#0a9450;text-decoration:underline;font-weight:700;">See ' + res.area.name + ' lessons →</a>';
        } else {
          checkerResult.innerHTML = '<i class="bi bi-check-circle-fill"></i> Yes! That’s within our Greater Manchester coverage — message us on WhatsApp to confirm your instructor.';
        }
      } else {
        checkerResult.classList.add('show', 'no');
        checkerResult.innerHTML = '<i class="bi bi-info-circle-fill"></i> We couldn’t match that automatically — message us on WhatsApp and we’ll confirm right away.';
      }
    });
  }

  /* ---- footer year ---- */
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
});
