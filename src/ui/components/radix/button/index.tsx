import { ButtonProps, Button as RadixButton, Spinner } from "@radix-ui/themes";

export default function Button({ isLoading, style, ...props }: ButtonProps & { isLoading?: boolean }) {
	return (
		<RadixButton
			{...props}
			style={{ cursor: "pointer", ...style }}>
			{isLoading ? <Spinner /> : null}
			{props.children}
		</RadixButton>
	);
}
