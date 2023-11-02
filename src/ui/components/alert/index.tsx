import "./alert.scss";

type AlertProps = {
	type?: "primary";
	title: string;
	content: string;
};

export default function Alert({ content, title, type = "primary" }: AlertProps) {
	return (
		<div className={`alert ${type}`}>
			<span>{title}</span>
			<div>{content}</div>
		</div>
	);
}
