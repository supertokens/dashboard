import { createContext, useContext } from "react";

import React from "react";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import "./dialog.scss";

type DialogContextType = {
	closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

function useDialog() {
	const context = useContext(DialogContext);

	if (context === undefined) {
		throw Error("useMenubarContext is used outside the MenubarContext provider.");
	}

	return context;
}

type DialogCommonProps = {
	children: React.ReactNode;
	className?: string;
};

type DialogProps = DialogCommonProps & {
	closeOnOverlayClick?: boolean;
} & DialogContextType;

function Dialog(props: DialogProps) {
	const { children, className = "", closeOnOverlayClick = false, closeDialog } = props;

	return (
		<DialogContext.Provider value={{ closeDialog }}>
			<div
				className="dialog-overlay"
				onClick={() => {
					if (closeOnOverlayClick === true) {
						closeDialog();
					}
				}}
			/>
			<div className={`dialog-container ${className}`}>{children}</div>
		</DialogContext.Provider>
	);
}

function DialogContent(props: DialogCommonProps) {
	const { children, className = "" } = props;

	return <div className={`dialog-content ${className}`}>{children}</div>;
}

function DialogHeader(props: DialogCommonProps) {
	const { children, className = "" } = props;

	const { closeDialog } = useDialog();

	return (
		<div className={`dialog-header ${className}`}>
			{children} <CloseIcon onClick={closeDialog} />
		</div>
	);
}

type DialogFooterProps = DialogCommonProps & {
	flexDirection?: "row" | "column";
	justifyContent?: "flex-start" | "flex-end" | "center" | "space-between" | "space-around" | "space-evenly";
	border?: "border-top" | "border-none";
};

function DialogFooter(props: DialogFooterProps) {
	const {
		children,
		className = "",
		flexDirection = "row",
		justifyContent = "flex-end",
		border = "border-top",
	} = props;

	return <div className={`dialog-footer ${flexDirection} ${justifyContent} ${border} ${className}`}>{children}</div>;
}

export { Dialog, DialogContent, DialogFooter, DialogHeader };
