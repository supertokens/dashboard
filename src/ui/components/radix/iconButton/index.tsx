import { IconButton as RadixIconButton, IconButtonProps } from "@radix-ui/themes";
import React from "react";

export default function IconButton({ children, ...props }: IconButtonProps & { children: React.ReactNode }) {
	const { style, ...rest } = props;
	return (
		<RadixIconButton
			{...rest}
			style={{
				cursor: "pointer",
				...style,
			}}>
			{children}
		</RadixIconButton>
	);
}
