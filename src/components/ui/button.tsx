import React from "react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "default" | "primary" | "outline";
}

export function Button({
	variant = "default",
	className = "",
	children,
	...rest
}: Props) {
	const base =
		"py-2 px-5 rounded-full font-semibold transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

	let styles = "";

	if (variant === "default") {
		styles = `
			bg-[var(--color-white)]
			text-[var(--color-primary)]
			border border-[var(--color-card-border)]
			hover:bg-[var(--color-bg-hover)]
		`;
	} else if (variant === "primary") {
		styles = `
			bg-[var(--color-primary)]
			text-[var(--color-white)]
			hover:bg-[var(--color-primary-hover)]
			shadow-md hover:shadow-lg
		`;
	} else if (variant === "outline") {
		styles = `
			border-2 border-[var(--color-primary)]
			text-[var(--color-primary)]
			bg-transparent
			hover:bg-[var(--color-primary)]
			hover:text-[var(--color-white)]
		`;
	}

	return (
		<button className={`${base} ${styles} ${className}`} {...rest}>
			{children}
		</button>
	);
}

export default Button;
