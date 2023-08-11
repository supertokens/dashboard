import { getApiUrl, useFetchData } from "../../utils";

type TDeleteUserResponse = Promise<{ status: "OK" } | undefined>;

interface IUseDeleteUserService {
	deleteLoginMethod: (userId: string) => TDeleteUserResponse;
}

const useDeleteLoginMethodService = (): IUseDeleteUserService => {
	const fetchData = useFetchData();

	const deleteLoginMethod = async (userId: string): Promise<{ status: "OK" } | undefined> => {
		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "DELETE",
			query: {
				userId,
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
		deleteLoginMethod,
	};
};

export default useDeleteLoginMethodService;
