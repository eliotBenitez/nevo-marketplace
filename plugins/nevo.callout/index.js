const NODE_NAME = 'callout_block'
const STYLE_ID = 'nevo-callout-block-styles'

const VARIANTS = {
  info: { icon: '💡', label: 'Info', accent: '#3b82f6' },
  success: { icon: '✅', label: 'Success', accent: '#22c55e' },
  warning: { icon: '⚠️', label: 'Warning', accent: '#f59e0b' },
  danger: { icon: '🛑', label: 'Danger', accent: '#ef4444' },
  note: { icon: '📝', label: 'Note', accent: '#8b5cf6' },
}

const DEFAULT_VARIANT = 'info'

function normalizeVariant(value) {
  return typeof value === 'string' && VARIANTS[value] ? value : DEFAULT_VARIANT
}

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
.nv-plugin-block--${NODE_NAME} { margin: 8px 0; }
.nv-cb {
  --cb-accent: ${VARIANTS.info.accent};
  display: flex;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--cb-accent) 32%, transparent);
  border-left: 3px solid var(--cb-accent);
  background: color-mix(in srgb, var(--cb-accent) 9%, transparent);
}
.nv-cb[data-variant="info"] { --cb-accent: ${VARIANTS.info.accent}; }
.nv-cb[data-variant="success"] { --cb-accent: ${VARIANTS.success.accent}; }
.nv-cb[data-variant="warning"] { --cb-accent: ${VARIANTS.warning.accent}; }
.nv-cb[data-variant="danger"] { --cb-accent: ${VARIANTS.danger.accent}; }
.nv-cb[data-variant="note"] { --cb-accent: ${VARIANTS.note.accent}; }
.nv-cb__icon {
  flex: 0 0 auto;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  line-height: 1.6;
  padding: 0;
  user-select: none;
}
.nv-cb__body { flex: 1 1 auto; min-width: 0; }
.nv-cb__body > :first-child { margin-top: 0; }
.nv-cb__body > :last-child { margin-bottom: 0; }
`
  document.head.appendChild(style)
}

const schema = {
  group: 'block',
  content: 'block+',
  defining: true,
  attrs: { variant: { default: DEFAULT_VARIANT } },
  parseDOM: [
    {
      tag: 'aside[data-nevo-callout-block]',
      getAttrs: (dom) => ({ variant: normalizeVariant(dom.getAttribute('data-variant')) }),
      contentElement: '[data-callout-body]',
    },
  ],
  toDOM: (node) => [
    'aside',
    {
      'data-nevo-callout-block': 'true',
      'data-variant': normalizeVariant(node.attrs && node.attrs.variant),
      class: 'nv-cb',
    },
    ['div', { 'data-callout-body': 'true', class: 'nv-cb__body' }, 0],
  ],
}

function render(node, helpers) {
  ensureStyles()
  const variant = normalizeVariant(node.attrs && node.attrs.variant)

  const dom = document.createElement('aside')
  dom.className = 'nv-cb'
  dom.dataset.variant = variant

  const icon = document.createElement('button')
  icon.type = 'button'
  icon.className = 'nv-cb__icon'
  icon.contentEditable = 'false'
  icon.textContent = VARIANTS[variant].icon
  icon.title = VARIANTS[variant].label
  icon.setAttribute('aria-label', 'Change callout type')

  const onMouseDown = (event) => event.preventDefault()
  const onClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    helpers.requestEdit(icon.getBoundingClientRect())
  }
  icon.addEventListener('mousedown', onMouseDown)
  icon.addEventListener('click', onClick)

  const body = document.createElement('div')
  body.className = 'nv-cb__body'

  dom.append(icon, body)

  return {
    dom,
    contentDOM: body,
    update(nextNode) {
      const next = normalizeVariant(nextNode.attrs && nextNode.attrs.variant)
      dom.dataset.variant = next
      icon.textContent = VARIANTS[next].icon
      icon.title = VARIANTS[next].label
    },
    destroy() {
      icon.removeEventListener('mousedown', onMouseDown)
      icon.removeEventListener('click', onClick)
    },
  }
}

const popover = {
  title: 'Callout',
  removable: true,
  fields: [
    {
      key: 'variant',
      type: 'select',
      label: 'Type',
      options: Object.keys(VARIANTS).map((value) => ({
        value,
        label: `${VARIANTS[value].icon} ${VARIANTS[value].label}`,
      })),
    },
  ],
}

const serialize = {
  markdown: (node, helpers) => {
    const variant = normalizeVariant(node.attrs && node.attrs.variant)
    const body = helpers.serializeChildren()
    const prefixed = body
      .split('\n')
      .map((line) => (line.length ? `> ${line}` : '>'))
      .join('\n')
    return `> [!${variant}]\n${prefixed}`
  },
  html: (node, helpers) => {
    const variant = normalizeVariant(node.attrs && node.attrs.variant)
    return `<aside class="nv-callout-block" data-variant="${helpers.escapeHtml(variant)}">\n${helpers.serializeChildren()}\n</aside>`
  },
  typst: (node, helpers) => {
    return `#block(inset: 10pt, radius: 6pt, stroke: 0.5pt + luma(200))[\n${helpers.serializeChildren()}\n]`
  },
}

const slashItem = {
  id: 'callout.insert',
  title: 'Callout',
  category: 'layout',
  keywords: ['callout', 'admonition', 'note', 'info', 'warning', 'danger', 'выноска', 'примечание', 'заметка'],
  defaultAttrs: { variant: DEFAULT_VARIANT },
}

export default {
  onRegister(ctx) {
    ctx.registerBlockType({
      name: NODE_NAME,
      schema,
      render,
      popover,
      serialize,
      slashItem,
    })
  },
}
