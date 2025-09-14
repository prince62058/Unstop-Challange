import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function analyzeSentiment(emailBody, subject) {
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

export async function analyzePriority(emailBody, subject) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a priority classification expert for customer support emails.
          Classify emails as "urgent" or "normal" based on content urgency.
          Urgent indicators: outages, critical bugs, angry customers, deadlines, legal issues, billing problems.
          Respond with JSON: { "priority": "urgent|normal", "confidence": 0.0-1.0, "keywords": ["word1", "word2"] }`
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
      keywords: Array.isArray(result.keywords) ? result.keywords : []
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

export async function extractInformation(emailBody, subject, sender) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `Extract key information from customer support emails.
          Respond with JSON: {
            "phoneNumbers": ["123-456-7890"],
            "alternateEmails": ["email@domain.com"],
            "category": "Technical Issue|Customer Feedback|Business Development|Financial|HR/Internal|General",
            "customerRequirements": ["requirement1", "requirement2"],
            "sentimentIndicators": ["positive word", "negative word"]
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
      phoneNumbers: Array.isArray(result.phoneNumbers) ? result.phoneNumbers : [],
      alternateEmails: Array.isArray(result.alternateEmails) ? result.alternateEmails : [],
      category: result.category || "General",
      customerRequirements: Array.isArray(result.customerRequirements) ? result.customerRequirements : [],
      sentimentIndicators: Array.isArray(result.sentimentIndicators) ? result.sentimentIndicators : []
    };
  } catch (error) {
    console.error("Information extraction failed:", error);
    return {
      phoneNumbers: [],
      alternateEmails: [],
      category: "General",
      customerRequirements: [],
      sentimentIndicators: []
    };
  }
}

export async function generateResponse(emailBody, subject, sender, sentiment, priority, extractedInfo) {
  try {
    // Determine tone based on sentiment and priority
    let tone = "professional and helpful";
    if (sentiment === "negative" || priority === "urgent") {
      tone = "empathetic and urgent";
    } else if (sentiment === "positive") {
      tone = "warm and appreciative";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a customer support specialist generating email responses.
          Create a ${tone} response that addresses the customer's concerns.
          Be specific, actionable, and include next steps.
          Respond with JSON: { "response": "email response text", "tone": "${tone}", "confidence": 0.0-1.0 }`
        },
        {
          role: "user",
          content: `Customer Email:
From: ${sender}
Subject: ${subject}
Priority: ${priority}
Sentiment: ${sentiment}
Category: ${extractedInfo?.category || 'General'}

Message: ${emailBody}

Requirements identified: ${extractedInfo?.customerRequirements?.join(', ') || 'None'}
Generate an appropriate response.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      response: result.response || "Thank you for your message. We will get back to you shortly.",
      tone: result.tone || tone,
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8))
    };
  } catch (error) {
    console.error("Response generation failed:", error);
    return {
      response: "Thank you for reaching out. We have received your message and will respond as soon as possible.",
      tone: "professional",
      confidence: 0.5
    };
  }
}