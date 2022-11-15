import "./style.scss";

export type IconButtonProps = {
	size: "small" | "medium" | "large";
	icon: string;
	text: string;
	tint: string;
	onClick: () => void | Promise<void>;
};

const IconButton: React.FC<IconButtonProps> = ({ size, icon, text, tint, onClick }: IconButtonProps) => {
	const getClassNameForFont = (): string => {
		if (size === "small") {
			return "text-small";
		}

		if (size === "medium") {
			return "text-medium";
		}

		return "text-large";
	};

	const getImageDimension = (): number => {
		if (size === "small") {
			return 12;
		}

		if (size === "medium") {
			return 14;
		}

		return 16;
	};

	const imageDimension = getImageDimension();

	return (
		<div
			className="button flat link button-root"
			onClick={onClick}>
			<img
				src={icon}
				width={imageDimension}
				height={imageDimension}
			/>
			<span
				style={{
					color: tint,
				}}
				className={`${getClassNameForFont()}`}>
				{text}
			</span>
		</div>
	);
};

export default IconButton;
