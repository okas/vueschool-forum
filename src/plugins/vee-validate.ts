import { email, required } from "@vee-validate/rules";
import { defineRule } from "vee-validate";

export default () => {
  defineRule("required", required);
  defineRule("email", email);
};
