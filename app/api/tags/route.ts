import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const TAGS_KEY = 'entrepreneurs-mixer-tags';

// For local development without Vercel KV, we use a simple in-memory store
// This will be replaced by Vercel KV in production
let localTags: any[] = [];

const isVercelKVConfigured = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
};

// GET - Fetch all tags
export async function GET() {
  try {
    if (isVercelKVConfigured()) {
      const tags = await kv.get(TAGS_KEY);
      return NextResponse.json({ tags: tags || [] });
    } else {
      // Local development fallback
      return NextResponse.json({ tags: localTags });
    }
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ tags: localTags });
  }
}

// POST - Save all tags
export async function POST(request: NextRequest) {
  try {
    const { tags } = await request.json();
    
    if (!Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

    if (isVercelKVConfigured()) {
      await kv.set(TAGS_KEY, tags);
    } else {
      // Local development fallback
      localTags = tags;
    }

    return NextResponse.json({ success: true, count: tags.length });
  } catch (error) {
    console.error('Error saving tags:', error);
    return NextResponse.json({ error: 'Failed to save tags' }, { status: 500 });
  }
}

// DELETE - Clear all tags
export async function DELETE() {
  try {
    if (isVercelKVConfigured()) {
      await kv.del(TAGS_KEY);
    } else {
      localTags = [];
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tags:', error);
    return NextResponse.json({ error: 'Failed to delete tags' }, { status: 500 });
  }
}
