/* DriveSQ — shared interactivity */
document.addEventListener('DOMContentLoaded', function () {

  /* ---- scroll progress bar ---- */
  var progress = document.getElementById('scroll-progress');
  function onScroll() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    if (progress) progress.style.width = scrolled + '%';

    var nav = document.getElementById('navbar');
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 30);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- mobile nav ---- */
  var burger = document.getElementById('hamburger');
  var links = document.getElementById('navLinks');
  if (burger && links) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      links.classList.toggle('mobile-open');
    });
    links.querySelectorAll('a:not(.dropdown > a)').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('open');
        links.classList.remove('mobile-open');
      });
    });
    // mobile dropdown toggle
    links.querySelectorAll('.dropdown > a').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth <= 1080) {
          e.preventDefault();
          trigger.parentElement.classList.toggle('open');
        }
      });
    });
  }

  /* ---- reveal on scroll ---- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
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

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-btn');
    var ans = item.querySelector('.faq-ans');
    if (!btn || !ans) return;
    btn.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-ans').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      ans.style.maxHeight = !isOpen ? ans.scrollHeight + 'px' : null;
    });
  });

  /* ---- pass-rate ring animation ---- */
  document.querySelectorAll('.pass-ring circle.bar').forEach(function (circle) {
    var pct = parseFloat(circle.getAttribute('data-pct') || '90');
    var r = circle.r.baseVal.value;
    var c = 2 * Math.PI * r;
    circle.style.strokeDasharray = c;
    circle.style.strokeDashoffset = c;
    setTimeout(function () {
      circle.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.4,0,.2,1)';
      circle.style.strokeDashoffset = c - (pct / 100) * c;
    }, 300);
  });

  /* ---- footer year ---- */
  document.querySelectorAll('.js-year').forEach(function (el) { el.textContent = new Date().getFullYear(); });
});
