"use server";

import { revalidatePath } from "next/cache";
import { redisClient } from "./redis-client";
import { Feature } from "./types";

export async function saveFeature(feature: Feature, formData: FormData) {
	const newFeature = {
		...feature,
		title: formData.get("feature") as string,
	};
	await redisClient.hset(
		`item:${newFeature.id}`,
		...Object.entries(newFeature).flatMap(([key, value]) => [key, String(value)]),
	);

	await redisClient.zadd("items_by_score", newFeature.score, newFeature.id);

	revalidatePath("/");
}

export async function saveEmail(formData: FormData) {
	const email = formData.get("email");

	function validateEmail(email: FormDataEntryValue) {
		const re =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(String(email).toLowerCase());
	}

	if (email && validateEmail(email)) {
		await redisClient.sadd("emails", email.toString());
		revalidatePath("/");
	}
}

export async function upvote(feature: Feature) {
	const newScore = Number(feature.score) + 1;
	await redisClient.hset(
		`item:${feature.id}`,
		...Object.entries({ ...feature, score: newScore }).flatMap(([key, value]) => [
			key,
			String(value),
		]),
	);

	await redisClient.zadd("items_by_score", newScore, feature.id);

	revalidatePath("/");
}
