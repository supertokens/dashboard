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

import { LayoutModalProps } from "../../layout/layoutModal";

export type MissingTenantIdModalProps = Omit<LayoutModalProps, "modalContent"> & {
	message: string;
};

export const getMissingTenantIdModalProps = (props: MissingTenantIdModalProps): LayoutModalProps => {
	const closeModalRef: React.MutableRefObject<(() => void) | undefined> = { current: undefined };

	return {
		...props,
		modalContent: <div>{props.message}</div>,
		header: <h2 className="missing-tenant-modal-title">Operation not allowed</h2>,
		closeCallbackRef: closeModalRef,
	};
};
