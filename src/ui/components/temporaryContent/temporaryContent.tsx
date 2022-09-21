import React, { useState, useEffect, useRef } from "react";

export type TemporaryContentProps = {
	/** duration before the content disappear (in miliseconds)*/
	duration?: number;
	contentAfterDisappear?: React.ReactNode;
	children?: React.ReactNode;
	onDisappear?: () => void;
};
export const TEMPORARY_CONTENT_DURATION = 3000;

/**
 * Simple component that will display one-time content,
 * and then disappears or replaced by `props.contentAfterDisappear` after `props.duration` miliseconds
 */
export const TemporaryContent: React.FC<TemporaryContentProps> = ({
	duration = TEMPORARY_CONTENT_DURATION,
	children,
	contentAfterDisappear,
	onDisappear,
}) => {
	const [showChildern, setShowChildern] = useState(true);
	const timerRef: React.MutableRefObject<undefined | NodeJS.Timeout> = useRef(undefined);
	const startTimer = () => {
		timerRef.current = setTimeout(() => {
			setShowChildern(false);
			if (onDisappear !== undefined) {
				onDisappear();
			}
		}, duration) as any as NodeJS.Timeout;
	};

	useEffect(() => {
		startTimer();
		return () => {
			if (timerRef.current !== undefined) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);
	return <>{showChildern ? children : contentAfterDisappear}</>;
};

export default TemporaryContent;
