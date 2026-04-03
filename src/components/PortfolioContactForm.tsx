"use client";

import { type FormEvent, useState } from "react";

interface PortfolioContactFormProps {
	slug: string;
}

interface FormState {
	status: "idle" | "submitting" | "success" | "error";
	errorMessage: string;
}

export default function PortfolioContactForm({
	slug,
}: PortfolioContactFormProps) {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [form, setForm] = useState<FormState>({
		status: "idle",
		errorMessage: "",
	});

	async function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setForm({ status: "submitting", errorMessage: "" });

		try {
			const res = await fetch("/api/portfolio/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slug, name, email, message }),
			});

			if (!res.ok) {
				const data = (await res.json()) as { error?: string };
				throw new Error(data.error ?? "Failed to send message");
			}

			setForm({ status: "success", errorMessage: "" });
			setName("");
			setEmail("");
			setMessage("");
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.";
			setForm({ status: "error", errorMessage });
		}
	}

	if (form.status === "success") {
		return (
			<div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
				<p className="text-green-800 font-medium">Message sent successfully!</p>
				<p className="text-green-600 text-sm mt-1">
					Thank you for reaching out. You should hear back soon.
				</p>
				<button
					type="button"
					onClick={() => setForm({ status: "idle", errorMessage: "" })}
					className="mt-4 text-sm text-green-700 underline hover:no-underline"
				>
					Send another message
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{form.status === "error" && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-3">
					<p className="text-red-700 text-sm">{form.errorMessage}</p>
				</div>
			)}

			<div>
				<label
					htmlFor="contact-name"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Name
				</label>
				<input
					id="contact-name"
					type="text"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
					placeholder="Your name"
				/>
			</div>

			<div>
				<label
					htmlFor="contact-email"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Email
				</label>
				<input
					id="contact-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
					placeholder="your@email.com"
				/>
			</div>

			<div>
				<label
					htmlFor="contact-message"
					className="block text-sm font-medium text-gray-700 mb-1"
				>
					Message
				</label>
				<textarea
					id="contact-message"
					required
					rows={5}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 resize-vertical"
					placeholder="Your message..."
				/>
			</div>

			<button
				type="submit"
				disabled={form.status === "submitting"}
				className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
				style={{ backgroundColor: "#1e2a3a" }}
			>
				{form.status === "submitting" ? "Sending..." : "Send Message"}
			</button>
		</form>
	);
}
