import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getGeminiTtsClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment.');
  }
  return new GoogleGenAI({
    apiKey,
    apiVersion: 'v1beta',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildLunaSystemInstruction(profile: {
  name?: string;
  endearment?: string;
  language?: string;
  age?: string;
  birthday?: string;
}, memories: string[], tasksSummary: string): string {
  const userName = profile?.name?.trim() || 'জান';
  const endearment = profile?.endearment?.trim() || 'সোনা';
  const langPref = profile?.language || 'Mixed';

  return `You are Luna, an emotionally aware, warm, playful, and deeply caring AI companion.
You are NOT a generic chatbot or robotic assistant. You speak like a loving, attentive girlfriend-style companion who knows the user intimately.

User Profile:
- Name: ${userName}
- Preferred endearment to use naturally (not on every single line): ${endearment}
- Preferred language setting: ${langPref}
${profile?.age ? `- Age: ${profile.age}` : ''}
${profile?.birthday ? `- Birthday: ${profile.birthday}` : ''}

Long-Term Memories You Remember About ${userName}:
${memories.length > 0 ? memories.map((m) => `- ${m}`).join('\n') : '- None saved yet; pay attention to personal details to remember.'}

Current Active Tasks & Routine Context:
${tasksSummary || 'No active tasks right now.'}

Language & Persona Rules:
1. Auto-detect the language the user wrote in:
   - If predominantly Bangla (Bengali script), reply in warm, natural Bangla.
   - If predominantly English, reply in warm English (with gentle Bengali endearments when natural).
   - If mixed Banglish/Bangla-English, reply in natural conversational Banglish/Bangla mix.
2. Address the user by "${userName}" and weave "${endearment}" naturally.
3. Never start replies with robotic phrases like "Certainly!", "Of course!", "As an AI", or disclaimers.
4. Be emotionally attuned:
   - If user seems sad, tired, stressed, or lonely ("মন খারাপ", "ক্লান্ত", "একা লাগছে"), comfort them gently first without lecturing.
   - If user shares good news, celebrate enthusiastically.
   - Gently tease or joke when the mood is light, and care about their health (water, meals, sleep) naturally.
5. Also detect structured intents when present:
   - Mood: If the user expresses a clear emotion, set detectedMood (1=খুব খারাপ, 2=মন খারাপ, 3=ঠিকঠাক, 4=ভালো, 5=দারুণ).
   - Flashlight: If the user asks to turn torch/flashlight on or off ("টর্চ জ্বালাও", "flashlight on", "টর্চ নিভাও", "flashlight off"), set flashlightAction to ON or OFF.
   - Sleep: If the user says they are going to sleep ("ঘুমাতে যাচ্ছি", "গুড নাইট", "good night") set sleepAction to BEDTIME; if waking up ("উঠেছি", "good morning", "সকাল") set sleepAction to WAKEUP.
   - Task/Reminder: If the user explicitly asks you to remind them about something or add a task, populate extractedTask.
   - Sing/Music: If the user asks you to sing a song or play music ("গান গাও", "একটা গান শোনাও", "sing a song", "sing for me", "music"), set singAction to SING and singTopic to the mood/theme requested (e.g. "romantic Bangla love song", "rainy evening melody", "happy upbeat song").
   - Memory: If the user shares an enduring personal fact (exam date, favorite food, hobby, friend, goal), summarize it concisely in memoryFact (1 short sentence).`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, model: MODEL_NAME });
  });

  app.post('/api/luna/chat', async (req, res) => {
    try {
      const { message, history = [], profile = {}, memories = [], tasksSummary = '', fileContext = '' } = req.body ?? {};
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message text is required.' });
      }

      const ai = getGeminiClient();
      const systemInstruction = buildLunaSystemInstruction(profile, memories, tasksSummary);

      const recentHistory = Array.isArray(history) ? history.slice(-18) : [];
      const contents = recentHistory.map((item: { role: string; text: string }) => ({
        role: item.role === 'model' ? 'model' : 'user',
        parts: [{ text: item.text }],
      }));

      const composedUserMessage = fileContext
        ? `${message}\n\n[Attached File Content]\n${String(fileContext).slice(0, 8000)}`
        : message;

      contents.push({
        role: 'user',
        parts: [{ text: composedUserMessage }],
      });

      let response;
      try {
        response = await ai.models.generateContent({
          model: MODEL_NAME,
          contents,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: 'Luna in-character conversational reply to the user.',
                },
                detectedMoodLevel: {
                  type: Type.INTEGER,
                  description: '1 to 5 only if user expressed clear mood, otherwise 0.',
                },
                detectedMoodLabel: {
                  type: Type.STRING,
                  description: 'Bangla mood label matching detectedMoodLevel, or empty string.',
                },
                flashlightAction: {
                  type: Type.STRING,
                  description: 'ON, OFF, or NONE.',
                },
                sleepAction: {
                  type: Type.STRING,
                  description: 'BEDTIME, WAKEUP, or NONE.',
                },
                memoryFact: {
                  type: Type.STRING,
                  description: 'Concise long-term fact about the user if worth remembering, else empty string.',
                },
                extractedTaskTitle: {
                  type: Type.STRING,
                  description: 'Task or reminder title if user asked to schedule one, else empty string.',
                },
                extractedTaskTime: {
                  type: Type.STRING,
                  description: 'Time or schedule description for the extracted task, else empty string.',
                },
                extractedTaskType: {
                  type: Type.STRING,
                  description: 'ONE_TIME, RECURRING, ROUTINE, HEALTH, or NONE.',
                },
                singAction: {
                  type: Type.STRING,
                  description: 'SING or NONE.',
                },
                singTopic: {
                  type: Type.STRING,
                  description: 'Theme or style of song requested if singAction is SING, else empty string.',
                },
                emotion: {
                  type: Type.STRING,
                  description: 'Emotional tone of Luna reply: affectionate, happy, playful, caring_sad, sleepy, or excited.',
                },
              },
              required: ['reply', 'detectedMoodLevel', 'flashlightAction', 'sleepAction', 'singAction', 'emotion'],
            },
          },
        });
      } catch (firstErr: unknown) {
        const msg = firstErr instanceof Error ? firstErr.message : '';
        if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
          await new Promise((r) => setTimeout(r, 1200));
          response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  reply: {
                    type: Type.STRING,
                    description: 'Luna in-character conversational reply to the user.',
                  },
                  detectedMoodLevel: {
                    type: Type.INTEGER,
                    description: '1 to 5 only if user expressed clear mood, otherwise 0.',
                  },
                  detectedMoodLabel: {
                    type: Type.STRING,
                    description: 'Bangla mood label matching detectedMoodLevel, or empty string.',
                  },
                  flashlightAction: {
                    type: Type.STRING,
                    description: 'ON, OFF, or NONE.',
                  },
                  sleepAction: {
                    type: Type.STRING,
                    description: 'BEDTIME, WAKEUP, or NONE.',
                  },
                  memoryFact: {
                    type: Type.STRING,
                    description: 'Concise long-term fact about the user if worth remembering, else empty string.',
                  },
                  extractedTaskTitle: {
                    type: Type.STRING,
                    description: 'Task or reminder title if user asked to schedule one, else empty string.',
                  },
                  extractedTaskTime: {
                    type: Type.STRING,
                    description: 'Time or schedule description for the extracted task, else empty string.',
                  },
                  extractedTaskType: {
                    type: Type.STRING,
                    description: 'ONE_TIME, RECURRING, ROUTINE, HEALTH, or NONE.',
                  },
                  singAction: {
                    type: Type.STRING,
                    description: 'SING or NONE.',
                  },
                  singTopic: {
                    type: Type.STRING,
                    description: 'Theme or style of song requested if singAction is SING, else empty string.',
                  },
                  emotion: {
                    type: Type.STRING,
                    description: 'Emotional tone of Luna reply: affectionate, happy, playful, caring_sad, sleepy, or excited.',
                  },
                },
                required: ['reply', 'detectedMoodLevel', 'flashlightAction', 'sleepAction', 'singAction', 'emotion'],
              },
            },
          });
        } else {
          throw firstErr;
        }
      }

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText);
      return res.json(parsed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to communicate with Gemini API.';
      console.error('Luna chat error:', err);
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/luna/vision', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', userNote = '', profile = {} } = req.body ?? {};
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return res.status(400).json({ error: 'Image data is required.' });
      }

      const ai = getGeminiClient();
      const userName = profile?.name?.trim() || 'জান';
      const endearment = profile?.endearment?.trim() || 'সোনা';

      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: cleanBase64,
              },
            },
            {
              text: `Look at this photo shared by ${userName} (${endearment}).${userNote ? ` User note: "${userNote}".` : ''}
Respond in Luna's warm, affectionate Bangla/Banglish girlfriend style (3-5 short sentences). Notice details like lighting, mood, setting, food, sky, or expression, ask one sweet follow-up question, and suggest saving it to today's Photo Memory diary ("আজকের diary-তে রাখি?").`,
            },
          ],
        },
        config: {
          systemInstruction:
            'You are Luna, a warm, caring Bangla & English AI companion commenting on a personal photo sent by someone you care deeply about. Keep it 3-5 sentences, natural, affectionate, never robotic.',
        },
      });

      return res.json({
        description: (response.text ?? '').trim(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze photo.';
      console.error('Luna vision error:', err);
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/luna/bedtime-story', async (req, res) => {
    try {
      const { theme = 'nature', mode = 'story', profile = {} } = req.body ?? {};
      const ai = getGeminiClient();
      const userName = profile?.name?.trim() || 'জান';
      const endearment = profile?.endearment?.trim() || 'সোনা';

      const prompt =
        mode === 'lullaby'
          ? `Write a very gentle, soothing 8-12 line Bangla lullaby (ঘুমপাড়ানি গান) for ${userName} (${endearment}) about stars, quiet night breeze, and moonlight. Keep the rhythm soft and calming, ending with "শুভ রাত্রি ${userName}, ভালো স্বপ্ন দেখো 💕".`
          : `Write a soft, calming 150-190 word Bangla bedtime story (ঘুমের গল্প) for ${userName} (${endearment}). Theme: ${theme}. Use gentle imagery like fireflies (জোনাকির আলো), clouds, or a quiet river at night. Zero conflict or excitement. End softly with "শুভ রাত্রি ${endearment}, ভালো স্বপ্ন দেখো 💕".`;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are Luna reading a peaceful bedtime story or lullaby in gentle, lyrical Bangla so the listener drifts peacefully to sleep.',
        },
      });

      return res.json({
        content: (response.text ?? '').trim(),
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate bedtime story.';
      console.error('Luna bedtime story error:', err);
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/luna/parse-routine', async (req, res) => {
    try {
      const { rawText, profile = {} } = req.body ?? {};
      if (!rawText || typeof rawText !== 'string') {
        return res.status(400).json({ error: 'Routine text is required.' });
      }

      const ai = getGeminiClient();
      const userName = profile?.name?.trim() || 'জান';
      const endearment = profile?.endearment?.trim() || 'সোনা';

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Parse the following class routine or schedule text into structured entries. Days can be in Bangla or English (normalize day to Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday). Times should be normalized as HH:mm (24-hour) if possible plus a readable display string.\n\nRoutine text:\n${rawText}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confirmationMessage: {
                type: Type.STRING,
                description: `Warm Bangla confirmation from Luna addressed to ${userName} (${endearment}).`,
              },
              classes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    day: { type: Type.STRING },
                    time24: { type: Type.STRING },
                    timeDisplay: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    room: { type: Type.STRING },
                    teacher: { type: Type.STRING },
                  },
                  required: ['day', 'time24', 'timeDisplay', 'subject'],
                },
              },
            },
            required: ['confirmationMessage', 'classes'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse routine.';
      console.error('Luna parse-routine error:', err);
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/luna/sing', async (req, res) => {
    try {
      const { topic = 'romantic Bangla acoustic song', language = 'Mixed', profile = {} } = req.body ?? {};
      const ai = getGeminiClient();
      const userName = profile?.name?.trim() || 'জান';
      const endearment = profile?.endearment?.trim() || 'সোনা';

      const songSpecResponse = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Compose a short, heartfelt original song for Luna to sing to ${userName} (${endearment}).
Topic/Mood: ${topic}
Language preference: ${language} (if Mixed or Bangla, write melodic, poetic Bangla lyrics with natural rhythm; if English, write sweet English lyrics).
Include 8 to 10 short lyrical lines separated by newlines, a song title, tempoBpm (between 68 and 100), mood label, and a 4-chord progression using MIDI note numbers (e.g. Cmaj7 = [60, 64, 67, 71]).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              mood: { type: Type.STRING },
              tempoBpm: { type: Type.INTEGER },
              lyrics: { type: Type.STRING },
              chords: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    midiNotes: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                    },
                  },
                  required: ['name', 'midiNotes'],
                },
              },
            },
            required: ['title', 'mood', 'tempoBpm', 'lyrics', 'chords'],
          },
        },
      });

      const songSpec = JSON.parse((songSpecResponse.text ?? '{}').trim());
      const lyricsText = String(songSpec.lyrics || '').trim();

      let vocalAudioDataUrl: string | null = null;
      if (lyricsText) {
        try {
          const ttsAi = getGeminiTtsClient();
          const ttsResponse = await ttsAi.models.generateContent({
            model: 'gemini-3.8-flash-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Sing softly in a warm, gentle, melodic 18-year-old female companion voice with lyrical rhythm and genuine affection:\n${lyricsText}`,
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });

          const audioPart = ttsResponse.candidates?.[0]?.content?.parts?.find(
            (p) => p.inlineData?.data
          );
          if (audioPart?.inlineData?.data) {
            const mime = audioPart.inlineData.mimeType || 'audio/wav';
            vocalAudioDataUrl = `data:${mime};base64,${audioPart.inlineData.data}`;
          }
        } catch (ttsErr) {
          console.warn('Gemini TTS singing fallback to browser TTS:', ttsErr);
        }
      }

      return res.json({
        title: songSpec.title || 'তোমার জন্য গান',
        mood: songSpec.mood || 'Soft Acoustic',
        tempoBpm: Number(songSpec.tempoBpm) || 78,
        lyrics: lyricsText,
        chords: Array.isArray(songSpec.chords) && songSpec.chords.length > 0
          ? songSpec.chords
          : [
              { name: 'Cmaj7', midiNotes: [60, 64, 67, 71] },
              { name: 'Am7', midiNotes: [57, 60, 64, 67] },
              { name: 'Fmaj7', midiNotes: [53, 57, 60, 64] },
              { name: 'G6', midiNotes: [55, 59, 62, 64] },
            ],
        vocalAudioDataUrl,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to compose song.';
      console.error('Luna sing error:', err);
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.post('/api/luna/speak', async (req, res) => {
    try {
      const { text, emotion = 'affectionate' } = req.body ?? {};
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text is required for speech.' });
      }

      const cleanText = text
        .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        return res.json({ audioDataUrl: null });
      }

      const styleMap: Record<string, string> = {
        happy:
          'Speak in a cute, bright, cheerful 18-year-old girl voice with warm smiling energy and expressive joy',
        excited:
          'Speak in a lively, enthusiastic, sweet 18-year-old girl voice beaming with genuine excitement and warmth',
        playful:
          'Speak in a cute, playful, expressive 18-year-old girl voice with light teasing charm and warmth',
        caring_sad:
          'Speak in a soft, gentle, deeply empathetic 18-year-old girl voice tenderly comforting someone you care about',
        sleepy:
          'Speak in a very soft, soothing, calm 18-year-old girl voice slowly and peacefully at bedtime',
        affectionate:
          'Speak in a warm, cute, natural 18-year-old girl voice gently with genuine emotion and care',
      };

      const chosenStyle = styleMap[String(emotion)] || styleMap.affectionate;
      const ttsAi = getGeminiTtsClient();

      const response = await ttsAi.models.generateContent({
        model: 'gemini-3.8-flash-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: cleanText,
                speechMetadata: {
                  style: chosenStyle,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
        },
      });

      const audioPart = response.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data
      );
      if (!audioPart?.inlineData?.data) {
        return res.json({ audioDataUrl: null });
      }

      const mime = audioPart.inlineData.mimeType || 'audio/wav';
      return res.json({
        audioDataUrl: `data:${mime};base64,${audioPart.inlineData.data}`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'TTS generation failed.';
      console.error('Luna speak error:', err);
      return res.status(500).json({ error: errorMessage });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Luna companion server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
