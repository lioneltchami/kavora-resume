"use client";

import { type FormEvent, useState } from "react";

interface PortfolioContactFormProps {
	slug: string;
}

interface FormState {
	status: "idle" | "submitting" | "success" | "error";
	errorMessage: string;
	demo?: boolean;
	successMessage?: string;
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

			const data = (await res.json()) as {
				demo?: boolean;
				message?: string;
			};

			setForm({
				status: "success",
				errorMessage: "",
				demo: Boolean(data.demo),
				successMessage: data.message,
			});
			setName("");
			setEmail("");
			setMessage("");
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Something went wrong. Please try again.";
			setForm({
				status: "error",
				errorMessage,
				demo: false,
				successMessage: undefined,
			});
		}
	}

	if (form.status === "success") {
		return (
			<div className="border border-rule bg-paper-2 p-6 text-left">
				<p className="font-medium text-ink">
					{form.demo ? "Demo portfolio" : "Message sent"}
				</p>
				<p className="mt-1 text-sm text-ink-2">
					{form.successMessage ??
						"Thank you for reaching out. You should hear back soon."}
				</p>
				<button
					type="button"
					onClick={() => setForm({ status: "idle", errorMessage: "" })}
					className="mt-4 text-sm text-ink underline-offset-2 hover:text-accent hover:underline"
				>
					Send another message
				</button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{form.status === "error" && (
				<div className="border border-red-200 bg-red-50 p-3 text-left">
					<p className="text-sm text-red-700">{form.errorMessage}</p>
				</div>
			)}

			<div>
				<label
					htmlFor="contact-name"
					className="mb-1 block text-xs font-medium text-ink-2"
				>
					Name
				</label>
				<input
					id="contact-name"
					type="text"
					required
					value={name}
					onChange={(e) => setName(e.target.value)}
					className="w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					placeholder="Your name"
				/>
			</div>

			<div>
				<label
					htmlFor="contact-email"
					className="mb-1 block text-xs font-medium text-ink-2"
				>
					Email
				</label>
				<input
					id="contact-email"
					type="email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					placeholder="your@email.com"
				/>
			</div>

			<div>
				<label
					htmlFor="contact-message"
					className="mb-1 block text-xs font-medium text-ink-2"
				>
					Message
				</label>
				<textarea
					id="contact-message"
					required
					rows={5}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="w-full rounded-[2px] border border-rule bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-vertical"
					placeholder="Your message..."
				/>
			</div>

			<button
				type="submit"
				disabled={form.status === "submitting"}
				className="btn-primary disabled:opacity-50"
			>
				{form.status === "submitting" ? "Sending..." : "Send Message"}
			</button>
		</form>
	);
}
