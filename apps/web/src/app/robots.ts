import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://timework.dev'; // Replace with actual domain in production or env var

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/'], // Example disallowed paths
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
