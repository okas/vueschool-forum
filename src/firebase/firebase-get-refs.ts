import {
  collection,
  CollectionReference,
  doc,
  type DocumentData,
  type DocumentReference,
} from "@firebase/firestore";
import { fabDb } from ".";
import {
  FabCollection,
  FabCollectionGenericTypes,
} from "./firebase-collections-enum";

export function getStatsDocRef(): DocumentReference<DocumentData> {
  return doc(fabDb, FabCollection.common, FabCollectionGenericTypes.stats);
}

export function getPostDocRef(id: string): DocumentReference<DocumentData> {
  return doc(fabDb, FabCollection.posts, id);
}

export function getUserDocRef(id: string): DocumentReference<DocumentData> {
  return doc(fabDb, FabCollection.users, id);
}

export function getForumDocRef(id: string): DocumentReference<DocumentData> {
  return doc(fabDb, FabCollection.forums, id);
}

export function getThreadDocRef(id: string): DocumentReference<DocumentData> {
  return doc(fabDb, FabCollection.threads, id);
}

export function getPostColRef(): CollectionReference<DocumentData> {
  return collection(fabDb, FabCollection.posts);
}

export function getThreadColRef(): CollectionReference<DocumentData> {
  return collection(fabDb, FabCollection.threads);
}
