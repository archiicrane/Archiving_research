export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, archiveImages } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const archiveSummary = archiveImages.map(item => ({
      id: item.id,
      title: item.title,
      year: item.year,
      tags: item.tags,
      description: item.description,
      imageUrl: item.imageUrl
    }));

    const prompt = `
You are an assistant for an architecture drawing archive.

The user is asking about the archive collection.
Use only the collection data provided below.
If helpful, recommend specific drawings by title and imageUrl.

Collection:
${JSON.stringify(archiveSummary, null, 2)}

User question:
${question}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed"
      });
    }

    const answer =
      data.output_text ||
      "I could not generate a response.";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}