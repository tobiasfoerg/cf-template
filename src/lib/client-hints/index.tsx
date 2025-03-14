import * as React from "react";
import { useRevalidator } from "react-router";

import { lazy } from "@/utils/lazy";
import { getHintUtils } from "@epic-web/client-hints";
import { clientHint as colorSchemeHint, subscribeToSchemeChange } from "@epic-web/client-hints/color-scheme";
import { clientHint as timezoneHint } from "@epic-web/client-hints/time-zone";
import { clientHint as deviceWidthHint, subscribeToWidthChange } from "./device-width";
import { clientHint as localeHint } from "./locale";

const hintsUtils = getHintUtils({
	timeZone: timezoneHint,
	locale: localeHint,
	theme: colorSchemeHint,
	deviceWidth: deviceWidthHint,
});

export const getHints = lazy(hintsUtils.getHints);

export function ClientHintCheck({ nonce }: { nonce?: string }) {
	const { revalidate } = useRevalidator();
	React.useEffect(() => {
		const unsubscribeToThemeChange = subscribeToSchemeChange(revalidate);
		const unsubscribeToWidthChange = subscribeToWidthChange(revalidate);

		return () => {
			unsubscribeToThemeChange();
			unsubscribeToWidthChange();
		};
	}, [revalidate]);

	return (
		<script
			nonce={nonce}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
			dangerouslySetInnerHTML={{
				__html: hintsUtils.getClientHintCheckScript(),
			}}
		/>
	);
}
