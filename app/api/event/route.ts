import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { FaceBox } from '@/lib/store';

const DB_PATH = path.join(process.cwd(), 'lib', 'db.json');

// Helper to read DB
function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    return { imageUrl: '/event-photo.jpeg', faces: [] };
  }
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Helper to write DB
function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = readDb();
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // body should contain { imageUrl, faces }
    
    const currentData = readDb();
    
    // Merge faces intelligently: update existing faces by ID, add new ones
    const existingFaceIds = new Set(currentData.faces?.map((f: FaceBox) => f.id) || []);
    const incomingFaces = body.faces || [];
    
    const mergedFaces = [
      ...(currentData.faces || []).map((existingFace: FaceBox) => {
        const updated = incomingFaces.find((f: FaceBox) => f.id === existingFace.id);
        return updated || existingFace;
      }),
      ...incomingFaces.filter((f: FaceBox) => !existingFaceIds.has(f.id))
    ];
    
    const newData = {
      imageUrl: body.imageUrl || currentData.imageUrl || '/event-photo.jpeg',
      faces: mergedFaces,
    };
    
    writeDb(newData);
    
    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
