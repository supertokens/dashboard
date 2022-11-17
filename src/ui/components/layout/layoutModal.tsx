/* Copyright (c) 2022, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

import { FC, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { getImageUrl } from "../../../utils";
import { PopupContentContext } from "../../contexts/PopupContentContext";
import { LayoutPanel, LayoutPanelProps } from "./layoutPanel";

export type LayoutModalContentProps = LayoutPanelProps & {
	hideBackDrop?: boolean;
	onClose?: () => void;
};

export type LayoutModalProps = LayoutModalContentProps & {
	modalContent: ReactNode;
	closeCallbackRef?: MutableRefObject<(() => void) | undefined>;
};

export const LayoutModalContent: FC<LayoutModalContentProps> = (props: LayoutModalContentProps) => {
	const { hideBackDrop, header, onClose } = props;
	const closeButton = (
		<div className="layout-modal__close">
			<div onClick={onClose}>
				<img
					src={getImageUrl("close.svg")}
					alt="Close Modal"
				/>
			</div>
		</div>
	);

	return (
		<>
			<div className="layout-modal">
				{!hideBackDrop && <div className="layout-modal__backdrop"></div>}
				<LayoutPanel
					{...props}
					header={
						<>
							{header}
							{closeButton}
						</>
					}
				/>
			</div>
		</>
	);
};

export const LayoutModal: FC<LayoutModalProps> = (props: LayoutModalProps) => {
	const { modalContent, closeCallbackRef, onClose } = props;
	const [isOpened, setIsOpened] = useState(true);

	const handleClose = useCallback(() => {
		setIsOpened(false);
		onClose?.();
	}, [onClose]);

	useEffect(() => {
		if (closeCallbackRef !== undefined) {
			closeCallbackRef.current = handleClose;
		}
	}, [closeCallbackRef, handleClose]);

	return (
		<>
			{isOpened && (
				<LayoutModalContent
					{...props}
					onClose={handleClose}>
					{modalContent}
				</LayoutModalContent>
			)}
		</>
	);
};

export const LayoutModalContainer: FC = () => {
	const { modals, removeModal } = useContext(PopupContentContext);
	const [modal] = modals;

	return modal !== undefined ? (
		<LayoutModal
			{...modal}
			key={modal.id}
			onClose={() => removeModal(modal.id)}
		/>
	) : null;
};

export default LayoutModal;
