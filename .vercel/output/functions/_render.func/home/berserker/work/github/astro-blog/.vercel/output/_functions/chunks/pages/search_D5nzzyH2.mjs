import { a as getCollection } from './404_CF96-D0t.mjs';

const allBlogArticles = await getCollection("blog");
const GET = async ({ url }) => {
  const query = url.searchParams.get("query");
  if (query == null) {
    return new Response(
      JSON.stringify({
        error: "query param is missing"
      }),
      {
        status: 400,
        headers: {
          "Content-type": "application-json"
        }
      }
    );
  }
  const searchResults = allBlogArticles.filter((blog) => {
    const titleMatch = blog.data.title.toLowerCase().includes(query?.toLowerCase());
    const bodyMatch = blog.body.toLowerCase().includes(query?.toLowerCase());
    const slugMatch = blog.slug.toLowerCase().includes(query?.toLowerCase());
    return titleMatch || bodyMatch || slugMatch;
  });
  return new Response(JSON.stringify(searchResults), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

export { GET };
