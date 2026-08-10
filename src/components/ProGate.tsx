"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProGateProps {
	feature: string;
	description: string;
	onClose: () => void;
}

export default function ProGate({
	feature,
	description,
	onClose,
}: ProGateProps) {
	const [visible, setVisible] = useState(false);
	const backdropRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		requestAnimationFrame(() => setVisible(true));
	}, []);

	function handleBackdropClick(e: React.MouseEvent) {
		if (e.target === backdropRef.current) {
			onClose();
		}
	}

	return (
		<div
			ref={backdropRef}
			onClick={handleBackdropClick}
			className={`fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 transition-opacity duration-200 sm:items-center ${
				visible ? "opacity-100" : "opacity-0"
			}`}
		>
			<div
				className={`w-full max-w-sm border border-rule bg-paper transition-opacity duration-200 ${
					visible ? "opacity-100" : "opacity-0"
				}`}
				role="dialog"
				aria-labelledby="pro-gate-title"
			>
				<div className="border-b border-rule bg-paper-2 px-6 py-8 text-left">
					<p className="font-mono text-xs text-accent">Pro</p>
					<h2
						id="pro-gate-title"
						className="mt-3 font-display text-xl font-semibold text-ink"
					>
						Pro feature
					</h2>
					<p className="mt-3 text-sm leading-relaxed text-ink-2">
						<span className="font-medium text-ink">{feature}</span>
						{" — "}
						{description}
					</p>
				</div>

				<div className="px-6 py-6">
					<Link href="/pricing" className="btn-primary flex w-full">
						Upgrade to Pro — $19
					</Link>
					<button
						type="button"
						onClick={onClose}
						className="mt-3 w-full py-2.5 text-sm text-ink-2 transition-colors hover:text-ink"
					>
						Maybe later
					</button>
				</div>
			</div>
		</div>
	);
}
