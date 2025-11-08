import React from "react";

import { SuperTokens } from "../../supertokens";

export const withOverride = <TComponent extends React.FunctionComponent<any>>(
	overrideKey: string,
	DefaultComponent: TComponent
): React.FunctionComponent<React.ComponentProps<TComponent>> => {
	const finalKey = overrideKey + "_Override";
	DefaultComponent.displayName = finalKey;

	if (SuperTokens.overridableComponents[finalKey] === undefined) {
		SuperTokens.overridableComponents[finalKey] = DefaultComponent;
	}

	return function (props: React.ComponentProps<TComponent>) {
		const Component = SuperTokens.overridableComponents[finalKey];

		return (
			<Component
				DefaultComponent={DefaultComponent}
				{...props}
			/>
		);
	};
};
