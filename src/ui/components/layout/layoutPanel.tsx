import { FC } from "react";

export type LayoutPanelProps = {
	children?: React.ReactNode;
	header?: React.ReactNode;
	className?: string;
};

export const LayoutPanel: FC<LayoutPanelProps> = ({ children, header, className }) => {
	return (
		<div className={`panel ${className ?? ""}`}>
			{header !== undefined && (
				<div className={`panel__header ${children !== undefined ? "with-border" : ""}`}>{header}</div>
			)}
			{children !== undefined && <div className="panel__body">{children}</div>}
		</div>
	);
};
