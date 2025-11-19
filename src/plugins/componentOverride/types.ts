import type React from "react";

type DefaultOverrideKey = `${string}_Override`;
type PropsOverrideKey = `${string}_Override_Props`;
type RendererOverrideKey = `${string}_Override_Renderer`;
type AllOverrideKeys = DefaultOverrideKey | PropsOverrideKey | RendererOverrideKey;

export type GenericComponentOverrideMapDefault<T extends Record<DefaultOverrideKey, any>> = {
	[K in keyof T]?: ComponentOverride<any>;
};

export type GenericComponentOverrideMapProps<T extends Record<PropsOverrideKey, any>> = {
	[K in keyof T]?: PropsOverride<any>;
};

export type GenericComponentOverrideMapRenderer<T extends Record<RendererOverrideKey, any>> = {
	[K in keyof T]?: ComponentOverride<any>;
};

export type GenericComponentOverrideMap<T extends AllOverrideKeys = AllOverrideKeys> =
	GenericComponentOverrideMapDefault<Record<Exclude<T, PropsOverrideKey | RendererOverrideKey>, any>> &
		GenericComponentOverrideMapProps<Record<Exclude<T, DefaultOverrideKey | RendererOverrideKey>, any>> &
		GenericComponentOverrideMapRenderer<Record<Exclude<T, DefaultOverrideKey | PropsOverrideKey>, any>>;

export type ContextType<T extends AllOverrideKeys> = GenericComponentOverrideMap<T> | "IS_DEFAULT";

export type ComponentOverrideProps<TComponent extends React.ComponentType<any>> = React.ComponentProps<TComponent> & {
	DefaultComponent: TComponent;
};

// only function components are supported for now so the builder can be used to override the component
export type ComponentOverride<TComponent extends React.ComponentType<any>> = React.ComponentType<
	ComponentOverrideProps<TComponent>
>;

export type PropsOverride<TComponent extends React.ComponentType<any>> = (
	props: React.ComponentProps<TComponent> & {
		defaultGetRendererProps: (props: React.ComponentProps<TComponent>) => React.ComponentProps<TComponent>;
	}
) => React.ComponentProps<TComponent>;
