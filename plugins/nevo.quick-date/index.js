// SDK V2 sandboxed-worker plugin. Dependency-free: the SDK helpers it needs
// (definePlugin, transaction) only build plain JSON, so they are inlined.
// The Worker clock and timezone are not the user's: every value is derived from
// the editor snapshot (`now`, `locale`, `timeZone`) that the host sends per call.

function pad2(value) {
  return String(value).padStart(2, '0')
}

// Wall-clock parts of `now` in the user's timezone.
function localParts(editor) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: editor.timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(editor.now))
  const value = (type) => Number(parts.find((part) => part.type === type).value)
  return { year: value('year'), month: value('month'), day: value('day'), hour: value('hour'), minute: value('minute') }
}

// A calendar day as a UTC-midnight Date, so day arithmetic ignores DST.
function localDay(editor, offsetDays = 0) {
  const { year, month, day } = localParts(editor)
  return new Date(Date.UTC(year, month - 1, day + offsetDays))
}

function formatDay(day) {
  return `${day.getUTCFullYear()}-${pad2(day.getUTCMonth() + 1)}-${pad2(day.getUTCDate())}`
}

function formatTime(editor) {
  const { hour, minute } = localParts(editor)
  return `${pad2(hour)}:${pad2(minute)}`
}

function formatLongDate(editor) {
  return new Intl.DateTimeFormat(editor.locale || 'en-US', { dateStyle: 'long', timeZone: 'UTC' })
    .format(localDay(editor))
}

function formatIsoWeek(editor) {
  const thursday = localDay(editor)
  thursday.setUTCDate(thursday.getUTCDate() + 3 - ((thursday.getUTCDay() + 6) % 7))
  const weekYear = thursday.getUTCFullYear()
  const week = 1 + Math.floor((thursday.getTime() - Date.UTC(weekYear, 0, 1)) / (7 * 86400000))
  return `${weekYear}-W${pad2(week)}`
}

const ITEMS = [
  ['today', 'Today', ['date', 'today', 'yyyy-mm-dd', 'сегодня', 'дата'], (editor) => formatDay(localDay(editor))],
  ['tomorrow', 'Tomorrow', ['date', 'tomorrow', 'завтра'], (editor) => formatDay(localDay(editor, 1))],
  ['yesterday', 'Yesterday', ['date', 'yesterday', 'вчера'], (editor) => formatDay(localDay(editor, -1))],
  ['long', 'Long Date', ['date', 'long', 'human', 'полная'], formatLongDate],
  ['time', 'Current Time', ['time', 'hh:mm', 'время'], formatTime],
  ['datetime', 'Date and Time', ['datetime', 'timestamp', 'дата время'], (editor) => `${formatDay(localDay(editor))} ${formatTime(editor)}`],
  ['iso', 'ISO Timestamp', ['iso', 'timestamp', 'utc'], (editor) => new Date(editor.now).toISOString()],
  ['week', 'ISO Week', ['week', 'calendar', 'неделя'], formatIsoWeek],
]

export default Object.freeze({
  setup(api) {
    for (const [id, title, keywords, format] of ITEMS) {
      api.slashItem({
        id: `${api.pluginId}.${id}`,
        title,
        category: 'text',
        keywords,
      }, (_input, { editor }) => {
        if (!editor) throw new Error('Quick Date requires an editor invocation')
        return {
          type: 'transaction',
          revision: editor.revision,
          operations: [{ type: 'insertText', text: format(editor), from: 'selection.from', to: 'selection.to' }],
          scrollIntoView: true,
        }
      })
    }
  },
})
