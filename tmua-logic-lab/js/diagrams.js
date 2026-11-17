/* Diagrams as inline SVG (selectable labels, theme-aware colours, text alternatives supplied by the lesson). */
(function (TLL) {
  'use strict';
  const esc = (s) => TLL.render.esc(s);
  const T = (x, y, s, o) => `<text x="${x}" y="${y}" ${o || ''} style="fill:var(--ink);font:600 15px var(--font-body)">${esc(s)}</text>`;
  const svg = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  const arrowDefs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--accent)"/></marker></defs>`;
  const box = (x, y, w, h, label, tone) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" style="fill:var(--${tone || 'surface'});stroke:var(--line-strong);stroke-width:1.5"/>` + T(x + w / 2, y + h / 2 + 5, label, 'text-anchor="middle"');
  const arrow = (x1, y1, x2, y2, both) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--accent);stroke-width:2.5" marker-end="url(#ah)" ${both ? 'marker-start="url(#ah)"' : ''}/>`;

  const D = {
    numberline(d) {
      const W = 520, pad = 40, rowH = 62, H = d.rows.length * rowH + 16;
      const sx = (v) => pad + (v - d.min) / (d.max - d.min) * (W - 2 * pad);
      let b = '';
      d.rows.forEach((r, i) => {
        const y = 40 + i * rowH;
        b += T(pad - 30, y - 18, r.label);
        b += `<line x1="${pad - 20}" y1="${y}" x2="${W - pad + 20}" y2="${y}" style="stroke:var(--line-strong);stroke-width:1.5"/>`;
        for (let v = d.min; v <= d.max; v++) b += `<line x1="${sx(v)}" y1="${y - 5}" x2="${sx(v)}" y2="${y + 5}" style="stroke:var(--line-strong)"/>` + `<text x="${sx(v)}" y="${y + 21}" text-anchor="middle" style="fill:var(--ink-soft);font:13px var(--font-body)">${v}</text>`;
        const a = r.from === '-inf' ? pad - 20 : sx(r.from), z = r.to === 'inf' ? W - pad + 20 : sx(r.to);
        b += `<line x1="${a}" y1="${y}" x2="${z}" y2="${y}" style="stroke:var(--accent);stroke-width:6;stroke-linecap:round"/>`;
        const dot = (x, open) => `<circle cx="${x}" cy="${y}" r="7" style="fill:${open ? 'var(--surface)' : 'var(--accent)'};stroke:var(--accent);stroke-width:2.5"/>`;
        if (r.from !== '-inf') b += dot(a, r.openLeft !== false && r.openLeft);
        if (r.to !== 'inf') b += dot(z, r.openRight !== false && r.openRight);
      });
      return svg(W, H, b);
    },
    truthgrid() {
      const rows = [['true', 'true', 'true'], ['true', 'false', 'FALSE'], ['false', 'true', 'true'], ['false', 'false', 'true']];
      let b = '';
      const xs = [70, 190, 340];
      ['A', 'B', 'if A then B'].forEach((h, i) => b += T(xs[i], 26, h, 'text-anchor="middle"'));
      rows.forEach((r, i) => {
        const y = 40 + i * 36;
        b += `<rect x="10" y="${y}" width="420" height="32" rx="6" style="fill:${i === 1 ? 'var(--bad-bg)' : 'var(--surface)'};stroke:var(--line)"/>`;
        r.forEach((c, j) => b += T(xs[j], y + 22, c + (i === 1 && j === 2 ? '  ← the only failing case' : ''), 'text-anchor="middle"'));
      });
      return svg(440, 190, b);
    },
    translations() {
      const rows = [['if A then B', 'A → B'], ['B if A', 'A → B'], ['A only if B', 'A → B'], ['A if and only if B', 'A ↔ B']];
      let b = arrowDefs;
      rows.forEach((r, i) => {
        const y = 14 + i * 50;
        b += box(10, y, 230, 38, r[0], 'surface');
        b += `<rect x="290" y="${y}" width="210" height="38" rx="8" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:1.5"/>`;
        b += T(320, y + 25, 'A');
        b += arrow(345, y + 19, 455, y + 19, i === 3);
        b += T(470, y + 25, 'B');
        b += `<line x1="244" y1="${y + 19}" x2="284" y2="${y + 19}" style="stroke:var(--line-strong);stroke-dasharray:4 4"/>`;
      });
      return svg(510, 216, b);
    },
    square4() {
      let b = arrowDefs;
      b += box(10, 20, 230, 46, 'if A then B'); b += box(290, 20, 230, 46, 'converse: if B then A');
      b += box(10, 130, 230, 46, 'contrapositive: if not B then not A'.replace('contrapositive: ', '')); b += box(290, 130, 230, 46, 'if not A then not B');
      b += T(125, 108, 'contrapositive', 'text-anchor="middle"'); b += T(405, 108, '(contrapositive of the converse)', 'text-anchor="middle" style="fill:var(--ink-soft);font:13px var(--font-body)"');
      b += `<rect x="4" y="12" width="242" height="172" rx="12" style="fill:none;stroke:var(--ok);stroke-width:2;stroke-dasharray:6 5"/>`;
      b += `<rect x="284" y="12" width="242" height="172" rx="12" style="fill:none;stroke:var(--line-strong);stroke-width:2;stroke-dasharray:2 5"/>`;
      b += T(125, 206, 'always the same truth value', 'text-anchor="middle" style="fill:var(--ok);font:700 14px var(--font-body)"');
      b += T(405, 206, 'same as each other, not as the left', 'text-anchor="middle" style="fill:var(--ink-soft);font:700 14px var(--font-body)"');
      return svg(530, 216, b);
    },
    subset(d) {
      let b = '';
      b += `<ellipse cx="230" cy="105" rx="210" ry="92" style="fill:var(--surface);stroke:var(--line-strong);stroke-width:2"/>`;
      b += `<ellipse cx="200" cy="118" rx="96" ry="48" style="fill:var(--accent-soft);stroke:var(--accent);stroke-width:2"/>`;
      b += T(200, 116, d.inner, 'text-anchor="middle"');
      b += T(200, 138, 'sufficient for the outer', 'text-anchor="middle" style="fill:var(--accent);font:700 13px var(--font-body)"');
      b += T(330, 48, d.outer, 'text-anchor="middle"');
      b += T(330, 68, 'necessary for the inner', 'text-anchor="middle" style="fill:var(--ink-soft);font:700 13px var(--font-body)"');
      return svg(460, 210, b);
    },
    chain(d) {
      let b = arrowDefs; const n = d.items.length;
      d.items.forEach((it, i) => { const x = 10 + i * 170; b += box(x, 20, 90, 42, it, i === 0 ? 'accent-soft' : 'surface'); if (i < n - 1) b += arrow(x + 94, 41, x + 166, 41); });
      d.items.slice().reverse().forEach((it, i) => { const x = 10 + i * 170; b += box(x, 110, 90, 42, 'not ' + it); if (i < n - 1) b += arrow(x + 94, 131, x + 166, 131); });
      b += T(10, 98, 'backwards with negations (contrapositive):', 'style="fill:var(--ink-soft);font:13px var(--font-body)"');
      return svg(10 + (n - 1) * 170 + 100, 165, b);
    },
    sinegraph() {
      const W = 520, H = 210, x0 = 40, y0 = 110, sx = (deg) => x0 + deg / 360 * (W - 70), sy = (v) => y0 - v * 80;
      let p = ''; for (let d = 0; d <= 360; d += 5) p += (d ? 'L' : 'M') + sx(d).toFixed(1) + ',' + sy(Math.sin(d * Math.PI / 180)).toFixed(1);
      let b = `<line x1="${x0}" y1="${y0}" x2="${W - 20}" y2="${y0}" style="stroke:var(--line-strong)"/><line x1="${x0}" y1="20" x2="${x0}" y2="200" style="stroke:var(--line-strong)"/>`;
      b += `<path d="${p}" style="fill:none;stroke:var(--accent);stroke-width:3"/>`;
      b += `<line x1="${x0}" y1="${sy(0.5)}" x2="${W - 20}" y2="${sy(0.5)}" style="stroke:var(--hint);stroke-width:2;stroke-dasharray:6 5"/>`;
      b += T(W - 70, sy(0.5) - 8, 'y = ½');
      [30, 150].forEach(d => { b += `<circle cx="${sx(d)}" cy="${sy(0.5)}" r="6" style="fill:var(--hint)"/><line x1="${sx(d)}" y1="${sy(0.5)}" x2="${sx(d)}" y2="${y0}" style="stroke:var(--hint);stroke-dasharray:3 3"/>` + T(sx(d), y0 + 22, d + '°', 'text-anchor="middle"'); });
      [90, 180, 270, 360].forEach(d => b += `<text x="${sx(d)}" y="${y0 + 22}" text-anchor="middle" style="fill:var(--ink-soft);font:13px var(--font-body)">${d}°</text>`);
      b += T(x0 + 8, 32, 'y = sin x');
      return svg(W, H, b);
    }
  };

  TLL.diagram = function (d) { return (D[d.type] || (() => ''))(d); };
})(window.TLL);
