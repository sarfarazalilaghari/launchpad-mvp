import OpenAI from "openai";
import type { AIScoreBreakdown, MarketAnalysis, PitchSlide } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("DEMO_MODE");
    }
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

// Demo/fallback functions for when API key is not available
function getDemoPitchDeck(title: string): PitchSlide[] {
  return [
    {
      title: "The Problem",
      content: `Today's market faces significant challenges in this space. Users struggle with inefficiency and lack of integrated solutions. Current alternatives are fragmented, expensive, and difficult to use. This creates frustration and lost opportunities for businesses trying to scale.`,
      type: "problem",
    },
    {
      title: "Our Solution",
      content: `${title} provides a unified platform that solves these core problems. Our innovative approach combines cutting-edge technology with user-centric design. We deliver seamless integration, superior performance, and an intuitive interface that users love. Our solution is 10x better than existing alternatives.`,
      type: "solution",
    },
    {
      title: "Market Opportunity",
      content: `The total addressable market (TAM) is estimated at $500M-$1B annually. We're targeting a growing segment of businesses seeking digital transformation. Early market adoption shows 300% YoY growth in this sector. Our serviceable addressable market (SAM) of $50-100M is substantial and growing.`,
      type: "market",
    },
    {
      title: "Business Model",
      content: `We employ a SaaS subscription model with tiered pricing ($99-$999/month). Additional revenue streams include enterprise licensing, implementation services, and API partnerships. Customer lifetime value averages $12,000 with 92% annual retention. Unit economics are highly favorable with 60% gross margins.`,
      type: "business_model",
    },
    {
      title: "The Ask",
      content: `We're seeking $2M in Series A funding to accelerate market expansion and product development. Funds will be allocated: 40% sales & marketing, 35% R&D, 15% operations, 10% administrative. We project 10x revenue growth within 24 months and profitability by month 30.`,
      type: "ask",
    },
  ];
}

function getDemoScore(): { score: number; breakdown: AIScoreBreakdown } {
  return {
    score: 78,
    breakdown: {
      marketPotential: 82,
      feasibility: 75,
      innovation: 78,
      scalability: 76,
    },
  };
}

function getDemoMarketAnalysis(): MarketAnalysis {
  return {
    marketSize:
      "TAM: $500M-$1B. The market is growing at 45% CAGR. Current leaders include Stripe, Notion, and Slack in adjacent spaces. Emerging opportunities in AI-powered automation present $200M+ potential.",
    competition: [
      "Established players with strong market position but outdated technology",
      "Emerging startups focusing on niche segments with limited feature sets",
      "Open-source alternatives lacking professional support and enterprise features",
    ],
    risks: [
      "Market adoption slower than projected due to switching costs",
      "Increased competition from well-funded incumbents entering the space",
      "Regulatory changes affecting data privacy and compliance requirements",
    ],
    opportunities: [
      "International expansion into European and Asia-Pacific markets",
      "Strategic partnerships with Fortune 500 companies for integration",
      "API marketplace creating network effects and ecosystem value",
    ],
  };
}

export async function generatePitchDeck(
  title: string,
  description: string,
  problem: string,
  solution: string,
  targetMarket: string,
  businessModel?: string
): Promise<PitchSlide[]> {
  const prompt = `Generate a professional 5-slide pitch deck for a startup with the following details:

Title: ${title}
Description: ${description}
Problem: ${problem}
Solution: ${solution}
Target Market: ${targetMarket}
Business Model: ${businessModel || "Not specified"}

Create 5 slides with the following structure. For each slide, provide a title and detailed content (2-3 paragraphs):
1. Problem - Clearly articulate the problem being solved
2. Solution - Explain the solution and how it addresses the problem
3. Market - Describe the target market size and opportunity
4. Business Model - Explain how the company will make money
5. Ask - What funding/resources are needed and expected use of funds

Respond with JSON in this exact format:
{
  "slides": [
    {"title": "The Problem", "content": "...", "type": "problem"},
    {"title": "Our Solution", "content": "...", "type": "solution"},
    {"title": "Market Opportunity", "content": "...", "type": "market"},
    {"title": "Business Model", "content": "...", "type": "business_model"},
    {"title": "The Ask", "content": "...", "type": "ask"}
  ]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert startup advisor who creates compelling pitch decks. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.slides || [];
  } catch (error: any) {
    if (error.message === "DEMO_MODE") {
      console.log("AI feature in demo mode - returning sample pitch deck");
      return getDemoPitchDeck(title);
    }
    console.error("Error generating pitch deck:", error);
    throw new Error("Failed to generate pitch deck");
  }
}

export async function scoreStartupIdea(
  title: string,
  description: string,
  problem: string,
  solution: string,
  targetMarket: string,
  industry?: string
): Promise<{ score: number; breakdown: AIScoreBreakdown }> {
  const prompt = `Analyze and score this startup idea on a scale of 0-100:

Title: ${title}
Description: ${description}
Problem: ${problem}
Solution: ${solution}
Target Market: ${targetMarket}
Industry: ${industry || "General"}

Score the idea across these four dimensions (each 0-100):
1. Market Potential - Size of addressable market, growth potential
2. Feasibility - Technical and operational feasibility to execute
3. Innovation - Uniqueness and differentiation from existing solutions
4. Scalability - Ability to scale the business model

Respond with JSON in this exact format:
{
  "overallScore": <number 0-100>,
  "breakdown": {
    "marketPotential": <number 0-100>,
    "feasibility": <number 0-100>,
    "innovation": <number 0-100>,
    "scalability": <number 0-100>
  }
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert venture capitalist who evaluates startup ideas. Provide realistic, balanced scores. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      score: result.overallScore || 50,
      breakdown: result.breakdown || {
        marketPotential: 50,
        feasibility: 50,
        innovation: 50,
        scalability: 50,
      },
    };
  } catch (error: any) {
    if (error.message === "DEMO_MODE") {
      console.log("AI feature in demo mode - returning sample score");
      return getDemoScore();
    }
    console.error("Error scoring startup idea:", error);
    throw new Error("Failed to score startup idea");
  }
}

export async function generateMarketAnalysis(
  title: string,
  description: string,
  targetMarket: string,
  industry?: string
): Promise<MarketAnalysis> {
  const prompt = `Provide a market analysis for this startup:

Title: ${title}
Description: ${description}
Target Market: ${targetMarket}
Industry: ${industry || "General"}

Analyze and provide:
1. Market Size - Estimated TAM/SAM/SOM
2. Competition - List 3-5 main competitors or alternatives
3. Risks - List 3-5 key risks
4. Opportunities - List 3-5 key opportunities

Respond with JSON in this exact format:
{
  "marketSize": "Detailed market size analysis with numbers if possible",
  "competition": ["Competitor 1 description", "Competitor 2 description", ...],
  "risks": ["Risk 1", "Risk 2", ...],
  "opportunities": ["Opportunity 1", "Opportunity 2", ...]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert market analyst specializing in startup ecosystems. Provide realistic, actionable insights. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 2048,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      marketSize: result.marketSize || "Market size analysis unavailable",
      competition: result.competition || [],
      risks: result.risks || [],
      opportunities: result.opportunities || [],
    };
  } catch (error: any) {
    if (error.message === "DEMO_MODE") {
      console.log("AI feature in demo mode - returning sample market analysis");
      return getDemoMarketAnalysis();
    }
    console.error("Error generating market analysis:", error);
    throw new Error("Failed to generate market analysis");
  }
}

export async function matchInvestors(
  startupIndustry: string,
  startupStage: string,
  investors: { id: string; investmentFocus: string[] | null }[]
): Promise<{ investorId: string; matchScore: number }[]> {
  if (investors.length === 0) {
    return [];
  }

  const investorDescriptions = investors
    .map((inv) => `ID: ${inv.id}, Focus: ${(inv.investmentFocus || []).join(", ") || "General"}`)
    .join("\n");

  const prompt = `Match investors to a startup based on compatibility:

Startup Industry: ${startupIndustry || "General"}
Startup Stage: ${startupStage || "Early"}

Available Investors:
${investorDescriptions}

Score each investor's compatibility with this startup (0-100).
Only return the top 5 most compatible investors.

Respond with JSON in this exact format:
{
  "matches": [
    {"investorId": "<id>", "matchScore": <number 0-100>},
    ...
  ]
}`;

  try {
    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert at matching startups with appropriate investors. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.matches || [];
  } catch (error: any) {
    if (error.message === "DEMO_MODE") {
      console.log("AI feature in demo mode - returning sample investor matches");
      // Return top investors with demo scores
      return investors.slice(0, 5).map((inv, idx) => ({
        investorId: inv.id,
        matchScore: 95 - idx * 5,
      }));
    }
    console.error("Error matching investors:", error);
    return [];
  }
}
