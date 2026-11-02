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

  app.post('/api/generate-image', async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Generate a high-quality, professional food photography image for: ${prompt}. The style should be clean, rustic, and appetizing.`,
      });
      // Assuming response.text is a property or accessible value
      const image = response.text; 
      if (image) {
        res.json({ image });
      } else {
        res.status(500).json({ error: 'No image generated' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  });

  app.post('/api/suggest-substitution', async (req, res) => {
    const { ingredient } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Suggest 3 healthy or allergen-free alternatives for the ingredient: ${ingredient}. Return them in JSON format as a list of strings.`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      });
      res.json(JSON.parse(response.text || '[]'));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to suggest substitutions' });
    }
  });

  app.post('/api/categorize-items', async (req, res) => {
    const { ingredients } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Categorize the following shopping items into aisles: ${ingredients.join(', ')}. Return a JSON object where keys are the aisle names and values are arrays of items.`,
        config: { 
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                aisles: { 
                    type: Type.OBJECT,
                    additionalProperties: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
            }
          }
        }
      });
      res.json(JSON.parse(response.text || '{}'));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to categorize items' });
    }
  });

  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

createServer();
