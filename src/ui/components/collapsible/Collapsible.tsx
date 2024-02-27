/* Copyright (c) 2024, VRAI Labs and/or its affiliates. All rights reserved.
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
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./collapsible.scss";

export const CollapsibleContext = createContext({
	isCollapsed: true,
	setIsCollapsed: (_: boolean) => {
		return;
	},
});

export const CollapsibleRoot = ({
	children,
	defaultCollapsed,
}: {
	children: React.ReactNode;
	defaultCollapsed?: boolean;
}) => {
	const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed ?? true);
	return (
		<CollapsibleContext.Provider
			value={{
				isCollapsed,
				setIsCollapsed,
			}}>
			{children}
		</CollapsibleContext.Provider>
	);
};

export const CollapsibleFixed = ({
	children,
}: {
	children: ({
		isCollapsed,
		setIsCollapsed,
	}: {
		isCollapsed: boolean;
		setIsCollapsed: (isCollapsed: boolean) => void;
	}) => React.ReactNode;
}) => {
	const { isCollapsed, setIsCollapsed } = useContext(CollapsibleContext);

	return (
		<>
			{children({
				isCollapsed,
				setIsCollapsed,
			})}
		</>
	);
};

export const CollapsibleContent = ({ children }: { children: React.ReactNode }) => {
	const { isCollapsed } = useContext(CollapsibleContext);
	const ref = useRef<HTMLDivElement>(null);
	const [contentHeight, setContentHeight] = useState("2000px");

	// Ensure that the content height is updated when the content changes
	useEffect(() => {
		const resizeObserver = new ResizeObserver((entries) => {
			if (!isCollapsed) {
				setContentHeight(`${entries[0].target.scrollHeight}px`);
			}
		});

		if (ref.current) {
			resizeObserver.observe(ref.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, [isCollapsed]);

	useLayoutEffect(() => {
		setContentHeight(isCollapsed ? "0px" : `${ref.current?.scrollHeight}px`);
	}, [isCollapsed]);

	return (
		<div
			style={{
				height: contentHeight,
			}}
			className="collapsible-content">
			<div ref={ref}>{children}</div>
		</div>
	);
};
