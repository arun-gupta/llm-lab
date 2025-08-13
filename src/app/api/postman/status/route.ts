import { NextResponse } from 'next/server';

export async function GET() {
  const postmanApiKey = process.env.POSTMAN_API_KEY;
  
  if (!postmanApiKey) {
    return NextResponse.json({ 
      configured: false, 
      message: 'Postman API key not configured' 
    });
  }

  try {
    // Test the API key by making a simple request to Postman API
    const response = await fetch('https://api.getpostman.com/collections', {
      headers: {
        'X-API-Key': postmanApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({ 
        configured: true, 
        message: 'Postman API key is working' 
      });
    } else {
      return NextResponse.json({ 
        configured: false, 
        message: 'Postman API key is invalid' 
      });
    }
  } catch (error) {
    return NextResponse.json({ 
      configured: false, 
      message: 'Error testing Postman API key' 
    });
  }
}
