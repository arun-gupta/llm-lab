import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { collection, name } = await request.json();

    // Method 1: Try using Postman Desktop via file system integration
    try {
      const fs = require('fs');
      const path = require('path');
      const os = require('os');
      
      // Get Postman collections directory based on OS
      let postmanCollectionsDir;
      const platform = os.platform();
      
      if (platform === 'darwin') { // macOS
        // Try multiple possible Postman directories
        const possiblePaths = [
          path.join(os.homedir(), 'Library', 'Application Support', 'Postman', 'Collections'),
          path.join(os.homedir(), 'Library', 'Application Support', 'Postman', 'app', 'Collections'),
          path.join(os.homedir(), 'Library', 'Application Support', 'Postman', 'app-*', 'Collections'),
          path.join(os.homedir(), 'Documents', 'Postman', 'Collections')
        ];
        
        // Find the first existing directory
        for (const dir of possiblePaths) {
          if (fs.existsSync(dir)) {
            postmanCollectionsDir = dir;
            break;
          }
        }
        
        // If none exist, use the default
        if (!postmanCollectionsDir) {
          postmanCollectionsDir = path.join(os.homedir(), 'Library', 'Application Support', 'Postman', 'Collections');
        }
      } else if (platform === 'win32') { // Windows
        postmanCollectionsDir = path.join(os.homedir(), 'AppData', 'Roaming', 'Postman', 'Collections');
      } else { // Linux
        postmanCollectionsDir = path.join(os.homedir(), '.config', 'Postman', 'Collections');
      }
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(postmanCollectionsDir)) {
        fs.mkdirSync(postmanCollectionsDir, { recursive: true });
      }
      
      // Save collection to Postman's collections directory
      const collectionFileName = `${name || 'GraphRAG API Collection'}.json`;
      const collectionFilePath = path.join(postmanCollectionsDir, collectionFileName);
      
      // Ensure the collection has the correct Postman format
      const postmanCollection = {
        ...collection,
        info: {
          ...collection.info,
          name: name || 'GraphRAG API Collection',
          description: 'Generated from LLM Prompt Lab GraphRAG functionality',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        }
      };
      
      fs.writeFileSync(collectionFilePath, JSON.stringify(postmanCollection, null, 2));
      
      console.log(`Collection saved to: ${collectionFilePath}`);
      console.log(`Directory exists: ${fs.existsSync(postmanCollectionsDir)}`);
      console.log(`File exists: ${fs.existsSync(collectionFilePath)}`);
      
      return NextResponse.json({
        success: true,
        message: `Collection saved to Postman collections directory. Check your Collections tab in Postman Desktop.`,
        filePath: collectionFilePath,
        directory: postmanCollectionsDir
      });
    } catch (error) {
      console.log('Postman Desktop file system integration not available:', error.message);
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

      // Use Postman CLI to import (try different command variations)
      let stdout, stderr;
      try {
        // Try newman CLI first
        const result = await execAsync(`newman run ${tempFile} --dry-run`);
        stdout = result.stdout;
        stderr = result.stderr;
      } catch (error) {
        try {
          // Try postman CLI if available
          const result = await execAsync(`postman collection import ${tempFile}`);
          stdout = result.stdout;
          stderr = result.stderr;
        } catch (error2) {
          // Try with full path to postman executable
          const result = await execAsync(`/Applications/Postman.app/Contents/MacOS/Postman --import ${tempFile}`);
          stdout = result.stdout;
          stderr = result.stderr;
        }
      }
      
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

    // Method 3: Try to copy to clipboard and provide instructions
    try {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      // Try to copy collection JSON to clipboard
      const collectionJson = JSON.stringify(collection, null, 2);
      const platform = require('os').platform();
      
      if (platform === 'darwin') { // macOS
        await execAsync(`echo '${collectionJson.replace(/'/g, "'\"'\"'")}' | pbcopy`);
      } else if (platform === 'win32') { // Windows
        await execAsync(`echo '${collectionJson.replace(/'/g, "'\"'\"'")}' | clip`);
      } else { // Linux
        await execAsync(`echo '${collectionJson.replace(/'/g, "'\"'\"'")}' | xclip -selection clipboard`);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Collection copied to clipboard! Paste in Postman Desktop Import → Raw text.',
        collection: collection,
        instructions: [
          '1. Open Postman Desktop',
          '2. Click "Import" button',
          '3. Select "Raw text" tab',
          '4. Paste the collection (already copied to clipboard)',
          '5. Click "Continue" and "Import"'
        ]
      });
    } catch (error) {
      // Method 4: Return collection data for manual import
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
    }

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
