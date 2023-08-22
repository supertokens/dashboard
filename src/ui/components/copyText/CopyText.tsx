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

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { getImageUrl } from "../../../utils";
import Toast, { TOAST_DEFAULT_DURATION } from "../toast/toast";
import "./CopyText.scss";

type CopyTextProps = {
	showChild?: boolean;
	children: string;
	copyVal?: string;
};

export const CopyText: React.FC<CopyTextProps> = ({ showChild = true, children, copyVal }: CopyTextProps) => {
	const alertWidth = 80;
	const copyBoxRef = useRef<HTMLDivElement>(null);
	const [isCopied, setIsCopied] = useState<boolean>(false);
	const copyClick = useCallback(() => {
		if (!isCopied) {
			setIsCopied(true);
			void navigator.clipboard.writeText(copyVal ?? children);
		}
	}, [isCopied, children]);

	/**
	 * Put alert horizontally on the (right + 8px space) of CopyBox, and vertically centered to the CopyBox
	 */
	const getAlertPosition = () => {
		if (copyBoxRef.current != null) {
			const copyBoxRect = copyBoxRef.current.getBoundingClientRect();
			if (copyBoxRect !== undefined) {
				const leftPosition = copyBoxRect.left + copyBoxRect.width + 8;
				const leftPositionMax = document.body.clientWidth - alertWidth;
				return {
					// top position also use the CSS `transform: translateY(-50%)`
					top: copyBoxRect.top + copyBoxRect.height / 2 + "px",
					left: Math.min(leftPosition, leftPositionMax) + "px",
				} as CSSProperties;
			}
		}
	};

	useEffect(() => {
		// hide alert on scroll, otherwise the alert will look not aligned with the CopyBox
		const onScroll = () => setIsCopied(false);
		window.removeEventListener("scroll", onScroll);
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<span
			ref={copyBoxRef}
			className={`copy-text ${isCopied ? "copy-text-copied" : ""}`}
			onMouseEnter={() => setIsCopied(false)}>
			{showChild && <span className="copy-text-text">{children}</span>}
			<span
				className="copy-text-action"
				onClick={copyClick}>
				<img
					src={getImageUrl("copy.svg")}
					alt="Copy text to clipboard"
				/>
			</span>
			{isCopied && (
				<Toast
					duration={TOAST_DEFAULT_DURATION}
					onDisappear={() => setIsCopied(false)}>
					<span
						className="copy-text-notification"
						style={getAlertPosition()}>
						<span className="block-snippet">Copied!</span>
					</span>
				</Toast>
			)}
		</span>
	);
};

export default CopyText;
