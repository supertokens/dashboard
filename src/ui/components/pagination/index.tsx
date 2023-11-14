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

import { getImageUrl } from "../../../utils";

import "./pagination.scss";

type PaginationProps = {
	className?: string;
	currentActivePage: number;
	limit: number;
	offset: number;
	totalPages: number;
	totalItems: number;
	handleNext: () => void;
	handlePrevious: () => void;
};

export default function Pagination({
	totalPages,
	limit,
	totalItems,
	offset,
	handleNext,
	handlePrevious,
	currentActivePage,
	className,
}: PaginationProps) {
	return (
		<div className={["pagination", className].join(" ")}>
			<p className="pagination-count text-small">
				{limit * (currentActivePage - 1) + 1}-{offset + limit * (currentActivePage - 1)} of {totalItems}
			</p>
			<div className="pagination-navigation">
				<button
					className="pagination-button"
					disabled={currentActivePage <= 1}
					onClick={handlePrevious}>
					<img
						src={getImageUrl("chevron-left.svg")}
						alt="Previous page"
					/>
				</button>
				<button
					className="pagination-button"
					disabled={currentActivePage === totalPages}
					onClick={handleNext}>
					<img
						src={getImageUrl("chevron-right.svg")}
						alt="Next page"
					/>
				</button>
			</div>
		</div>
	);
}
