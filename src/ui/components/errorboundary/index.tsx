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

import React, { PropsWithChildren } from "react";
import { getImageUrl } from "../../../utils";
import { Footer } from "../footer/footer";
import "./error-boundary.scss";

// eslint-disable-next-line @typescript-eslint/ban-types
type Props = PropsWithChildren<{}>;
type State = {
	hasError: boolean;
};

export default class ErrorBoundary extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false };
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	static getDerivedStateFromError(_: unknown) {
		return { hasError: true };
	}

	render(): React.ReactNode {
		if (this.state.hasError) {
			return (
				<>
					<div className="error-container">
						<div className="block-container">
							<img
								className="title-image"
								src={getImageUrl("delete.svg")}
								alt="Error"></img>
							<h2 className="text-title">Looks like something went wrong!</h2>
							<p className="text-small text-label">
								Please refresh the page to try again or contact us if the error persists.
							</p>
						</div>
					</div>
					<Footer
						horizontalAlignment="center"
						verticalAlignment="center"
						size="normal"
						colorMode="dark"></Footer>
				</>
			);
		}

		return this.props.children;
	}
}
