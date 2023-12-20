import { useState } from "react";
import { ReactComponent as ArrowDown } from "../../../assets/arrow-down.svg";

import "./select.scss";

type SelectProps = {
	options: { value: string; name: string }[];
	selectedOption: string | undefined;
	onOptionSelect: (value: string) => void;
};
export default function Select({ onOptionSelect, options, selectedOption }: SelectProps) {
	const [showOptions, setShowOptions] = useState(false);
	return (
		<div
			className="select-container"
			onMouseLeave={() => setShowOptions(false)}
			onMouseEnter={() => setShowOptions(true)}
			//	this code make sure that the select options show up in the mobile view
			//	since there will be no onMouseEnter event there.
			onClick={() => setShowOptions(true)}>
			<div className="select-action">
				{selectedOption === undefined ? "Please select" : selectedOption}{" "}
				<ArrowDown
					color="#000"
					style={{ rotate: showOptions ? "180deg" : undefined }}
				/>
			</div>
			{showOptions ? (
				<div className="select-dropdown-wrapper">
					<div className="select-dropdown">
						{options.map((option) => {
							return (
								<div
									className="select-item"
									key={option.value}
									onClick={(e) => {
										e.stopPropagation();
										onOptionSelect(option.value);
										setShowOptions(false);
									}}>
									{option.name}
								</div>
							);
						})}
					</div>
				</div>
			) : null}
		</div>
	);
}
