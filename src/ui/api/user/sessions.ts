import { fetchDataAndRedirectIf401, getApiUrl } from "../../../utils";
import { SessionInfo } from "../../components/userDetail/userDetailSessionList";

export const getSessionsForUser = async (userId: string): Promise<SessionInfo[] | undefined> => {
	const response = await fetchDataAndRedirectIf401({
		url: getApiUrl("/api/user/sessions"),
		method: "GET",
		query: {
			userId,
		},
	});

	if (response.ok) {
		const body = await response.json();

		if (body.status !== "OK") {
			return undefined;
		}

		return body.sessions;
	}

	return undefined;
};
