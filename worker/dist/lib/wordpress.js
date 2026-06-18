"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPosts = getPosts;
exports.getPostBySlug = getPostBySlug;
exports.getCategories = getCategories;
exports.getCategoryBySlug = getCategoryBySlug;
exports.getFeaturedImage = getFeaturedImage;
exports.getPostCategories = getPostCategories;
exports.formatDate = formatDate;
const WP_BASE = process.env.WORDPRESS_API_URL || "https://cms.getabarrel.com/wp-json/wp/v2";
async function wpFetch(path) {
    const res = await fetch(`${WP_BASE}${path}`, { next: { revalidate: 60 } });
    if (!res.ok)
        throw new Error(`WordPress API error: ${res.status} ${path}`);
    return res.json();
}
async function getPosts(params) {
    const { page = 1, perPage = 12, categoryId } = params ?? {};
    const qs = new URLSearchParams({
        _embed: "1",
        per_page: String(perPage),
        page: String(page),
    });
    if (categoryId)
        qs.set("categories", String(categoryId));
    const res = await fetch(`${WP_BASE}/posts?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok)
        throw new Error(`WordPress API error: ${res.status}`);
    const posts = (await res.json());
    return {
        posts,
        total: Number(res.headers.get("x-wp-total") ?? 0),
        totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
    };
}
async function getPostBySlug(slug) {
    const posts = await wpFetch(`/posts?slug=${encodeURIComponent(slug)}&_embed=1`);
    return posts[0] ?? null;
}
async function getCategories() {
    return wpFetch("/categories?per_page=100&hide_empty=true");
}
async function getCategoryBySlug(slug) {
    const cats = await wpFetch(`/categories?slug=${encodeURIComponent(slug)}`);
    return cats[0] ?? null;
}
function getFeaturedImage(post) {
    const media = post._embedded?.["wp:featuredmedia"]?.[0];
    if (!media)
        return null;
    return { src: media.source_url, alt: media.alt_text || "" };
}
function getPostCategories(post) {
    return post._embedded?.["wp:term"]?.[0] ?? [];
}
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
