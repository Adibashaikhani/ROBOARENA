export function Button({ variant = "primary", className = "", ...props }) {
  const base =
    "px-4 py-2 rounded-full text-sm font-medium transition";

  const variants = {
    primary:
      "bg-brand-blue text-white shadow-soft hover:opacity-90",

    secondary:
      "bg-white border border-brand-line text-brand-text hover:bg-brand-blueSoft",

    yellow:
      "bg-brand-yellow text-brand-text shadow-soft hover:opacity-90",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
