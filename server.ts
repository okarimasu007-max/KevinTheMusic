import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const PORT = 3000;
const isProd = process.env.NODE_ENV === "production";

// Initialize Gemini API securely if available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API initialized successfully.");
} else {
  console.warn("GEMINI_API_KEY environment variable is not defined. AI music creation will fall back to smart local procedural generation.");
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoint: Generate Custom life stage song based on user input
  app.post("/api/songs/generate", async (req, res) => {
    const { memory, stage, vibe, instrument } = req.body;

    if (!memory || !stage || !vibe) {
      return res.status(400).json({ error: "Isi kolom memori, fase hidup, dan suasana hati terlebih dahulu!" });
    }

    try {
      if (!ai) {
        // Safe backend fallback in case API key is somehow missing
        const fallbackId = `ai-fallback-${Date.now()}`;
        return res.json({
          id: fallbackId,
          title: `Melodi ${vibe} di Masa ${stage}`,
          mood: vibe,
          stage: stage,
          bpm: vibe === "Sad" || vibe === "Warm" || vibe === "Damai" ? 80 : 110,
          description: `Sebuah aransemen ${vibe.toLowerCase()} untuk mengenang: "${memory.substring(0, 50)}..."`,
          story: `Kisah dibalik lagu: ${memory}. Musik ini dirancang secara prosedural melingkupi fase ${stage} Anda yang penuh dengan nuansa ${vibe.toLowerCase()}.`,
          lyrics: [
            `Mengingat kembali lembaran usia ${stage},`,
            `Saat kenangan terlukis di antara waktu,`,
            `Rasa ${vibe.toLowerCase()} mengalir hangat dalam nafas,`,
            `Langkah kita mengabadi, terpatri indah selamanya.`
          ],
          chordProgression: ["C", "G", "Am", "F"],
          melodyPattern: [
            { note: "E4", duration: 0.5, time: 0.0 },
            { note: "G4", duration: 0.5, time: 1.0 },
            { note: "C5", duration: 1.0, time: 2.0 },
            { note: "B4", duration: 1.0, time: 4.0 },
            { note: "A4", duration: 1.0, time: 6.0 }
          ],
          colorTheme: "from-purple-600 to-pink-600",
          isAI: true
        });
      }

      const prompt = `
        Analisis potongan memori, suasana hati, instrumen, dan fase kehidupan berikut untuk menciptakan sebuah profil lagu orisinal yang sangat puitis dan indah.
        
        KATA KUNCI MEMORI USER: "${memory}"
        FASE KEHIDUPAN: "${stage}"
        SUASANA HATI (MOOD): "${vibe}"
        PREFERENSI INSTRUMEN: "${instrument || "Sintetis Universal"}"

        Berikan keluaran dalam format JSON yang valid dengan skema berikut:
        {
          "title": "judul lagu yang sangat puitis dan bermakna dalam bahasa Indonesia",
          "mood": "suasana hati lagu, satu kata deskriptif",
          "stage": "fase kehidupan",
          "bpm": angka rentang 60 sampai 125, sesuaikan bpm lambat (60-80) jika sedih/tenang, sedang/cepat (90-125) jika ceria/semangat,
          "description": "deskripsi singkat 1 kalimat puitis mengenai rasa lagu tersebut",
          "story": "narasi singkat 2-3 kalimat menghubungkan memori yang user tulis dengan musik ini secara empati",
          "lyrics": [
            "baris lirik indah 1 (Bahasa Indonesia)",
            "baris lirik indah 2",
            "baris lirik indah 3",
            "baris lirik indah 4",
            "baris lirik indah 5",
            "baris lirik indah 6"
          ],
          "chordProgression": ["4 chord representatif dalam kunci C Mayor, contoh: [\"C\", \"G\", \"Am\", \"F\"] atau [\"Am\", \"F\", \"C\", \"G\"]"],
          "melodyPattern": [
            {"note": "Nama note (misal C4, D4, E4, F4, G4, A4, B4, C5, D5, E5)", "duration": durasi detik (0.5 atau 0.25 atau 1.0), "time": waktu mulai berjalan dari 0.0 sampai 7.5, berjarak ideal genap seperti 0.0, 0.5, 1.0, 1.5, dan seterusnya}
          ],
          "colorTheme": "pilihan warna gradien Tailwind yang cocok dengan suasana hati, misal: 'from-amber-500 to-orange-700' untuk nostalgia hangat, 'from-blue-600 to-indigo-900' untuk sedih/sunyi, 'from-emerald-500 to-teal-700' untuk kedamaian, 'from-rose-500 to-purple-700' untuk remaja ceria."
        }

        Pastikan field "melodyPattern" memiliki setidaknya 8-12 entri note melodi indah yang seirama dengan progression yang Anda buat. Nada-nada yang valid antara lain: C4, D4, E4, F4, G4, A4, B4, C5, D5, E5, F5, G5. Pastikan waktu mulai berkisar antara 0.0 detik sampai 7.5 detik agar pas dalam loop 8 detik.
        Kembalikan HANYA JSON murni yang valid tanpa membungkusnya dalam markdown backticks.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "Anda adalah kurator musik profesional dan produser kreatif jenius yang membantu menerjemahkan emosi dan memori manusia ke dalam bentuk aransemen lagu puitis lengkap dengan lirik puitis dan susunan nada melodi MIDI sederhana."
        }
      });

      const responseText = response.text || "{}";
      const songData = JSON.parse(responseText.trim());

      // Assure IDs and metadata are complete
      const cleanSong = {
        id: `ai-${Date.now()}`,
        title: songData.title || `Melodi Kenangan ${vibe}`,
        mood: songData.mood || vibe,
        stage: songData.stage || stage,
        bpm: Number(songData.bpm) || 90,
        description: songData.description || "Sebuah alunan memori puitis.",
        story: songData.story || `Diinspirasi dari kenangan berharga Anda di masa ${stage}.`,
        lyrics: songData.lyrics || [
          "Matahari tenggelam menyambut waktu,",
          "Menyisakan sebaris senyum hangatmu.",
          "Di sinilah alunan melodi bersemi,",
          "Bernyanyi sunyi tentang mimpi."
        ],
        chordProgression: songData.chordProgression || ["C", "G", "Am", "F"],
        melodyPattern: songData.melodyPattern || [
          { note: "C4", duration: 0.5, time: 0.0 },
          { note: "E4", duration: 0.5, time: 1.0 },
          { note: "G4", duration: 0.5, time: 2.0 },
          { note: "A4", duration: 0.5, time: 3.0 },
          { note: "G4", duration: 1.0, time: 4.0 },
          { note: "E4", duration: 1.0, time: 6.0 }
        ],
        colorTheme: songData.colorTheme || "from-sky-500 to-indigo-600",
        isAI: true
      };

      res.json(cleanSong);
    } catch (err: any) {
      console.error("Gemini song generation error:", err);
      res.status(500).json({ error: "Gagal berdiskusi dengan AI untuk menyusun melodimu. Silakan coba sebentar lagi!" });
    }
  });

  // Client asset serving (Vite in Dev, static folder in Prod)
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server runs on http://localhost:${PORT} [ENV: ${process.env.NODE_ENV || "development"}]`);
  });
}

startServer();
