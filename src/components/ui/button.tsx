import React from "react";
import classNames from "classnames";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "outline"; 
}

export function Button({ variant = "default", className = "", children, ...rest }: Props) {
  const base = "py-2 px-4 rounded-full font-semibold transition";

  let styles = "";

  if (variant === "default") {
    styles = "bg-white text-blue-900 hover:bg-gray-100";
  } 
  else if (variant === "primary") {
    styles = "bg-rose-500 text-white hover:bg-rose-600 shadow-xl"; 
  } 
  else if (variant === "outline") {
    styles = "border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-900";
  }

  return (
    <button className={classNames(base, styles, className)} {...rest}>
      {children}
    </button>
  );
}

