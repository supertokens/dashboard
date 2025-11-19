import "./shared/styles";

import { SuperTokens } from "./supertokens";

import Dashboard from "./App";
import { SuperTokensConfig, SuperTokensPlugin } from "./types";

// Import styles to ensure they're bundled

export const init = (props: SuperTokensConfig) => {
	SuperTokens.init(props);
};

export { Dashboard };
export type { SuperTokensPlugin };

export { createPluginInit } from "./plugins";
