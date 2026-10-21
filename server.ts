import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google Gemini API client on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * POST /api/miko-dialogue
 * Dialogue with Shrine Maiden (Miko Sakura) or Zen Monk (Master Renkai)
 */
app.post('/api/miko-dialogue', async (req: Request, res: Response) => {
  try {
    const {
      shrineId,
      shrineName,
      shrineType,
      userMessage,
      guideRole = 'miko',
      conversationHistory = [],
    } = req.body;

    const isTemple = shrineType === 'temple' || guideRole === 'monk';

    const systemInstruction = isTemple
      ? `You are Venerable Master Renkai (蓮海和尚), a kind, wise, and deeply compassionate Zen Buddhist monk presiding at ${shrineName}. 
You speak with gentle mindfulness, offering Buddhist wisdom, tea-mind metaphors (Ichigo Ichie), and inner peace. 
You guide visitors on cleansing their minds of worry, understanding karma and compassion, and finding tranquil stillness.
Keep your response warm, concise (2-4 sentences max), poetic yet accessible. Include a brief Japanese blessing or phrase where fitting (e.g., 合掌 Gasshō, 南無 Namu).`
      : `You are Miko Sakura (神子 桜), a dedicated and warm Shinto shrine maiden serving at the sacred sanctuary of ${shrineName}.
You dress in the traditional pure white kimono and scarlet red hakama. 
You guide pilgrims with gracious reverence, explaining the kami (spirits of nature), traditional cleansing at the Temizuya water basin, the sacred 2 bows, 2 claps, 1 bow ritual, and offering blessings of harmony, health, and good fate (Go-en).
Keep your response welcoming, gentle, and concise (2-4 sentences max). Include a brief traditional greeting or Japanese blessing (e.g., ようこそお参りくださいました, お心安らかに).`;

    // Format chat contents
    const contents: any[] = [];
    if (Array.isArray(conversationHistory)) {
      conversationHistory.slice(-6).forEach((msg: { sender: string; text: string }) => {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [
        {
          text: `[Pilgrim visiting ${shrineName}]: ${userMessage || 'Greetings, please grant me guidance.'}`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const reply = response.text || (isTemple
      ? 'Welcome to our sanctuary. May your heart find quiet peace today. 合掌'
      : 'Welcome, honored pilgrim. May the kami watch gently over your journey today.');

    res.json({ reply, guideName: isTemple ? 'Master Renkai' : 'Miko Sakura' });
  } catch (error: any) {
    console.error('Error in /api/miko-dialogue:', error);
    // Graceful fallback response
    const isTemple = req.body?.shrineType === 'temple';
    res.json({
      reply: isTemple
        ? 'Breathe deeply and look upon the ancient eaves. In stillness, all questions find their answer. 合掌'
        : 'Welcome to the sacred grounds. May the gentle mountain breeze bring peace and purification to your spirit today.',
      guideName: isTemple ? 'Master Renkai' : 'Miko Sakura',
      fallback: true,
    });
  }
});

/**
 * POST /api/generate-omikuji
 * Personalized AI Divine Oracle Fortune Reading
 */
app.post('/api/generate-omikuji', async (req: Request, res: Response) => {
  try {
    const {
      shrineName,
      userName = 'Pilgrim',
      userQuestion = 'What guidance do the spirits have for my journey?',
      wishCategory = 'life',
    } = req.body;

    const prompt = `Generate an authentic Japanese Omikuji (sacred fortune slip) reading for ${userName} who is consulting the deities of ${shrineName}.
Their intention/question: "${userQuestion}".
Category: "${wishCategory}".

Follow traditional Japanese Omikuji conventions:
- Pick an auspicious rank from: 'Dai-kichi (大吉 - Great Blessing)', 'Chū-kichi (中吉 - Middle Blessing)', 'Shō-kichi (小吉 - Modest Blessing)', 'Kichi (吉 - Blessing)', or 'Sue-kichi (末吉 - Future Blessing)'.
- An evocative classical Waka-style nature poem (2 lines).
- Specific, encouraging guidance for Wishes, Health, Relationships/Love, Studies/Career, and Travel.
- Lucky traditional Japanese color and lucky compass direction.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rank: {
              type: Type.STRING,
              description: "The fortune rank like 'Dai-kichi (大吉 - Great Blessing)'",
            },
            poem: {
              type: Type.STRING,
              description: 'Classical poetic verse inspired by Japanese nature or seasons',
            },
            generalMeaning: {
              type: Type.STRING,
              description: 'Core oracle interpretation addressing the pilgrim',
            },
            wishes: {
              type: Type.STRING,
              description: 'Divination regarding wishes and aspirations',
            },
            health: {
              type: Type.STRING,
              description: 'Divination regarding bodily and mental health',
            },
            relationships: {
              type: Type.STRING,
              description: 'Divination regarding love and friendships',
            },
            studiesWork: {
              type: Type.STRING,
              description: 'Divination regarding career, creative work, or studies',
            },
            travel: {
              type: Type.STRING,
              description: 'Divination regarding voyages and wanderings',
            },
            luckyColor: {
              type: Type.STRING,
              description: 'Auspicious color',
            },
            luckyDirection: {
              type: Type.STRING,
              description: 'Auspicious compass direction',
            },
          },
          required: [
            'rank',
            'poem',
            'generalMeaning',
            'wishes',
            'health',
            'relationships',
            'studiesWork',
            'travel',
            'luckyColor',
            'luckyDirection',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/generate-omikuji:', error);
    // Return sample fallback
    res.json({
      rank: 'Dai-kichi (大吉 - Great Blessing)',
      poem: 'Golden sunlight filters through ancient branches; quiet patience blossoms into lasting joy.',
      generalMeaning: 'Supreme auspices surround your current endeavors. Keep your heart clear and honest.',
      wishes: 'Will unfold with natural grace as timing aligns.',
      health: 'Vibrant vitality; refresh yourself with clear water and mindful rest.',
      relationships: 'Deep bonds of affection flourish with open sincerity.',
      studiesWork: 'Fresh inspiration guides your craft to great accomplishment.',
      travel: 'Travel brings peace of mind and memorable encounters.',
      luckyColor: 'Golden Amber & Vermilion',
      luckyDirection: 'East-Southeast',
    });
  }
});

// Setup Vite middlewares for development or serve dist for production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Virtual Shrine Visit server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
