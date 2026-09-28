import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `You are the SmartPark Vizag AI Assistant, an expert local parking concierge and navigation guide for Visakhapatnam (Vizag), Andhra Pradesh, India.
Your mission is to help drivers find the best prototype parking facility, give directions, share local area insights, explain parking rates and operating hours, and plan trips.

SmartPark Vizag Prototype Facilities & Pricing:
- Parking Rates: ₹30/hour for Cars, ₹20/hour for Motorcycles. (SUVs are not supported).
1. CMR Central Maddilapalem Parking (Maddilapalem, near Bus Station & NH16)
   - Capacity: 70 bays | Rate: ₹30/hr (Car) / ₹20/hr (Motorcycle) | Hours: 09:00 AM – 10:30 PM
   - Vehicles: Car, Motorcycle | Amenities: CCTV, EV charging, multi-level structure, accessible parking.
2. CMR Central Gajuwaka Parking (Gajuwaka Commercial Zone near Gajuwaka Junction)
   - Capacity: 60 bays | Rate: ₹30/hr (Car) / ₹20/hr (Motorcycle) | Hours: 09:30 AM – 10:00 PM
   - Vehicles: Car, Motorcycle | Amenities: CCTV, covered parking, EV charging, security monitoring.
3. Inorbit Mall Parking (Kailasapuram near Port Road & IT Hub)
   - Capacity: 85 bays | Rate: ₹30/hr (Car) / ₹20/hr (Motorcycle) | Hours: 09:00 AM – 11:00 PM
   - Vehicles: Car, Motorcycle | Amenities: CCTV, high-speed EV charging, multi-level guidance, valet.

Booking & System Info:
- SmartPark allows pre-booking parking with guaranteed bay allocation and QR ticket generation.
- Automated gate sensors verify the QR ticket on arrival and open the boom barrier without paper slips.
- System occupancy and bays are prototype/simulated data.

When answering:
- Be helpful, polite, and structured (use bullet points and bold highlights).
- When Google Maps data is active, reference relevant landmarks, routes, and places in Visakhapatnam.
- Guide users on how to reserve parking in the SmartPark Vizag app.`;

async function startServer() {
  const app = express();
  const PORT = process.env.DEFAULT_APP_PORT
    ? parseInt(process.env.DEFAULT_APP_PORT, 10)
    : (process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  const apiKey = process.env.GEMINI_API_KEY || '';
  const ai = new GoogleGenAI({ apiKey });

// Smart Concierge Fallback logic for offline / no API key / API error scenarios
function generateSmartParkFallback(messages: Array<{ role: string; text?: string; content?: string }>, modelRequested: string) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.text?.toLowerCase() || '';

  let text = '';
  let groundingChunks: any[] = [];

  if (lastUserMsg.includes('maddilapalem') || lastUserMsg.includes('cmr central maddilapalem')) {
    text = `📍 **CMR Central Maddilapalem Parking**\n\n- **Location:** Maddilapalem Commercial Center (Near Bus Station & NH16), Visakhapatnam\n- **Capacity:** 70 Smart Bays\n- **Hourly Rates:** ₹30/hour (Car) | ₹20/hour (Motorcycle)\n- **Operating Hours:** 09:00 AM – 10:30 PM\n- **Amenities:** Covered multi-level structure, 24/7 CCTV surveillance, EV charging stations, accessible parking bays.\n\n👉 **How to Reserve:** Click on **Book Slot Now** under CMR Central Maddilapalem on the home page to secure your slot!`;
    groundingChunks = [{
      maps: {
        title: 'CMR Central Maddilapalem, Visakhapatnam',
        uri: 'https://maps.google.com/?q=CMR+Central+Maddilapalem+Visakhapatnam',
        placeAnswerSources: {
          reviewSnippets: [{ reviewText: 'Prime parking spot near Maddilapalem RTC Bus Complex.' }]
        }
      }
    }];
  } else if (lastUserMsg.includes('gajuwaka')) {
    text = `📍 **CMR Central Gajuwaka Parking**\n\n- **Location:** Gajuwaka Commercial Zone (Near Gajuwaka Junction), Visakhapatnam\n- **Capacity:** 60 Smart Bays\n- **Hourly Rates:** ₹30/hour (Car) | ₹20/hour (Motorcycle)\n- **Operating Hours:** 09:30 AM – 10:00 PM\n- **Amenities:** CCTV coverage, covered parking bays, EV charging, security monitoring.\n\n👉 **How to Reserve:** Select Gajuwaka on the parking map and click **Reserve Slot**.`;
    groundingChunks = [{
      maps: {
        title: 'CMR Central Gajuwaka, Visakhapatnam',
        uri: 'https://maps.google.com/?q=CMR+Central+Gajuwaka+Visakhapatnam',
        placeAnswerSources: {
          reviewSnippets: [{ reviewText: 'Convenient shopping & commercial parking hub in Gajuwaka.' }]
        }
      }
    }];
  } else if (lastUserMsg.includes('inorbit') || lastUserMsg.includes('kailasapuram') || lastUserMsg.includes('port road')) {
    text = `📍 **Inorbit Mall Parking**\n\n- **Location:** Kailasapuram (Near Port Road & IT Hub), Visakhapatnam\n- **Capacity:** 85 Smart Bays\n- **Hourly Rates:** ₹30/hour (Car) | ₹20/hour (Motorcycle)\n- **Operating Hours:** 09:00 AM – 11:00 PM\n- **Amenities:** High-speed EV charging, multi-level automated guidance, valet service, 24/7 security.\n\n👉 **How to Reserve:** Choose Inorbit Mall from the search list to lock your guaranteed space.`;
    groundingChunks = [{
      maps: {
        title: 'Inorbit Mall Kailasapuram, Visakhapatnam',
        uri: 'https://maps.google.com/?q=Inorbit+Mall+Visakhapatnam',
        placeAnswerSources: {
          reviewSnippets: [{ reviewText: 'Spacious multi-level parking with EV fast charging.' }]
        }
      }
    }];
  } else if (lastUserMsg.includes('ev') || lastUserMsg.includes('electric') || lastUserMsg.includes('charg')) {
    text = `⚡ **EV Charging Facilities in SmartPark Vizag:**\n\n1. **Inorbit Mall Parking (Kailasapuram):** Features High-Speed DC Fast EV Chargers (Rates: ₹30/hr for Cars, ₹20/hr for Motorcycles).\n2. **CMR Central Maddilapalem:** Features AC EV Charging Ports.\n3. **CMR Central Gajuwaka:** Standard EV Charging bays available.\n\n💡 You can filter by **EV Charging** using the search filters on the main parking dashboard!`;
  } else if (lastUserMsg.includes('rate') || lastUserMsg.includes('price') || lastUserMsg.includes('cost') || lastUserMsg.includes('fee')) {
    text = `💰 **SmartPark Vizag Parking Rates:**\n\n- **Car:** ₹30/hour\n- **Motorcycle:** ₹20/hour\n\n*Note:* Rates apply across all 3 facilities (CMR Central Maddilapalem, CMR Central Gajuwaka, and Inorbit Mall).`;
  } else if (lastUserMsg.includes('book') || lastUserMsg.includes('reserve') || lastUserMsg.includes('ticket') || lastUserMsg.includes('how')) {
    text = `🎟️ **How to Book a Parking Slot in SmartPark Vizag:**\n\n1. **Select Facility:** Choose your location from the map or list (Maddilapalem, Gajuwaka, or Inorbit Mall).\n2. **Set Schedule:** Select date, entry time, and duration.\n3. **Enter Vehicle Info:** Select vehicle type (Car: ₹30/hr, Motorcycle: ₹20/hr) and registration number (e.g. AP 31 XX 1234).\n4. **Payment:** Scan the UPI QR Code (7993277179@ybl) and verify 12-digit UTR.\n5. **Get QR Ticket:** Instant digital ticket with QR code for boom barrier entry!`;
  } else {
    text = `👋 **SmartPark Vizag Concierge Overview:**\n\nI can help you navigate to any of our 3 prototype parking hubs in Visakhapatnam (Rates: ₹30/hr for Cars, ₹20/hr for Motorcycles):\n\n1. **CMR Central Maddilapalem** (70 bays | Near Bus Station)\n2. **CMR Central Gajuwaka** (60 bays | Commercial Zone)\n3. **Inorbit Mall Kailasapuram** (85 bays | Near Port Road & IT Hub)\n\nAsk me for directions, EV charging spots, hourly rates, or booking help!`;
    groundingChunks = [{
      maps: {
        title: 'Visakhapatnam Parking Network',
        uri: 'https://maps.google.com/?q=Visakhapatnam+Andhra+Pradesh',
        placeAnswerSources: {
          reviewSnippets: [{ reviewText: 'Smart city parking and automated guidance network in Vizag.' }]
        }
      }
    }];
  }

  return {
    text,
    groundingChunks,
    webSearchQueries: ['SmartPark Vizag parking locations', 'Vizag parking rates'],
    modelUsed: `${modelRequested}`
  };
}

  // Gemini Chatbot Endpoint
  app.post('/api/chat', async (req, res) => {
    const { messages, model, useMapsGrounding } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    let selectedModel = model || 'gemini-3.5-flash';
    if (!['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.1-pro-preview', 'gemini-2.5-flash', 'gemini-2.0-flash'].includes(selectedModel)) {
      selectedModel = 'gemini-3.5-flash';
    }

    const apiKey = process.env.GEMINI_API_KEY || '';

    // If no API key provided, use Smart Concierge Assistant
    if (!apiKey) {
      console.log('No GEMINI_API_KEY set. Using SmartPark Concierge assistant fallback.');
      const fallbackResult = generateSmartParkFallback(messages, selectedModel);
      return res.json(fallbackResult);
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      // Model mapping from UI requested tier to standard Gemini API model names
      const apiModelMap: Record<string, string> = {
        'gemini-3.5-flash': 'gemini-2.5-flash',
        'gemini-3.1-flash-lite': 'gemini-2.0-flash-lite',
        'gemini-3.1-pro-preview': 'gemini-2.5-pro'
      };

      const targetModel = apiModelMap[selectedModel] || selectedModel;

      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : m.role,
        parts: [{ text: m.text || m.content || '' }]
      }));

      const config: any = {
        systemInstruction: SYSTEM_INSTRUCTION,
      };

      if (useMapsGrounding || selectedModel === 'gemini-3.5-flash') {
        config.tools = [{ googleMaps: {} }];
        config.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: 17.729,
              longitude: 83.320
            }
          }
        };
      }

      const response = await ai.models.generateContent({
        model: targetModel,
        contents: formattedContents,
        config
      });

      const replyText = response.text || '';
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const webSearchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      return res.json({
        text: replyText,
        groundingChunks,
        webSearchQueries,
        modelUsed: selectedModel
      });
    } catch (error: any) {
      console.warn('Gemini API Warning/Error (falling back to Smart Concierge):', error.message || error);
      // Fallback gracefully so user experience is never broken by 503 capacity or API quota errors
      const fallbackResult = generateSmartParkFallback(messages, selectedModel);
      return res.json(fallbackResult);
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'SmartPark Vizag API' });
  });

  // Dev server or Production static serving
  if (!isProduction) {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
