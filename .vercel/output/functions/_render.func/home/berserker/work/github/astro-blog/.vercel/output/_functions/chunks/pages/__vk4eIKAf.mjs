/* empty css                          */
import { e as createAstro, f as createComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as renderComponent } from '../astro_1EME-aGG.mjs';
import 'kleur/colors';
import { f as formatDate, a as getCollection, c as capitalize, $ as $$MainLayout } from './404_CF96-D0t.mjs';
import { $ as $$Tags } from './__IXyC34pn.mjs';

const $$Astro$1 = createAstro();
const $$ArticleCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ArticleCard;
  const { blog } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<div class="max-w-md mx-auto mt-10"> <div class="bg-white rounded-lg overflow-hidden shadow-lg"> <a${addAttribute("/articles/" + blog.slug, "href")}> <img${addAttribute("/images/" + blog.data.image, "src")} alt="Article Image" class="w-full h-48 object-cover hover:opacity-75 transition duration-300 ease-in-out"> </a> <div class="p-6"> <h2 class="text-2xl font-semibold mb-2"> <a${addAttribute("/articles/" + blog.slug, "href")}>${blog.data.title}</a> </h2> <p class="text-gray-600 text-sm mb-4"> ${formatDate(blog.data.pubDate)} </p> ${renderComponent($$result, "Tags", $$Tags, { "tags": blog.data.tags })} </div> </div> </div>`;
}, "/home/berserker/work/github/astro-blog/src/components/ArticleCard.astro", void 0);

const $$Astro = createAstro();
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { tag } = Astro2.params;
  if (tag === void 0) {
    throw new Error("Tag is required");
  }
  const allBlogArticles = (await getCollection("blog")).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const tagAllArticles = allBlogArticles.filter(
    (blog) => blog.data.tags.includes(tag)
  );
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, {}, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<a href="/articles" class="inline-block bg-gray-100 p-2 mb-6 hover:bg-indigo-500 hover:text-white">Back To Articles</a> <h1 class="text-2xl pb-3">#${capitalize(tag)}</h1> <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"> ${tagAllArticles.map((blog) => renderTemplate`${renderComponent($$result2, "ArticleCard", $$ArticleCard, { "blog": blog })}`)} </div> ` })}`;
}, "/home/berserker/work/github/astro-blog/src/pages/articles/tag/[...tag].astro", void 0);

const $$file = "/home/berserker/work/github/astro-blog/src/pages/articles/tag/[...tag].astro";
const $$url = "/articles/tag/[...tag]";

const ____tag_ = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

export { $$ArticleCard as $, ____tag_ as _ };
