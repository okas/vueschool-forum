import { fabDb } from "@/firebase";
import { FabCollection } from "@/firebase/firebase-collections-enum";
import { ok } from "@/utils/assert-helpers";
import { nameUser } from "@/utils/model-member-name-helpers";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "@firebase/firestore";

export interface IUniqueArgs {
  coll: string;
  field: string;
  exclude?: string;
}

export async function unique(
  val: string,
  args: IUniqueArgs | Array<string>
): Promise<boolean> {
  const { coll, exclude, field } = extractUniqueArgs(args);

  ok(
    Object.keys(FabCollection).includes(coll),
    `Unique validation error: provided collection "${coll}" is unknown to application.`
  );

  if (val === exclude) {
    return true;
  }

  const _field =
    field === nameUser("username") ? nameUser("usernameLower") : field;

  const count = await getCount(coll, _field, val);

  return count === 0;
}

function extractUniqueArgs(args: string[] | IUniqueArgs): IUniqueArgs {
  let coll: string;
  let field: string;
  let exclude: string | undefined;

  if (Array.isArray(args)) {
    [coll, field, exclude] = args;
  } else {
    ({ coll, field, exclude } = args);
  }

  return { coll, exclude, field };
}

async function getCount(
  column: string,
  field: string,
  value: string
): Promise<number> {
  const qry = query(collection(fabDb, column), where(field, "==", value));
  const { count } = (await getCountFromServer(qry)).data();

  return count;
}

export function twitter(val: string): boolean {
  return /^[A-Za-z0-9_]{4,15}$/.test(val);
}
