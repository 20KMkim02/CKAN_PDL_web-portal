/**
 * PD Link landing — scroll-driven scene
 * ไม่ต้องแก้ไฟล์นี้เพื่อปรับค่า: แก้ที่ js/config.js
 */
(function () {
  'use strict';

  const C = window.PDL_CONFIG;

  /* แผนที่ใน assets/*.svg ใช้ viewBox 1040 x 1872
     projection: equirectangular แก้ด้วย cos(13°) — ค่าด้านล่างต้องตรงกับตอน generate SVG */
  const VB_W = 1040, VB_H = 1872;
  const GEO = { minLon: 97.3514, maxLat: 20.4450, cosLat: Math.cos(13 * Math.PI / 180), pxPerDeg: 123.657, pad: 20 };

  /* ---------- helpers ---------- */
  const $ = (id) => document.getElementById(id);
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, r) => clamp01((p - r[0]) / (r[1] - r[0]));
  const smooth = (t) => t * t * (3 - 2 * t);                          // ease-in-out (กล้อง)
  const slowOut = (t) => 1 - Math.pow(1 - t, C.motion.slowOutPower); // ease-out (fade)
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function toMapPct(pv) {
    if (pv.lat != null && pv.lon != null) {
      return {
        x: ((pv.lon - GEO.minLon) * GEO.cosLat * GEO.pxPerDeg + GEO.pad) / VB_W * 100,
        y: ((GEO.maxLat - pv.lat) * GEO.pxPerDeg + GEO.pad) / VB_H * 100
      };
    }
    return { x: pv.x, y: pv.y };
  }

  /* ---------- elements ---------- */
  const el = {
    track: $('track'), stage: $('stage'), progress: $('progress'),
    scene: $('scene'), map: $('map'), provinces: $('mapProvinces'),
    links: $('links'), pinBases: $('pinBases'), pins: $('pins'),
    hero: $('hero'), hint: $('hint'), quote: $('quote'),
    cta: $('cta'), ctaLink: $('ctaLink'), ctaUrl: $('ctaUrl')
  };

  /* ---------- apply config to CSS ---------- */
  const rs = document.documentElement.style;
  rs.setProperty('--bg', C.colors.background);
  rs.setProperty('--dot', C.colors.dot);
  rs.setProperty('--dot-gap', C.colors.dotGapPx + 'px');
  rs.setProperty('--accent', C.colors.accent);
  rs.setProperty('--ease-out', C.motion.cssEaseOut);
  rs.setProperty('--ease-pop', C.motion.cssEasePop);
  rs.setProperty('--fade-ms', C.motion.fadeMs + 'ms');
  rs.setProperty('--pop-ms', C.motion.popMs + 'ms');
  el.track.style.height = C.scroll.trackHeightPx + 'px';
  el.scene.style.perspective = C.camera.perspectivePx + 'px';
  el.scene.style.perspectiveOrigin = '50% ' + (C.camera.eyeY * 100) + '%';
  el.ctaLink.href = C.cta.url;
  el.ctaUrl.textContent = C.cta.showUrl ? C.cta.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

  /* ---------- build pins ---------- */
  const PIN_SVG =
    '<svg viewBox="0 0 24 32" aria-hidden="true">' +
    '<path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20s12-11.6 12-20C24 5.4 18.6 0 12 0z" fill="var(--accent)"/>' +
    '<path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 20 12 20z" fill="#000" fill-opacity=".16"/>' +
    '<circle cx="12" cy="11.5" r="4.6" fill="#0a0a0a"/></svg>';

  const pins = C.provinces.map((pv) => {
    const pos = toMapPct(pv);

    const base = document.createElement('div');
    base.className = 'pin-base';
    base.style.left = pos.x + '%';
    base.style.top = pos.y + '%';
    el.pinBases.appendChild(base);

    const root = document.createElement('div');
    root.className = 'pin';
    root.setAttribute('role', 'img');
    root.setAttribute('aria-label', pv.label);
    const body = document.createElement('div');
    body.className = 'pin-body';
    body.innerHTML = PIN_SVG;
    const label = document.createElement('span');
    label.className = 'pin-label';
    label.textContent = pv.label;
    body.appendChild(label);
    root.appendChild(body);
    el.pins.appendChild(root);

    return { id: pv.id, label: pv.label, x: pos.x, y: pos.y, base, root, body, labelEl: label, flip: pos.x > 75 };
  });
  const pinById = Object.fromEntries(pins.map((p) => [p.id, p]));

  /* ---------- build links (quadratic curves) ---------- */
  const links = C.connections.map(([a, b], k) => {
    const A = pinById[a], B = pinById[b];
    if (!A || !B) { console.warn('[PDL] unknown connection', a, b); return null; }
    const ax = A.x / 100 * VB_W, ay = A.y / 100 * VB_H;
    const bx = B.x / 100 * VB_W, by = B.y / 100 * VB_H;
    const bend = (k % 2 === 0 ? 1 : -1) * C.links.bend;
    const cx = (ax + bx) / 2 - (by - ay) * bend;
    const cy = (ay + by) / 2 + (bx - ax) * bend;
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M${ax} ${ay}Q${cx} ${cy} ${bx} ${by}`);
    path.style.stroke = C.colors.link;
    path.style.strokeWidth = C.links.strokeWidth;
    el.links.appendChild(path);
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len} ${len}`;
    path.style.strokeDashoffset = len;
    return { path, len };
  }).filter(Boolean);

  /* ---------- frame update ---------- */
  function update() {
    const vw = el.stage.clientWidth;
    const vh = el.stage.clientHeight;
    const scrollable = Math.max(1, el.track.offsetHeight - vh);
    const p = clamp01((window.scrollY - el.track.offsetTop) / scrollable);
    const mobile = vw < C.map.mobileBreakpointPx;

    /* map size */
    const mcfg = mobile ? C.map.mobile : C.map.desktop;
    const mapW = Math.min(vw * mcfg.widthRatio, mcfg.maxWidthPx);
    const mapH = mapW * VB_H / VB_W;

    /* camera: zoom in → tilt up → pan south */
    const zIn = smooth(seg(p, C.zoom.range));
    const eT = smooth(seg(p, C.tilt.range));
    const rotX = (90 - C.tilt.startDeg) * (1 - eT);
    const zoom = 1 + ((C.zoom.start - 1) + C.zoom.extra * zIn) * (1 - eT);
    const originY = mapH / 2;
    const pivotY = mobile ? C.pan.heroPivotY.mobile : C.pan.heroPivotY.desktop;
    const tyHero = vh * pivotY - mapH / 2;
    const tyFlat = vh * C.pan.flatTopY;
    const tyEnd = vh * C.pan.endBottomY - mapH;
    const ty = p < C.tilt.range[1]
      ? lerp(tyHero, tyFlat, eT)
      : lerp(tyFlat, tyEnd, smooth(seg(p, C.pan.range)));
    const tx = mobile ? 0 : vw * C.pan.shiftX * smooth(seg(p, C.pan.shiftRange));

    const m = el.map.style;
    m.width = mapW + 'px';
    m.height = mapH + 'px';
    m.marginLeft = (-mapW / 2) + 'px';
    m.transformOrigin = `50% ${originY}px`;
    m.transform = `translate(${tx}px, ${ty}px) rotateX(${rotX}deg) scale(${zoom})`;

    el.provinces.style.opacity = C.map.provinceLines.maxOpacity * slowOut(seg(p, C.map.provinceLines.range));

    /* pins: project map point → screen so pins stay upright (90°) */
    const persp = C.camera.perspectivePx;
    const pox = vw / 2, poy = vh * C.camera.eyeY;
    const ang = rotX * Math.PI / 180;
    const pinW = Math.max(C.pins.minSizePx, Math.min(C.pins.maxSizePx, mapW * C.pins.sizeRatio));
    const pinH = pinW * 32 / 24;
    const labelO = slowOut(seg(p, C.pins.labels.range));

    pins.forEach((pin, i) => {
      const u = pin.x / 100 * mapW - mapW / 2;
      const v = pin.y / 100 * mapH - originY;
      const X = vw / 2 + tx + zoom * u;
      const Y = originY + ty + zoom * v * Math.cos(ang);
      const Z = zoom * v * Math.sin(ang);
      const den = persp - Z;
      const f = Math.max(0.35, Math.min(2.2, persp / Math.max(den, 1)));
      const sx = pox + (X - pox) * f;
      const sy = poy + (Y - poy) * f;
      const w = pinW * f, h = pinH * f;
      const shown = p > C.pins.startAt + i * C.pins.stagger && den > 120;

      pin.root.style.transform = `translate(${sx}px, ${sy}px)`;
      const b = pin.body.style;
      b.width = w + 'px'; b.height = h + 'px';
      b.left = (-w / 2) + 'px'; b.top = (-h) + 'px';
      pin.root.classList.toggle('is-shown', shown);
      pin.base.classList.toggle('is-shown', shown);
      pin.base.style.width = pinW + 'px';
      pin.base.style.marginLeft = (-pinW / 2) + 'px';
      pin.labelEl.style.left = pin.flip ? 'auto' : (w + 6) + 'px';
      pin.labelEl.style.right = pin.flip ? (w * 0.2 + 8) + 'px' : 'auto';
      pin.labelEl.style.opacity = labelO;
    });

    /* links draw in one after another */
    links.forEach((ln, k) => {
      const s = C.links.startAt + k * C.links.stagger;
      const t = slowOut(seg(p, [s, s + C.links.duration]));
      ln.path.style.strokeDashoffset = ln.len * (1 - t);
      ln.path.style.opacity = t > 0 ? C.links.opacity : 0;
    });

    /* text layers */
    const heroT = slowOut(seg(p, C.hero.fadeRange));
    el.hero.style.opacity = 1 - heroT;
    el.hero.style.transform = `translateY(${-C.hero.liftPx * heroT}px)`;
    el.hint.style.opacity = 1 - slowOut(seg(p, C.hint.fadeRange));

    const q = slowOut(seg(p, C.quote.range));
    el.quote.style.opacity = q;
    el.quote.style.transform = `translateY(${C.quote.risePx * (1 - q)}px)`;

    const c = slowOut(seg(p, C.cta.range));
    el.cta.style.opacity = c;
    el.cta.style.transform = `translateY(${C.cta.risePx * (1 - c)}px)`;
    el.cta.classList.toggle('is-active', c > 0.5);

    el.progress.style.width = (p * 100) + '%';
  }

  /* ---------- run ---------- */
  let raf = 0;
  const schedule = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
})();
