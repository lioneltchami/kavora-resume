import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const GEMINI_MODEL = "gemini-2.5-flash";
const ANTHROPIC_MODEL = "claude-haiku-4-5-20251001";

interface GenerateAITextOptions {
	prompt: string;
	maxOutputTokens: number;
}

async function generateWithModel(
	model: Parameters<typeof generateText>[0]["model"],
	options: GenerateAITextOptions,
): Promise<string> {
	const { text } = await generateText({
		model,
		prompt: options.prompt,
		maxOutputTokens: options.maxOutputTokens,
	});

	const trimmed = text.trim();
	if (!trimmed) throw new Error("AI provider returned an empty response");
	return trimmed;
}

/**
 * Uses Gemini Flash first for lower cost, then Claude Haiku when configured.
 * Route-level deterministic fallbacks still handle total provider failure.
 */
export async function generateAIText(
	options: GenerateAITextOptions,
): Promise<string> {
	const errors: Error[] = [];

	if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
		try {
			return await generateWithModel(google(GEMINI_MODEL), options);
		} catch (error) {
			const cause =
				error instanceof Error ? error : new Error("Unknown Gemini error");
			errors.push(cause);
			console.error(
				"Gemini generation failed; trying Anthropic:",
				cause.message,
			);
		}
	}

	if (process.env.ANTHROPIC_API_KEY) {
		try {
			return await generateWithModel(anthropic(ANTHROPIC_MODEL), options);
		} catch (error) {
			const cause =
				error instanceof Error ? error : new Error("Unknown Anthropic error");
			errors.push(cause);
			console.error("Anthropic generation failed:", cause.message);
		}
	}

	if (errors.length > 0) {
		throw new AggregateError(errors, "All configured AI providers failed");
	}

	throw new Error("NO_AI_API_KEY");
}
