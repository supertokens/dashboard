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

import { parsePhoneNumber } from "libphonenumber-js/max";
import React, { useCallback, useEffect, useState } from "react";
import { getImageUrl } from "@utils";
import "./searchTest.scss";

import { useFetchSearchTags } from "@api/search/searchTags";

import { Box, Flex, Text, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Select from "@components/radix/select";

const deleteIcon = getImageUrl("close.svg");

type SearchType = {
	tag: string;
	value: string;
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
		default:
			return tag;
	}
};

type searchProp = {
	onSearch: (paginationToken?: string, search?: object) => Promise<void>;
	isLoading: boolean;
	placeholder?: string;
};

const Search: React.FC<searchProp> = ({ onSearch, isLoading, placeholder }) => {
	const [searches, setSearches] = useState<SearchType[] | []>([]);
	const [tags, setTags] = useState<string[] | []>([]);
	const [defaulTag, setDefaultTag] = useState<string>("email");
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
			if (isLoading) {
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
			await onSearch(undefined, tempQueryMap);
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

	return (
		<div className="searchInput">
			<TextField.Root
				placeholder={placeholder || "Type here"}
				size="2"
				variant="surface"
				onKeyDown={(e) => search(e)}
				className="searchInput__input">
				<TextField.Slot>
					<MagnifyingGlassIcon
						height="16"
						width="16"
					/>
				</TextField.Slot>
			</TextField.Root>
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
		<Flex className="search-tag">
			<Select
				items={props.tags.map((tag) => ({ value: tag, label: tagToText(tag) }))}
				defaultValue={props.val.tag}
				onValueChange={(e) => props.onUpdate("chn", { ...props.val, tag: e })}
				selectedValue={props.val.tag}
				triggerClassName="search-tag__select__trigger"
				contentClassName="search-tag__select__content"
			/>
			<Flex
				className="search-tag__value"
				align="center"
				justify="between">
				{props.val.value}

				<img
					src={deleteIcon}
					alt=""
					onClick={() => props.onUpdate("del", props.val)}
				/>
			</Flex>
		</Flex>
	);
};

export default Search;
