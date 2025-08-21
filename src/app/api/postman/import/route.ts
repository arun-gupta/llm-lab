import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { collection, name } = await request.json();

    // Postman Desktop API endpoints
    const POSTMAN_API_BASE = 'http://localhost:3000'; // Postman Desktop default port
    const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY; // Optional: if user has API key

    // Method 1: Try using Postman Desktop API (if available)
    try {
      const postmanResponse = await fetch(`${POSTMAN_API_BASE}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(POSTMAN_API_KEY && { 'X-API-Key': POSTMAN_API_KEY }),
        },
        body: JSON.stringify({
          collection: {
            ...collection,
            info: {
              ...collection.info,
              name: name || 'GraphRAG API Collection',
              description: 'Generated from LLM Prompt Lab GraphRAG functionality'
            }
          }
        }),
      });

      if (postmanResponse.ok) {
        const result = await postmanResponse.json();
        return NextResponse.json({
          success: true,
          message: 'Collection imported to Postman Desktop successfully',
          collectionId: result.collection?.id
        });
      }
    } catch (error) {
      console.log('Postman Desktop API not available, trying alternative methods');
    }

    // Method 2: Try using Postman CLI (if installed)
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      // Save collection to temp file
      const fs = require('fs');
      const path = require('path');
      const tempFile = path.join(process.cwd(), 'temp-collection.json');
      
      fs.writeFileSync(tempFile, JSON.stringify(collection, null, 2));

      // Use Postman CLI to import
      const { stdout, stderr } = await execAsync(`postman collection import ${tempFile}`);
      
      // Clean up temp file
      fs.unlinkSync(tempFile);

      if (!stderr) {
        return NextResponse.json({
          success: true,
          message: 'Collection imported via Postman CLI',
          output: stdout
        });
      }
    } catch (error) {
      console.log('Postman CLI not available');
    }

    // Method 3: Return collection data for manual import
    return NextResponse.json({
      success: false,
      message: 'Postman Desktop integration not available. Please import manually.',
      collection: collection,
      instructions: [
        '1. Open Postman Desktop',
        '2. Click "Import" button',
        '3. Select "Raw text" tab',
        '4. Paste the collection JSON below',
        '5. Click "Continue" and "Import"'
      ]
    });

  } catch (error) {
    console.error('Error importing to Postman:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to import collection to Postman',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
