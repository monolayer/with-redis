import { saveEmail } from "./actions";
import FeatureForm from "./form";
import { redisClient } from "./redis-client";
import type { Feature } from "./types";

export const metadata = {
	title: "Next.js and Redis workload example",
	description: "Feature roadmap example with Next.js with Redis.",
};

export const dynamic = "force-dynamic";

async function getFeatures() {
	try {
		const itemIds = await redisClient.zrevrange("items_by_score", 0, 100);

		if (!itemIds.length) {
			return [];
		}

		const pipeline = redisClient.pipeline();
		itemIds.forEach((id) => {
			pipeline.hgetall(`item:${id}`);
		});
		const results = await pipeline.exec();
		const items: Feature[] = (results ?? []).map(([err, result]) => {
			if (err) throw err;
			return result as Feature;
		});

		return items.map((item) => {
			return {
				...item,
				score: item.score,
				created_at: item.created_at,
			};
		});
	} catch (error) {
		console.error(error);
		return [];
	}
}

export default async function Page() {
	const features = await getFeatures();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
				<h1 className="text-lg sm:text-2xl font-bold mb-2">Help us prioritize our roadmap</h1>
				<h2 className="text-md sm:text-xl mx-4">
					Create or vote up features you want to see in our product.
				</h2>
				<div className="flex flex-wrap items-center justify-around max-w-4xl my-8 sm:w-full bg-white rounded-md shadow-xl h-full border border-gray-100">
					<FeatureForm features={features} />
					<hr className="border-1 border-gray-200 my-8 mx-8 w-full" />
					<div className="mx-8 w-full">
						<p className="flex text-gray-500">
							Leave your email address here to be notified when feature requests are released.
						</p>
						<form className="relative my-4" action={saveEmail}>
							<input
								name="email"
								aria-label="Email for updates"
								placeholder="Email Address"
								type="email"
								autoComplete="email"
								maxLength={60}
								required
								className="px-3 py-3 mt-1 text-lg block w-full border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
							/>
							<button
								className="flex items-center justify-center absolute right-2 top-2 px-4 h-10 border border-gray-200 text-gray-900 rounded-md w-14 focus:outline-none focus:ring focus:ring-blue-300 focus:bg-gray-100"
								type="submit"
							>
								OK
							</button>
						</form>
					</div>
				</div>
			</main>
		</div>
	);
}
