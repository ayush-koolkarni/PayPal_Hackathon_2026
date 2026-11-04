import { Request, Response } from 'express';

const SVG_FALLBACK = `
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
  <rect width="400" height="400" fill="#0E111B"/>
  <rect x="1" y="1" width="398" height="398" rx="15" stroke="#1C2133" stroke-width="2"/>
  <circle cx="200" cy="180" r="50" fill="#141724" stroke="#2A3048" stroke-width="2"/>
  <path d="M185 170L200 155L215 170M200 155V195" stroke="#00F0FF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="200" y="260" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#94A3B8" text-anchor="middle">Product Visual</text>
  <text x="200" y="282" font-family="Inter, sans-serif" font-size="11" fill="#475569" text-anchor="middle">Verified Regional Store Offering</text>
</svg>
`.trim();

export async function handleImageProxy(req: Request, res: Response): Promise<void> {
  const imageUrl = req.query.url as string;

  if (!imageUrl || typeof imageUrl !== 'string') {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(SVG_FALLBACK);
    return;
  }

  // Validate URL protocol
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(SVG_FALLBACK);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': `${parsed.protocol}//${parsed.hostname}/`,
    };

    const response = await fetch(imageUrl, {
      headers,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(SVG_FALLBACK);
      return;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Verify it's indeed an image
    if (!contentType.startsWith('image/')) {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.status(200).send(SVG_FALLBACK);
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    res.setHeader('Content-Length', buffer.length.toString());
    res.status(200).send(buffer);
  } catch (err) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.status(200).send(SVG_FALLBACK);
  }
}
