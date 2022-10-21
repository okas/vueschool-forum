import { Timestamp } from "firebase/firestore";

export function tryGetSeconds<
  TInput extends Timestamp | undefined | null | number
>(fbTimeStampOrAsIs: TInput): number {
  return fbTimeStampOrAsIs instanceof Timestamp
    ? fbTimeStampOrAsIs.seconds
    : Number(fbTimeStampOrAsIs);
}
