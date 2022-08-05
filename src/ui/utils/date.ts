import { ordinal } from "./number";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

/**
 * Output long date
 ** example: 5th August, 03:35 pm
 * @param date epooch number, or Date object
 */
export const formatLongDate = (date: number | Date) => {
  if (typeof date === 'number') { date = new Date(date) }
  const day = date.getDate()
  const hour = date.getHours();
  const meridiem = hour < 12 ? 'am' : 'pm'
  return `${day}${ordinal(day)} ${months[date.getMonth()]}, 
  ${(hour % 12 || 12).toString().padStart(2, '0')}:${(date.getMinutes()).toString().padStart(2, '0')} ${meridiem}`
}
