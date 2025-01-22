import { Action } from "@raycast/api";
import { createDeeplink } from "@raycast/utils";

type DeepLinkProps = Readonly<{
  name: string;
  view: string;
}>;

export function DeepLink(props: DeepLinkProps) {
  const { name, view } = props;

  return (
    <Action.CreateQuicklink
      quicklink={{
        name,
        link: createDeeplink({
          extensionName: "billing",
          command: "index",
          arguments: {
            view,
          },
        }),
      }}
    />
  );
}
