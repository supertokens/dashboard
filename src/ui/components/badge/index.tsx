import "./badge.scss";

export type BadgeProps = {
	children?: React.ReactNode;
	className?: string;
	text: string;
	type?: "secondary" | "success";
	size?: "xs" | "sm" | "md" | "lg";
};

export default function Badge(props: BadgeProps) {
	const { children, type = "secondary", className = "", size = "md", text } = props;
	return (
		<span className={`badge ${type} ${size} ${className}`}>
			<span className="content">{text}</span>
			{children}
		</span>
	);
}
