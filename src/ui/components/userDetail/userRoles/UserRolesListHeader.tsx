import { getImageUrl } from "../../../../utils";
import Button from "../../button";
import IconButton from "../../common/iconButton";

type UserRolesListHeaderProps = {
	setIsEditing: (value: boolean) => void;
	isEditing: boolean;
	isFeatureEnabled: boolean | undefined;
};

export const UserRolesListHeader = ({ setIsEditing, isEditing, isFeatureEnabled }: UserRolesListHeaderProps) => {
	return (
		<>
			<div>
				<div className="title">Asssigned User Roles</div>
			</div>
			{isFeatureEnabled ? (
				<>
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
			) : null}
		</>
	);
};
