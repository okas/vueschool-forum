import {
  collection,
  doc,
  DocumentData,
  documentId,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  Query,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import { HasId } from "../types/HasId";
import { toBuckets, upsert } from "../utils/array-helpers";
import { _isFulFilled } from "../utils/promise-helpers";
import { firestoreDb } from "./../firebase/index";

const { warn } = console;

export function makeFirebaseFetchSingleDocFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string,
  converter?: FirestoreDataConverter<TViewModel>
): (id: string) => Promise<TViewModel | undefined> {
  return async (id: string) => {
    const docRef = doc(firestoreDb, collectionName, id);

    const docSnap = await getDoc(
      converter ? docRef.withConverter(converter) : docRef
    );

    if (!docSnap.exists()) {
      _warn(collectionName, id);
      return;
    }

    const viewModel = vmMapper<TViewModel>(docSnap);

    upsert(array, viewModel);

    return viewModel;
  };
}

export function makeFirebaseFetchMultiDocsFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string,
  converter?: FirestoreDataConverter<TViewModel>
): (ids?: Array<string>) => Promise<Array<TViewModel>> {
  return async (ids?: Array<string>) => {
    const queries = ids
      ? createBucketedQueries(ids, collectionName, converter)
      : [getAllQuery(collectionName, converter)];

    const settledPromises = await Promise.allSettled(queries.map(getDocs));

    const querySnaps: QuerySnapshot<DocumentData>[] = [];

    settledPromises.forEach((x) => _isFulFilled(x) && querySnaps.push(x.value));

    const viewModels = querySnaps.flatMap((qs) =>
      qs.docs.map((doc) => vmMapper<TViewModel>(doc))
    );

    if (!viewModels.length) {
      _warn(collectionName, ...(ids ?? []));
    } else {
      upsert(array, ...viewModels);
    }

    return viewModels;
  };
}

function getAllQuery<TViewModel extends HasId>(
  collectionName: string,
  converter?: FirestoreDataConverter<TViewModel>
): Query<DocumentData> {
  const q = query(collection(firestoreDb, collectionName));

  return converter ? q.withConverter(converter) : q;
}

function createBucketedQueries<TViewModel extends HasId>(
  ids: string[],
  collectionName: string,
  converter?: FirestoreDataConverter<TViewModel>
): Array<Query<DocumentData>> {
  const queries: Query<DocumentData>[] = [];

  for (const bucket of toBuckets(ids, 10)) {
    const q = query(
      collection(firestoreDb, collectionName),
      where(documentId(), "in", bucket)
    );

    queries.push(converter ? q.withConverter(converter) : q);
  }

  return queries;
}

function vmMapper<TViewModel extends HasId>(
  snap: QueryDocumentSnapshot<DocumentData>
): TViewModel {
  return { ...snap.data(), id: snap.id } as TViewModel;
}

function _warn(collectionName: string, ...ids: string[]) {
  warn(
    `Fetch documents warning: no documents in collection "${collectionName}" with id(s) "${ids}"!`
  );
}
