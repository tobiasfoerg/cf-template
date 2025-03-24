export type InstrumentationConfig = {
	service: {
		name: string;
		version: string;
		namespace: string;
	};
	endpoint: string;
	instrumentation?: {
		cache?: boolean;
		fetch?: boolean;
	};
};
