# Quick Date

Quick Date adds slash commands for inserting common date and time values into the active note.

## Commands

| Slash item | Output |
| --- | --- |
| `/quick-date-today` | Local date, `YYYY-MM-DD` |
| `/quick-date-tomorrow` | Tomorrow, `YYYY-MM-DD` |
| `/quick-date-yesterday` | Yesterday, `YYYY-MM-DD` |
| `/quick-date-long` | Locale-aware long date |
| `/quick-date-time` | Local time, `HH:mm` |
| `/quick-date-datetime` | Local date and time, `YYYY-MM-DD HH:mm` |
| `/quick-date-iso` | UTC ISO timestamp |
| `/quick-date-week` | ISO week label, `YYYY-Www` |

## Permissions

The plugin requires only `editor.write` because it registers slash items and inserts text at the current selection.

## Notes

The plugin is a plain browser ES module with no external dependencies. It uses `navigator.language` when available for the long-date formatter.
