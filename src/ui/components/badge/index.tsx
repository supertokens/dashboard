import "./badge.scss";

type BadgeProps = {
	children: React.ReactNode;
	className?: string;

	type?: "secondary" | "success";
	size?: "xs" | "sm" | "md" | "lg";
};

export default function Badge(props: BadgeProps) {
	const { children, type = "secondary", className = "", size = "md" } = props;
	return <span className={`badge ${type} ${size}`}>{children}</span>;
}
