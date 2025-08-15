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
    const { collection, environment, createInWeb = true } = await request.json();

    console.log('Creating Postman collection:', {
      collectionName: collection.info?.name,
      createInWeb,
      hasEnvironment: !!environment
    });

    // Create collection first
    const collectionResponse = await fetch('https://api.getpostman.com/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': postmanApiKey,
      },
      body: JSON.stringify({
        collection: collection,
      }),
    });

    if (!collectionResponse.ok) {
      const errorData = await collectionResponse.json();
      console.error('Postman API error:', {
        status: collectionResponse.status,
        statusText: collectionResponse.statusText,
        error: errorData
      });
      return NextResponse.json({ 
        success: false, 
        message: `Failed to create collection in Postman: ${collectionResponse.status} ${collectionResponse.statusText}`,
        error: errorData,
        fallback: true 
      });
    }

    const collectionResult = await collectionResponse.json();
    const collectionId = collectionResult.collection?.uid;

    // Create environment if provided
    let environmentId = null;
    if (environment) {
      try {
        const environmentResponse = await fetch('https://api.getpostman.com/environments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': postmanApiKey,
          },
          body: JSON.stringify({
            environment: environment,
          }),
        });

        if (environmentResponse.ok) {
          const environmentResult = await environmentResponse.json();
          environmentId = environmentResult.environment?.uid;
        }
      } catch (envError) {
        console.warn('Failed to create environment, but collection was created:', envError);
        // Continue without environment - collection is more important
      }
    }

    // Return appropriate URL based on agent selection
    const collectionUrl = createInWeb 
      ? `https://go.postman.co/collection/${collectionId}`
      : `postman://collection/${collectionId}`;
    
    const environmentUrl = environmentId ? (createInWeb 
      ? `https://go.postman.co/environment/${environmentId}`
      : `postman://environment/${environmentId}`) : null;
    
    return NextResponse.json({
      success: true,
      collectionId: collectionId,
      collectionUrl: collectionUrl,
      environmentId: environmentId,
      environmentUrl: environmentUrl,
      message: environmentId 
        ? `Collection and environment created successfully in Postman ${createInWeb ? 'Web' : 'Desktop'}`
        : `Collection created successfully in Postman ${createInWeb ? 'Web' : 'Desktop'} (environment creation failed)`
    });
  } catch (error) {
    console.error('Error creating Postman collection:', error);
    return NextResponse.json({ 
      success: false, 
      message: `Error creating Postman collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      fallback: true,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
