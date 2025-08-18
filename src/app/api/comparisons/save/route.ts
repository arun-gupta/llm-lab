import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const comparisonsDir = path.join(process.cwd(), 'data', 'comparisons');

// Ensure comparisons directory exists
const ensureComparisonsDir = () => {
  if (!fs.existsSync(comparisonsDir)) {
    fs.mkdirSync(comparisonsDir, { recursive: true });
  }
};

// Load all saved comparisons
const loadComparisons = () => {
  try {
    ensureComparisonsDir();
    const files = fs.readdirSync(comparisonsDir);
    const comparisons = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(comparisonsDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return comparisons;
  } catch (error) {
    console.error('Error loading comparisons:', error);
    return [];
  }
};

// Save a new comparison
const saveComparison = (comparisonData: any) => {
  try {
    ensureComparisonsDir();
    const filename = `comparison-${comparisonData.id}.json`;
    const filePath = path.join(comparisonsDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(comparisonData, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving comparison:', error);
    return false;
  }
};

export async function GET() {
  try {
    const comparisons = loadComparisons();
    return NextResponse.json(comparisons);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load comparisons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const comparisonData = await request.json();
    
    // Validate required fields
    if (!comparisonData.prompt || !comparisonData.responses || !Array.isArray(comparisonData.responses)) {
      return NextResponse.json(
        { error: 'Invalid comparison data: missing prompt or responses' },
        { status: 400 }
      );
    }
    
    // Add metadata if not present
    if (!comparisonData.metadata) {
      comparisonData.metadata = {
        totalResponses: comparisonData.responses.length,
        successfulResponses: comparisonData.responses.filter((r: any) => !r.error).length,
        totalTokens: comparisonData.responses.reduce((sum: number, r: any) => sum + (r.tokens?.total || 0), 0),
        avgLatency: comparisonData.responses.reduce((sum: number, r: any) => sum + r.latency, 0) / comparisonData.responses.length
      };
    }
    
    if (saveComparison(comparisonData)) {
      return NextResponse.json({
        success: true,
        id: comparisonData.id,
        message: 'Comparison saved successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save comparison' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid comparison data' },
      { status: 400 }
    );
  }
}
