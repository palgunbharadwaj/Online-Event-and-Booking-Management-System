export const formatTime = (timeString) => {
  if (!timeString) return '';
  const [h, m] = timeString.split(':');
  const hh = parseInt(h);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  return `${hh % 12 || 12}:${m} ${ampm}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const formatDateTimeRange = (event) => {
  if (!event) return '';
  
  const startD = formatDate(event.date);
  const startT = formatTime(event.time);
  const endD = formatDate(event.end_date);
  const endT = formatTime(event.end_time);

  // Case 1: Single day event
  if (!event.end_date || event.date === event.end_date) {
    if (startT && endT) {
      return `${startD}, ${startT} - ${endT}`;
    } else if (startT) {
      return `${startD}, ${startT}`;
    }
    return startD;
  }

  // Case 2: Multi-day event
  let result = `${startD}`;
  if (startT) result += `, ${startT}`;
  result += ` to ${endD}`;
  if (endT) result += `, ${endT}`;
  
  return result;
};
