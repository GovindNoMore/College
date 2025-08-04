// src/services/aiService.ts
import { College } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  published_date?: string;
}

export interface AIResponse {
  content: string;
  searchResults?: SearchResult[];
  suggestions?: {
    action: 'update_college' | 'add_college' | 'set_reminder';
    data: any;
  }[];
}

class AIService {
  private async callGemini(prompt: string): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your .env.local file');
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response format from Gemini API');
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      throw error;
    }
  }

  private async searchWeb(query: string): Promise<SearchResult[]> {
    const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY;
    
    if (!TAVILY_API_KEY) {
      console.warn('Tavily API key not found. Skipping web search.');
      return [];
    }

    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: query,
          search_depth: 'basic',
          include_answer: false,
          include_images: false,
          include_raw_content: false,
          max_results: 5,
          include_domains: [
            'edu',
            'college',
            'university',
            'admissions',
            'collegeboard.org',
            'commonapp.org'
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Tavily API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.results?.map((result: any) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        published_date: result.published_date
      })) || [];
    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }

  private buildPrompt(userQuery: string, colleges: College[], searchResults?: SearchResult[]): string {
    let prompt = `You are a college application assistant helping students with their college applications. You have access to the student's current college list and can help with research, deadlines, requirements, and application tracking.

Current colleges the student is tracking:
${colleges.map(college => `
- ${college.name} (${college.location})
  Status: ${college.status}
  Application Deadline: ${college.applicationDeadline}
  ${college.earlyDeadline ? `Early Deadline: ${college.earlyDeadline}` : ''}
  Fee: $${college.applicationFee}
  Requirements: ${college.requirements.essays.join(', ')} | ${college.requirements.testScores.join(', ')} | ${college.requirements.documents.join(', ')}
  ${college.scholarships.length > 0 ? `Scholarships: ${college.scholarships.join(', ')}` : ''}
`).join('\n')}

User Question: "${userQuery}"

${searchResults && searchResults.length > 0 ? `
I found the following recent information from web search:
${searchResults.map((result, index) => `
${index + 1}. ${result.title}
   URL: ${result.url}
   Content: ${result.content.substring(0, 500)}...
   ${result.published_date ? `Published: ${result.published_date}` : ''}
`).join('\n')}
` : ''}

Please provide a helpful response. If you're suggesting updates to college information, clearly indicate what should be updated. Be specific about deadlines, requirements, and application steps. If you found conflicting information, mention it.

Guidelines:
- Be encouraging and supportive
- Provide specific, actionable advice
- If information might be outdated, suggest verifying with official sources
- Keep responses conversational but informative
- If you recommend updating college data, be explicit about the changes`;

    return prompt;
  }

  async processQuery(
    userQuery: string, 
    colleges: College[], 
    shouldSearch: boolean = true
  ): Promise<AIResponse> {
    try {
      let searchResults: SearchResult[] = [];
      
      // Perform web search if requested and query seems to need current info
      if (shouldSearch && this.shouldPerformSearch(userQuery)) {
        const searchQuery = this.extractSearchQuery(userQuery);
        searchResults = await this.searchWeb(searchQuery);
      }

      // Build prompt with context
      const prompt = this.buildPrompt(userQuery, colleges, searchResults);
      
      // Get AI response
      const aiResponse = await this.callGemini(prompt);
      
      // Parse for potential actions (simple keyword detection for now)
      const suggestions = this.parseActionSuggestions(aiResponse, colleges);

      return {
        content: aiResponse,
        searchResults: searchResults.length > 0 ? searchResults : undefined,
        suggestions
      };
    } catch (error) {
      console.error('AI processing failed:', error);
      
      // Fallback response
      return {
        content: `I'm having trouble connecting to my AI services right now. Here's what I can help you with:

• Research college deadlines and requirements
• Track your application progress
• Find scholarship opportunities
• Get application tips and advice

Please try your question again, or check if your API keys are properly configured.

Error details: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private shouldPerformSearch(query: string): boolean {
    const searchKeywords = [
      'deadline', 'requirement', 'admission', 'scholarship', 'application fee',
      'test score', 'gpa', 'essay prompt', 'interview', 'acceptance rate',
      'tuition', 'financial aid', 'early decision', 'early action',
      'waitlist', 'deferral', 'latest', 'current', 'recent', 'new', 'updated'
    ];
    
    const lowerQuery = query.toLowerCase();
    return searchKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private extractSearchQuery(userQuery: string): string {
    // Extract college name if mentioned
    const collegeKeywords = ['university', 'college', 'institute', 'school'];
    const words = userQuery.split(' ');
    
    let searchQuery = userQuery;
    
    // If query is very long, try to extract key terms
    if (userQuery.length > 100) {
      const keyTerms = [];
      if (userQuery.toLowerCase().includes('deadline')) keyTerms.push('application deadline');
      if (userQuery.toLowerCase().includes('requirement')) keyTerms.push('admission requirements');
      if (userQuery.toLowerCase().includes('scholarship')) keyTerms.push('scholarships');
      if (userQuery.toLowerCase().includes('tuition')) keyTerms.push('tuition cost');
      
      if (keyTerms.length > 0) {
        searchQuery = keyTerms.join(' ') + ' 2024 2025';
      }
    }
    
    return searchQuery;
  }

  private parseActionSuggestions(response: string, colleges: College[]): AIResponse['suggestions'] {
    const suggestions: AIResponse['suggestions'] = [];
    
    // Simple keyword-based action detection
    // This can be made more sophisticated with structured prompts later
    
    if (response.toLowerCase().includes('update') && response.toLowerCase().includes('deadline')) {
      // Could suggest deadline updates
    }
    
    if (response.toLowerCase().includes('add') && response.toLowerCase().includes('college')) {
      // Could suggest adding a new college
    }
    
    return suggestions;
  }
}

export const aiService = new AIService();