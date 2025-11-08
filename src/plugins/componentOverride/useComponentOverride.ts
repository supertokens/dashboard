import type React from "react";

import type { ComponentOverride } from "./types";
import { SuperTokens } from "../../supertokens";

export const useComponentOverride = <TComponent extends React.FunctionComponent<any>>(
	overrideKey: string
): ComponentOverride<TComponent> | null => {
	const OverrideComponent = SuperTokens.overridableComponents[overrideKey];

	return OverrideComponent ?? null;
};
