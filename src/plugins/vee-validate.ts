import { localize } from "@vee-validate/i18n";
import { email, min, required } from "@vee-validate/rules";
import { configure, defineRule } from "vee-validate";

export default () => {
  defineRule("required", required);
  defineRule("email", email);
  defineRule("min", min);

  configure({
    generateMessage: localize("en", {
      messages: {
        required: "{field} is required",
        email: "{field} must be a valid email",
        min: "{field} must be 0:{min} chars long",
      },
    }),
  });
};
