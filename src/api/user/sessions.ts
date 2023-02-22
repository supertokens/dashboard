import { SessionInfo } from "../../ui/components/userDetail/userDetailSessionList";
import { getApiUrl, useFetchData } from "../../utils";

interface IUseSessionsForUserService {
	getSessionsForUser: (userId: string) => Promise<SessionInfo[] | undefined>;
	deleteSessionsForUser: (sessionHandles: string[]) => Promise<void>;
}

const useSessionsForUserService = (): IUseSessionsForUserService => {
	const fetchData = useFetchData();

	const getSessionsForUser = async (userId: string): Promise<SessionInfo[] | undefined> => {
		const response = await fetchData({
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

	const deleteSessionsForUser = async (sessionHandles: string[]): Promise<void> => {
		await fetchData({
			url: getApiUrl("/api/user/sessions"),
			method: "POST",
			config: {
				body: JSON.stringify({
					sessionHandles,
				}),
			},
		});

		return;
	};

	return {
		getSessionsForUser,
		deleteSessionsForUser,
	};
};

export default useSessionsForUserService;
