import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
const distPath = path.resolve(process.cwd(), 'dist');
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

app.use(express.json());

// Health check endpoint for Cloud Run container monitoring
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Initialize Google GenAI client if GEMINI_API_KEY is available
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize Google GenAI:', err);
  }
}

// 1. Live Match Announcer Commentary API
app.post('/api/commentary', async (req: Request, res: Response) => {
  const { player1, player2, eventType, comboCount, p1Hp, p2Hp, stage } = req.body;
  
  if (!ai) {
    // High-energy procedural fallback commentary
    const fallbacks = [
      `OH MY! ${player1} unleashes a devastating ${comboCount > 1 ? comboCount + '-hit combo' : 'strike'} in the ${stage || 'Arena'}!`,
      `Incredible counter! ${player2} is fighting for survival with only ${p2Hp}% health left!`,
      `Mehmona Arena is roaring! ${player1} commands the center of the ring!`,
      `WHAT A HIT! The speed, the power—this is true championship fighting!`,
      `Listen to the arena crowd! Can ${player2} mount a comeback against ${player1}?!`
    ];
    const text = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return res.json({ commentary: text, source: 'arcade-engine' });
  }

  try {
    const prompt = `You are the legendary energetic hype fight announcer in the arcade fighting game "Warrior Arena" created by Mehmona Jabeen.
Current fight: ${player1} vs ${player2}.
Stage: ${stage || 'Mehmona Grand Arena'}.
Event: ${eventType || 'strike'}.
Player 1 HP: ${p1Hp}%, Player 2 HP: ${p2Hp}%.
Current combo: ${comboCount} hits.

Provide ONE short, punchy, high-energy arcade line (maximum 18 words, Street Fighter style, all caps emphasis on hype words). Mention the fighters or Mehmona Arena.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const commentary = response.text?.trim() || `SAVAGE COMBO FROM ${player1}! THE ARENA IS SHAKING!`;
    return res.json({ commentary, source: 'gemini-ai' });
  } catch (error: any) {
    console.error('Commentary generation error:', error?.message);
    return res.json({
      commentary: `UNBELIEVABLE HIT! ${player1} delivers pure arcade fury!`,
      source: 'fallback',
    });
  }
});

// 2. AI Fight Coach Tactics API
app.post('/api/tactics', async (req: Request, res: Response) => {
  const { fighter, opponent, userStyle } = req.body;

  if (!ai) {
    const defaultTips = [
      `Keep mid-range distance against ${opponent}. Bait their heavy attack, then punish with your Light Kick -> Heavy Punch combo!`,
      `Charge your Super Meter by deflecting projectiles with Block! When ${opponent} whiffs their special, activate your Ultimate!`,
      `Use dash cancel to mix up between low sweep and overhead jump kicks. Keep ${opponent} guessing!`,
    ];
    return res.json({
      tactics: defaultTips[Math.floor(Math.random() * defaultTips.length)],
      source: 'arcade-engine',
    });
  }

  try {
    const prompt = `You are Sensei Mehmona, Grand Champion and creator of Warrior Arena.
Player is fighting as "${fighter}" facing opponent "${opponent}".
Provide 2 short, sharp tactical tips (under 40 words total) in fighting-game lingo (frames, spacing, combos, counters, super meter).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ tactics: response.text?.trim(), source: 'gemini-ai' });
  } catch (error: any) {
    return res.json({
      tactics: `Punish ${opponent}'s recovery frames with a quick 3-hit link into your Rising Special!`,
      source: 'fallback',
    });
  }
});

// 3. AI Fighter Voice Taunt / Battle Cry
app.post('/api/voice-taunt', async (req: Request, res: Response) => {
  const { fighter, opponent, outcome } = req.body;

  if (!ai) {
    const taunts: Record<string, string[]> = {
      Mehmona: [
        'Welcome to my arena! Let us see if your spirit can match my steel!',
        'A warrior fights with discipline and heart! Rise and try again!',
        'Flawless technique! The Grand Champion title remains untouched!'
      ],
      Zara: [
        'You blinked! That was your only mistake.',
        'Shadows move faster than your blade.',
        'Is that all you brought to the arena?'
      ],
      Jin: [
        'My dragon fist burns with unyielding fire!',
        'Feel the martial art of true champions!',
        'Stand up! Our battle has only begun!'
      ],
      Ayla: [
        'Systems locked. Target neutralized.',
        'Cybernetic precision always triumphs over raw fury.',
        'Recalibrating power shields for the next contender.'
      ],
      Tariq: [
        'You can not break titanium armor with toothpicks!',
        'Tremble before the seismic shockwave!',
        'Hahaha! Come back when you have grown stronger!'
      ],
      Rex: [
        'Too slow for the neon underground!',
        'Catch me if you can, rookie!',
        'That combo was pure rhythm and laser smoke!'
      ]
    };
    const pool = taunts[fighter] || taunts['Mehmona'];
    const text = pool[Math.floor(Math.random() * pool.length)];
    return res.json({ taunt: text });
  }

  try {
    const prompt = `Generate a single dramatic combat voice taunt or battle line for warrior "${fighter}" in "Warrior Arena by Mehmona Jabeen".
Opponent: "${opponent}".
Situation: ${outcome || 'mid-fight taunt'}.
Keep it fierce, stylish, under 15 words.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ taunt: response.text?.trim() });
  } catch (err) {
    return res.json({ taunt: 'The arena belongs to the fearless!' });
  }
});

// 4. Voice Chat / Comms simulated channel
app.post('/api/voice-chat', async (req: Request, res: Response) => {
  const { message, speakerName } = req.body;

  if (!ai) {
    const replies = [
      `Roger that! Watch your six, teammate!`,
      `Push forward, save your Super Bar for the final round!`,
      `Nice counter! Grandmaster Mehmona would be proud!`,
      `Let's secure this win for the global leaderboards!`,
      `GG! Let's rematch in ranked mode!`
    ];
    return res.json({ reply: replies[Math.floor(Math.random() * replies.length)] });
  }

  try {
    const prompt = `You are a hype teammate or arena fighter in the voice comms channel of the fighting game Warrior Arena (by Mehmona Jabeen).
The user says: "${message}".
Speaker persona: "${speakerName || 'Arena Squad'}".
Respond back in voice chat like a friendly gamer teammate in 1 short sentence (under 16 words).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ reply: response.text?.trim() });
  } catch (err) {
    return res.json({ reply: 'Covering your flanks! Let us take down the champion!' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Warrior Arena] Server running on port ${PORT} (isProduction: ${isProduction})`);
  });
}

startServer();
