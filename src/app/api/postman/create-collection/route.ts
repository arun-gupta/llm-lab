import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const postmanApiKey = process.env.POSTMAN_API_KEY;
  
  if (!postmanApiKey) {
    return NextResponse.json({ 
      success: false, 
      message: 'Postman API key not configured',
      fallback: true 
    });
  }

  try {
    const { collection } = await request.json();

    const response = await fetch('https://api.getpostman.com/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': postmanApiKey,
      },
      body: JSON.stringify({
        collection: collection,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return NextResponse.json({
        success: true,
        collectionId: result.collection?.uid,
        collectionUrl: `https://go.postman.co/collection/${result.collection?.uid}`,
        message: 'Collection created successfully in Postman'
      });
    } else {
      const errorData = await response.json();
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create collection in Postman',
        error: errorData,
        fallback: true 
      });
    }
  } catch (error) {
    console.error('Error creating Postman collection:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error creating Postman collection',
      fallback: true 
    });
  }
}
