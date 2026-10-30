# Quick Date

Quick Date adds slash commands for inserting common date and time values into the active note.

## Commands

| Slash item | Output |
| --- | --- |
| Today | Local date, `YYYY-MM-DD` |
| Tomorrow | Tomorrow, `YYYY-MM-DD` |
| Yesterday | Yesterday, `YYYY-MM-DD` |
| Long Date | Locale-aware long date |
| Current Time | Local time, `HH:mm` |
| Date and Time | Local date and time, `YYYY-MM-DD HH:mm` |
| ISO Timestamp | UTC ISO timestamp |
| ISO Week | ISO week label, `YYYY-Www` |

## Permissions

The plugin requires only `editor.write` because it registers slash items and inserts text at the current selection.

## Notes

The plugin is an SDK V2 (`sandboxed-worker`) ES module with no external dependencies. It runs in an isolated Worker, so it takes the current time, locale, and timezone from the editor snapshot the host sends with each invocation rather than from the Worker's own clock.
