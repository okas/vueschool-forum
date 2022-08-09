import { App } from "vue";

export type Options = {
  loader: () => ((fileName: string) => { default?: never; name?: string }) & {
    keys: () => string[];
    id: string;
  };
};

export default function (app: App<Element>, { loader }: Options) {
  const requireComponent = loader();

  requireComponent.keys().forEach((fileName) => {
    let baseComponentConfig = requireComponent(fileName);
    baseComponentConfig = baseComponentConfig.default || baseComponentConfig;

    const baseComponentName =
      baseComponentConfig.name ||
      fileName.replace(/^.+\//, "").replace(/\.\w+$/, "");

    app.component(baseComponentName, baseComponentConfig);
  });
}
