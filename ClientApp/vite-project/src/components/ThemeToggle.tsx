export function ThemeToggle({
  theme,
  onToggle,
}: {
  theme: "dark" | "light";
  onToggle: () => void;
}) {
  // det ska stå light mode under switch när den är på dark och tvärtom
  const label = theme === "dark" ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <span
        className={
          "themeToggleTrack " + (theme === "light" ? "isLight" : "isDark")
        }
      >
        <span className="themeToggleThumb" />
      </span>

      <span className="themeToggleText">{label}</span>
    </button>
  );
}
