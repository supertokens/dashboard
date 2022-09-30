import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { getImageUrl } from "../../../utils";
import Toast from "../toast/toast";
import "./CopyText.scss";

export const CopyText: React.FC<{ children: string }> = ({ children }) => {
	const alertWidth = 80;
	const copyBoxRef = useRef<HTMLDivElement>(null);
	const [isCopied, setIsCopied] = useState<boolean>(false);
	const copyClick = useCallback(() => {
		if (!isCopied) {
			setIsCopied(true);
			navigator.clipboard.writeText(children);
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
			<span className="copy-text-text">{children}</span>
			<span
				className="copy-text-action"
				onClick={copyClick}>
				<img
					src={getImageUrl("copy.svg")}
					alt="Copy text to clipboard"
				/>
			</span>
			{isCopied && (
				<Toast onDisappear={() => setIsCopied(false)}>
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
