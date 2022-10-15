export interface StoreBaseState<TViewModel> {
  items: Array<TViewModel>;
}

export interface StoreBaseActions {
  clearDbSubscriptions(): void;
}
