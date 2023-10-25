import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import "./dialog.scss";

type DialogCommonProps = {
	children: React.ReactNode;
	className?: string;
};

function Dialog(props: DialogCommonProps) {
	const { children, className = "" } = props;

	return (
		<div className="dialog-overlay">
			<div className={`dialog-container ${className}`}>{children}</div>
		</div>
	);
}

function DialogContent(props: DialogCommonProps) {
	const { children, className = "" } = props;

	return <div className={`dialog-content ${className}`}>{children}</div>;
}

function DialogHeader(props: DialogCommonProps) {
	const { children, className = "" } = props;

	return (
		<div className={`dialog-header ${className}`}>
			{children} <CloseIcon />
		</div>
	);
}

type DialogFooterProps = DialogCommonProps & {
	flexDirection?: "row" | "column";
	justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
};

function DialogFooter(props: DialogFooterProps) {
	const { children, className = "", flexDirection = "row", justifyContent = "flex-end" } = props;

	return <div className={`dialog-footer ${flexDirection} ${justifyContent} ${className}`}>{children}</div>;
}

export { Dialog, DialogContent, DialogFooter, DialogHeader };
