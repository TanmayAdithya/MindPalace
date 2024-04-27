import { type APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

const allBlogArticles: CollectionEntry<'blog'>[] = await getCollection('blog');

export const GET: APIRoute = async ({ url }): Promise<Response> => {
  const query: string | null = url.searchParams.get('query');

  // query doesn't exist

  if (query == null) {
    return new Response(
      JSON.stringify({
        error: 'query param is missing',
      }),
      {
        status: 400,
        headers: {
          'Content-type': 'application-json',
        },
      }
    );
  }

  const searchResults = allBlogArticles.filter((blog) => {
    const titleMatch: boolean = blog.data.title
      .toLowerCase()
      .includes(query?.toLowerCase());

    const bodyMatch: boolean = blog.body
      .toLowerCase()
      .includes(query?.toLowerCase());

    const slugMatch: boolean = blog.slug
      .toLowerCase()
      .includes(query?.toLowerCase());

    return titleMatch || bodyMatch || slugMatch;
  });

  return new Response(JSON.stringify(searchResults), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
