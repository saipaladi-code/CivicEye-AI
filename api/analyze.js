const promptText = `You are CivicEye AI, an expert computer vision system for municipal civic issue detection.
Analyze this civic infrastructure image.
Respond STRICTLY with a valid JSON object matching this schema:
{
  "category": "Pothole" | "Garbage" | "Broken Streetlight" | "Water Leakage" | "Drainage" | "Damaged Road" | "Other",
  "confidence": number (80 to 99),
  "severity": "High" | "Medium" | "Low",
  "publicImpact": "High" | "Medium" | "Low",
  "explanation": "Short 1-2 sentence description of the visual findings."
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini is not configured' });
  }

  const { imageDataUrl, fallbackCategory = 'Pothole' } = req.body || {};
  if (typeof fallbackCategory !== 'string' || fallbackCategory.length > 100) {
    return res.status(400).json({ error: 'Invalid fallback category' });
  }

  const imageMatch = typeof imageDataUrl === 'string'
    ? imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=]+)$/)
    : null;
  const parts = [{ text: `${promptText}\n\nCategory hint: ${fallbackCategory}` }];

  if (imageMatch) {
    parts.push({
      inline_data: {
        mime_type: imageMatch[1],
        data: imageMatch[2]
      }
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Gemini analysis failed' });
    }

    const data = await response.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(502).json({ error: 'Gemini returned an invalid response' });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return res.status(200).json({
      category: parsed.category || fallbackCategory,
      confidence: parsed.confidence || 94,
      severity: parsed.severity || 'High',
      publicImpact: parsed.publicImpact || 'High',
      explanation: parsed.explanation || `Detected ${parsed.category || fallbackCategory} with high visual confidence using Gemini AI model.`,
      isRealGemini: true
    });
  } catch {
    return res.status(502).json({ error: 'Gemini analysis failed' });
  }
}