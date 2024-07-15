import React, { useState } from "react";
import { getImageUrl } from "../../../utils";
import "./searchInput.scss";

const searchIcon = getImageUrl("search.png");
const clearIcon = getImageUrl("clear.svg");

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	onClear: () => void;
	value: string;
};

export const SearchInput = ({ onClear, ...rest }: SearchInputProps) => {
	const [active, setActive] = useState<boolean>(false);

	return (
		<div className={`search__input_wrapper ${active ? "active" : ""}`}>
			<img
				src={searchIcon}
				alt=""
			/>
			<input
				type="text"
				{...rest}
				onFocus={(e) => {
					setActive(true);
					// eslint-disable-next-line react/prop-types
					rest?.onFocus?.(e);
				}}
				onBlur={(e) => {
					setActive(false);
					// eslint-disable-next-line react/prop-types
					rest?.onBlur?.(e);
				}}
			/>
			{(active || rest?.value) && (
				<button
					aria-label="Clear Search"
					onClick={() => {
						onClear();
					}}
					className="search__input_wrapper__clear">
					<img
						src={clearIcon}
						alt=""
					/>
				</button>
			)}
		</div>
	);
};
