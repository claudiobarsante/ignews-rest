import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import styles from './../../styles/pages/posts.module.scss';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

type Post = {
	slug: string;
	title: string;
	excerpt: string;
	updatedAt: string;
};

type Props = {
	posts: Post[];
};
export default function Posts({ posts }: Props) {
	return (
		<>
			<Head>
				<title>Posts | Ignews</title>
			</Head>
			<main className={styles['container']}>
				<section className={styles['posts']}>
					{posts.map(post => (
						<Link key={post.slug} href={`/posts/${post.slug}`}>
							<a className={styles['post-link']}>
								<time className={styles['post-link__time']}>{post.updatedAt}</time>
								<strong className={styles['post-link__title']}>{post.title}</strong>
								<p className={styles['post-link__brief-description']}>{post.excerpt}</p>
							</a>
						</Link>
					))}
				</section>
			</main>
		</>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const prismic = getPrismicClient();

	const response = await prismic.query([Prismic.predicates.at('document.type', 'post')], {
		fetch: ['post.title', 'post.content'],
		pageSize: 100,
	});
	// -- IMPORTANT : format all data that's needs formatation(currency,numbers,dates,price...)
	// -- on the server side, because if you do it on the client side
	// -- everytime that the page is accessed, the data will be formatted again !
	// -- if you can do it on the server side, do it because the data will be formatted only once !
	//console.log('response', JSON.stringify(response, null, 2));
	const posts = response.results.map(post => {
		return {
			slug: post.uid,
			title: RichText.asText(post.data.title),
			// -- try to find the first paragraph otherwise return ''
			excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
			updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
			}),
		};
	});
	return {
		props: { posts },
		//revalidate: 60 * 60 * 24, //24 hours - revalidate is in seconds, so 60sec * 60 min * 24 hours
	};
};
