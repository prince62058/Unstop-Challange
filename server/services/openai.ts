import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface SentimentAnalysis {
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
  reasoning: string;
}

export interface PriorityAnalysis {
  priority: "urgent" | "normal";
  confidence: number;
  keywords: string[];
}

export interface EmailInformation {
  phoneNumbers: string[];
  alternateEmails: string[];
  category: string;
  customerRequirements: string[];
  sentimentIndicators: string[];
}

export interface ResponseGeneration {
  response: string;
  tone: string;
  confidence: number;
}

export async function analyzeSentiment(emailBody: string, subject: string): Promise<SentimentAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert. Analyze the sentiment of customer support emails. 
          Consider the subject line and email body together. 
          Respond with JSON in this format: 
          { "sentiment": "positive|negative|neutral", "confidence": 0.0-1.0, "reasoning": "brief explanation" }`
        },
        {
          role: "user",
          content: `Subject: ${subject}\n\nEmail Body: ${emailBody}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      sentiment: result.sentiment || "neutral",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      reasoning: result.reasoning || "Unable to determine reasoning"
    };
  } catch (error) {
    console.error("Sentiment analysis failed:", error);
    return {
      sentiment: "neutral",
      confidence: 0.5,
      reasoning: "Error during analysis"
    };
  }
}

export async function analyzePriority(emailBody: string, subject: string): Promise<PriorityAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are an email priority classification expert. 
          Classify emails as "urgent" or "normal" based on keywords and context.
          Urgent indicators: "immediately", "critical", "cannot access", "urgent", "asap", "emergency", "broken", "not working", "failed", "error", "issue", "problem".
          Respond with JSON: { "priority": "urgent|normal", "confidence": 0.0-1.0, "keywords": ["keyword1", "keyword2"] }`
        },
        {
          role: "user",
          content: `Subject: ${subject}\n\nEmail Body: ${emailBody}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      priority: result.priority || "normal",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      keywords: result.keywords || []
    };
  } catch (error) {
    console.error("Priority analysis failed:", error);
    return {
      priority: "normal",
      confidence: 0.5,
      keywords: []
    };
  }
}

export async function extractInformation(emailBody: string, subject: string, sender: string): Promise<EmailInformation> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Extract key information from customer support emails.
          Find phone numbers, alternate emails, categorize the issue, identify customer requirements, and sentiment indicators.
          Respond with JSON: {
            "phoneNumbers": ["phone1", "phone2"],
            "alternateEmails": ["email1@example.com"],
            "category": "Account Issues|Billing Questions|Technical Support|General Inquiry|Other",
            "customerRequirements": ["requirement1", "requirement2"],
            "sentimentIndicators": ["frustrated", "happy", "confused"]
          }`
        },
        {
          role: "user",
          content: `From: ${sender}\nSubject: ${subject}\n\nEmail Body: ${emailBody}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      phoneNumbers: result.phoneNumbers || [],
      alternateEmails: result.alternateEmails || [],
      category: result.category || "General Inquiry",
      customerRequirements: result.customerRequirements || [],
      sentimentIndicators: result.sentimentIndicators || []
    };
  } catch (error) {
    console.error("Information extraction failed:", error);
    return {
      phoneNumbers: [],
      alternateEmails: [],
      category: "General Inquiry",
      customerRequirements: [],
      sentimentIndicators: []
    };
  }
}

export async function generateResponse(
  emailBody: string, 
  subject: string, 
  sender: string,
  sentiment: string,
  priority: string,
  extractedInfo: any
): Promise<ResponseGeneration> {
  try {
    let toneInstruction = "professional and helpful";
    if (sentiment === "negative") {
      toneInstruction = "empathetic and apologetic while being solution-focused";
    } else if (priority === "urgent") {
      toneInstruction = "urgent yet reassuring, acknowledging the importance of their request";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a professional customer support representative. 
          Generate contextual responses to customer emails.
          - Use a ${toneInstruction} tone
          - Reference specific details from the customer's email
          - Provide actionable solutions or next steps
          - Be concise but thorough
          - End with appropriate contact information or follow-up steps
          
          Customer Context:
          - Sentiment: ${sentiment}
          - Priority: ${priority}
          - Category: ${extractedInfo?.category || 'General'}
          
          Respond with JSON: {
            "response": "the email response text",
            "tone": "description of tone used",
            "confidence": 0.0-1.0
          }`
        },
        {
          role: "user",
          content: `Customer Email:
          From: ${sender}
          Subject: ${subject}
          
          ${emailBody}
          
          Please generate an appropriate response.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      response: result.response || "Thank you for your email. We will get back to you shortly.",
      tone: result.tone || toneInstruction,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8))
    };
  } catch (error) {
    console.error("Response generation failed:", error);
    return {
      response: "Thank you for contacting us. We have received your email and will respond within 24 hours. If this is urgent, please call our support line.",
      tone: "professional",
      confidence: 0.5
    };
  }
}
