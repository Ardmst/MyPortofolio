/*
 * ardmst sheet kit: the "sheet and biro" interaction layer (DESIGN.md §2).
 * Framework-free ES module, no dependencies, no build step. Needs theme.css (tokens)
 * and sheet-kit.css. Copy VERBATIM into each repo; usage and pitfalls are in README.md.
 *
 * initTheme() initRise() initSheet() initBiro() initMonument() initAll(): each returns a
 * cleanup function, does nothing on the server or without its targets, and survives
 * React strict-mode double mounting.
 */

const W = typeof window === 'object' && window.document ? window : null;
const D = W && W.document;
const PITCH = 18; // dot pitch in px; sheet-kit.css uses the same number
const REACH = 110; // how far from the pointer dots wake
const PASSIVE = { passive: true };
const noop = () => {};

const on = (target, type, fn) => {
  target.addEventListener(type, fn, PASSIVE);
  return () => target.removeEventListener(type, fn, PASSIVE);
};
const all = (...offs) => () => offs.forEach((off) => off());
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const near = (e, selector) => (e.target.closest ? e.target.closest(selector) : null);

let fine; // a mouse or trackpad is the main pointer
let calm; // the visitor asked for reduced motion
const live = () => fine.matches && !calm.matches;

/* One instance per behaviour, counted, so double mounts and double calls are harmless.
   Gated behaviours are rebuilt when the pointer or motion preference changes. */
function unit(setup, gated) {
  let users = 0;
  let off;
  let ungate;
  const flip = () => {
    off();
    off = setup();
  };
  return () => {
    if (!W) return noop;
    if (!users++) {
      fine = fine || W.matchMedia('(hover: hover) and (pointer: fine)');
      calm = calm || W.matchMedia('(prefers-reduced-motion: reduce)');
      off = setup();
      ungate = gated ? all(on(fine, 'change', flip), on(calm, 'change', flip)) : noop;
    }
    let done = false;
    return () => {
      if (done) return;
      done = true;
      if (!--users) {
        off();
        ungate();
      }
    };
  };
}

/* ---- one scheduler: a frame is requested only while a job is unsettled ---------- */

const jobs = new Set();
let raf = 0;
let last = 0;
const frame = (now) => {
  const dt = Math.min(32, last ? now - last : 16);
  last = now;
  raf = 0;
  jobs.forEach((job) => job(dt) || jobs.delete(job));
  if (jobs.size) raf = requestAnimationFrame(frame);
  else last = 0;
};
const wake = (job) => {
  jobs.add(job);
  if (!raf) raf = requestAnimationFrame(frame);
};

/* ---- one pointer: handlers only store numbers and wake the jobs ------------------ */

const ptr = { x: 0, y: 0, on: false };
const subs = new Set();
let epoch = 0; // bumped when boxes may have moved (scroll, resize, fonts)
let shape = 0; // bumped when sizes may have changed (resize, fonts)
let unhook;
const tell = () => subs.forEach(wake);
const leave = () => {
  if (ptr.on) {
    ptr.on = false;
    tell();
  }
};
const moved = (sized) => () => {
  epoch++;
  shape += sized;
  tell();
};
function track(job) {
  if (!subs.size) {
    unhook = all(
      on(W, 'pointermove', (e) => {
        if (e.pointerType !== 'mouse') return leave(); // trust events over the media query
        ptr.x = e.clientX;
        ptr.y = e.clientY;
        ptr.on = true;
        tell();
      }),
      on(W, 'pointerdown', (e) => e.pointerType !== 'mouse' && leave()),
      on(W, 'pointercancel', leave), // a native drag has started: no more moves until it ends
      on(D, 'pointerover', (e) => e.target.tagName === 'IFRAME' && leave()),
      on(D.documentElement, 'pointerleave', leave),
      on(W, 'blur', leave),
      on(D, 'visibilitychange', () => D.hidden && leave()),
      on(W, 'scroll', moved(0)),
      on(W, 'resize', moved(1)),
    );
    if (D.fonts) D.fonts.ready.then(moved(1));
  }
  subs.add(job);
  return () => {
    subs.delete(job);
    jobs.delete(job);
    if (!subs.size) unhook();
  };
}

/* ---- theme: the word in the bar ---------------------------------------------------- */

function theme() {
  const root = D.documentElement;
  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    D.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      const label = button.querySelector('[data-theme-label]');
      if (!label && button.firstElementChild) return; // both words are in the markup: theme.css shows one
      (label || button).textContent = dark ? 'Light' : 'Dark';
      button.setAttribute('aria-pressed', dark);
    });
  };
  try {
    if (localStorage.getItem('ardmst-theme') === 'dark') root.dataset.theme = 'dark';
  } catch {
    /* storage can be blocked: the theme then lasts for this page only */
  }
  sync();
  return on(D, 'click', (e) => {
    if (!near(e, '[data-theme-toggle]')) return;
    const dark = root.dataset.theme !== 'dark';
    if (dark) root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    try {
      localStorage.setItem('ardmst-theme', dark ? 'dark' : 'light');
    } catch {
      /* see above */
    }
    sync();
  });
}

/* ---- rise: entrances, once ------------------------------------------------------------ */

function rise() {
  const WAITING = '[data-rise]:not(.is-in)';
  const show = (el) => el.classList.add('is-in');
  if (!W.IntersectionObserver) {
    D.querySelectorAll(WAITING).forEach(show);
    return noop;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        // also show what is already above the fold (a reload half-way down the page)
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  const scan = () =>
    D.querySelectorAll(WAITING).forEach((el) => {
      if (el.dataset.riseI) el.style.setProperty('--i', el.dataset.riseI);
      io.observe(el);
    });
  const added = new MutationObserver(scan); // content that arrives later is never left hidden
  scan();
  added.observe(D.body, { childList: true, subtree: true });
  return () => {
    io.disconnect();
    added.disconnect();
  };
}

/* ---- the sheet: dot-grid paper that wakes under the pointer -------------------------- */

function sheet() {
  const root = D.documentElement;
  const canvas = D.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return noop;
  // Where the browser can do it on the compositor, CSS moves the paper with the page.
  const travel = W.CSS && CSS.supports('animation-timeline:scroll()');
  const awake = []; // indices of the dots that are not at rest
  let cols = 0;
  let rows = 0;
  let width = 0;
  let height = 0;
  let ratio = 0;
  let energy; // 0..1 per dot: one number drives size, colour and push
  let ux; // unit vector away from the pointer, kept from the moment of the hit
  let uy;
  let flag;
  let ink;
  let swell;
  let base = 0; // document row shown in the canvas's first row
  let box; // cells drawn awake last frame
  let timer;

  const span = () => canvas.style.setProperty('--sheet-n', (root.scrollHeight - root.clientHeight) / PITCH);
  const read = () => {
    const style = getComputedStyle(root);
    ink = ['--dot', '--bloom-3', '--bloom-2', '--bloom-1'].map((name) => style.getPropertyValue(name).trim());
    swell = 0.9; // dots near cursor grow slightly; most dots stay small
  };

  // Redraw whole cells c0..c1 × r0..r1: one path per colour, four fills at most.
  const draw = (c0, r0, c1, r1) => {
    const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
    for (let r = r0; r <= r1; r++) {
      const row = ((base + r) % rows) * cols;
      for (let c = c0; c <= c1; c++) {
        const v = energy[row + c];
        const push = 0; // no displacement; dots stay on grid
        const x = c * PITCH + 14 + ux[row + c] * push;
        const y = r * PITCH + 14 + uy[row + c] * push;
        const radius = 1 + swell * v * v;
        const path = paths[v < 0.05 ? 0 : v < 0.33 ? 1 : v < 0.66 ? 2 : 3];
        path.moveTo(x + radius, y);
        path.arc(x, y, radius, 0, 6.2832);
      }
    }
    ctx.clearRect(c0 * PITCH, r0 * PITCH, (c1 - c0 + 1) * PITCH, (r1 - r0 + 1) * PITCH);
    paths.forEach((path, step) => {
      ctx.fillStyle = ink[step];
      ctx.fill(path);
    });
  };
  const paint = () => draw(0, 0, cols - 1, rows - 1);

  const build = () => {
    canvas.style.width = canvas.style.height = ''; // let the stylesheet size it, then hold that size
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    // device pixels, at most 2x, and at most about 8 million of them (but never below 1x)
    const r = Math.min(W.devicePixelRatio || 1, 2, Math.max(1, Math.sqrt(8e6 / (w * h || 1))));
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    span();
    if (w === width && h === height && r === ratio) return;
    width = w;
    height = h;
    ratio = r;
    canvas.width = w * r;
    canvas.height = h * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    cols = Math.ceil(w / PITCH);
    rows = Math.ceil(h / PITCH);
    energy = new Float32Array(cols * rows);
    ux = new Float32Array(cols * rows);
    uy = new Float32Array(cols * rows);
    flag = new Uint8Array(cols * rows);
    awake.length = 0;
    box = 0;
    paint();
  };

  const tick = (dt) => {
    const scroll = travel ? Math.max(0, W.scrollY) : 0;
    const top = Math.floor(scroll / PITCH);
    const px = ptr.x;
    const py = ptr.y + scroll - top * PITCH;
    const here = ptr.on;
    if (top !== base) {
      // the paper moved by whole rows: rows that wrapped round come back dry
      const by = top - base;
      base = top;
      if (Math.abs(by) >= rows) energy.fill(0);
      else
        for (let r = by > 0 ? rows - by : 0, end = by > 0 ? rows : -by; r < end; r++) {
          const row = ((top + r) % rows) * cols;
          energy.fill(0, row, row + cols);
        }
    }
    if (here) {
      const r1 = Math.min(rows - 1, Math.floor((py + REACH) / PITCH));
      const c1 = Math.min(cols - 1, Math.floor((px + REACH) / PITCH));
      for (let r = Math.max(0, Math.floor((py - REACH) / PITCH)); r <= r1; r++) {
        const row = ((top + r) % rows) * cols;
        for (let c = Math.max(0, Math.floor((px - REACH) / PITCH)); c <= c1; c++) {
          if (!flag[row + c]) {
            flag[row + c] = 1;
            awake.push(row + c);
          }
        }
      }
    }
    const attack = 1 - Math.exp(-dt / 50);
    const release = 1 - Math.exp(-dt / 300);
    let kept = 0;
    let busy = 0;
    let c0 = cols;
    let r0 = rows;
    let c1 = -1;
    let r1 = -1;
    for (let n = 0; n < awake.length; n++) {
      const i = awake[n];
      const c = i % cols;
      const r = ((((i - c) / cols - top) % rows) + rows) % rows;
      const dx = c * PITCH + 14 - px;
      const dy = r * PITCH + 14 - py;
      const d = Math.sqrt(dx * dx + dy * dy);
      const want = here && d < REACH ? 1 - d / REACH : 0;
      const gap = want - energy[i];
      let v = energy[i] + gap * (gap > 0 ? attack : release);
      if (want && d > 1) {
        ux[i] = dx / d;
        uy[i] = dy / d;
      }
      if (gap > 0.004 || gap < -0.004) busy = 1;
      if (!want && v < 0.01) v = flag[i] = 0;
      else awake[kept++] = i;
      energy[i] = v;
      if (c < c0) c0 = c;
      if (c > c1) c1 = c;
      if (r < r0) r0 = r;
      if (r > r1) r1 = r;
    }
    awake.length = kept;
    const now = c1 < 0 ? 0 : [c0, r0, c1, r1];
    if (box) {
      c0 = Math.min(c0, box[0]);
      r0 = Math.min(r0, box[1]);
      c1 = Math.max(c1, box[2]);
      r1 = Math.max(r1, box[3]);
    }
    if (c1 >= 0) draw(c0, r0, c1, r1);
    box = now;
    return busy;
  };

  canvas.className = 'sheet';
  canvas.setAttribute('aria-hidden', 'true');
  root.classList.add('has-sheet');
  D.body.prepend(canvas); // first, so the page's own z-index -1 layers still paint over it
  read();
  build();
  const themed = new MutationObserver(() => {
    read();
    paint();
  });
  themed.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  const grown = travel && W.ResizeObserver && new ResizeObserver(span);
  if (grown) grown.observe(D.body);
  const off = all(
    live() ? track(tick) : noop, // touch and reduced motion: the grid is drawn once and left alone
    on(W, 'resize', () => {
      clearTimeout(timer);
      timer = setTimeout(build, 150);
    }),
  );
  return () => {
    off();
    clearTimeout(timer);
    themed.disconnect();
    if (grown) grown.disconnect();
    canvas.remove();
    root.classList.remove('has-sheet');
  };
}

/* ---- the biro: one point beside the cursor that becomes what it reaches ------------- */

function biro() {
  const make = (tag, name, parent) => {
    const node = D.createElement(tag);
    node.className = name;
    return parent.appendChild(node);
  };
  const root = make('div', 'biro', D.body);
  const dot = make('i', 'biro__dot', root);
  const disc = make('b', 'biro__disc', root);
  const held = make('div', 'biro__frame', root);
  const pic = make('div', 'biro__pic', held);
  const imgs = [make('img', '', pic), make('img', '', pic)];
  const follows = live(); // otherwise there is no follower, only the preview anchored to its row
  const warmed = new Map();
  const at = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }];
  let state = '';
  let aim; // the element the state was resolved from
  let row = null; // the target whose picture is showing
  let box; // its rectangle
  let band = 0; // [left, right] of the free stretch inside a row that keeps its frame (data-biro-place="gap")
  let lifted = null; // the row marked data-biro-held: its picture is in the frame
  let jump = 0; // the frame is opening: it starts at its place, not where it was last
  let pinned = false; // the frame is fixed beside the row (keyboard, reduced motion)
  let keyed = false;
  let shown = 0;
  let wanted = '';
  let fw = 0;
  let fh = 0;
  let vw = 0;
  let vh = 0;
  let seen = -1;
  let away = true;
  let mx; // where the pointer last crossed into an element
  let my;
  root.setAttribute('aria-hidden', 'true');
  imgs.forEach((img) => {
    img.alt = '';
    img.decoding = 'async';
  });

  const warm = () =>
    D.querySelectorAll('[data-biro-src]').forEach((el) => {
      const src = el.dataset.biroSrc;
      if (src && !warmed.has(src)) {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
        warmed.set(src, img);
      }
    });
  const size = () => {
    vw = D.documentElement.clientWidth;
    vh = W.innerHeight;
    band = 0;
    if (row) {
      box = row.getBoundingClientRect();
      if (row.dataset.biroPlace === 'gap') {
        // the widest stretch between what the row's children hold, less one dot pitch of air each side
        const range = D.createRange();
        const kids = [...row.children]
          .map((el) => (range.selectNodeContents(el), range.getBoundingClientRect()))
          .sort((a, b) => a.left - b.left);
        let lo = 0;
        let hi = 0;
        kids.forEach((kid, i) => {
          const next = kids[i + 1];
          if (next && next.left - kid.right > hi - lo) {
            lo = kid.right;
            hi = next.left;
          }
        });
        band = [lo + PITCH, hi - PITCH];
      }
    }
    held.style.height = band ? box.height + 'px' : '';
    held.classList.toggle('is-gap', !!band);
    fw = held.offsetWidth;
    fh = held.offsetHeight;
  };
  const go = (node, p, x, y, k, ky = k) => {
    const dx = x - p.x;
    const dy = y - p.y;
    p.x += dx * k;
    p.y += dy * ky;
    node.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`;
    return Math.abs(dx) + Math.abs(dy) > 0.2;
  };
  const lift = (el) => {
    if (el === lifted) return;
    if (lifted) lifted.removeAttribute('data-biro-held');
    lifted = el;
    if (el) el.setAttribute('data-biro-held', '');
  };
  // In a row that keeps its frame: open while the stretch can hold it and the pointer has
  // not passed it. The row is marked while its picture is in the frame.
  const seat = (x) => {
    const open = band[1] - band[0] >= fw && x < band[1];
    held.classList.remove('is-fx', 'is-fy');
    held.classList.toggle('is-out', !open);
    lift(open ? row : null);
  };
  // Beside the row when there is room, otherwise under (or over) its right end:
  // the focused row itself is never covered. A row that keeps its frame holds it mid-stretch.
  const place = () => {
    let x = box.right + 20;
    let y = box.top + (box.height - fh) / 2;
    if (band) {
      seat(0);
      return go(held, at[2], (band[0] + band[1] - fw) / 2, box.top, 1);
    }
    if (x + fw > vw - 16) {
      x = box.right - fw - 16;
      y = box.bottom + 12;
      if (y + fh > vh - 16) y = box.top - fh - 12;
    }
    held.classList.remove('is-fx', 'is-fy');
    go(held, at[2], clamp(x, 16, vw - fw - 16), clamp(y, 16, vh - fh - 16), 1);
  };
  const set = (kind, target, pin = false) => {
    if (kind === 'preview' && !target.dataset.biroSrc) kind = 'link';
    if (kind === state && target === aim && pin === pinned) return; // still on the same thing
    aim = target;
    pinned = pin;
    row = null;
    lift(null);
    held.classList.remove('is-out');
    if (kind === 'preview') {
      const src = target.dataset.biroSrc;
      const next = imgs[1 - shown];
      warm();
      held.style.setProperty('--biro-ratio', target.dataset.biroRatio || '');
      row = target;
      jump = state !== kind;
      size();
      if (pin) place();
      else if (band) seat(mx);
      if (src !== wanted) {
        wanted = src;
        next.alt = target.dataset.biroAlt || '';
        next.src = src;
        const swap = () => {
          if (wanted !== src || imgs[shown] === next) return;
          imgs[shown].className = '';
          next.className = 'is-on';
          shown = 1 - shown;
        };
        if (next.decode) next.decode().then(swap, noop);
        else swap();
      }
    } else if (kind === 'label') disc.textContent = target.dataset.biroLabel || '';
    root.dataset.state = state = kind;
  };

  const tick = (dt) => {
    const here = ptr.on;
    const k = (tau) => (away ? 1 : 1 - Math.exp(-dt / tau));
    if (seen !== epoch) {
      seen = epoch;
      size();
      if (row && pinned) place();
    }
    if (!here && state && !keyed) set('');
    root.classList.toggle('is-on', here && follows);
    if (!here || !follows) {
      away = true;
      return 0;
    }
    const x = ptr.x;
    const y = ptr.y;
    let busy = go(dot, at[0], x + 14, y + 16, k(80)) | go(disc, at[1], x, y, k(100));
    const kf = jump ? 1 : k(130);
    jump = 0;
    if (row && band && !pinned) {
      // A row that keeps its frame: the frame follows the pointer along the free stretch
      // between the row's name and its note, locked to the row, and covers no neighbour.
      seat(x);
      busy |= go(held, at[2], clamp(x + 20, band[0], band[1] - fw), box.top, kf, 1);
    } else if (!(row && pinned)) {
      // The frame follows the pointer along the row and hangs from the row's lower edge,
      // so the row being read is never covered; it turns round at the viewport edges.
      // Over a tall target it hangs from the pen tip instead.
      const docks = row && box.bottom - y < 160 && y - box.top < 160;
      const under = docks ? box.bottom : y + 20;
      const fx = x + 20 + fw > vw - 16;
      const fy = under + fh > vh - 16;
      held.classList.toggle('is-fx', fx);
      held.classList.toggle('is-fy', fy);
      busy |= go(
        held,
        at[2],
        clamp(fx ? x - 20 - fw : x + 20, 16, vw - fw - 16),
        clamp(fy ? (docks ? box.top : y - 20) - fh : under, 16, vh - fh - 16),
        kf,
      );
    }
    away = false;
    return busy;
  };

  const press = (down) => () => root.classList.toggle('is-down', down);
  // pictures are fetched ahead when the browser is idle, and at the latest on the first preview
  const later =
    fine.matches &&
    !(navigator.connection || {}).saveData &&
    (W.requestIdleCallback ? requestIdleCallback(warm, { timeout: 2500 }) : setTimeout(warm, 1500));
  const off = all(
    track(tick),
    on(D, 'pointerover', (e) => {
      if (e.pointerType !== 'mouse') return;
      const still = mx === undefined || (e.clientX === mx && e.clientY === my);
      mx = e.clientX;
      my = e.clientY;
      if (keyed && still) return; // the page scrolled under a resting pointer: the keyboard keeps its frame
      const target = near(e, '[data-biro],a,button,iframe,[data-ui]');
      const field = near(e, '[data-biro-ink]');
      root.style.setProperty('--biro-ink', field ? field.dataset.biroInk : '');
      keyed = false;
      set(!target ? '' : target.matches('iframe,[data-ui]') ? 'off' : target.dataset.biro || 'link', target, !follows);
      wake(tick);
    }),
    on(D, 'focusin', (e) => {
      const target = near(e, '[data-biro="preview"]');
      if (target && e.target.matches(':focus-visible')) {
        keyed = true;
        set('preview', target, true);
      }
    }),
    on(D, 'focusout', () => {
      if (keyed) {
        keyed = false;
        set('');
      }
    }),
    on(W, 'pointerdown', press(true)),
    on(W, 'pointerup', press(false)),
    on(W, 'pointercancel', press(false)),
  );
  return () => {
    off();
    (W.cancelIdleCallback || clearTimeout)(later);
    lift(null);
    root.remove();
  };
}

/* ---- the monument: letters lean away from the pointer ------------------------------- */

function monument() {
  if (!live()) return noop;
  const items = [];
  D.querySelectorAll('.monument,[data-monument]').forEach((el) => {
    const text = el.textContent;
    if (el.children.length || !text.trim()) return; // plain text only
    // A heading keeps one name; the letters are hidden from assistive technology.
    const named = el.hasAttribute('aria-label');
    const quiet = named || el.hasAttribute('role') || /^H\d$/.test(el.tagName);
    const letters = [];
    el.textContent = '';
    for (const ch of text) {
      if (!ch.trim()) {
        el.append(ch);
        continue;
      }
      const span = D.createElement('span');
      span.className = 'monument__l';
      span.textContent = ch;
      if (quiet) span.setAttribute('aria-hidden', 'true');
      el.append(span);
      letters.push({ el: span, x: 0, y: 0, lean: 0, vl: 0, grow: 0, vg: 0 });
    }
    if (quiet && !named) el.setAttribute('aria-label', text.trim());
    items.push({ el, text, ours: quiet && !named, letters, seen: -1, shape: -1, reach: 0, box: null, busy: 0 });
  });
  if (!items.length) return noop;

  const tick = (dt) => {
    const t = dt / 1000;
    const px = ptr.x;
    const py = ptr.y;
    let busy = 0;
    items.forEach((m) => {
      if (m.shape !== shape) {
        // letter centres relative to the element, from layout values (transforms do not count)
        m.shape = shape;
        m.reach = clamp(parseFloat(getComputedStyle(m.el).fontSize) * 0.6, 160, 420);
        m.letters.forEach((l) => {
          const inside = l.el.offsetParent === m.el;
          l.x = l.el.offsetLeft - (inside ? 0 : m.el.offsetLeft) + l.el.offsetWidth / 2;
          l.y = l.el.offsetTop - (inside ? 0 : m.el.offsetTop) + l.el.offsetHeight / 2;
        });
      }
      if (m.seen !== epoch) {
        m.seen = epoch;
        m.box = m.el.getBoundingClientRect();
      }
      const b = m.box;
      const reach = m.reach;
      const close = ptr.on && px > b.left - reach && px < b.right + reach && py > b.top - reach && py < b.bottom + reach;
      if (!close && !m.busy) return;
      m.busy = 0;
      m.letters.forEach((l) => {
        let lean = 0;
        let grow = 0;
        if (close) {
          const dx = b.left + l.x - px;
          const dy = b.top + l.y - py;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < reach) {
            grow = (1 - d / reach) ** 2;
            // away from the pointer, through zero at the letter's centre; peaks near 0.4 (about 2.4 degrees)
            lean = (grow * dx) / Math.sqrt(dx * dx + (reach * reach) / 16);
          }
        }
        // spring: stiffness 170, damping 22 (ratio 0.84: weight, not bounce)
        l.vl += ((lean - l.lean) * 170 - l.vl * 22) * t;
        l.lean += l.vl * t;
        l.vg += ((grow - l.grow) * 170 - l.vg * 22) * t;
        l.grow += l.vg * t;
        if (Math.abs(lean - l.lean) + Math.abs(grow - l.grow) < 0.002 && Math.abs(l.vl) + Math.abs(l.vg) < 0.02) {
          l.lean = lean;
          l.grow = grow;
          l.vl = l.vg = 0;
        } else m.busy = 1;
        l.el.style.transform =
          l.lean || l.grow
            ? `skewX(${(-6 * l.lean).toFixed(2)}deg) scale(${(1 - 0.012 * l.grow).toFixed(4)},${(1 + 0.035 * l.grow).toFixed(4)})`
            : '';
      });
      busy |= m.busy;
    });
    return busy;
  };

  const off = track(tick);
  return () => {
    off();
    items.forEach((m) => {
      m.el.textContent = m.text;
      if (m.ours) m.el.removeAttribute('aria-label');
    });
  };
}

/* ---- public ----------------------------------------------------------------------------- */

export const initTheme = unit(theme);
export const initRise = unit(rise);
export const initSheet = unit(sheet, true);
export const initBiro = unit(biro, true);
export const initMonument = unit(monument, true);
export const initAll = () => all(initTheme(), initRise(), initSheet(), initBiro(), initMonument());
