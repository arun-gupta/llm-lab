import axios from 'axios';
import * as natural from 'natural';

export interface FactCheckResult {
  accuracy: number;
  confidence: number;
  issues: string[];
  verifiedFacts: string[];
  unverifiedClaims: string[];
  contradictions: string[];
}

export interface ExtractedClaim {
  text: string;
  type: 'fact' | 'statistic' | 'claim' | 'opinion';
  confidence: number;
}

export class FactChecker {
  private tokenizer = new natural.WordTokenizer();
  private tfidf = new natural.TfIdf();

  /**
   * Main fact-checking method that analyzes response accuracy
   */
  async checkAccuracy(response: string, prompt: string): Promise<FactCheckResult> {
    try {
      // Extract claims from the response
      const claims = this.extractClaims(response);
      
      // Check each claim against knowledge bases
      const claimResults = await Promise.all(
        claims.map(claim => this.verifyClaim(claim))
      );

      // Calculate overall accuracy score
      const accuracy = this.calculateOverallAccuracy(claimResults);
      
      // Identify issues and contradictions
      const issues = this.identifyIssues(claimResults);
      const contradictions = this.findContradictions(claimResults);
      
      // Separate verified and unverified claims
      const verifiedFacts = claimResults
        .filter(result => result.verified)
        .map(result => result.claim.text);
      
      const unverifiedClaims = claimResults
        .filter(result => !result.verified)
        .map(result => result.claim.text);

      return {
        accuracy,
        confidence: this.calculateConfidence(claimResults),
        issues,
        verifiedFacts,
        unverifiedClaims,
        contradictions
      };
    } catch (error) {
      console.error('Fact checking error:', error);
      return {
        accuracy: 0.5, // Neutral score on error
        confidence: 0.3,
        issues: ['Fact checking service unavailable'],
        verifiedFacts: [],
        unverifiedClaims: [],
        contradictions: []
      };
    }
  }

  /**
   * Extract factual claims from the response
   */
  private extractClaims(response: string): ExtractedClaim[] {
    const claims: ExtractedClaim[] = [];
    const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
      const claim = this.analyzeSentence(sentence);
      if (claim) {
        claims.push(claim);
      }
    }

    return claims;
  }

  /**
   * Analyze a sentence to determine if it contains a factual claim
   */
  private analyzeSentence(sentence: string): ExtractedClaim | null {
    const cleanSentence = sentence.trim();
    if (cleanSentence.length < 10) return null;

    // Skip opinion statements
    if (this.isOpinion(cleanSentence)) return null;

    // Identify claim types
    if (this.isFactualClaim(cleanSentence)) {
      return {
        text: cleanSentence,
        type: 'fact',
        confidence: this.calculateClaimConfidence(cleanSentence)
      };
    }

    if (this.isStatistic(cleanSentence)) {
      return {
        text: cleanSentence,
        type: 'statistic',
        confidence: this.calculateClaimConfidence(cleanSentence)
      };
    }

    if (this.isGeneralClaim(cleanSentence)) {
      return {
        text: cleanSentence,
        type: 'claim',
        confidence: this.calculateClaimConfidence(cleanSentence)
      };
    }

    return null;
  }

  /**
   * Check if a sentence is an opinion rather than a fact
   */
  private isOpinion(sentence: string): boolean {
    const opinionIndicators = [
      'i think', 'i believe', 'in my opinion', 'i feel', 'i would say',
      'it seems', 'appears', 'might be', 'could be', 'possibly',
      'probably', 'maybe', 'perhaps', 'i guess', 'i suppose'
    ];

    const lowerSentence = sentence.toLowerCase();
    return opinionIndicators.some(indicator => lowerSentence.includes(indicator));
  }

  /**
   * Check if a sentence contains a factual claim
   */
  private isFactualClaim(sentence: string): boolean {
    const factualIndicators = [
      'is', 'are', 'was', 'were', 'has', 'have', 'had',
      'contains', 'includes', 'consists of', 'comprises',
      'located in', 'found in', 'discovered', 'invented',
      'created', 'established', 'founded', 'developed'
    ];

    const lowerSentence = sentence.toLowerCase();
    return factualIndicators.some(indicator => lowerSentence.includes(indicator));
  }

  /**
   * Check if a sentence contains statistics
   */
  private isStatistic(sentence: string): boolean {
    const hasNumbers = /\d+/.test(sentence);
    const hasPercentage = /%|percent|percentage/i.test(sentence);
    const hasUnits = /million|billion|thousand|hundred|dozen|score/i.test(sentence);
    
    return hasNumbers && (hasPercentage || hasUnits);
  }

  /**
   * Check if a sentence contains a general claim
   */
  private isGeneralClaim(sentence: string): boolean {
    const claimIndicators = [
      'causes', 'leads to', 'results in', 'affects', 'impacts',
      'influences', 'determines', 'controls', 'regulates',
      'prevents', 'enables', 'allows', 'requires', 'needs'
    ];

    const lowerSentence = sentence.toLowerCase();
    return claimIndicators.some(indicator => lowerSentence.includes(indicator));
  }

  /**
   * Calculate confidence level for a claim
   */
  private calculateClaimConfidence(sentence: string): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for specific details
    if (/\d{4}/.test(sentence)) confidence += 0.2; // Years
    if (/\d+%/.test(sentence)) confidence += 0.15; // Percentages
    if (/study|research|paper|journal/i.test(sentence)) confidence += 0.1; // Citations
    if (/according to|as stated by|reported by/i.test(sentence)) confidence += 0.1; // Sources

    // Lower confidence for vague statements
    if (/many|some|few|several/i.test(sentence)) confidence -= 0.1;
    if (/often|sometimes|rarely/i.test(sentence)) confidence -= 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Verify a claim against knowledge bases
   */
  private async verifyClaim(claim: ExtractedClaim): Promise<{
    claim: ExtractedClaim;
    verified: boolean;
    confidence: number;
    source?: string;
    contradiction?: string;
  }> {
    try {
      // Use Wikipedia API for factual verification
      const wikiResult = await this.checkWikipedia(claim.text);
      
      // Use Wolfram Alpha for mathematical/statistical verification
      const wolframResult = await this.checkWolframAlpha(claim.text);
      
      // Use Google Knowledge Graph for entity verification
      const knowledgeResult = await this.checkKnowledgeGraph(claim.text);

      // Combine results
      const verified = wikiResult.verified || wolframResult.verified || knowledgeResult.verified;
      const confidence = Math.max(wikiResult.confidence, wolframResult.confidence, knowledgeResult.confidence);
      
      return {
        claim,
        verified,
        confidence,
        source: wikiResult.source || wolframResult.source || knowledgeResult.source,
        contradiction: wikiResult.contradiction || wolframResult.contradiction || knowledgeResult.contradiction
      };
    } catch (error) {
      console.error('Claim verification error:', error);
      return {
        claim,
        verified: false,
        confidence: 0.3
      };
    }
  }

  /**
   * Check Wikipedia for factual verification
   */
  private async checkWikipedia(claim: string): Promise<{
    verified: boolean;
    confidence: number;
    source?: string;
    contradiction?: string;
  }> {
    try {
      // Extract key terms for Wikipedia search
      const terms = this.extractKeyTerms(claim);
      
      for (const term of terms.slice(0, 3)) { // Check top 3 terms
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(term)}`);
        
        if (response.data && response.data.extract) {
          const extract = response.data.extract.toLowerCase();
          const claimLower = claim.toLowerCase();
          
          // Check for semantic similarity
          const similarity = this.calculateSimilarity(claimLower, extract);
          
          if (similarity > 0.3) {
            return {
              verified: true,
              confidence: similarity,
              source: `Wikipedia: ${term}`
            };
          }
        }
      }
      
      return { verified: false, confidence: 0.1 };
    } catch (error) {
      return { verified: false, confidence: 0.1 };
    }
  }

  /**
   * Check Wolfram Alpha for mathematical/statistical verification
   */
  private async checkWolframAlpha(claim: string): Promise<{
    verified: boolean;
    confidence: number;
    source?: string;
    contradiction?: string;
  }> {
    // Note: Wolfram Alpha requires API key and paid subscription
    // For now, we'll implement a basic mathematical fact checker
    try {
      const mathFacts = this.checkMathematicalFacts(claim);
      if (mathFacts.verified) {
        return {
          verified: true,
          confidence: mathFacts.confidence,
          source: 'Mathematical verification'
        };
      }
      
      return { verified: false, confidence: 0.1 };
    } catch (error) {
      return { verified: false, confidence: 0.1 };
    }
  }

  /**
   * Check Google Knowledge Graph for entity verification
   */
  private async checkKnowledgeGraph(claim: string): Promise<{
    verified: boolean;
    confidence: number;
    source?: string;
    contradiction?: string;
  }> {
    // Note: Google Knowledge Graph requires API key
    // For now, we'll implement basic entity recognition
    try {
      const entities = this.extractEntities(claim);
      if (entities.length > 0) {
        return {
          verified: true,
          confidence: 0.4,
          source: `Entity verification: ${entities.join(', ')}`
        };
      }
      
      return { verified: false, confidence: 0.1 };
    } catch (error) {
      return { verified: false, confidence: 0.1 };
    }
  }

  /**
   * Extract key terms for search
   */
  private extractKeyTerms(text: string): string[] {
    const words = this.tokenizer.tokenize(text) || [];
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can']);
    
    return words
      .filter(word => word && word.length > 3 && !stopWords.has(word.toLowerCase()))
      .slice(0, 5); // Return top 5 terms
  }

  /**
   * Calculate similarity between two texts
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(this.tokenizer.tokenize(text1) || []);
    const words2 = new Set(this.tokenizer.tokenize(text2) || []);
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  /**
   * Check mathematical facts
   */
  private checkMathematicalFacts(claim: string): {
    verified: boolean;
    confidence: number;
  } {
    const mathPatterns = [
      { pattern: /(\d+)\s*\+\s*(\d+)\s*=\s*(\d+)/, verify: (a: number, b: number, c: number) => a + b === c },
      { pattern: /(\d+)\s*\*\s*(\d+)\s*=\s*(\d+)/, verify: (a: number, b: number, c: number) => a * b === c },
      { pattern: /(\d+)\s*%\s*of\s*(\d+)\s*=\s*(\d+)/, verify: (a: number, b: number, c: number) => Math.abs((a / 100) * b - c) < 0.01 }
    ];

    for (const { pattern, verify } of mathPatterns) {
      const match = claim.match(pattern);
      if (match) {
        const [, a, b, c] = match;
        const result = verify(parseFloat(a), parseFloat(b), parseFloat(c));
        return {
          verified: result,
          confidence: result ? 0.9 : 0.1
        };
      }
    }

    return { verified: false, confidence: 0.1 };
  }

  /**
   * Extract entities from text
   */
  private extractEntities(text: string): string[] {
    // Basic entity extraction - in production, use NER libraries
    const entities: string[] = [];
    
    // Extract capitalized phrases (potential entities)
    const capitalizedPhrases = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    entities.push(...capitalizedPhrases);
    
    // Extract numbers with context
    const numberPatterns = text.match(/\d+(?:\.\d+)?\s*(?:million|billion|thousand|percent|%|years?|months?|days?)/gi) || [];
    entities.push(...numberPatterns);
    
    return entities.slice(0, 5); // Return top 5 entities
  }

  /**
   * Calculate overall accuracy from claim results
   */
  private calculateOverallAccuracy(claimResults: any[]): number {
    if (claimResults.length === 0) return 0.5;

    const verifiedClaims = claimResults.filter(result => result.verified);
    const totalClaims = claimResults.length;
    
    // Weight by confidence
    const weightedScore = claimResults.reduce((sum, result) => {
      return sum + (result.verified ? result.confidence : 0);
    }, 0);
    
    return Math.min(1, weightedScore / totalClaims);
  }

  /**
   * Calculate confidence level
   */
  private calculateConfidence(claimResults: any[]): number {
    if (claimResults.length === 0) return 0.3;

    const avgConfidence = claimResults.reduce((sum, result) => sum + result.confidence, 0) / claimResults.length;
    const coverage = Math.min(1, claimResults.length / 5); // Normalize by expected claim count
    
    return (avgConfidence + coverage) / 2;
  }

  /**
   * Identify issues in the response
   */
  private identifyIssues(claimResults: any[]): string[] {
    const issues: string[] = [];
    
    const unverifiedCount = claimResults.filter(result => !result.verified).length;
    if (unverifiedCount > 0) {
      issues.push(`${unverifiedCount} unverified claims detected`);
    }
    
    const lowConfidenceClaims = claimResults.filter(result => result.confidence < 0.3);
    if (lowConfidenceClaims.length > 0) {
      issues.push(`${lowConfidenceClaims.length} claims with low confidence`);
    }
    
    return issues;
  }

  /**
   * Find contradictions in claims
   */
  private findContradictions(claimResults: any[]): string[] {
    const contradictions: string[] = [];
    
    // Check for numerical contradictions
    const numericalClaims = claimResults.filter(result => 
      /\d+/.test(result.claim.text) && result.verified
    );
    
    for (let i = 0; i < numericalClaims.length; i++) {
      for (let j = i + 1; j < numericalClaims.length; j++) {
        const contradiction = this.findNumericalContradiction(
          numericalClaims[i].claim.text,
          numericalClaims[j].claim.text
        );
        if (contradiction) {
          contradictions.push(contradiction);
        }
      }
    }
    
    return contradictions;
  }

  /**
   * Find numerical contradictions between two claims
   */
  private findNumericalContradiction(claim1: string, claim2: string): string | null {
    const numbers1 = claim1.match(/\d+(?:\.\d+)?/g) || [];
    const numbers2 = claim2.match(/\d+(?:\.\d+)?/g) || [];
    
    // Check for same metric with different values
    const metrics1 = this.extractMetrics(claim1);
    const metrics2 = this.extractMetrics(claim2);
    
    for (const metric1 of metrics1) {
      for (const metric2 of metrics2) {
        if (metric1.type === metric2.type && metric1.value !== metric2.value) {
          return `Contradiction: ${metric1.type} reported as ${metric1.value} and ${metric2.value}`;
        }
      }
    }
    
    return null;
  }

  /**
   * Extract metrics from text
   */
  private extractMetrics(text: string): Array<{ type: string; value: number }> {
    const metrics: Array<{ type: string; value: number }> = [];
    
    // Extract percentages
    const percentages = text.match(/(\d+(?:\.\d+)?)\s*%/g) || [];
    percentages.forEach(p => {
      const value = parseFloat(p);
      metrics.push({ type: 'percentage', value });
    });
    
    // Extract years
    const years = text.match(/(\d{4})/g) || [];
    years.forEach(y => {
      const value = parseInt(y);
      if (value > 1900 && value < 2030) {
        metrics.push({ type: 'year', value });
      }
    });
    
    return metrics;
  }
}

// Export singleton instance (server-side only)
export const factChecker = new FactChecker();
