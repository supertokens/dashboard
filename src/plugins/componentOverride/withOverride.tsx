import React from "react";

import { useComponentOverride, usePropsOverride, useRendererOverride } from "./useComponentOverride";

export const withSplitOverride = <
	TComponentProps extends React.ComponentProps<any>,
	TComponentRenderer extends React.ComponentType<any>,
	TProps extends React.ComponentProps<TComponentRenderer>
>(
	overrideKey: string,
	defaultGetRendererProps: (props: TComponentProps) => TProps,
	DefaultRenderer: TComponentRenderer
): React.ComponentType<TComponentProps> => {
	const rendererKey = `${overrideKey}_Override_Renderer` as const;
	const propsKey = `${overrideKey}_Override_Props` as const;

	DefaultRenderer.displayName = rendererKey;

	const DefaultComponent = function (defaultProps: TComponentProps) {
		const overrideRendererProps = usePropsOverride(propsKey);

		let rendererProps: TProps;
		if (overrideRendererProps) {
			rendererProps = overrideRendererProps({ defaultGetRendererProps, ...(defaultProps || {}) }) as TProps;
		} else {
			rendererProps = defaultGetRendererProps(defaultProps) as TProps;
		}

		const OverrideRenderer = useRendererOverride(rendererKey);
		if (OverrideRenderer !== null) {
			return (
				<OverrideRenderer
					DefaultComponent={DefaultRenderer}
					{...rendererProps}
				/>
			);
		}

		return <DefaultRenderer {...rendererProps} />;
	};
	DefaultComponent.displayName = overrideKey;

	return withOverride(overrideKey, DefaultComponent);
};

export const withOverride = <TComponent extends React.ComponentType<any>>(
	overrideKey: string,
	DefaultComponent: TComponent
): React.ComponentType<React.ComponentProps<TComponent>> => {
	const finalKey = `${overrideKey}_Override` as const;

	DefaultComponent.displayName = finalKey;

	return (props: React.ComponentProps<TComponent>) => {
		const OverrideComponent = useComponentOverride(finalKey);
		if (OverrideComponent !== null) {
			return (
				<OverrideComponent
					DefaultComponent={DefaultComponent}
					{...props}
				/>
			);
		}

		return <DefaultComponent {...props} />;
	};
};
