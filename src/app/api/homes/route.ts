import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '20';

  const apiRes = await fetch(
    `https://api-production.stickball.biz/zilo/propertiesfetch?page=${page}&limit=${limit}`,
    {
      headers: {
        'x-api-key': process.env.ZILO_API_KEY as string,
      },
    }
  );
  const data = await apiRes.json();

  // Optionally normalize/transform data here if needed
  return NextResponse.json(data, { status: apiRes.status });
} 