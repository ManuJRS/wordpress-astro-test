const domain = import.meta.env.WP_DOMAIN
const apiUrl = `${domain}/wp-json/wp/v2`

export const getPageInfo = async (slug: string) => {
    const response = await fetch(`${apiUrl}/pages?=${slug}`)
    if (!response.ok) throw new Error("Error en el fetching de data")

    const [data] = await response.json()
    const { title: { rendered: title }, content: { rendered: content } } = data

    return { title, content }
}

export const getAllPostsSlugs = async (): Promise<string[]> => {
    const response = await fetch(`${apiUrl}/posts?per_page=100`)
    if (!response.ok) throw new Error("Error en el fetching de data");

    const results = await response.json()
    if (!results.length) throw new Error("No se encontraron posts")

    const slugs = results.map((post: { slug: string }) => post.slug);
    return slugs
}

export const getPostInfo = async (slug: string) => {
    const response = await fetch(`${apiUrl}/posts?slug=${slug}`)
    if (!response.ok) throw new Error("Error en el fetching de data")

    const [data] = await response.json()
    const { title: { rendered: title }, content: { rendered: content }, yoast_head_json: seo } = data

    return { title, content, seo }
}

type WPPost = {
    title: { rendered: string };
    excerpt: { rendered: string };
    content: { rendered: string };
    date: string;
    slug: string;
    _embedded: {
        'wp:featuredmedia': Array<{ source_url: string }>;
    };
};

export const getLatestPosts = async ({ perPage = 10 }: { perPage?: number } = {}) => {
    const response = await fetch(`${apiUrl}/posts?per_page=${perPage}&_embed`);
    if (!response.ok) throw new Error("Error en el fetching de data");

    const results: WPPost[] = await response.json();
    if (!results.length) throw new Error("No hay posts para mostrar");

    const posts = results.map((post) => {
        const title = post.title.rendered;
        const excerpt = post.excerpt.rendered;
        const content = post.content.rendered;
        const { date, slug } = post;

        const feturedImage = post._embedded['wp:featuredmedia'][0].source_url;

        return { title, excerpt, content, date, slug, feturedImage };
    });

    return posts;
};


