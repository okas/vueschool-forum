import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export function diffFromUnix(unixTimestamp: number) {
  return dayjs.unix(unixTimestamp).fromNow();
}

export function formatFromUnix(unixTimestamp: number) {
  return dayjs.unix(unixTimestamp).format("llll");
}
