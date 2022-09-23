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

import { FC, MutableRefObject, ReactNode, useEffect, useRef, useState } from "react";
import { getImageUrl } from "../../../utils";
import { LayoutPanel, LayoutPanelProps } from "./layoutPanel";

export type LayoutModalProps = LayoutPanelProps & {
	hideBackDrop?: boolean;
	onClose?: () => void;
};

export type LayoutModalTriggerProps = LayoutModalProps & { modalContent: ReactNode; closeCallbackRef?: MutableRefObject<Function | undefined> };

export const LayoutModal: FC<LayoutModalProps> = (props: LayoutModalProps) => {
	const { hideBackDrop, header, onClose } = props;
	const closeButton = <div className="layout-modal__close"><div onClick={onClose}><img src={getImageUrl("close.svg")} alt="Close Modal"/></div></div>

	return (
		<>
			<div className="layout-modal">
				{!hideBackDrop && <div className="layout-modal__backdrop"></div>}
				<LayoutPanel {...props} header={<>{header}{closeButton}</>}/>
			</div>
		</>
	);
};

export const LayoutModalTrigger: FC<LayoutModalTriggerProps> = (props: LayoutModalTriggerProps) => {
	const { children, modalContent, closeCallbackRef } = props;
	const [isOpened, setIsOpened] = useState(false);

	useEffect(() => {
		if (closeCallbackRef !== undefined) {
			closeCallbackRef.current = () => setIsOpened(false);
		}
	}, [ closeCallbackRef ]);

	return (
		<>
			<div
				className="layout-modal-trigger"
				onClick={() => setIsOpened(true)}>
				{children}
			</div>
			{isOpened && (
				<LayoutModal
					{...props}
					children={modalContent}
					onClose={() => setIsOpened(false)}
				/>
			)}
		</>
	);
};

export default LayoutModalTrigger;
