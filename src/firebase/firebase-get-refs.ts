import {
  doc,
  type DocumentData,
  type DocumentReference,
} from "@firebase/firestore";
import { fabDb } from ".";
import {
  FabCollection,
  FabCollectionGenericTypes,
} from "./firebase-collections-enum";

export function getStatsRef(): DocumentReference<DocumentData> {
  return doc(fabDb, FabCollection.common, FabCollectionGenericTypes.stats);
}
