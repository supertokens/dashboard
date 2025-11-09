import type React from "react";

export type GenericComponentOverrideMap<T> = {
	[K in keyof T]?: ComponentOverride<any>;
};

export type ContextType<T> = GenericComponentOverrideMap<T> | "IS_DEFAULT";

export type ComponentOverrideProps<TComponent extends React.ComponentType<any>> = React.ComponentProps<TComponent> & {
	DefaultComponent: TComponent;
};

// only function components are supported for now so the builder can be used to override the component
export type ComponentOverride<TComponent extends React.ComponentType<any>> = React.ComponentType<
	ComponentOverrideProps<TComponent>
>;
