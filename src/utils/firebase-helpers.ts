import { Timestamp } from "@firebase/firestore";

export function tryGetSeconds(fbTimeStampOrAsIs: Timestamp | number): number {
  return fbTimeStampOrAsIs instanceof Timestamp
    ? fbTimeStampOrAsIs.seconds
    : (fbTimeStampOrAsIs as number);
}
