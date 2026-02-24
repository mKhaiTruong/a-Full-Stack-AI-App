import React from "react";

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: string;
	size?: string;
	fullWidth?: boolean;
	className?: string;
	children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	size = "md",
	fullWidth = false,
	className = "",
	children,
	...props
}) => {
	const classes = [
		"btn",
		`btn--${variant}`,
		`btn--${size}`,
		fullWidth ? "btn--full-width" : null,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button className={classes} {...props}>
			{children}
		</button>
	);
};

export default Button;

