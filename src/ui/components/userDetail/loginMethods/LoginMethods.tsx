import React, { useContext, useState } from "react";
import "./loginMethods.scss";
import { LayoutPanel } from "../../layout/layoutPanel";
import { UserRecipeType } from "../../../pages/usersList/types";
import CopyText from "../../copyText/CopyText";
import { DropDown } from "./components/dropDown";
import { EditableInput } from "./components/editableInput";
import { getImageUrl } from "../../../../utils";
import { useUserDetailContext } from "../context/UserDetailContext";

export type LoginMethods = {
	tenantIds?: string[];
	timeJoined: number;
	recipeUserId: string;
	recipeId: "emailpassword" | "thirdparty" | "passwordless";
	email?: string;
	phoneNumber?: string;
	thirdParty?: {
		id: string;
		userId: string;
	};
};

export type LoginMethodsProps = {
	methods: LoginMethods[];
};

export type InfoItemProps = { label: string; info: string; isEditing: boolean };

const UserRecipeTypeText: Record<UserRecipeType, string> = {
	["emailpassword"]: "Email password",
	["passwordless"]: "Passwordless",
	["thirdparty"]: "Third party",
	["multiple"]: "Multiple",
};

const ProviderPill = ({ id, userId }: { id: string; userId: string }) => {
	const idToImage = () => {
		switch (id) {
			case "apple":
				return getImageUrl("provider-apple.svg");
			case "facebook":
				return getImageUrl("provider-facebook.svg");
			case "github":
				return getImageUrl("provider-github.svg");
			case "google":
				return getImageUrl("provider-google.svg");
			default:
				return getImageUrl("auth-provider.svg");
		}
	};
	return (
		<span className="provider-pill">
			<img
				src={idToImage()}
				alt="Provider logo"
			/>{" "}
			| <CopyText>{userId}</CopyText>
		</span>
	);
};

const UserRecipePill = (loginMethod: LoginMethods) => {
	return (
		<div className={`pill ${loginMethod.recipeId} ${loginMethod.thirdParty ?? ""}`}>
			<span>{UserRecipeTypeText[loginMethod.recipeId]}</span>
			{loginMethod.thirdParty && (
				<span
					className="thirdparty-name"
					title={loginMethod.thirdParty.id}>
					{" "}
					- {loginMethod.thirdParty.id}
				</span>
			)}
		</div>
	);
};

const VerifiedPill = ({ isVerified }: { isVerified: boolean }) => {
	if (!isVerified) {
		return <span className="not-verified">Not Verified</span>;
	} else return <span className="verified">Verified</span>;
};

const Methods: React.FC<LoginMethods> = (loginMethod) => {
	const dateToWord = (timestamp: number) => {
		const date = new Date(timestamp);
		return (
			date.getUTCDay() +
			"th " +
			date.getUTCMonth() +
			", " +
			date.getFullYear() +
			" at " +
			date.getUTCHours() +
			":" +
			date.getMinutes()
		);
	};
	const [isEditing, setEdit] = useState(false);
	return (
		<div className="method">
			<div className="method-header">
				<div className="left">
					<UserRecipePill {...loginMethod} />
					<span className="user-id-span">
						User ID:
						<span className="copy-text-wrapper">
							<CopyText>{loginMethod.recipeUserId}</CopyText>
						</span>
					</span>
				</div>
				<div className="right">
					{!isEditing && (
						<DropDown
							onEdit={() => setEdit(!isEditing)}
							onDelete={() => null}
							onUnlink={() => null}
						/>
					)}
					{isEditing && (
						<button
							onClick={() => setEdit(false)}
							className="save-button">
							Save
						</button>
					)}
				</div>
			</div>
			<div className="method-body">
				<EditableInput
					label={"Email ID"}
					val={loginMethod.email ?? ""}
					edit={isEditing}
				/>
				<div>
					Is Email Verified?: <VerifiedPill isVerified={true} />
				</div>
				{loginMethod.recipeId === "thirdparty" && (
					<>
						<div>
							Created On: <b>{dateToWord(loginMethod.timeJoined)}</b>
						</div>
						<div>
							{loginMethod.thirdParty && (
								<>
									Provider: <ProviderPill {...loginMethod.thirdParty} />
								</>
							)}
						</div>
					</>
				)}
				{loginMethod.recipeId === "passwordless" && (
					<>
						<div>
							Created On: <b>{dateToWord(loginMethod.timeJoined)}</b>
						</div>
						<EditableInput
							label={"Phonenumber"}
							val={loginMethod.phoneNumber ?? ""}
							edit={isEditing}
						/>
					</>
				)}
				{loginMethod.recipeId === "emailpassword" && (
					<>
						<div>
							Password: <span className="password-link">Change Password</span>
						</div>
						<div>
							Created On: <b>{dateToWord(loginMethod.timeJoined)}</b>
						</div>
					</>
				)}
				{loginMethod.tenantIds && (
					<div>
						Tenants:{" "}
						{loginMethod.tenantIds.map((tenantId) => {
							return (
								<div
									key={tenantId}
									style={{ display: "inline" }}
									className="tenant-pill">
									{tenantId}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export const LoginMethods: React.FC = () => {
	const { userDetail } = useUserDetailContext();
	const methods = userDetail.details.loginMethods;
	return (
		<LayoutPanel header={<div className="title">Login Methods</div>}>
			{methods.map((val, ind) => (
				<Methods
					{...val}
					key={ind}
				/>
			))}
		</LayoutPanel>
	);
};
