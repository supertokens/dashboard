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

import React, { useCallback, useEffect, useState } from "react";
import { getImageUrl } from "../../../utils";
import "./search.scss";

const searchIcon = getImageUrl("search.png");
const chevron = getImageUrl("chevron-down.svg");
const deleteIcon = getImageUrl("close.svg");
const checkmark = getImageUrl("checkmark-yellow.svg");

type SearchType = {
	tag: string;
	value: string;
};

type action = "chn" | "del";

const Search: React.FC<object> = (props) => {
	const [active, setActive] = useState<boolean>(false);
	const [searches, setSearches] = useState<SearchType[] | []>([]);
	const [tags, setTags] = useState<string[] | []>([]);
	const getTags = () => ["Email", "Phone Number", "Auth Method", "Auth Provider"];
	useEffect(() => {
		setTags(getTags());
	}, []);

	const getSearchResult = useCallback(
		(searches: SearchType[]) => {
			// eslint-disable-next-line no-console
			console.log("hi", searches);
		},
		[searches]
	);

	// useEffect to call everytime searches change
	useEffect(() => {
		if (searches.length !== 0) getSearchResult(searches);
	}, [searches, getSearchResult]);

	const updateEntry = (action: action, data: SearchType, index: number) => {
		// eslint-disable-next-line no-console
		console.log(action, data);

		switch (action) {
			case "chn": {
				const temp = [...searches];
				temp[index] = data;
				setSearches(temp);
				break;
			}
			case "del":
				setSearches(
					searches.filter((el) => el.value !== data.value || (el.value === data.value && el.tag !== data.tag))
				);
				break;
		}
	};
	const search = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			setSearches([...searches, { tag: "Email", value: e.target.value }]);
			e.target.value = "";
		}
	};
	return (
		<div className="search">
			<div className={`search__input_wrapper ${active && "active"}`}>
				<img
					src={searchIcon}
					alt=""
				/>
				<input
					type="text"
					placeholder="Search"
					onFocus={() => setActive(true)}
					onBlur={() => setActive(false)}
					onKeyDown={(e) => search(e)}
				/>
				{active && (
					<img
						src={searchIcon}
						alt=""
					/>
				)}
			</div>
			<div className="search__entries">
				{searches.map((el, index) => (
					<SearchTag
						key={index}
						val={el}
						tags={tags}
						onUpdate={(action: action, data: SearchType) => updateEntry(action, data, index)}
					/>
				))}
			</div>
		</div>
	);
};

const SearchTag = (props: {
	val: SearchType;
	tags: string[];
	onUpdate: (action: action, data: SearchType) => void;
}) => {
	return (
		<div className="searchTag">
			<TagDropdown
				selected={props.val.tag}
				tags={props.tags}
				onUpdate={(e) => props.onUpdate("chn", { ...props.val, tag: e })}
			/>
			<div className="searchTag__value">
				{props.val.value}
				<img
					src={deleteIcon}
					alt=""
					onClick={() => props.onUpdate("del", props.val)}
				/>
			</div>
		</div>
	);
};

const TagDropdown = (props: { selected: string; tags: string[]; onUpdate: (data: string) => void }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="tag_dropdown">
			<div
				onClick={() => setOpen(!open)}
				className={`tag_dropdown__selector ${open ? "active" : ""}`}>
				<div>{props.selected}</div>
				<img
					src={chevron}
					alt="chevron"
					style={{ transform: open ? "rotate(180deg)" : "" }}
				/>
			</div>
			<div
				className="tag_dropdown__menu"
				style={{ display: open ? "block" : "none" }}>
				<ul>
					{props.tags.map((el, ind) => (
						<li
							key={ind}
							onClick={() => props.onUpdate(el)}>
							{el}
							{el === props.selected && <img src={checkmark} />}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default Search;
