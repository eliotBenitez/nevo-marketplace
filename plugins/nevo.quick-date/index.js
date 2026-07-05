function activeLocale() {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }
  return 'en-US';
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatLocalDateTime(date) {
  return `${formatLocalDate(date)} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatLocalTime(date) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatLongDate(date) {
  return new Intl.DateTimeFormat(activeLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function isoWeek(date) {
  const current = startOfDay(date);
  current.setDate(current.getDate() + 3 - ((current.getDay() + 6) % 7));
  const week1 = new Date(current.getFullYear(), 0, 4);
  return 1 + Math.round(((current.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function isoWeekYear(date) {
  const current = startOfDay(date);
  current.setDate(current.getDate() + 3 - ((current.getDay() + 6) % 7));
  return current.getFullYear();
}

function insertText(state, dispatch, text) {
  const { from, to } = state.selection;
  dispatch(state.tr.insertText(text, from, to).scrollIntoView());
}

function makeItem(id, title, keywords, getText) {
  return {
    id,
    title,
    category: 'text',
    keywords,
    run({ state, dispatch }) {
      insertText(state, dispatch, getText(new Date()));
    },
  };
}

export default {
  onRegister(ctx) {
    const items = [
      makeItem(
        'quick-date-today',
        'Today',
        ['date', 'today', 'yyyy-mm-dd', 'сегодня', 'дата'],
        (now) => formatLocalDate(now),
      ),
      makeItem(
        'quick-date-tomorrow',
        'Tomorrow',
        ['date', 'tomorrow', 'завтра'],
        (now) => formatLocalDate(addDays(now, 1)),
      ),
      makeItem(
        'quick-date-yesterday',
        'Yesterday',
        ['date', 'yesterday', 'вчера'],
        (now) => formatLocalDate(addDays(now, -1)),
      ),
      makeItem(
        'quick-date-long',
        'Long Date',
        ['date', 'long', 'human', 'полная'],
        (now) => formatLongDate(now),
      ),
      makeItem(
        'quick-date-time',
        'Current Time',
        ['time', 'hh:mm', 'время'],
        (now) => formatLocalTime(now),
      ),
      makeItem(
        'quick-date-datetime',
        'Date and Time',
        ['datetime', 'timestamp', 'дата время'],
        (now) => formatLocalDateTime(now),
      ),
      makeItem(
        'quick-date-iso',
        'ISO Timestamp',
        ['iso', 'timestamp', 'utc'],
        (now) => now.toISOString(),
      ),
      makeItem(
        'quick-date-week',
        'ISO Week',
        ['week', 'calendar', 'неделя'],
        (now) => `${isoWeekYear(now)}-W${pad2(isoWeek(now))}`,
      ),
    ];

    for (const item of items) {
      ctx.registerSlashItem(item);
    }
  },
};
