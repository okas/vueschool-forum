import { HasId } from "../types/HasId";

export class CategoryVM extends HasId {
  id!: string;
  name!: string;
  forums!: Array<string>;
  slug!: string;
}
