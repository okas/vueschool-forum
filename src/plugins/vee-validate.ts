import {
  collection,
  getCountFromServer,
  query,
  where,
} from "@firebase/firestore";
import { localize } from "@vee-validate/i18n";
import { email, min, required } from "@vee-validate/rules";
import { configure, defineRule } from "vee-validate";
import { fabDb } from "../firebase";
import { FabCollection } from "../firebase/firebase-collections-enum";
import { nameUser } from "../types/userVm-types";
import { ok } from "../utils/assert-helpers";

export default () => {
  defineRule("required", required);

  defineRule("email", email);

  defineRule("min", min);

  defineRule("unique", unique);

  configure({
    generateMessage: localize("en", {
      messages: {
        required: "{field} is required",
        email: "{field} must be a valid email",
        min: "{field} must be at least 0:{min} chars long",
        unique: "{field} must be unique",
      },
    }),
  });
};

async function unique(
  val: string,
  args: Array<string> | { col: string; field: string }
) {
  let col: string;
  let field: string;

  if (Array.isArray(args)) {
    [col, field] = args;
  } else {
    ({ col, field } = args);
  }

  ok(
    Object.keys(FabCollection).includes(col),
    `Unique validation error: provided collection "${col}" is unknown to application.`
  );

  const _field =
    field === nameUser("username") ? nameUser("usernameLower") : field;

  const collRef = collection(fabDb, col);
  const constraint = where(_field, "==", val);
  const qry = query(collRef, constraint);
  const { count } = (await getCountFromServer(qry)).data();

  return count === 0;
}
