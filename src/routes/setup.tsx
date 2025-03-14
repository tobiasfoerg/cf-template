import { authClient } from "@/lib/auth/.client";
import type { Route } from "./+types/setup";

async function bootstrap() {
	const { data: user } = await authClient.signUp.email({
		email: "tobias.foerg@gmail.com",
		name: "Tobias Foerg",
		password: "Test1234!",
		firstName: "Tobias",
		lastName: "Foerg",
	});

	const result = await authClient.organization.create({
		name: "tobias-foerg",
		slug: "tobias-foerg",
		userId: user?.user.id,
	});
}

export default function Component(_: Route.ComponentProps) {
	return (
		<div>
			{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
			<button onClick={bootstrap}>Setup</button>
		</div>
	);
}
