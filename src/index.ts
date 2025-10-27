import { SuperTokens } from "supertokens";

import Dashboard from "./App";

export const init = () => {
	SuperTokens.init({
		apiPath: "/api",
		plugins: [],
	});
};

export { Dashboard };
