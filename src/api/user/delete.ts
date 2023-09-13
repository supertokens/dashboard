import { getApiUrl, useFetchData } from "../../utils";

type TDeleteUserResponse = Promise<{ status: "OK" } | undefined>;

interface IUseDeleteUserService {
	deleteUser: (userId: string, removeAllLinkedAccounts: boolean) => TDeleteUserResponse;
}

const useDeleteUserService = (): IUseDeleteUserService => {
	const fetchData = useFetchData();

	const deleteUser = async (
		userId: string,
		removeAllLinkedAccounts: boolean
	): Promise<{ status: "OK" } | undefined> => {
		const response = await fetchData({
			url: getApiUrl("/api/user"),
			method: "DELETE",
			query: {
				userId,
				removeAllLinkedAccounts: String(removeAllLinkedAccounts),
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
		deleteUser,
	};
};

export default useDeleteUserService;
