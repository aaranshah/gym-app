// Paged (infinite-scroll) thumbnail grid, shared by the library and the picker.
import { el } from './util.js';
import { thumbUrl, fullUrl } from './store.js';

const PAGE = 120;
const canHover = window.matchMedia('(hover: hover)').matches;

export class PagedGrid {
  /**
   * @param grid      container element
   * @param sentinel  element placed after the grid (triggers loading more)
   * @param opts      { onClick(item, tile, event), decorate(item, tile), scrollRoot }
   */
  constructor(grid, sentinel, opts = {}) {
    this.grid = grid;
    this.opts = opts;
    this.items = [];
    this.shown = 0;
    this.tiles = new Map();
    this.io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) this.more();
    }, { root: opts.scrollRoot || null, rootMargin: '600px' });
    this.io.observe(sentinel);
  }

  set(items) {
    this.items = items;
    this.shown = 0;
    this.tiles.clear();
    this.grid.replaceChildren();
    this.more();
  }

  more() {
    if (this.shown >= this.items.length) return;
    const frag = document.createDocumentFragment();
    const end = Math.min(this.items.length, this.shown + PAGE);
    for (let i = this.shown; i < end; i++) frag.append(this.tile(this.items[i]));
    this.shown = end;
    this.grid.append(frag);
  }

  tile(item) {
    const img = el('img', { src: thumbUrl(item), alt: item.name || 'GIF', loading: 'lazy', draggable: false });
    const t = el('div.tile', { draggable: true, title: item.name || '' },
      img,
      el('div.cap', {}, el(`i.dot.${item.gender || 'none'}`), el('span', {}, item.name || 'Untagged')));
    t.dataset.id = item.id;
    t.item = item;
    t.addEventListener('click', (e) => this.opts.onClick && this.opts.onClick(item, t, e));
    t.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/gif-id', item.id);
      e.dataTransfer.effectAllowed = 'copy';
    });
    if (canHover) {
      t.addEventListener('mouseenter', async () => {
        t.hovering = true;
        const u = await fullUrl(item.id);
        if (t.hovering && u) img.src = u;
      });
      t.addEventListener('mouseleave', () => {
        t.hovering = false;
        img.src = thumbUrl(item);
      });
    }
    this.opts.decorate && this.opts.decorate(item, t);
    this.tiles.set(item.id, t);
    return t;
  }

  /** Re-run decorate() on rendered tiles (selection / usage badges). */
  redecorate() {
    if (!this.opts.decorate) return;
    for (const t of this.tiles.values()) this.opts.decorate(t.item, t);
  }
}
