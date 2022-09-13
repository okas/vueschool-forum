import { HasId } from "../types/HasId";

export class CategoryVM extends HasId {
  name!: string;
  forums!: Array<string>;
  slug!: string;
}
