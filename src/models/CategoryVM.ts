import { HasId } from "./HasId";

export class CategoryVM extends HasId {
  name!: string;
  forums!: Array<string>;
  slug!: string;
}
