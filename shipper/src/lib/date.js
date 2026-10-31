export function formatDateValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : '';
}

export function addDays(dateValue, days) {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date;
}
