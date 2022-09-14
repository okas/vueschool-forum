import { Unsubscribe } from "@firebase/util";

// TODO: migrate to composable pattern.

export class FirebaseSubscriptionManager {
  _dbUnsubscribes: Unsubscribe[] = [];

  clearDbSubscriptions() {
    this._dbUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this._dbUnsubscribes.splice(0);
  }
}
