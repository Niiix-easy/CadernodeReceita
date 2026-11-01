import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

async function createServer() {
  const app = express();
  app.use(express.json());

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);

  app.post('/api/nutrition', async (req, res) => {
    const { ingredients } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `For the following ingredients: ${ingredients.join(', ')}, provide estimated nutrition facts (calories, protein, fats, carbs) in JSON format.`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              calories: { type: Type.NUMBER },
              protein: { type: Type.STRING },
              fats: { type: Type.STRING },
              carbs: { type: Type.STRING }
            }
          }
        }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch nutrition' });
    }
  });

  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

createServer();
