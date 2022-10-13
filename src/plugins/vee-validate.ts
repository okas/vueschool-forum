import { defineRule } from "vee-validate";

export default () => {
  defineRule("required", <TValue>(val: TValue) =>
    val?.toString().trim() ? true : `This is required`
  );
};
