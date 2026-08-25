import { getGeminiModel, isGeminiConfigured } from '../config/gemini.js';
import ChatHistory from '../models/ChatHistory.js';
import { PERSONALITY_PROMPTS, cleanForSpeech, detectIntent } from '../utils/assistantPrompts.js';

// Fallback intelligent offline engine when Gemini API key is not set
const getOfflineResponse = (prompt, assistantName, personality, isHindi = false) => {
  const p = prompt.toLowerCase();

  if (isHindi) {
    if (p.includes('who are you') || p.includes('your name') || p.includes('नाम क्या') || p.includes('तुम कौन') || p.includes('आप कौन')) {
      return `नमस्ते! मेरा नाम ${assistantName} है, मैं आपका AI वर्चुअल असिस्टेंट हूँ। मैं आपकी सहायता और voice automation के लिए सदैव तैयार हूँ।`;
    }
    if (p.includes('how are you') || p.includes('कैसे हो') || p.includes('कैसी हो') || p.includes('हाल चाल') || p.includes('क्या हाल')) {
      return `मैं बिल्कुल ठीक और पूरी तरह सक्रिय हूँ। बताइये, आज मैं आपकी क्या मदद करूँ?`;
    }
    if (p.includes('hello') || p.includes('hi') || p.includes('hey') || p.includes('नमस्ते') || p.includes('प्रणाम') || p.includes('हेलो')) {
      return `नमस्ते! ${assistantName} ऑनलाइन है और आपकी सेवा के लिए तैयार है। आज का क्या कार्य है?`;
    }
    if (p.includes('joke') || p.includes('चुटकुला') || p.includes('हंस')) {
      const hindiJokes = [
        "अध्यापक ने पूछा: 'सच्चा मित्र कौन होता है?' छात्र बोला: 'जो परीक्षा के समय अपनी उत्तर-पुस्तिका खुली छोड़ दे!'",
        "डॉक्टर: 'तनाव कम करने के लिए आपको रोज़ाना व्यायाम करना चाहिए।' मरीज़: 'डॉक्टर साहब, सुबह उठकर चाय पीना भी तो एक व्यायाम ही है!'",
        "कंप्यूटर को ठंड क्यों लगी? क्योंकि उसने अपनी Windows खुली छोड़ रखी थी!"
      ];
      return hindiJokes[Math.floor(Math.random() * hindiJokes.length)];
    }
    if (p.includes('thank you') || p.includes('धन्यवाद') || p.includes('शुक्रिया') || p.includes('thanks')) {
      return `आपका बहुत-बहुत स्वागत है! आपकी सेवा में हमेशा उपस्थित।`;
    }
    return `नमस्ते! मैंने आपका प्रश्न समझा: "${prompt}"। मैं आपकी सहायता के लिए तैयार हूँ।`;
  }

  // English default responses
  if (p.includes('who are you') || p.includes('your name') || p.includes('what are you')) {
    return `I am ${assistantName}, your personal AI virtual assistant. I am online and ready to assist you with tasks, knowledge, voice automation, and queries.`;
  }
  if (p.includes('how are you') || p.includes('how do you do')) {
    return `All primary systems are operating at peak capacity. How may I be of service today?`;
  }
  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) {
    return `Greetings! ${assistantName} online and standing by. What are our objectives today?`;
  }
  if (p.includes('tell me a joke') || p.includes('joke')) {
    const jokes = [
      "Why do programmers prefer dark mode? Because light attracts bugs.",
      "There are 10 types of people in the world: those who understand binary, and those who do not.",
      "Why was the computer cold? It left its Windows open!",
      "An SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }
  if (p.includes('software job') || p.includes('job') || p.includes('career') || p.includes('developer')) {
    return `In software engineering, high-demand career paths include Full-Stack Development (React, Node.js, Next.js), AI/ML Engineering (Python, LLMs, PyTorch), Cloud DevOps (Docker, Kubernetes, AWS), and Distributed Systems. Focus on building real-world projects and system design.`;
  }
  if (p.includes('coding') || p.includes('programming') || p.includes('javascript') || p.includes('python')) {
    return `For modern coding, mastering clean architecture, asynchronous patterns, and testing yields the highest impact. What specific programming language or challenge are you working on?`;
  }
  if (p.includes('capabilities') || p.includes('what can you do') || p.includes('help')) {
    return `I can converse via real-time voice, search the web, open applications like YouTube, Google, GitHub, solve math, manage your preferences, and answer complex questions using Gemini AI intelligence.`;
  }
  if (p.includes('thank you') || p.includes('thanks')) {
    return `You are most welcome. Always at your service.`;
  }

  return `I have analyzed your prompt: "${prompt}". I am standing by to assist you.`;
};

// @desc    Send user message & get AI speech reply + actionable intent
// @route   POST /api/chat/message
// @access  Public / Optional Auth
export const sendMessage = async (req, res) => {
  try {
    const { message, assistantConfig = {} } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    const assistantName = assistantConfig.name || req.user?.assistantConfig?.name || 'AI Assistant';
    const personalityKey = assistantConfig.personality || req.user?.assistantConfig?.personality || 'companion';
    const customPrompt = assistantConfig.customPrompt || req.user?.assistantConfig?.customPrompt || '';
    
    // Check language preference (defaulting to English)
    const language = assistantConfig.language || 'english';
    const isHindi = language === 'hindi' || language === 'hi';

    // 1. Detect quick Action Intent (Open websites, search, time, math, etc.)
    const detectedIntent = detectIntent(message, assistantName);

    let replyText = '';
    let actionData = { type: 'none', payload: null };

    if (detectedIntent) {
      if (isHindi) {
        if (detectedIntent.type === 'open_url') {
          replyText = `${detectedIntent.payload?.label || 'वेबसाइट'} खोली जा रही है।`;
        } else if (detectedIntent.type === 'search_web') {
          replyText = `गूगल पर "${detectedIntent.payload?.query || ''}" खोजा जा रहा है।`;
        } else if (detectedIntent.type === 'time') {
          replyText = `वर्तमान समय ${detectedIntent.payload?.time || ''} है।`;
        } else if (detectedIntent.type === 'date') {
          replyText = `आज की तारीख ${detectedIntent.payload?.date || ''} है।`;
        } else if (detectedIntent.type === 'calculate') {
          replyText = `${detectedIntent.payload?.equation} का उत्तर ${detectedIntent.payload?.result} है।`;
        } else if (detectedIntent.type === 'clear') {
          replyText = `बातचीत का इतिहास साफ़ कर दिया गया है।`;
        } else {
          replyText = detectedIntent.speech;
        }
      } else {
        replyText = detectedIntent.speech;
      }

      actionData = {
        type: detectedIntent.type,
        payload: detectedIntent.payload,
      };
    } else {
      // 2. Query Gemini AI with Conversation Context
      if (isGeminiConfigured()) {
        const candidateModels = [
          'gemini-3.6-flash',
          'gemini-2.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-flash',
          'gemini-flash-latest'
        ];

        const basePersonality = PERSONALITY_PROMPTS[personalityKey] || PERSONALITY_PROMPTS.companion;
        
        const languageInstruction = isHindi
          ? `CRITICAL LANGUAGE REQUIREMENT: You MUST ALWAYS generate your answers in clear, natural, polite, and fluent Hindi (हिंदी). Use Devanagari script for the answer so it speaks naturally through Hindi text-to-speech. Keep answers crisp, warm, and direct (1-3 sentences).`
          : `CRITICAL LANGUAGE REQUIREMENT: You MUST ALWAYS respond strictly in fluent, articulate, and natural ENGLISH. Even if the user message or past conversation history contains Hindi or another language, ALWAYS provide your answer in ENGLISH. Keep responses concise, direct, and conversational (1-3 sentences). Do NOT use markdown symbols (no asterisks, no bullets) as this output will be read aloud by text-to-speech.`;

        const systemInstruction = `${basePersonality}
Your name is "${assistantName}".
${languageInstruction}
User's additional instructions: ${customPrompt || 'None'}.
Keep responses concise, natural, and direct (1-3 sentences). Do NOT use markdown symbols (no asterisks, no bullets) as this will be read by text-to-speech.`;

        // Fetch recent conversation history context if user is logged in
        let historyContext = [];
        if (req.user && (req.user.id || req.user._id)) {
          const userId = req.user.id || req.user._id;
          const chatDoc = await ChatHistory.findOne({ userId });
          if (chatDoc && chatDoc.messages && chatDoc.messages.length > 0) {
            const recent = chatDoc.messages.slice(-6);
            historyContext = recent.map((m) => ({
              role: m.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: m.content }],
            }));
          }
        }

        let modelSuccess = false;
        for (const modelName of candidateModels) {
          try {
            const model = getGeminiModel(modelName);
            if (!model) continue;

            const chat = model.startChat({
              history: historyContext,
              generationConfig: {
                maxOutputTokens: 800,
                temperature: 0.7,
              },
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
            });

            const result = await chat.sendMessage(message);
            const response = await result.response;
            replyText = response.text();
            if (replyText) {
              modelSuccess = true;
              break;
            }
          } catch (modelErr) {
            console.warn(`Model ${modelName} failed:`, modelErr.message);
          }
        }

        if (!modelSuccess || !replyText) {
          replyText = getOfflineResponse(message, assistantName, personalityKey, isHindi);
        }
      } else {
        replyText = getOfflineResponse(message, assistantName, personalityKey, isHindi);
      }
    }

    // Clean text for speech synthesis
    const spokenText = cleanForSpeech(replyText);

    // 3. Save to Chat History if User is authenticated
    if (req.user && (req.user.id || req.user._id)) {
      try {
        const userId = req.user.id || req.user._id;
        let chatHistory = await ChatHistory.findOne({ userId });
        if (!chatHistory) {
          chatHistory = new ChatHistory({
            userId,
            messages: [],
          });
        }

        chatHistory.messages.push({
          role: 'user',
          content: message,
          timestamp: new Date(),
        });

        chatHistory.messages.push({
          role: 'assistant',
          content: replyText,
          action: actionData,
          timestamp: new Date(),
        });

        if (chatHistory.messages.length > 100) {
          chatHistory.messages = chatHistory.messages.slice(-100);
        }

        await chatHistory.save();
      } catch (dbErr) {
        console.warn('Chat history save error:', dbErr.message);
      }
    }

    res.json({
      success: true,
      reply: replyText,
      spokenText,
      action: actionData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate assistant response',
    });
  }
};

// @desc    Process user voice audio recording & generate AI response + actionable intent
// @route   POST /api/chat/voice
// @access  Public / Optional Auth
export const sendVoiceMessage = async (req, res) => {
  try {
    const { base64Audio, mimeType = 'audio/webm', assistantConfig = {} } = req.body;

    if (!base64Audio || !base64Audio.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Audio data cannot be empty',
      });
    }

    // Clean base64 and extract pure audio MIME type
    const cleanBase64 = base64Audio.includes(',') ? base64Audio.split(',')[1].trim() : base64Audio.trim();
    const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

    const assistantName = assistantConfig.name || req.user?.assistantConfig?.name || 'AI Assistant';
    const personalityKey = assistantConfig.personality || req.user?.assistantConfig?.personality || 'companion';
    const customPrompt = assistantConfig.customPrompt || req.user?.assistantConfig?.customPrompt || '';
    const language = assistantConfig.language || 'english';
    const isHindi = language === 'hindi' || language === 'hi';

    let transcript = '';
    let replyText = '';
    let actionData = { type: 'none', payload: null };

    if (isGeminiConfigured()) {
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-flash-latest'
      ];

      const basePersonality = PERSONALITY_PROMPTS[personalityKey] || PERSONALITY_PROMPTS.companion;
      const languageInstruction = isHindi
        ? `Respond in clear, natural Hindi (हिंदी). Use Devanagari script. Keep answers concise (1-3 sentences).`
        : `Respond strictly in fluent, clear ENGLISH (1-3 sentences). Do NOT use markdown symbols.`;

      const promptText = `
You are "${assistantName}", a helpful AI assistant.
${basePersonality}
${languageInstruction}
User additional instructions: ${customPrompt || 'None'}

Please listen to the attached user voice audio recording:
1. Transcribe what the user said in the audio accurately.
2. Provide a helpful, direct answer or response to what the user asked.

Format your output strictly as a JSON object:
{
  "transcript": "Exact words spoken by user",
  "reply": "Your response to the user"
}
`;

      for (const modelName of candidateModels) {
        try {
          const model = getGeminiModel(modelName);
          if (!model) continue;

          const result = await model.generateContent([
            {
              inlineData: {
                data: cleanBase64,
                mimeType: cleanMimeType,
              },
            },
            promptText,
          ]);

          const response = await result.response;
          const rawText = response.text() || '';

          // Parse JSON from output
          try {
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              transcript = parsed.transcript || '';
              replyText = parsed.reply || '';
            } else {
              replyText = rawText.trim();
            }
          } catch (e) {
            replyText = rawText.trim();
          }

          if (transcript || replyText) {
            break;
          }
        } catch (err) {
          console.warn(`Voice processing with model ${modelName} failed:`, err.message);
        }
      }
    }

    if (!transcript && !replyText) {
      transcript = 'Voice Input';
      replyText = getOfflineResponse(transcript, assistantName, personalityKey, isHindi);
    }

    // Check detected intents on transcript (e.g., Open YouTube, Calculator, etc.)
    if (transcript) {
      const detectedIntent = detectIntent(transcript, assistantName);
      if (detectedIntent) {
        actionData = {
          type: detectedIntent.type,
          payload: detectedIntent.payload,
        };
        if (!replyText || replyText.toLowerCase().includes('voice input')) {
          if (detectedIntent.type === 'open_url') {
            replyText = isHindi
              ? `${detectedIntent.payload?.label || 'वेबसाइट'} खोली जा रही है।`
              : `Opening ${detectedIntent.payload?.label || 'website'} for you now.`;
          } else if (detectedIntent.type === 'search_web') {
            replyText = isHindi
              ? `Google पर "${detectedIntent.payload?.query}" खोजा जा रहा है।`
              : `Searching Google for ${detectedIntent.payload?.query}.`;
          }
        }
      }
    }

    const spokenText = cleanForSpeech(replyText);

    // Save to chat history if user logged in
    if (req.user && (req.user.id || req.user._id) && transcript) {
      try {
        const userId = req.user.id || req.user._id;
        await ChatHistory.findOneAndUpdate(
          { userId },
          {
            $push: {
              messages: {
                $each: [
                  { role: 'user', content: transcript, timestamp: new Date() },
                  { role: 'assistant', content: replyText, action: actionData, timestamp: new Date() },
                ],
                $slice: -50,
              },
            },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.warn('Could not save voice chat to DB:', dbErr.message);
      }
    }

    res.json({
      success: true,
      transcript: transcript || 'Spoken Command',
      reply: replyText,
      spokenText,
      action: actionData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Send voice message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process voice message',
    });
  }
};

// @desc    Get user conversation history
// @route   GET /api/chat/history
// @access  Private
export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const chatHistory = await ChatHistory.findOne({ userId });

    if (!chatHistory) {
      return res.json({
        success: true,
        messages: [],
      });
    }

    res.json({
      success: true,
      messages: chatHistory.messages,
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Clear user conversation history
// @route   DELETE /api/chat/history
// @access  Private
export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await ChatHistory.findOneAndUpdate(
      { userId },
      { $set: { messages: [] } },
      { upsert: true }
    );

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
