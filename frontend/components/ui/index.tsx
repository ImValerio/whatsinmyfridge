import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "dark";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  className = "", 
  ...props 
}: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-emerald-500 text-white hover:bg-emerald-600",
    secondary: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "bg-gray-50 text-gray-500 hover:bg-gray-100",
    dark: "bg-white/10 text-white hover:bg-white/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 rounded-lg text-xs",
    md: "px-6 py-3 rounded-xl text-sm",
    lg: "px-8 py-4 rounded-2xl text-base",
    icon: "p-3 rounded-xl",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current/20 border-t-current rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
};

export const Input = ({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className={`w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-400 text-base ${className}`}
    {...props}
  />
);

export const Card = ({ children, variant = "white", className = "" }: { children: React.ReactNode, variant?: "white" | "dark", className?: string }) => (
  <div className={`p-8 rounded-[2rem] shadow-sm border transition-all ${
    variant === "white" 
      ? "bg-white border-gray-100/50 hover:shadow-md" 
      : "bg-[#1C1C1E] border-transparent shadow-xl text-white"
  } ${className}`}>
    {children}
  </div>
);

export const Badge = ({ children, colorStyles = "bg-gray-100 text-gray-500" }: { children: React.ReactNode, colorStyles?: string }) => (
  <span className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-md border border-transparent ${colorStyles}`}>
    {children}
  </span>
);
