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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { parsePhoneNumber } from "libphonenumber-js/max";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { getImageUrl } from "../../../utils";
import "./search.scss";

import { useFetchSearchTags } from "../../../api/search/searchTags";

const searchIcon = getImageUrl("search.png");
const clearIcon = getImageUrl("clear.svg");
const chevron = getImageUrl("chevron-down.svg");
const deleteIcon = getImageUrl("close.svg");
const checkmark = getImageUrl("checkmark-yellow.svg");

type SearchType = {
	tag: string;
	value: string;
};

type searchProp = {
	onSearch: (paginationToken?: string, search?: object) => Promise<void>;
	loading: boolean;
};

type action = "chn" | "del";

const tagToText = (tag: string) => {
	switch (tag) {
		case "email":
			return "Email";
		case "phone":
			return "Phone Number";
		case "recipe":
			return "Auth Method";
		case "provider":
			return "Auth Provider";
	}
};

const tagToImg = (tag: string) => {
	switch (tag) {
		case "email":
			return getImageUrl("email.svg");
		case "phone":
			return getImageUrl("phone-no.svg");
		case "recipe":
			return getImageUrl("auth-method.svg");
		case "provider":
			return getImageUrl("auth-provider.svg");
	}
};

const Search: React.FC<searchProp> = (props: searchProp) => {
	const [active, setActive] = useState<boolean>(false);
	const [searches, setSearches] = useState<SearchType[] | []>([]);
	const [tags, setTags] = useState<string[] | []>([]);
	const [defaulTag, setDefaultTag] = useState<string>("email");
	const searchRef = useRef<HTMLInputElement>(null);
	const { fetchSearchTags } = useFetchSearchTags();
	useEffect(() => {
		const asyncEffect = async () => {
			const resp = await fetchSearchTags();
			setTags(resp?.tags ?? []);
			if (resp?.tags.includes("email")) {
				setDefaultTag("email");
			} else {
				setDefaultTag(resp?.tags[0] ?? "");
			}
		};
		asyncEffect().catch(console.error);
	}, []);

	const getSearchResult = useCallback(
		async (searches: SearchType[]) => {
			if (props.loading) {
				return;
			}

			const tempQueryMap: Record<string, string> = {};
			searches.forEach((el) => {
				let value = el.value.trim();

				if (el.tag === "phone") {
					try {
						const parsed = parsePhoneNumber(value);

						if (parsed !== undefined) {
							value = parsed.format("E.164");
						}
					} catch (e) {
						let temp = value;

						if (!temp.startsWith("+")) {
							temp = "+" + temp;
						}

						temp = temp.replace(/[()\s]/g, "");
						value = temp;
					}
				}

				if (el.tag in tempQueryMap) {
					const temp = tempQueryMap[el.tag] + ";" + value;
					tempQueryMap[el.tag] = temp;
				} else {
					tempQueryMap[el.tag] = value;
				}
			});
			await props.onSearch(undefined, tempQueryMap);
		},
		[searches]
	);

	// useEffect to call everytime searches change
	useEffect(() => {
		getSearchResult(searches).catch(console.error);
	}, [searches, getSearchResult]);

	const updateEntry = (action: action, data: SearchType, index: number) => {
		switch (action) {
			case "chn": {
				const temp = [...searches];
				temp[index] = data;
				setSearches(temp);
				break;
			}
			case "del": {
				const temp = searches.filter(
					(el) => el.value !== data.value || (el.value === data.value && el.tag !== data.tag)
				);
				setSearches(temp);
				break;
			}
		}
	};
	const search = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.target.value.trim() === "") return;
		if (e.key === "Enter") {
			e.preventDefault();
			setSearches([...searches, { tag: defaulTag, value: e.target.value }]);
			e.target.value = "";
		}
	};

	const searchButton = () => {
		if (searchRef.current.value.trim() === "") return;
		setSearches([...searches, { tag: defaulTag, value: searchRef.current?.value ?? "" }]);
		searchRef.current!.value = "";
	};

	return (
		<div className="search">
			<div>
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
						ref={searchRef}
					/>
					{(active || (searchRef.current && searchRef.current.value)) && (
						<img
							src={clearIcon}
							alt=""
							onClick={() => (searchRef.current ? (searchRef.current.value = "") : "")}
						/>
					)}
				</div>
				<button
					onClick={searchButton}
					id="search-btn">
					Search
				</button>
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
	const [id, setId] = useState(null);
	useEffect(() => {
		setId(Math.floor(Math.random() * 100));
		const closeDropDown = (e) => {
			// const classList = Array.from(e.target.classList);
			// if (classList[0].startsWith("tag_dropdown")) {
			// 	// no-op
			// } else {
			// }
			setOpen(false);
		};
		window.addEventListener("click", closeDropDown);
	}, []);
	const handleOpen = () => {
		setTimeout(() => {
			setOpen(!open);
		}, 10);
	};
	return (
		<div className="tag_dropdown ">
			<div
				onClick={handleOpen}
				className={`tag_dropdown__selector ${open ? "active" : ""} ${id}`}>
				<div className="tag_dropdown">{tagToText(props.selected)}</div>
				<img
					className="tag_dropdown "
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
							onClick={() => {
								props.onUpdate(el);
								setOpen(false);
							}}>
							<span>
								<img
									src={tagToImg(el)}
									alt=""
								/>
								{tagToText(el)}
							</span>
							{el === props.selected && <img src={checkmark} />}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default Search;
