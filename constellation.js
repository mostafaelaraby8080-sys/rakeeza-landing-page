/* خلفية الموقع: عقل من مثلثات متوهجة ثابت خلف الصفحة كلها.
   كل ما تسكرول لتحت يتفكك ويتفرّق على الشاشة كلها، وكل ما ترجع لفوق يتجمّع تاني. */
(() => {
  "use strict";
  const canvas = document.getElementById("bgField");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const palette = ["#8052ff", "#8052ff", "#a78bfa", "#ffb829", "#15846e", "#d946ef", "#3b82f6"];
  const BW = 420, BH = 300; // مساحة رسم العقل قبل التحويل لنقاط

  // ---------- شكل العقل (منظر جانبي) ----------
  const brain = new Path2D();
  brain.moveTo(70, 172);
  brain.bezierCurveTo(30, 150, 32, 92, 78, 66);
  brain.bezierCurveTo(100, 30, 155, 16, 200, 26);
  brain.bezierCurveTo(240, 8, 300, 18, 326, 58);
  brain.bezierCurveTo(364, 80, 376, 134, 346, 164);
  brain.bezierCurveTo(338, 186, 304, 194, 286, 186);
  brain.bezierCurveTo(270, 210, 232, 214, 214, 200);
  brain.bezierCurveTo(196, 218, 150, 208, 140, 192);
  brain.bezierCurveTo(118, 198, 92, 192, 70, 172);
  brain.closePath();
  const cerebellum = new Path2D();
  cerebellum.ellipse(100, 206, 44, 22, -0.08, 0, Math.PI * 2);
  const stem = new Path2D();
  stem.moveTo(168, 198); stem.lineTo(178, 258);
  stem.quadraticCurveTo(192, 272, 206, 258); stem.lineTo(212, 206);
  const folds = new Path2D();
  const f = (...c) => { folds.moveTo(c[0], c[1]); for (let i = 2; i < c.length; i += 6) folds.bezierCurveTo(...c.slice(i, i + 6)); };
  f(205, 28, 190, 60, 225, 80, 210, 110, 200, 130, 222, 140, 214, 164);
  f(150, 172, 190, 150, 230, 170, 280, 150, 300, 142, 310, 148, 324, 140);
  f(100, 100, 120, 80, 140, 110, 160, 90, 175, 76, 170, 60, 190, 62);
  f(250, 60, 270, 48, 285, 80, 305, 66);
  f(245, 100, 265, 90, 270, 120, 295, 108, 315, 98, 320, 110, 336, 102);
  f(90, 135, 110, 120, 125, 150, 150, 135);
  f(240, 135, 255, 128, 262, 140, 280, 132);
  f(70, 200, 90, 190, 110, 214, 134, 204);
  f(80, 212, 100, 204, 118, 220, 138, 212);

  function sampleMask(draw) {
    const c = document.createElement("canvas");
    c.width = BW; c.height = BH;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.fillStyle = x.strokeStyle = "#fff"; x.lineJoin = "round";
    draw(x);
    const d = x.getImageData(0, 0, BW, BH).data, out = [];
    for (let i = 3; i < d.length; i += 4) if (d[i] > 90) out.push((i - 3) / 4);
    return out;
  }
  const strokePx = sampleMask((x) => {
    x.lineWidth = 3.5; x.stroke(brain); x.stroke(cerebellum); x.stroke(stem);
    x.lineWidth = 3; x.stroke(folds);
  });
  const fillPx = sampleMask((x) => { x.fill(brain); x.fill(cerebellum); x.fill(stem); });
  const pick = (arr) => { const i = arr[(Math.random() * arr.length) | 0]; return [(i % BW) + Math.random() * 2 - 1, ((i / BW) | 0) + Math.random() * 2 - 1]; };

  // ---------- الجسيمات ----------
  let W = 0, H = 0, S = 1, cx = 0, cy = 0, mobile = false, P = [], groups = [], count = 0;
  function build() {
    const n = innerWidth < 700 ? 800 : 1500;
    if (n === count) return;
    count = n; P = [];
    groups = palette.map(() => []);
    for (let k = 0; k < n; k++) {
      const [hx, hy] = pick(Math.random() < 0.55 ? strokePx : fillPx);
      const ci = (Math.random() * palette.length) | 0;
      P.push({
        hx, hy, ci,
        s: 1.6 + Math.random() * 3.2, a: Math.random() * 6.28, v: (Math.random() - 0.5) * 0.7, spin: (Math.random() - 0.5) * 5,
        ph: Math.random() * 6.28, sp: 0.0004 + Math.random() * 0.0006, amp: 6 + Math.random() * 18,
        d: (hx / BW) * 0.55 + Math.random() * 0.45,                 // ترتيب التفكك: من الخلف للقدام مع شوية عشوائية
        fx: Math.random() * 1.1 - 0.05, fy: Math.random() * 1.1 - 0.05, // مكانه لما يتفرّق على الشاشة
        ax: (Math.random() - 0.5) * 220, ay: (Math.random() - 0.5) * 220, // انحناءة الحركة وقت التفكك
      });
      groups[ci].push(k);
    }
  }
  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    mobile = W < 860;
    S = (mobile ? W * 0.92 : Math.min(W * 0.46, 760)) / BW;
    cx = mobile ? W * 0.5 : W * 0.27; // في الديسكتوب العقل ناحية الشمال عكس النص (RTL)
    cy = mobile ? H * 0.7 : H * 0.5;
    build();
  }

  // ---------- الرسم ----------
  const ease = (t) => t * t * (3 - 2 * t);
  let sm = 0, last = 0, raf = 0;
  function frame(now) {
    raf = 0;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const target = Math.max(0, Math.min(1, scrollY / (H * 0.85)));
    sm = reduce.matches ? target : sm + (target - sm) * (1 - Math.exp(-dt * 6));
    const t = reduce.matches ? 0 : now;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1;
    ctx.globalAlpha = (mobile ? 0.75 : 0.92) * (1 - 0.55 * sm);
    for (let gi = 0; gi < groups.length; gi++) {
      ctx.strokeStyle = palette[gi];
      ctx.beginPath();
      for (const idx of groups[gi]) {
        const p = P[idx];
        const e = ease(Math.max(0, Math.min(1, (sm - p.d * 0.45) / 0.55)));
        const bob = (1 - e) * 2.2;
        const hx = cx + (p.hx - BW / 2) * S + Math.sin(t * 0.0008 + p.ph) * bob;
        const hy = cy + (p.hy - BH / 2) * S + Math.cos(t * 0.0007 + p.ph) * bob;
        const sx = p.fx * W + Math.sin(t * p.sp + p.ph) * p.amp;
        const sy = p.fy * H + Math.cos(t * p.sp * 0.9 + p.ph) * p.amp;
        const arc = Math.sin(e * Math.PI);
        const x = hx + (sx - hx) * e + arc * p.ax;
        const y = hy + (sy - hy) * e + arc * p.ay;
        const a = p.a + t * 0.0006 * p.v + e * p.spin;
        for (let k = 0; k < 3; k++) {
          const ang = a + k * 2.0944;
          const px = x + Math.cos(ang) * p.s, py = y + Math.sin(ang) * p.s;
          k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
        }
        ctx.closePath();
      }
      ctx.stroke();
    }
    if (!document.hidden) raf = requestAnimationFrame(frame);
  }
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  layout(); start();
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
})();
