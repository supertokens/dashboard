import { useContext } from "react";
import type React from "react";

import { ComponentOverrideContext } from "./componentOverrideContext";

import type { ComponentOverride, PropsOverride } from "./types";

export const useComponentOverride = <TComponent extends React.ComponentType<any>>(
	overrideKey: `${string}_Override`
): ComponentOverride<TComponent> | null => {
	const ctx = useContext(ComponentOverrideContext);

	if (ctx === "IS_DEFAULT") {
		throw new Error("Cannot use component override outside ComponentOverrideContext provider.");
	}

	return ctx[overrideKey] ?? null;
};

export const usePropsOverride = <TComponent extends React.ComponentType<any>>(
	overrideKey: `${string}_Override_Props`
): PropsOverride<TComponent> => {
	const ctx = useContext(ComponentOverrideContext);

	if (ctx === "IS_DEFAULT") {
		throw new Error("Cannot use component override outside ComponentOverrideContext provider.");
	}

	return ctx[overrideKey] as PropsOverride<TComponent>;
};

export const useRendererOverride = <TComponent extends React.ComponentType<any>>(
	overrideKey: `${string}_Override_Renderer`
): ComponentOverride<TComponent> | null => {
	const ctx = useContext(ComponentOverrideContext);

	if (ctx === "IS_DEFAULT") {
		throw new Error("Cannot use component override outside ComponentOverrideContext provider.");
	}

	return ctx[overrideKey] ?? null;
};
