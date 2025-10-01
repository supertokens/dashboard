export class ForbiddenError extends Error {
	statusCode = 403;
	status = "FORBIDDEN_REQUEST";
	constructor(message: string) {
		super(message);
	}

	static isThisError(err: any): boolean {
		return err.status === "FORBIDDEN_REQUEST";
	}
}
