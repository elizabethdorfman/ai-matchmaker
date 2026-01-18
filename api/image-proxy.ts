// Image proxy endpoint to fetch Instagram images server-side
// This bypasses CORS restrictions by fetching images on the server

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Support both GET (query param) and POST (body) for flexibility
  const url = req.method === 'POST' ? req.body?.url : req.query?.url;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  // Only allow Instagram CDN URLs for security
  if (!url.includes('cdninstagram.com') && !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Only Instagram URLs are allowed' });
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-proxy.ts:21',message:'Server-side fetch attempt',data:{url:url.substring(0,100),hasUserAgent:true,hasReferer:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Fetch the image from Instagram CDN with proper headers
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.instagram.com/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
    });

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-proxy.ts:32',message:'Server-side fetch response',data:{status:imageResponse.status,statusText:imageResponse.statusText,ok:imageResponse.ok,headers:Object.fromEntries(imageResponse.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!imageResponse.ok) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-proxy.ts:37',message:'Server-side fetch failed',data:{status:imageResponse.status,statusText:imageResponse.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      return res.status(imageResponse.status).json({ 
        error: 'Failed to fetch image',
        status: imageResponse.status,
      });
    }

    // Get the image content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Get the image buffer
    const imageBuffer = await imageResponse.arrayBuffer();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-proxy.ts:48',message:'Server-side fetch success',data:{contentType,imageSize:imageBuffer.byteLength},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    // Set appropriate headers and send the image
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // Cache for 1 year
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    return res.send(Buffer.from(imageBuffer));
  } catch (error: any) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/51b1e6f8-6338-4739-93b2-63c60587f8e9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'image-proxy.ts:56',message:'Server-side fetch exception',data:{error:error.message,errorType:error.name,stack:error.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    console.error('Error proxying image:', error);
    return res.status(500).json({ 
      error: 'Failed to proxy image',
      message: error.message,
    });
  }
}

