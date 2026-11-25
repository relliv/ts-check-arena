// Variant tags: a checker name such as "tsrs 0.20.1 +fast" renders "+fast" as a small
// button that explains the variant, from checkers.json, so a reader need not open
// METHOD.md. One popover lives on <body> and is placed next to the tag that opened
// it, so the scroll containers around the tables cannot clip it. Mouse hover and
// keyboard focus show it; a click or tap pins it until a click elsewhere or Esc.
import type { Family } from '../../src/lib/checkers.ts';
import checkers from '../../checkers.json' with { type: 'json' };

// The JSON import infers a union per entry; checkers.ts reads the same file as Family[].
const families = (checkers as unknown as { families: Family[] }).families;

const esc = (s: unknown): string => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

/** "tsrs@0.20.1-ts7.1.0-beta+fast" splits into its family and its variant; null without one. */
function variantOf(id: string): { family: Family; name: string } | null {
  const at = id.lastIndexOf('@');
  const plus = id.lastIndexOf('+');
  if (plus < at) return null;
  const family = families.find(f => f.name === id.slice(0, at));
  const name = id.slice(plus + 1);
  return family?.variants?.[name] ? { family, name } : null;
}

/**
 * A checker's display name as HTML: `short` names it ("tsrs 0.20.1 +fast"), and a
 * variant suffix becomes the tag that explains it.
 */
export function checkerName(id: string, short: (id: string) => string): string {
  const text = short(id);
  const v = variantOf(id);
  if (!v) return esc(text);
  const base = text.slice(0, text.lastIndexOf(` +${v.name}`));
  return `${esc(base)} <button type="button" class="variant-tag" data-variant="${esc(v.family.name)}:${esc(v.name)}" aria-describedby="variant-pop">+${esc(v.name)}</button>`;
}

/** The variants a family documents, for the Libs dialog: "+fast" and what it does. */
export function familyVariants(family: Family): { name: string; args: string[]; versions?: string; description: string }[] {
  return Object.entries(family.variants ?? {}).map(([name, v]) => ({ name, ...v }));
}

function content(familyName: string, name: string): string {
  const family = families.find(f => f.name === familyName)!;
  const v = family.variants![name]!;
  return `<b>${esc(family.name)} +${esc(name)}</b>
    <span>Runs <code>${esc(v.args.join(' '))}</code>${v.versions ? `, available in ${esc(family.name)} ${esc(v.versions)}` : ''}.</span>
    <span>${esc(v.description)}</span>
    <span class="variant-note">Measured as its own entry, next to the same version as it ships.</span>`;
}

/** Adds the shared popover to the page once and wires every current and future tag. */
export function mountVariantPopover(): void {
  const pop = document.createElement('div');
  pop.id = 'variant-pop';
  pop.className = 'variant-pop';
  pop.setAttribute('role', 'tooltip');
  pop.hidden = true;
  document.body.append(pop);

  let anchor: HTMLElement | null = null;
  let pinned = false;

  const place = () => {
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const margin = 8;
    const width = pop.offsetWidth;
    const height = pop.offsetHeight;
    const left = Math.min(Math.max(margin, r.left + r.width / 2 - width / 2), window.innerWidth - width - margin);
    // Below the tag, or above it when the viewport has no room below.
    const below = r.bottom + 6;
    const top = below + height + margin > window.innerHeight && r.top - height - 6 > margin ? r.top - height - 6 : below;
    pop.style.left = `${Math.round(left)}px`;
    pop.style.top = `${Math.round(top)}px`;
  };
  const show = (tag: HTMLElement) => {
    const [family, name] = (tag.dataset['variant'] ?? '').split(':');
    if (!family || !name) return;
    anchor?.setAttribute('aria-expanded', 'false');
    anchor = tag;
    tag.setAttribute('aria-expanded', 'true');
    pop.innerHTML = content(family, name);
    pop.hidden = false;
    place();
  };
  const hide = () => {
    anchor?.setAttribute('aria-expanded', 'false');
    anchor = null;
    pinned = false;
    pop.hidden = true;
  };
  const tagOf = (e: Event) => (e.target instanceof Element ? e.target.closest<HTMLElement>('.variant-tag') : null);

  // Hover only for a real mouse: on touch screens pointerover fires on tap, which the click below handles.
  document.addEventListener('pointerover', e => {
    const tag = tagOf(e);
    if (tag && e.pointerType === 'mouse' && !pinned) show(tag);
  });
  document.addEventListener('pointerout', e => {
    if (tagOf(e) && e.pointerType === 'mouse' && !pinned) hide();
  });
  document.addEventListener('focusin', e => {
    const tag = tagOf(e);
    if (tag && !pinned) show(tag);
  });
  document.addEventListener('focusout', e => {
    if (tagOf(e) && !pinned) hide();
  });
  document.addEventListener('click', e => {
    const tag = tagOf(e);
    if (tag) {
      if (pinned && anchor === tag) return hide();
      show(tag);
      pinned = true;
    } else if (pinned && !(e.target instanceof Node && pop.contains(e.target))) {
      hide();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !pop.hidden) hide();
  });
  // A re-render removes the tag it was attached to; scrolling moves it.
  window.addEventListener('scroll', () => (anchor?.isConnected ? place() : hide()), { capture: true, passive: true });
  window.addEventListener('resize', () => (anchor?.isConnected ? place() : hide()));
}
