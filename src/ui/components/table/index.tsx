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

import * as React from "react";

import "./table.scss";

const Table = React.forwardRef<
	HTMLTableElement,
	React.HTMLAttributes<HTMLTableElement> & { className?: string; pagination?: React.ReactNode }
>(({ className = "", pagination, ...props }, ref) => {
	return (
		<div className="table-container">
			<table
				ref={ref}
				className={`table ${className}`}
				{...props}
			/>
			{pagination}
		</div>
	);
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ ...props }, ref) => (
		<thead
			ref={ref}
			{...props}
		/>
	)
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ ...props }, ref) => (
		<tbody
			ref={ref}
			{...props}
		/>
	)
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ ...props }, ref) => (
		<tfoot
			ref={ref}
			{...props}
		/>
	)
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	({ ...props }, ref) => (
		<tr
			ref={ref}
			{...props}
		/>
	)
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
	({ ...props }, ref) => (
		<th
			ref={ref}
			{...props}
		/>
	)
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
	({ ...props }, ref) => (
		<td
			ref={ref}
			{...props}
		/>
	)
);
TableCell.displayName = "TableCell";

export { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow };
