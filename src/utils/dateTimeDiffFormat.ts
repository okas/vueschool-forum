import dayjs from "dayjs";
import localizedFormatPlugin from "dayjs/plugin/localizedFormat";
import relativeTimePlugin from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormatPlugin);

export function diffFromUnix(unixTimestamp: number | Date) {
  return dayjs.unix(unixTimestamp).fromNow();
}

export function formatFromUnix(unixTimestamp: number) {
  return dayjs.unix(unixTimestamp).format("llll");
}

export function formatMonthYearFromUnix(unixTimestamp: number | Date) {
  return dayjs.unix(unixTimestamp).format("MMMM YYYY");
}
