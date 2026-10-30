# Callout

Callout adds a **container block** that highlights a passage of content — a tip, a warning, an important note. Unlike leaf blocks, a callout holds fully editable rich content: paragraphs, lists, code, even nested blocks.

## Usage

- Type `/callout` (or `/note`, `/warning`, …) and pick **Callout** from the slash menu. The cursor lands inside the callout so you can start typing immediately.
- Open the callout's popover and pick a **Type** to switch between variants.

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
- **DOCX** — a bold `icon + label` heading paragraph followed by the children.

## Permissions

- `editor.schema` — registers the `callout_block` node.
- `editor.write` — the slash item inserts a callout.
- `editor.read` — serializers receive the node for export.
- `ui.contributions` — the host-rendered type popover.

No filesystem, storage, or network access.

## How it works

The plugin is an SDK V2 (`sandboxed-worker`) dependency-free ES module running in an isolated Worker. The block is described with the declarative host UI DSL: an `<aside>` with the variant bound to `data-variant` and a `contentSlot` where ProseMirror renders the editable children. Variant icons and colors come from scoped CSS (`::before` content and `color-mix`), so they adapt to light and dark themes without any DOM code.

## Upgrading from 1.x

2.0.0 keeps the persisted contract — node name `callout_block`, attr `variant`, content `block+` — so existing callouts open unchanged and no data migration is needed (`dataVersion` stays `1`).
