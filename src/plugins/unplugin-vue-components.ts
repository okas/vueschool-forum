import type {
  ComponentResolver,
  ComponentResolveResult,
} from "unplugin-vue-components";

export function VeeValidateResolver(): ComponentResolver {
  return {
    type: "component",
    resolve: (requestedName): ComponentResolveResult => {
      const originalName = requestedName.slice(3);
      if (
        requestedName.startsWith("Vee") &&
        ["Form", "Field", "ErrorMessage", "FieldArray"].includes(originalName)
      ) {
        return {
          name: originalName,
          from: "vee-validate",
        };
      }
    },
  };
}
