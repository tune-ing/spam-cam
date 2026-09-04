import { createFileRoute } from "@tanstack/react-router";

type ParsedEvent = {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string;
  uncertainFields?: string[];
};

const SYSTEM_PROMPT = `You extract event details from photographs of paper flyers, posters and printed notices.
Return ONLY a JSON object, no prose, no markdown fences, matching exactly:
{
  "title": string,
  "startDate": "YYYY-MM-DDTHH:mm:ss",
  "endDate": "YYYY-MM-DDTHH:mm:ss",
  "location": string,
  "description": string,
  "uncertainFields": string[]
}
Rules:
- Use the flyer's stated year. If no year is printed, assume the next occurrence relative to today's date given by the user.
- If no end time is printed, set endDate to two hours after startDate.
- description should summarise extra notes: price, contact, age limits, lineup.
- uncertainFields lists the keys ("title","startDate","endDate","location","description") whose value you guessed or could not read clearly.`;

export const Route = createFileRoute("/api/parse-flyer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "AI is not configured." }, { status: 401 });
        }

        let body: { image?: string };
        try {
          body = (await request.json()) as { image?: string };
        } catch {
          return Response.json({ error: "Invalid request body." }, { status: 400 });
        }

        const image = body.image;
        if (!image || !image.startsWith("data:image/")) {
          return Response.json({ error: "A base64 image data URL is required." }, { status: 400 });
        }

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3.6-flash",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: `Today is ${new Date().toISOString().slice(0, 10)}. Extract the event from this flyer.`,
                  },
                  { type: "image_url", image_url: { url: image } },
                ],
              },
            ],
          }),
        });

        if (!res.ok) {
          const detail = await res.text();
          const message =
            res.status === 429
              ? "Too many requests right now — try again in a moment."
              : res.status === 402
                ? "AI credits are exhausted for this workspace."
                : `The vision model rejected the request (${res.status}).`;
          console.error("parse-flyer gateway error", res.status, detail);
          return Response.json({ error: message }, { status: res.status });
        }

        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const raw = json.choices?.[0]?.message?.content ?? "";
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          return Response.json({ error: "Could not read that flyer. Try a sharper photo." }, { status: 422 });
        }

        let parsed: ParsedEvent;
        try {
          parsed = JSON.parse(match[0]) as ParsedEvent;
        } catch {
          return Response.json({ error: "The extracted data was malformed." }, { status: 422 });
        }

        return Response.json({
          title: parsed.title ?? "",
          startDate: parsed.startDate ?? "",
          endDate: parsed.endDate ?? "",
          location: parsed.location ?? "",
          description: parsed.description ?? "",
          uncertainFields: Array.isArray(parsed.uncertainFields) ? parsed.uncertainFields : [],
        });
      },
    },
  },
});
