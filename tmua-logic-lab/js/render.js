/* Text + maths renderer. Every piece of content goes through here, so typesetting is consistent everywhere.
 * - $...$ inline maths; any inline expression containing a fraction is set in display style (stacked, full size)
 *   inside an inline-block with extra vertical margin, so tall fractions never overlap neighbouring lines.
 * - $$...$$ display maths in a locally scrolling container (only genuinely wide maths scrolls).
 * - **word** decisive-word emphasis (removed in exam mode).
 * KaTeX output is HTML + MathML, so assistive technology receives real mathematics.
 */
(function (TLL) {
  'use strict';
  const cache = new Map();
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function tex(src, display) {
    const key = (display ? 'D' : 'I') + src;
    if (cache.has(key)) return cache.get(key);
    let html;
    const tall = !display && /\\(d|t)?frac|\\displaystyle|\\int|\\sum/.test(src);
    // A long expression containing stacked fractions would wrap awkwardly inside a sentence: give it its own line.
    const body = tall && !/\\tfrac/.test(src) ? '\\displaystyle ' + src : src;
    try {
      html = window.katex.renderToString(body, { displayMode: !!display, output: 'htmlAndMathml', throwOnError: true, strict: 'ignore' });
    } catch (e) {
      // Never show raw LaTeX: fall back to plain readable text and log for maintainers.
      console.error('Maths render error', src, e);
      html = '<span class="math-error">' + esc(src.replace(/\\[a-z]+/gi, ' ').replace(/[{}]/g, '')) + '</span>';
    }
    if (display) html = '<span class="math-display">' + html + '</span>';
    else if (tall) html = '<span class="math-tall">' + html + '</span>';
    cache.set(key, html);
    return html;
  }

  /* A long inline expression with display-size fractions would wrap badly inside a sentence: give it its own line. */
  function promote(src) {
    if (!/\\(d?frac|displaystyle|int|sum)/.test(src.replace(/\\tfrac/g, ''))) return false;
    return (src.match(/\\d?frac/g) || []).length >= 3 || src.replace(/\\[a-z]+|[{}\s]/gi, '').length > 26;
  }

  /* inline: text with maths and emphasis, no block structure. */
  function inline(text, opt) {
    opt = opt || {};
    if (text == null) return '';
    const re = /\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g;
    let out = '', last = 0, m;
    while ((m = re.exec(text))) {
      out += plain(text.slice(last, m.index), opt);
      last = re.lastIndex;
      if (m[1]) out += tex(m[1].trim(), true);
      else if (promote(m[2])) {
        // own line; absorb trailing punctuation so it is not orphaned at the start of the next line
        const p = text.charAt(last);
        if (/[.,;:]/.test(p)) { out += tex(m[2] + p, true); last++; } else out += tex(m[2], true);
      } else out += tex(m[2], false);
    }
    out += plain(text.slice(last), opt);
    return out;
  }
  function plain(s, opt) {
    let h = esc(s);
    h = h.replace(/\*\*([^*]+)\*\*/g, opt.exam ? '$1' : '<strong class="key">$1</strong>');
    h = h.replace(/\n/g, '<br>');
    return h;
  }

  /* block: paragraphs (blank-line separated) and "- " bullet lists. */
  function block(text, opt) {
    if (text == null) return '';
    const paras = String(text).split(/\n\s*\n/);
    return paras.map(p => {
      const lines = p.split('\n');
      if (lines.every(l => /^\s*- /.test(l))) {
        return '<ul>' + lines.map(l => '<li>' + inline(l.replace(/^\s*- /, ''), opt) + '</li>').join('') + '</ul>';
      }
      if (lines.some(l => /^\s*- /.test(l))) {
        // paragraph followed by list
        const first = []; const items = [];
        lines.forEach(l => (/^\s*- /.test(l) ? items : (items.length ? items : first)).push(l));
        return (first.length ? '<p>' + inline(first.join('\n'), opt) + '</p>' : '') +
          '<ul>' + items.map(l => '<li>' + inline(l.replace(/^\s*- /, ''), opt) + '</li>').join('') + '</ul>';
      }
      const t = p.trim();
      if (/^\$\$[\s\S]*\$\$$/.test(t)) return inline(t, opt);
      return '<p>' + inline(p.replace(/^\n+|\n+$/g, ''), opt) + '</p>';
    }).join('');
  }

  /* After insertion: make only overflowing maths keyboard-scrollable. */
  function fixScroll(root) {
    (root || document).querySelectorAll('.math-display, .otext').forEach(el => {
      if (el.scrollWidth > el.clientWidth + 2) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'group');
        el.setAttribute('aria-label', 'Wide expression: scroll sideways to read it all');
      } else if (el.getAttribute('role') === 'group') {
        el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label');
      }
    });
  }

  /* Plain text version (for aria labels / search). */
  function text(s) { return String(s || '').replace(/\$\$?([^$]+)\$\$?/g, '$1').replace(/\\[a-z]+/gi, ' ').replace(/[{}*]/g, '').replace(/\s+/g, ' ').trim(); }

  TLL.render = { inline, block, fixScroll, esc, text };
})(window.TLL);
