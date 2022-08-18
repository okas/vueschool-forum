import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  Query,
  query,
  QueryDocumentSnapshot,
  QuerySnapshot,
  where,
} from "firebase/firestore";
import firebaseConfig from "../config/firebase.js";
import { HasId } from "../types/HasId";
import { toBuckets } from "../utils/array-helpers";
import { _isFulFilled } from "../utils/promise-helpers";

const { warn } = console;

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(firebaseApp);

export function makeFirebaseFetchSingleDocFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string
): (id: string) => Promise<TViewModel | undefined> {
  return async (id: string) => {
    const docSnap = await getDoc(doc(firestoreDb, collectionName, id));

    if (!docSnap.exists()) {
      _warn(collectionName, id);
      return;
    }

    const viewModel = vmMapper<TViewModel>(docSnap);

    array.push(viewModel);

    return viewModel;
  };
}

export function makeFirebaseFetchMultiDocsFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string
): (ids?: Array<string>) => Promise<Array<TViewModel>> {
  return async (ids?: Array<string>) => {
    const queries = getQueries(collectionName, ids);

    const settledPromises = await Promise.allSettled(queries.map(getDocs));

    const querySnaps: QuerySnapshot<DocumentData>[] = [];

    settledPromises.forEach((x) => _isFulFilled(x) && querySnaps.push(x.value));

    const viewModels = querySnaps.flatMap((qs) =>
      qs.docs.map((doc) => vmMapper<TViewModel>(doc))
    );

    if (!viewModels.length) {
      _warn(collectionName, ...(ids ?? []));
    } else {
      array.push(...viewModels);
    }

    return viewModels;
  };
}

function getQueries(
  collectionName: string,
  ids?: string[]
): Array<Query<DocumentData>> {
  if (!ids?.length) {
    return [query(collection(firestoreDb, collectionName))];
  }

  return createBucketedQueries(ids, collectionName);
}

function createBucketedQueries(
  ids: string[],
  collectionName: string
): Array<Query<DocumentData>> {
  const queries: Query<DocumentData>[] = [];

  for (const bucket of toBuckets(ids, 10)) {
    queries.push(
      query(
        collection(firestoreDb, collectionName),
        where(documentId(), "in", bucket)
      )
    );
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
