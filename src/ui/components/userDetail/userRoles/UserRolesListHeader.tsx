import { getImageUrl } from "../../../../utils";
import Button from "../../button";
import IconButton from "../../common/iconButton";

type UserRolesListHeaderProps = {
	setIsEditing: (value: boolean) => void;
	isEditing: boolean;
};

export const UserRolesListHeader = ({ setIsEditing, isEditing }: UserRolesListHeaderProps) => {
	return (
		<>
			<div className="title">User Information</div>
			{!isEditing ? (
				<IconButton
					size="small"
					text="Edit"
					tint="var(--color-link)"
					icon={getImageUrl("edit.svg")}
					onClick={() => {
						setIsEditing(true);
					}}
				/>
			) : (
				<div className="metadata-actions actions">
					<Button
						size="sm"
						color="secondary"
						onClick={() => setIsEditing(false)}>
						Save
					</Button>
				</div>
			)}
		</>
	);
};
