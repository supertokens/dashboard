/* eslint-disable no-mixed-spaces-and-tabs */
import { createContext, PropsWithChildren, useReducer } from "react";
import { LayoutModalProps } from "../components/layout/layoutModal";
import { ToastNotificationProps } from "../components/toast/toastNotification";

type PopupAction<PopupType> =
	| {
			type: "add";
			payload: PopupType;
	  }
	| {
			type: "remove";
			itemId: number;
	  };

type PopupContextItem<PopupType> = PopupType & { id: number };

export type ToastNotificationContextItem = PopupContextItem<ToastNotificationProps>;
export type ModalContextItem = PopupContextItem<LayoutModalProps>;

export type PopupContentContextProps = {
	toasts: ToastNotificationContextItem[];
	showToast: (toast: ToastNotificationProps) => void;
	removeToast: (toastId: number) => void;

	modals: ModalContextItem[];
	showModal: (modal: LayoutModalProps) => void;
	removeModal: (modalId: number) => void;
};

export function toastNotificationReducer(
	state: ToastNotificationContextItem[],
	action: PopupAction<ToastNotificationProps>
): ToastNotificationContextItem[] {
	if (action.type === "add") {
		return [...state, { ...action.payload, id: new Date().getTime() }];
	}
	if (action.type === "remove") {
		return state.filter((toast) => toast.id !== action.itemId);
	}
	return state;
}

export function modalReducer(state: ModalContextItem[], action: PopupAction<LayoutModalProps>): ModalContextItem[] {
	if (action.type === "add") {
		return [...state, { ...action.payload, id: new Date().getTime() }];
	}
	if (action.type === "remove") {
		return state.filter((modal) => modal.id !== action.itemId);
	}
	return state;
}

const POPUP_CONTENT_CONTEXT_DEFAULT_VALUE = {
	toasts: [],
	showToast: () => {
		/* TODO */
	},
	removeToast: () => {
		/* TODO */
	},

	modals: [],
	showModal: () => {
		/* TODO */
	},
	removeModal: () => {
		/* TODO */
	},
};
export const PopupContentContext = createContext<PopupContentContextProps>(POPUP_CONTENT_CONTEXT_DEFAULT_VALUE);

export const PopupContentContextProvider = ({ children }: PropsWithChildren) => {
	const [toasts, dispatchToast] = useReducer(toastNotificationReducer, []);
	const [modals, dispatchModal] = useReducer(modalReducer, []);

	const showToast = (payload: ToastNotificationProps) =>
		dispatchToast({
			type: "add",
			payload,
		});

	const removeToast = (itemId: number) => dispatchToast({ type: "remove", itemId });

	const showModal = (payload: LayoutModalProps) =>
		dispatchModal({
			type: "add",
			payload,
		});

	const removeModal = (itemId: number) => dispatchModal({ type: "remove", itemId });

	return (
		<PopupContentContext.Provider value={{ toasts, showToast, removeToast, modals, showModal, removeModal }}>
			{children}
		</PopupContentContext.Provider>
	);
};
