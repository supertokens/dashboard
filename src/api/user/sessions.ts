import { SessionInfo } from "../../ui/components/userDetail/userDetailSessionList";
import { getApiUrl, useFetchData } from "../../utils";

const useSessionsForUserService = () => {
	const fetchData = useFetchData();

	const getSessionsForUser = async (userId: string): Promise<SessionInfo[] | undefined> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/sessions"),
			method: "GET",
			query: {
				userId,
			},
			shouldRedirect: true,
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

	const deleteSessionsForUser = async (sessionHandles: string[]): Promise<void> => {
		await fetchData({
			url: getApiUrl("/api/user/sessions"),
			method: "POST",
			config: {
				body: JSON.stringify({
					sessionHandles,
				}),
			},
			shouldRedirect: true,
		});

		return;
	};

	return {
		getSessionsForUser,
		deleteSessionsForUser,
	};
};

export default useSessionsForUserService;
