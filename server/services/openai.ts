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

// Generate contextual fallback responses when OpenAI API is not available
function generateContextualFallback(
  emailBody: string, 
  subject: string, 
  sender: string,
  sentiment: string,
  priority: string,
  extractedInfo: any
): ResponseGeneration {
  const lowerBody = emailBody.toLowerCase();
  const lowerSubject = subject.toLowerCase();
  
  // Determine response type based on content
  let response = "";
  let tone = "professional";
  
  // Billing related issues
  if (lowerSubject.includes('billing') || lowerBody.includes('billing') || 
      lowerBody.includes('invoice') || lowerBody.includes('charged') || 
      lowerBody.includes('payment') || lowerBody.includes('refund')) {
    response = `Dear ${sender.split('@')[0]},

Thank you for contacting us regarding your billing inquiry. I understand your concern about the billing issue mentioned in your email.

Our billing team will review your account details and resolve this matter within 2-3 business days. You will receive an updated invoice or confirmation of any adjustments via email.

If you have any transaction IDs or additional details to share, please reply to this email with that information.

Best regards,
Customer Support Team
billing@support.com | 1-800-BILLING`;
    tone = sentiment === "negative" ? "empathetic and solution-focused" : "professional";
  }
  
  // Technical issues
  else if (lowerBody.includes('not working') || lowerBody.includes('error') || 
           lowerBody.includes('broken') || lowerBody.includes('failed') || 
           lowerBody.includes('crash') || lowerBody.includes('down') ||
           lowerSubject.includes('critical') || lowerSubject.includes('urgent')) {
    response = `Dear ${sender.split('@')[0]},

Thank you for reporting this technical issue. I understand how frustrating this must be, especially given the impact on your operations.

Our technical team has been notified and will investigate this issue immediately. We typically resolve such matters within 4-6 hours for critical issues.

In the meantime, please try these quick troubleshooting steps:
1. Clear your browser cache and cookies
2. Try accessing from a different browser or device
3. Check your internet connection stability

We'll keep you updated on our progress. For immediate assistance, you can reach our emergency tech support at tech-support@company.com.

Best regards,
Technical Support Team`;
    tone = "urgent yet reassuring";
  }
  
  // Feature requests or questions
  else if (lowerBody.includes('feature') || lowerBody.includes('how to') || 
           lowerBody.includes('can i') || lowerBody.includes('possible') ||
           lowerSubject.includes('request') || lowerSubject.includes('query')) {
    response = `Dear ${sender.split('@')[0]},

Thank you for reaching out with your inquiry. I appreciate you taking the time to share your thoughts and questions.

${lowerBody.includes('feature') ? 
  'Your feature request has been forwarded to our product development team for consideration. We regularly review customer feedback when planning new features and improvements.' :
  'I\'d be happy to help you with your question. Our team will provide you with detailed information and step-by-step guidance.'}

You can expect a comprehensive response from our team within 24-48 hours. If you have any additional questions or clarifications, please don't hesitate to reply to this email.

Best regards,
Customer Success Team
help@company.com`;
    tone = "helpful and encouraging";
  }
  
  // Security or audit related
  else if (lowerBody.includes('security') || lowerBody.includes('audit') || 
           lowerBody.includes('compliance') || lowerBody.includes('encryption')) {
    response = `Dear ${sender.split('@')[0]},

Thank you for your security and compliance inquiry. We take data security very seriously and are happy to provide the information you need.

Our security team will compile the requested documentation and information for your audit. This typically includes:
- Security certifications and compliance documents
- Data encryption and protection policies  
- Infrastructure and access control details

You should receive a comprehensive security package within 3-5 business days. For urgent security matters, please contact our security team directly at security@company.com.

Best regards,
Security & Compliance Team`;
    tone = "professional and thorough";
  }
  
  // Confused or help-seeking users
  else if (lowerBody.includes('confused') || lowerBody.includes('don\'t understand') || 
           lowerBody.includes('overwhelmed') || lowerBody.includes('new to') ||
           lowerSubject.includes('help')) {
    response = `Dear ${sender.split('@')[0]},

Thank you for reaching out, and don't worry - we're here to help guide you through everything step by step!

I understand that getting started can feel overwhelming, but our support team specializes in helping new users like yourself. We'll provide:
- A personalized walkthrough of the platform
- Step-by-step setup instructions
- Direct access to our customer success team

One of our customer success specialists will contact you within 24 hours to schedule a convenient time for a guided session.

In the meantime, you might find our getting started guide helpful: [link to guide]

Best regards,
Customer Success Team
onboarding@company.com | 1-800-HELP-YOU`;
    tone = "patient and supportive";
  }
  
  // Positive feedback
  else if (sentiment === "positive" || lowerBody.includes('thank') || 
           lowerBody.includes('love') || lowerBody.includes('excellent') ||
           lowerBody.includes('great')) {
    response = `Dear ${sender.split('@')[0]},

Thank you so much for your wonderful feedback! It truly means a lot to our entire team to hear that you're having a positive experience.

We'll be sure to share your kind words with the team members who helped make your experience great. Customer feedback like yours motivates us to continue improving our service.

If you ever have any questions or suggestions for how we can make things even better, please don't hesitate to reach out.

Thank you again for choosing our service and for taking the time to share your positive experience!

Best regards,
Customer Experience Team
feedback@company.com`;
    tone = "appreciative and warm";
  }
  
  // Default general response
  else {
    response = `Dear ${sender.split('@')[0]},

Thank you for contacting our support team. We have received your message regarding "${subject}" and want to ensure you receive the best possible assistance.

Our team will review your inquiry and provide a detailed response within 24 hours. We appreciate your patience as we work to address your specific needs.

If this matter is urgent, please don't hesitate to call our support line at 1-800-SUPPORT or reply to this email with "URGENT" in the subject line.

Best regards,
Customer Support Team
support@company.com`;
    tone = "professional and helpful";
  }
  
  return {
    response,
    tone,
    confidence: 0.85 // High confidence since this is rule-based contextual generation
  };
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
    // Generate contextual fallback response based on email content
    const fallbackResponse = generateContextualFallback(emailBody, subject, sender, sentiment, priority, extractedInfo);
    return fallbackResponse;
  }
}
