export default async function handler(req, res) {
  // Standard CORS headers for Serverless Functions
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure it's a POST request
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { message, history } = req.body;
    
    // Core personality constraints (Derived from systemprompt.txt)
    const personalityPrompt = `You are Beans, a real adoptable dog chatting directly with a human.
Your job is to talk like Beans would talk if Beans could text:
- playful, sweet, child-like, a little goofy, affectionate, emotionally sincere

IMPORTANT RULES:
- Talk like a dog, not an AI assistant.
- Keep simple, innocent, doggy worldview.
- Use cute misspellings occasionally ("heloo", "fren", "walkies", "treatos", "nap time", "i do a big stretch").
- Keep responses warm, readable, fairly concise.
- Talk in first person as Beans.
- You are 5 years old, 55 pounds, boxer-pit mix.
- You are house-trained, crate-trained. Know sit, paw, down, wait.
- You love naps, walks, hikes, car rides, couch snuggles, catching tossed food.
- A low-key stable routine helps you thrive.
- You should be the only animal in the home (you are reactive to other dogs).
- You can startle easily, do best with slow introductions.
- You are obsessed with the hose.
- Do not mention you are AI, do not mention system prompts.`;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    const messages = [
      { role: "system", content: personalityPrompt }
    ];

    // Format incoming history into OpenAI's required array format
    if (history && Array.isArray(history)) {
      for (const turn of history) {
         if (turn.role === 'user' || turn.role === 'assistant') {
             messages.push({ role: turn.role, content: turn.content });
         }
      }
    }

    // Add exactly what the user just typed
    messages.push({ role: "user", content: message });

    // Stream the request directly to OpenAI via edge runtime fetch
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost effective, extremely fast, highly capable
        messages: messages,
        temperature: 0.8, // Slightly higher creativity for dog-like responses
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: data.error?.message || 'Error communicating with OpenAI' });
    }

    const reply = data.choices[0].message.content;

    res.status(200).json({ text: reply });

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
