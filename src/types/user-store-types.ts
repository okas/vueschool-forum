import { ComputedRef, Ref } from "vue";
import { UserVM } from "./../models/UserVM";
import { StoreBaseActions } from "./store-base-types";
import {
  UserVmEditForInput,
  UserVMNewFormInput,
  UserVMRegWithEmailAndPassword,
  UserVMWithActivity,
} from "./userVm-types";

export interface UserStoreState {
  authUserId: Ref<string | null>;
  users: Array<UserVM>;
}

export interface UserStoreGetters {
  getAuthUser: ComputedRef<UserVMWithActivity | undefined>;
  getUserByIdFn: ComputedRef<(id: string) => UserVMWithActivity | undefined>;
}

export interface UserStoreActions extends StoreBaseActions {
  /**
   * Forces and awaits for Firestore Auth to find out authenticated user state.
   * @returns A promise that resolves to boolean: is authenticated or not.
   */
  forceInitFireBaseAuthState(): Promise<boolean>;
  /**
   * Sings in user using Firebase Auth `password` method.
   * @returns Id of signed in user.
   */
  signInWithEmailAndPassword(email: string, password: string): Promise<void>;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  /**
   * Registers user using Firebase Auth `password` method.
   * @param dto
   * @returns Id of registered user.
   */
  registerUserWithEmailAndPassword(
    dto: UserVMRegWithEmailAndPassword
  ): Promise<string>;
  /**
   * Creates user to app's database.
   * @param id Generated by Firebase Auth.
   * @param dto
   * @param fetchAfter Conditionally fetch new user after creation, default: `false`.
   * @returns Id of registered and created user.
   */
  createUser(
    id: string,
    dto: UserVMNewFormInput,
    fetchAfter?: boolean
  ): Promise<string>;
  editUser(dto: UserVmEditForInput, fetchAfter?: boolean): Promise<void>;
  fetchUser(id: string): Promise<UserVM | undefined>;
  fetchUsers(ids?: Array<string>): Promise<Array<UserVM>>;
  /**
   * It is important to call `clearDbSubscriptionAuthUser` action exclusively,
   * when this actions has been called. It uses distinct unsubscription logic.
   */
  fetchAuthUser(): Promise<UserVM | undefined>;
  clearDbSubscriptionAuthUser(): void;
}