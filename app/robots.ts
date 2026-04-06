import type { MetadataRoute } from 'next';

const BASE_URL = 'https://smilingwestjava.official.id';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard/admin/', '/api/admin/'],
        },
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
