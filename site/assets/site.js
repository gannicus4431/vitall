/* Vitall site — nav, reveal, spotlight, cursor light, headline decode, hero point cloud + HUD. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile nav */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = ((i % 4) * 70) + 'ms'; io.observe(el); });
  }

  /* Card spotlight follows the pointer */
  document.querySelectorAll('.card').forEach(function (card) {
    var spot = document.createElement('span'); spot.className = 'spot'; card.appendChild(spot);
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* Cursor light */
  var light = document.querySelector('.cursor-light');
  if (light && !reduce && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', function (e) {
      light.style.transform = 'translate(' + (e.clientX - 300) + 'px,' + (e.clientY - 300) + 'px)';
      light.style.opacity = '1';
    }, { passive: true });
    document.addEventListener('pointerleave', function () { light.style.opacity = '0'; });
  }

  /* Headline decode */
  var h = document.getElementById('decode');
  if (h && !reduce) {
    var target = h.getAttribute('data-text');
    var glyphs = '01<>/\\|[]{}=+*#%@&$';
    var t0 = null, dur = 1100;
    function tick(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur);
      var settled = Math.floor(k * target.length);
      var out = '';
      for (var i = 0; i < target.length; i++) {
        var c = target[i];
        if (i < settled || c === ' ' || c === '.') out += c;
        else out += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      h.textContent = out;
      if (k < 1) requestAnimationFrame(tick); else h.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  /* Contact form.
     Set FORM_ENDPOINT to a URL that accepts a JSON POST (Formspree, Basin, your own API)
     and the form submits in place. Left empty, it falls back to opening the visitor's
     mail client with the message pre-filled to hi@vitall.ai. */
  var FORM_ENDPOINT = '';
  var form = document.getElementById('contactForm');
  if (form) {
    var status = document.getElementById('cf-status');
    var submit = document.getElementById('cf-submit');
    function setStatus(msg, cls) { status.textContent = msg; status.className = 'cform-status mono ' + (cls || ''); }
    function fieldOf(el) { return el.closest('.field'); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.website.value) return;                     // honeypot: silently drop bots
      var bad = false;
      ['name', 'email', 'message'].forEach(function (n) {
        var el = form[n]; var ok = el.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value));
        fieldOf(el).classList.toggle('invalid', !ok); if (!ok) bad = true;
      });
      if (bad) { setStatus('Fill in name, a valid email and your message.', 'err'); return; }

      var data = {
        name: form.name.value.trim(), email: form.email.value.trim(), company: form.company.value.trim(),
        type: form.type.value, message: form.message.value.trim(), page: location.href
      };

      if (!FORM_ENDPOINT) {
        var body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nCompany: ' + data.company +
                   '\nProject type: ' + data.type + '\n\n' + data.message;
        location.href = 'mailto:hi@vitall.ai?subject=' + encodeURIComponent('Project enquiry — ' + (data.company || data.name)) +
                        '&body=' + encodeURIComponent(body);
        setStatus('Opening your mail app…', 'ok');
        return;
      }

      submit.disabled = true; setStatus('Sending…');
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); form.reset(); setStatus('Sent. We will reply within two working days.', 'ok'); })
        .catch(function () { setStatus('Could not send. Email hi@vitall.ai instead.', 'err'); })
        .then(function () { submit.disabled = false; });
    });
  }

  /* Hero: scanning point-cloud sphere on canvas, driving the HUD */
  var canvas = document.getElementById('cloud');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var hudRot = document.getElementById('hudRot'), hudScan = document.getElementById('hudScan');
  var W = 0, H = 0, dpr = 1;
  var N = 3200, pts = [];
  var golden = Math.PI * (3 - Math.sqrt(5));
  for (var i = 0; i < N; i++) {
    var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
    pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
  }
  var mouseX = 0, mouseY = 0;
  window.addEventListener('pointermove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5); mouseY = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  var lastHud = 0;
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    var wide = W > 760;
    var cx = wide ? W * 0.72 + mouseX * 20 : W * 0.82;
    var cy = wide ? H * 0.48 + mouseY * 14 : H * 0.16;
    var R = wide ? Math.min(W * 0.23, H * 0.44) : Math.min(W * 0.3, H * 0.16);
    var dim = wide ? 1 : 0.55;
    var a = t * 0.00016 + mouseX * 0.6;
    var tilt = 0.42 + mouseY * 0.25;
    var ca = Math.cos(a), sa = Math.sin(a), ct = Math.cos(tilt), st = Math.sin(tilt);
    var scan = Math.sin(t * 0.0007);

    for (var i = 0; i < N; i++) {
      var p = pts[i];
      var x1 = p.x * ca - p.z * sa, z1 = p.x * sa + p.z * ca;
      var y2 = p.y * ct - z1 * st, z2 = p.y * st + z1 * ct;
      var persp = 1 / (1 + z2 * 0.35);
      var sx = cx + x1 * R * persp, sy = cy + y2 * R * persp;
      var depth = (z2 + 1) / 2;
      var near = Math.abs(p.y - scan) < 0.06;
      var alpha = (0.12 + depth * 0.55) * dim;
      var size = 0.55 + depth * 1.05;
      if (near) { ctx.fillStyle = 'rgba(77,216,255,' + Math.min(1, alpha + 0.5) + ')'; size += 0.9; }
      else ctx.fillStyle = 'rgba(190,210,245,' + alpha + ')';
      ctx.beginPath(); ctx.arc(sx, sy, size, 0, Math.PI * 2); ctx.fill();
    }

    // scan line
    var ly = cy + (scan * ct) * R;
    ctx.strokeStyle = 'rgba(77,216,255,0.25)'; ctx.setLineDash([3, 6]);
    ctx.beginPath(); ctx.moveTo(cx - R * 1.6, ly); ctx.lineTo(cx + R * 1.6, ly); ctx.stroke();
    ctx.setLineDash([]);

    // HUD, throttled
    if (t - lastHud > 90 && hudRot && hudScan) {
      lastHud = t;
      var deg = ((a * 180 / Math.PI) % 360 + 360) % 360;
      hudRot.textContent = deg.toFixed(1).padStart(5, '0') + '°';
      hudScan.textContent = (((scan + 1) / 2) * 100).toFixed(1).padStart(4, '0') + '%';
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
