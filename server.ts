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

  app.post('/api/smart-pantry-recipes', async (req, res) => {
    const { expiringItems } = req.body;
    try {
      const itemsList = Array.isArray(expiringItems) && expiringItems.length > 0
        ? expiringItems.join(', ')
        : 'ovos, tomate, leite, queijo';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are a professional chef specializing in zero-waste cooking. Given these ingredients nearing expiration: ${itemsList}, suggest exactly 3 quick-prep recipes (under 25 minutes) that use as many of these expiring ingredients as possible. Return JSON in Portuguese with this exact schema.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recipes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    prepTime: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    usedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    extraIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instructions: { type: Type.STRING }
                  },
                  required: ['title', 'prepTime', 'difficulty', 'usedIngredients', 'instructions']
                }
              }
            },
            required: ['recipes']
          }
        }
      });
      res.json(JSON.parse(response.text || '{"recipes":[]}'));
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to generate smart pantry recipes' });
    }
  });

  app.get('/api/og-image', (req, res) => {
    const title = (req.query.title as string) || 'Caderno de Receitas';
    const category = (req.query.category as string) || 'Receita Especial';
    const time = (req.query.time as string) || '20-30 min';
    const calories = (req.query.calories as string) || '';

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDFBF7"/>
            <stop offset="50%" stop-color="#FFF8F3"/>
            <stop offset="100%" stop-color="#F7EBE3"/>
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#E28B6E"/>
            <stop offset="100%" stop-color="#C86D51"/>
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bg)"/>

        <!-- Outer Border -->
        <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="#E28B6E" stroke-width="3" stroke-opacity="0.3"/>

        <!-- Header / Brand -->
        <g transform="translate(80, 90)">
          <circle cx="16" cy="16" r="12" fill="#E28B6E"/>
          <text x="40" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#2C3E50" letter-spacing="2">
            CADERNO DE RECEITAS
          </text>
        </g>

        <!-- Category Badge -->
        <g transform="translate(80, 160)">
          <rect width="180" height="38" rx="19" fill="#E28B6E" fill-opacity="0.15"/>
          <text x="90" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#C86D51" text-anchor="middle">
            ${category.toUpperCase()}
          </text>
        </g>

        <!-- Recipe Title (Wrapped text preview) -->
        <text x="80" y="280" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#1A202C">
          <tspan x="80" dy="0">${title.length > 32 ? title.substring(0, 32) + '...' : title}</tspan>
        </text>

        <!-- Recipe Details Badges -->
        <g transform="translate(80, 360)">
          <!-- Time Tag -->
          <rect x="0" y="0" width="200" height="48" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
          <text x="20" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="600" fill="#4A5568">
            ⏱ ${time}
          </text>

          <!-- Calories Tag -->
          ${calories ? `
            <rect x="220" y="0" width="220" height="48" rx="12" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="2"/>
            <text x="240" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="#065F46">
              🔥 ${calories} kcal
            </text>
          ` : ''}
        </g>

        <!-- Footer / Watermark -->
        <line x1="80" y1="480" x2="1120" y2="480" stroke="#E28B6E" stroke-opacity="0.2" stroke-width="2"/>
        <g transform="translate(80, 530)">
          <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#718096">
            Acesse e veja o modo de preparo completo:
          </text>
          <text x="1040" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#C86D51" text-anchor="end">
            caderno-de-receitas.app
          </text>
        </g>
      </svg>
    `;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(svg);
  });

  app.listen(3000, () => console.log('Server running on http://localhost:3000'));
}

createServer();
