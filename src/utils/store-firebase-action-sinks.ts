import {
  collection,
  doc,
  DocumentChange,
  DocumentData,
  documentId,
  DocumentReference,
  DocumentSnapshot,
  FirestoreDataConverter,
  onSnapshot,
  Query,
  query,
  QuerySnapshot,
  SnapshotListenOptions,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { fabDb } from "../firebase/index";
import { HasId } from "../types/HasId";
import { remove, toBuckets, upsert } from "./array-helpers";
import { isFulFilled } from "./promise-helpers";

const { warn, error } = console;

const snapshotListenOptions: SnapshotListenOptions = {
  includeMetadataChanges: true,
};

export function makeFirebaseFetchSingleDocFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string,
  unsubscribesSink: Array<Unsubscribe>,
  converter?: FirestoreDataConverter<TViewModel>
): (id: string) => Promise<TViewModel | undefined> {
  return async (id: string) => {
    const docRef = getSingleDocQuery<TViewModel>(id, collectionName, converter);

    return new Promise(
      (resolve: null | ((vm: TViewModel | undefined) => void)) => {
        const unsubscribe = onSnapshot(
          docRef,
          snapshotListenOptions,
          (docSnap: DocumentSnapshot<DocumentData>): void => {
            let vm: TViewModel | undefined;

            if (docSnap.exists()) {
              vm = handleSingleDocumentUpsert(docSnap, array);
            } else {
              _warn(collectionName, id);
              remove(array, ({ id: vmId }) => vmId === docSnap.id);
            }

            resolve?.(vm);
            resolve = null;
          },
          (err) => {
            error(err);
            resolve = null;
          }
        );

        unsubscribesSink.push(unsubscribe);
      }
    );
  };
}

export function makeFirebaseFetchMultiDocsFn<TViewModel extends HasId>(
  array: Array<TViewModel>,
  collectionName: string,
  unsubscribesSink: Array<Unsubscribe>,
  converter?: FirestoreDataConverter<TViewModel>
): (ids?: Array<string>) => Promise<Array<TViewModel>> {
  return async (ids: Array<string> = []) => {
    const queries = getMultiDocQueries<TViewModel>(
      collectionName,
      ids,
      converter
    );

    const settledPromises = await Promise.allSettled(
      queries.map((q) =>
        getMultiDocSnapHandlerAsync(q, array, unsubscribesSink)
      )
    );

    return extractFetchResult<TViewModel>(settledPromises);
  };
}

function getSingleDocQuery<TViewModel extends HasId>(
  id: string,
  collectionName: string,
  converter: FirestoreDataConverter<TViewModel> | undefined
): DocumentReference<DocumentData> {
  const docRef = doc(fabDb, collectionName, id);

  if (converter) {
    return docRef.withConverter(converter);
  }
  return docRef;
}

function getMultiDocSnapHandlerAsync<TViewModel extends HasId>(
  qryRef: Query<DocumentData>,
  array: Array<TViewModel>,
  unsubscribesSink: Array<Unsubscribe>
): Promise<Array<TViewModel>> {
  return new Promise((resolve: (vm: Array<TViewModel>) => void) => {
    let fetchResultSink: TViewModel[] | undefined = [];

    const unsubscribeFn = onSnapshot(
      qryRef,
      snapshotListenOptions,
      (qrySnap: QuerySnapshot<DocumentData>): void => {
        qrySnap
          .docChanges()
          .forEach((docChange: DocumentChange<DocumentData>) => {
            if (docChange.type === "removed") {
              remove(array, ({ id }) => id === docChange.doc.id);
            } else {
              const vm = handleSingleDocumentUpsert(docChange.doc, array);
              fetchResultSink?.push(vm);
            }
          });

        if (fetchResultSink && !qrySnap.metadata.fromCache) {
          // TODO: For future, if app is offline, then resolve immediately,
          // TODO: do not wait for event from server response.
          resolve(fetchResultSink);

          fetchResultSink = undefined;
        }
      }
    );

    unsubscribesSink.push(unsubscribeFn);
  });
}

function extractFetchResult<TViewModel extends HasId>(
  settledPromises: PromiseSettledResult<TViewModel[]>[]
) {
  const viewModels: TViewModel[] = [];

  settledPromises.forEach((settledResult) => {
    isFulFilled(settledResult) &&
      viewModels.push(...settledResult.value.map((vm) => vm));
  });
  return viewModels;
}

function handleSingleDocumentUpsert<TViewModel extends HasId>(
  docSnap: DocumentSnapshot<DocumentData>,
  array: Array<TViewModel>
): TViewModel {
  const viewModel = docSnap.data() as TViewModel;

  upsert(array, viewModel);

  return viewModel;
}

function getMultiDocQueries<TViewModel extends HasId>(
  collectionName: string,
  ids?: Array<string>,
  converter?: FirestoreDataConverter<TViewModel>
): Array<Query<DocumentData>> {
  const uniqueIds = ids?.length ? [...new Set(ids)] : ids ?? [];

  return uniqueIds.length
    ? createBucketedQueries(uniqueIds, collectionName, converter)
    : [getAllQuery(collectionName, converter)];
}

function getAllQuery<TViewModel extends HasId>(
  collectionName: string,
  converter?: FirestoreDataConverter<TViewModel>
): Query<DocumentData> {
  const q = query(collection(fabDb, collectionName));

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
      collection(fabDb, collectionName),
      where(documentId(), "in", bucket)
    );

    queries.push(converter ? q.withConverter(converter) : q);
  }

  return queries;
}

function _warn(collectionName: string, ...ids: string[]) {
  warn(
    `Fetch documents warning: no documents in collection "${collectionName}" with id(s) "${ids}"!`
  );
}
