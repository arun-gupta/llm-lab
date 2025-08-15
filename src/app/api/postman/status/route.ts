import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const postmanApiKey = process.env.POSTMAN_API_KEY;
  
  if (!postmanApiKey) {
    return NextResponse.json({ 
      success: false, 
      message: 'Postman API key not configured',
      configured: false
    });
  }

  try {
    // Test the Postman API key by fetching user info
    const response = await fetch('https://api.getpostman.com/me', {
      headers: {
        'X-API-Key': postmanApiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Postman API test failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return NextResponse.json({ 
        success: false, 
        message: `Postman API test failed: ${response.status} ${response.statusText}`,
        configured: true,
        error: errorData
      });
    }

    const userData = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Postman API key is valid',
      configured: true,
      user: {
        id: userData.user?.id,
        email: userData.user?.email,
        firstName: userData.user?.firstname,
        lastName: userData.user?.lastname
      }
    });
  } catch (error) {
    console.error('Error testing Postman API:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing Postman API connection',
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
