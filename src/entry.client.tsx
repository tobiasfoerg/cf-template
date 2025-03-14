import * as React from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "dayjs/locale/de";
import "dayjs/locale/en";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

React.startTransition(() => {
	hydrateRoot(
		document,
		<React.StrictMode>
			<HydratedRouter />
		</React.StrictMode>,
	);
});
