import { Timestamp } from "firebase/firestore";

export function tryGetSeconds<
  TInput extends Date | Timestamp | undefined | null | number
>(fbTimeStampOrAsIs: TInput): number {
  return fbTimeStampOrAsIs instanceof Timestamp
    ? fbTimeStampOrAsIs.seconds
    : fbTimeStampOrAsIs instanceof Date
    ? Math.floor(fbTimeStampOrAsIs.getTime() / 1000)
    : Number(fbTimeStampOrAsIs);
}
