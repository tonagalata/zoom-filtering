import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    
    // Get the API key from environment variables
    const validApiKey = process.env.ZOOM_FILTER_API_KEY;
    
    if (!validApiKey) {
      return NextResponse.json(
        { error: "API key not configured on server" },
        { status: 500 }
      );
    }
    
    if (apiKey === validApiKey) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
} 