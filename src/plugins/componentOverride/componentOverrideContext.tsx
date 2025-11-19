import React from "react";

import type { GenericComponentOverrideMap } from "./types";

export const ComponentOverrideContext = React.createContext<GenericComponentOverrideMap | "IS_DEFAULT">("IS_DEFAULT");
