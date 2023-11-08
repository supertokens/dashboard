import { getImageUrl } from "../../../utils";

import "./pagination.scss";

type PaginationProps = {
	className?: string;
	page: number;
	limit: number;
	offset: number;
	totalPages: number;
	totalItems: number;
	handleNext: () => void;
	handlePrevious: () => void;
	isLoading: boolean;
};

export default function Pagination({
	totalPages,
	limit,
	totalItems,
	offset,
	handleNext,
	handlePrevious,
	isLoading,
	page,
	className,
}: PaginationProps) {
	return (
		<div className={["pagination", className].join(" ")}>
			<p className="pagination-count text-small">
				{limit * (page - 1) + 1}-{offset + limit * (page - 1)} of {totalItems}
			</p>
			<div className="pagination-navigation">
				<button
					className="pagination-button"
					disabled={page <= 1 || isLoading}
					onClick={handlePrevious}>
					<img
						src={getImageUrl("chevron-left.svg")}
						alt="Previous page"
					/>
				</button>
				<button
					className="pagination-button"
					disabled={page === totalPages || isLoading}
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
