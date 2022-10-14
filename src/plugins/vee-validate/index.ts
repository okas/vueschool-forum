import { localize } from "@vee-validate/i18n";
import { email, min, required, url } from "@vee-validate/rules";
import { configure, defineRule } from "vee-validate";
import { twitter, unique } from "./custom-rules";

export default () => {
  defineRule("required", required);

  defineRule("email", email);

  defineRule("min", min);

  defineRule("url", url);

  defineRule("unique", unique);

  defineRule("twitter", twitter);

  configure({
    generateMessage: localize("en", {
      messages: {
        required: "{field} is required",
        email: "{field} must be a valid email",
        min: "{field} must be at least 0:{min} chars long",
        unique: "{field} must be unique",
        twitter: "{field} must be a valid twitter username",
      },
    }),
  });
};
