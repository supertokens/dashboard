import { ImplType } from "./types";
import { OverrideableBuilder } from "supertokens-js-override";

export class Implementation implements ImplType<Implementation> {
	static instance: Implementation | undefined;

	static init(config: {
		override?: (
			originalImplementation: Implementation,
			builder: OverrideableBuilder<ImplType<Implementation>>
		) => Implementation;
	}): void {
		if (Implementation.instance) {
			return;
		}

		const implementation = new Implementation();
		const builder = new OverrideableBuilder<ImplType<Implementation>>(implementation);
		if (config.override) {
			builder.override(config.override);
		}
		Implementation.instance = builder.build();
	}

	static getInstanceOrThrow(): Implementation {
		if (!Implementation.instance) {
			throw new Error("Implementation instance not found. Make sure you have initialized the plugin.");
		}

		return Implementation.instance;
	}

	static reset(): void {
		Implementation.instance = undefined;
	}

	constructor() {}

	testMethod = async function (this: Implementation): Promise<boolean> {
		// console.log("og testMethod");
		return true;
	};
}
