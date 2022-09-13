import { Unsubscribe } from "@firebase/util";

export class StoreBase {
  _dbUnsubscribes: Unsubscribe[] = [];

  clearDbSubscriptions() {
    this._dbUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this._dbUnsubscribes.splice(0);
  }
}
