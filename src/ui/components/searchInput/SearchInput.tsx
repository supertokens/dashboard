import React, { useState } from "react";
import { getImageUrl } from "../../../utils";
import "./searchInput.scss";

const searchIcon = getImageUrl("search.png");
const clearIcon = getImageUrl("clear.svg");

type SearchInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
	onClear: () => void;
	value: string;
};

export const SearchInput = (props: SearchInputProps) => {
	const [active, setActive] = useState<boolean>(false);

	return (
		<div className={`search__input_wrapper ${active ? "active" : ""}`}>
			<img
				src={searchIcon}
				alt=""
			/>
			<input
				type="text"
				{...props}
				onFocus={(e) => {
					setActive(true);
					// eslint-disable-next-line react/prop-types
					props.onFocus?.(e);
				}}
				onBlur={(e) => {
					setActive(false);
					// eslint-disable-next-line react/prop-types
					props.onBlur?.(e);
				}}
			/>
			{(active || props.value) && (
				<button
					aria-label="Clear Search"
					onClick={() => {
						props.onClear();
					}}>
					<img
						src={clearIcon}
						alt=""
					/>
				</button>
			)}
		</div>
	);
};
