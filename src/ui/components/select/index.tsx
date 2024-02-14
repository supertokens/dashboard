import "./select.scss";

type SelectProps = {
	options: { value: string; name: string }[];
	selectedOption: string | undefined;
	onOptionSelect: (value: string) => void;
};
export default function Select({ onOptionSelect, options, selectedOption }: SelectProps) {
	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const selectedOption = options.find((option) => option.value === e.currentTarget.value)!;
		onOptionSelect(selectedOption.value);
	}
	return (
		<select
			className="st-select"
			onChange={handleChange}>
			<option
				disabled
				selected={selectedOption === undefined}>
				Please select
			</option>
			{options.map((option) => {
				const isSelected = option.value === selectedOption;
				return (
					<option
						selected={isSelected}
						value={option.value}
						key={option.value}>
						{option.name}
					</option>
				);
			})}
		</select>
	);
}
