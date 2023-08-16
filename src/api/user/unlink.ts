import { getApiUrl, useFetchData } from "../../utils";

type TUnlinkUserResponse = Promise<{ status: "OK" } | undefined>;

interface IUseUnlinkService {
	unlinkUser: (userId: string) => TUnlinkUserResponse;
}

const useUnlinkService = (): IUseUnlinkService => {
	const fetchData = useFetchData();

	const unlinkUser = async (recipeUserId: string): Promise<{ status: "OK" } | undefined> => {
		const response = await fetchData({
			url: getApiUrl("/api/user/unlink"),
			method: "GET",
			query: {
				recipeUserId: recipeUserId,
			},
		});

		if (response.ok) {
			const body = await response.json();

			if (body.status !== "OK") {
				return undefined;
			}

			return body;
		}

		return undefined;
	};

	return {
		unlinkUser,
	};
};

export default useUnlinkService;
