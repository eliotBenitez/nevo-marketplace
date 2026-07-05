# Callout

Callout adds a **container block** that highlights a passage of content — a tip, a warning, an important note. Unlike leaf blocks, a callout holds fully editable rich content: paragraphs, lists, code, even nested blocks.

## Usage

- Type `/callout` (or `/note`, `/warning`, …) and pick **Callout** from the slash menu. The cursor lands inside the callout so you can start typing immediately.
- Click the icon on the left to open the type picker and switch between variants.

## Variants

| Variant | Icon | Accent |
| --- | --- | --- |
| `info` | 💡 | blue |
| `success` | ✅ | green |
| `warning` | ⚠️ | amber |
| `danger` | 🛑 | red |
| `note` | 📝 | violet |

## Export

The callout serializes into every export format:

- **Markdown** — an Obsidian-style blockquote: `> [!info]` followed by the quoted body.
- **HTML** — `<aside class="nv-callout-block" data-variant="…">` wrapping the children.
- **Typst** — a `#block(...)` with the rendered children inside.

## Permissions

Requires only `editor.write`: it registers a block type (node + node view + popover + serializers) and a slash item. No filesystem or network access.

## How it works

The plugin is a dependency-free browser ES module. It relies on the container block API: `render()` returns `{ dom, contentDOM }`, so ProseMirror renders the editable child content directly into `contentDOM`, while the icon lives in the block "chrome" (`contentEditable=false`). Variant colors are injected once via a scoped `<style>` element using `color-mix` so they adapt to light and dark themes.
