import React, { useState } from "react";
import { getImageUrl } from "../../../utils";
import "./searchInput.scss";

const searchIcon = getImageUrl("search.png");
const clearIcon = getImageUrl("clear.svg");

type SearchInputProps = React.HTMLAttributes<HTMLInputElement> & {
	onClear: () => void;
};

export const SearchInput = (props: SearchInputProps) => {
	const [active, setActive] = useState<boolean>(false);

	return (
		<div className={`search__input_wrapper ${active && "active"}`}>
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
			{active && (
				<img
					src={clearIcon}
					alt=""
					onClick={() => {
						props.onClear();
					}}
				/>
			)}
		</div>
	);
};
