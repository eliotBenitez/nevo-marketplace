// SDK V2 sandboxed-worker plugin. Dependency-free: the SDK helpers it needs
// (definePlugin, transaction, ui) only build plain JSON, so they are inlined.

const NODE_NAME = 'callout_block'

const VARIANTS = {
  info: { icon: '💡', label: 'Info', accent: '#3b82f6' },
  success: { icon: '✅', label: 'Success', accent: '#22c55e' },
  warning: { icon: '⚠️', label: 'Warning', accent: '#f59e0b' },
  danger: { icon: '🛑', label: 'Danger', accent: '#ef4444' },
  note: { icon: '📝', label: 'Note', accent: '#8b5cf6' },
}

const DEFAULT_VARIANT = 'info'

function normalizeVariant(value) {
  return typeof value === 'string' && Object.hasOwn(VARIANTS, value) ? value : DEFAULT_VARIANT
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function element(tag, props = {}, children = []) {
  return { type: 'element', tag, props, children }
}

// The host prefixes every selector with the plugin scope, which sits on the UI root,
// so styles target `.nv-cb` one level below it. The host forbids the word "body" here.
const variantCss = Object.entries(VARIANTS)
  .map(([name, variant]) => `
.nv-cb[data-variant="${name}"] { --cb-accent: ${variant.accent}; }
.nv-cb[data-variant="${name}"] .nv-cb__icon::before { content: "${variant.icon}"; }`)
  .join('')

const css = `
.nv-cb {
  --cb-accent: ${VARIANTS.info.accent};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 8px 0;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--cb-accent) 32%, transparent);
  border-left: 3px solid var(--cb-accent);
  background: color-mix(in srgb, var(--cb-accent) 9%, transparent);
}
.nv-cb__icon {
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  font-size: 18px;
  line-height: 1;
  user-select: none;
}
.nv-cb__content { flex: 1 1 auto; min-width: 0; }
.nv-cb__content > :first-child { margin-top: 0; }
.nv-cb__content > :last-child { margin-bottom: 0; }
${variantCss}
`

function variantOf(input) {
  const node = input && input.node
  return normalizeVariant(node && node.attrs && node.attrs.variant)
}

function serializeMarkdown(input) {
  const quoted = String(input.children ?? '')
    .split('\n')
    .map((line) => (line.length ? `> ${line}` : '>'))
    .join('\n')
  return `> [!${variantOf(input)}]\n${quoted}`
}

function serializeHtml(input) {
  return `<aside class="nv-callout-block" data-variant="${escapeHtml(variantOf(input))}">\n${String(input.children ?? '')}\n</aside>`
}

function serializeTypst(input) {
  return `#block(inset: 10pt, radius: 6pt, stroke: 0.5pt + luma(200))[\n${String(input.children ?? '')}\n]`
}

function serializeDocx(input) {
  const variant = VARIANTS[variantOf(input)]
  return {
    blocks: [
      { type: 'paragraph', children: [{ type: 'text', text: `${variant.icon} ${variant.label}`, bold: true }] },
      { type: 'children' },
    ],
  }
}

export default Object.freeze({
  setup(api) {
    api.blockType({
      id: `${api.pluginId}.block`,
      name: NODE_NAME,
      schema: {
        group: 'block',
        content: 'block+',
        defining: true,
        attrs: { variant: { default: DEFAULT_VARIANT } },
      },
      ui: element('aside', { role: 'note' }, [
        element('div', { class: 'nv-cb', 'data-variant': 'attrs.variant' }, [
          element('span', { class: 'nv-cb__icon', 'aria-hidden': 'true' }),
          element('div', { class: 'nv-cb__content' }, [{ type: 'contentSlot' }]),
        ]),
      ]),
      css,
    })

    api.register('popover', {
      id: `${api.pluginId}.variant`,
      nodeType: NODE_NAME,
      title: 'Callout',
      removable: true,
      fields: [
        {
          key: 'variant',
          type: 'select',
          label: 'Type',
          options: Object.entries(VARIANTS).map(([value, variant]) => ({
            value,
            label: `${variant.icon} ${variant.label}`,
          })),
        },
      ],
    })

    api.slashItem({
      id: `${api.pluginId}.insert`,
      title: 'Callout',
      category: 'layout',
      keywords: ['callout', 'admonition', 'note', 'info', 'warning', 'danger', 'выноска', 'примечание', 'заметка'],
    }, (_input, { editor }) => {
      if (!editor) throw new Error('Callout requires an editor invocation')
      return {
        type: 'transaction',
        revision: editor.revision,
        operations: [{
          type: 'insertNode',
          nodeType: NODE_NAME,
          attrs: { variant: DEFAULT_VARIANT },
          at: 'selection.from',
        }],
        scrollIntoView: true,
      }
    })

    const serializers = { markdown: serializeMarkdown, html: serializeHtml, typst: serializeTypst, docx: serializeDocx }
    for (const [format, serialize] of Object.entries(serializers)) {
      api.serializer({ id: `${api.pluginId}.serialize-${format}`, nodeType: NODE_NAME, format }, serialize)
    }
  },
})
