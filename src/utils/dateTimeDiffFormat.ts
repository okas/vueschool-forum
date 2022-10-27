import dayjs from "dayjs";
import localizedFormatPlugin from "dayjs/plugin/localizedFormat";
import relativeTimePlugin from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormatPlugin);

export function timeDiff(dateOrTimestamp: number | Date): string {
  return dayjs.unix(extractTimeStamp(dateOrTimestamp)).fromNow();
}

export function formatTime(dateOrTimestamp: number | Date): string {
  return dayjs.unix(extractTimeStamp(dateOrTimestamp)).format("llll");
}

export function formatTimeMonthYear(dateOrTimestamp: number | Date): string {
  return dayjs.unix(extractTimeStamp(dateOrTimestamp)).format("MMMM YYYY");
}

export function extractFromUnixTS(dateOrTimestamp: number | Date): Date {
  return typeof dateOrTimestamp === "number"
    ? dayjs.unix(dateOrTimestamp).toDate()
    : dateOrTimestamp;
}

function extractTimeStamp(time: number | Date): number {
  return typeof time === "number" ? time : time.getTime();
}
