import { XMLParser } from 'fast-xml-parser';

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    published: string;
}

const CHANNEL_ID = 'UCFf4Zbap_oELqdAsA4nOjqQ';
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

export async function getLatestYouTubeVideos(limit = 10): Promise<YouTubeVideo[]> {
    try {
        const res = await fetch(RSS_URL, {
            next: { revalidate: 86400 }, // Revalidate every 24 hours
        });

        if (!res.ok) {
            console.error('Failed to fetch YouTube RSS feed:', res.status);
            return [];
        }

        const xml = await res.text();
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
        });

        const parsed = parser.parse(xml);
        const entries = parsed?.feed?.entry;

        if (!entries) return [];

        const videos: YouTubeVideo[] = (Array.isArray(entries) ? entries : [entries])
            .slice(0, limit)
            .map((entry: Record<string, unknown>) => {
                const videoId = (entry['yt:videoId'] as string) || '';
                return {
                    id: videoId,
                    title: (entry.title as string) || '',
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                    published: (entry.published as string) || '',
                };
            });

        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        return [];
    }
}
