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

import { parsePhoneNumber } from "libphonenumber-js/max";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getImageUrl } from "@utils";
import { useQuery } from "@tanstack/react-query";
import { useFetchSearchTags } from "@api/search/searchTags";
import { Flex, TextField } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Select from "@shared/components/select";

import styles from "./index.module.scss";

// Constants
const SEARCH_TAGS_QUERY_KEY = "search-tags";
const SEARCH_TAGS_STALE_TIME = 10 * 60 * 1000; // 10 minutes
const DEFAULT_TAG = "email";

const deleteIcon = getImageUrl("close.svg");

// Types
export interface SearchCriteria {
	readonly email?: string;
	readonly phone?: string;
	readonly recipe?: string;
	readonly provider?: string;
}

interface SearchEntry {
	readonly tag: keyof SearchCriteria;
	readonly value: string;
}

type SearchAction = "change" | "delete";

interface SearchProps {
	readonly onSearch: (criteria: SearchCriteria | null) => void;
	readonly placeholder?: string;
	readonly initialCriteria?: SearchCriteria | null;
}

interface SearchTagProps {
	readonly entry: SearchEntry;
	readonly availableTags: string[];
	readonly onUpdate: (action: SearchAction, entry: SearchEntry) => void;
}

// Utility functions
const getTagDisplayName = (tag: string): string => {
	const tagNames: Record<string, string> = {
		email: "Email",
		phone: "Phone Number",
		recipe: "Auth Method",
		provider: "Auth Provider",
	};
	return tagNames[tag] || tag;
};

const normalizePhoneNumber = (value: string): string => {
	try {
		const parsed = parsePhoneNumber(value);
		if (parsed !== undefined) {
			return parsed.format("E.164");
		}
	} catch (e) {
		// Fallback normalization
		let temp = value;
		if (!temp.startsWith("+")) {
			temp = "+" + temp;
		}
		temp = temp.replace(/[()\s]/g, "");
		return temp;
	}
	return value;
};

const convertSearchEntriesToCriteria = (entries: SearchEntry[]): SearchCriteria => {
	const criteria: Record<string, string> = {};

	entries.forEach(({ tag, value }) => {
		const normalizedValue = tag === "phone" ? normalizePhoneNumber(value.trim()) : value.trim();

		if (normalizedValue) {
			if (criteria[tag]) {
				criteria[tag] += ";" + normalizedValue;
			} else {
				criteria[tag] = normalizedValue;
			}
		}
	});

	return criteria as SearchCriteria;
};

const useSearchTags = () => {
	const { fetchSearchTags } = useFetchSearchTags();

	return useQuery({
		queryKey: [SEARCH_TAGS_QUERY_KEY],
		queryFn: fetchSearchTags,
		staleTime: SEARCH_TAGS_STALE_TIME,
		select: (data) => data?.tags || [],
	});
};

export const Search: React.FC<SearchProps> = ({ onSearch, placeholder = "Type here", initialCriteria = null }) => {
	const [searchEntries, setSearchEntries] = useState<SearchEntry[]>([]);
	const { data: availableTags = [], isLoading: tagsLoading } = useSearchTags();

	const defaultTag = useMemo(() => {
		return availableTags.includes(DEFAULT_TAG) ? DEFAULT_TAG : availableTags[0] || DEFAULT_TAG;
	}, [availableTags]);

	// Trigger search when search entries change
	useEffect(() => {
		const criteria = searchEntries.length === 0 ? null : convertSearchEntriesToCriteria(searchEntries);
		onSearch(criteria);
	}, [searchEntries, onSearch]);

	useEffect(() => {
		if (initialCriteria && availableTags.length > 0) {
			const entries: SearchEntry[] = [];
			Object.entries(initialCriteria).forEach(([tag, value]) => {
				if (value && availableTags.includes(tag)) {
					// Handle multiple values separated by semicolon
					const values = value.split(";");
					values.forEach((v: string) => {
						if (v.trim()) {
							entries.push({ tag: tag as keyof SearchCriteria, value: v.trim() });
						}
					});
				}
			});
			setSearchEntries(entries);
		}
	}, [initialCriteria, availableTags]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			const target = e.target as HTMLInputElement;
			const value = target.value.trim();

			if (!value) return;

			if (e.key === "Enter") {
				e.preventDefault();
				setSearchEntries((prev) => [...prev, { tag: defaultTag as keyof SearchCriteria, value }]);
				target.value = "";
			}
		},
		[defaultTag]
	);

	const handleEntryUpdate = useCallback((action: SearchAction, entry: SearchEntry, index: number) => {
		setSearchEntries((prev) => {
			switch (action) {
				case "change": {
					const updated = [...prev];
					updated[index] = entry;
					return updated;
				}
				case "delete":
					return prev.filter((_, i) => i !== index);
				default:
					return prev;
			}
		});
	}, []);

	return (
		<div className={styles.searchInput}>
			<TextField.Root
				placeholder={placeholder}
				size="2"
				variant="surface"
				onKeyDown={handleKeyDown}
				disabled={tagsLoading}
				className={styles.searchInput__input}>
				<TextField.Slot>
					<MagnifyingGlassIcon
						height="16"
						width="16"
					/>
				</TextField.Slot>
			</TextField.Root>

			<div className={styles.searchInput__entries}>
				{searchEntries.map((entry, index) => (
					<SearchTag
						key={`${entry.tag}-${entry.value}-${index}`}
						entry={entry}
						availableTags={availableTags}
						onUpdate={(action, updatedEntry) => handleEntryUpdate(action, updatedEntry, index)}
					/>
				))}
			</div>
		</div>
	);
};

// Search Tag Component
const SearchTag: React.FC<SearchTagProps> = ({ entry, availableTags, onUpdate }) => {
	const tagOptions = useMemo(
		() => availableTags.map((tag) => ({ value: tag, label: getTagDisplayName(tag) })),
		[availableTags]
	);

	const handleTagChange = useCallback(
		(newTag: string) => {
			onUpdate("change", { ...entry, tag: newTag as keyof SearchCriteria });
		},
		[entry, onUpdate]
	);

	const handleDelete = useCallback(() => {
		onUpdate("delete", entry);
	}, [entry, onUpdate]);

	return (
		<Flex className={styles["search-tag"]}>
			<Select
				items={tagOptions}
				defaultValue={entry.tag}
				onValueChange={handleTagChange}
				selectedValue={entry.tag}
				triggerClassName={styles["search-tag__select__trigger"]}
				contentClassName={styles["search-tag__select__content"]}
			/>
			<Flex
				className={styles["search-tag__value"]}
				align="center"
				justify="between">
				{entry.value}
				<img
					src={deleteIcon}
					alt="Remove search term"
					onClick={handleDelete}
					style={{ cursor: "pointer" }}
				/>
			</Flex>
		</Flex>
	);
};

export default Search;
