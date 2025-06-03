import { after } from "next/server.js";

interface Post {
	id: string;
	title: string;
	content: string;
	date: string;
}

export const revalidate = 20;

export const dynamicParams = true; // or false, to 404 on unknown paths

export async function generateStaticParams() {
	const posts: Post[] = await fetch("https://api.vercel.app/blog").then((res) => res.json());
	return posts.map((post) => ({
		id: String(post.id),
	}));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const date = new Date().toISOString();
	const post: Post = await fetch(`https://api.vercel.app/blog/${id}`).then((res) => res.json());
	after(() => {
		// Execute after the layout is rendered and sent to the user
	});
	return (
		<main>
			<h1>{post.title}</h1>
			<p>{post.content}</p>
			<p>{date}</p>
		</main>
	);
}
