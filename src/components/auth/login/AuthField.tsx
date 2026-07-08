import React from "react";
import { Eye, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FieldVariant = "compact" | "roomy";

const VARIANT_STYLES: Record<
  FieldVariant,
  { iconPad: string; inputLeft: string; padNoToggle: string; padToggle: string; togglePad: string }
> = {
  compact: {
    iconPad: "pl-3",
    inputLeft: "pl-9",
    padNoToggle: "pr-3",
    padToggle: "pr-8",
    togglePad: "pr-2.5",
  },
  roomy: {
    iconPad: "pl-3.5",
    inputLeft: "pl-10",
    padNoToggle: "pr-4",
    padToggle: "pr-10",
    togglePad: "pr-3",
  },
};

const INPUT_BASE =
  "py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all shadow-inner-sm";

interface PasswordToggle {
  visible: boolean;
  onToggle: () => void;
}

interface AuthFieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  variant: FieldVariant;
  wrapperClassName?: string;
  labelSlot?: React.ReactNode;
  toggle?: PasswordToggle;
}

export default function AuthField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  variant,
  wrapperClassName = "space-y-1",
  labelSlot,
  toggle,
}: AuthFieldProps) {
  const styles = VARIANT_STYLES[variant];
  const rightPad = toggle ? styles.padToggle : styles.padNoToggle;

  return (
    <div className={wrapperClassName}>
      {labelSlot ?? (
        <label
          htmlFor={id}
          className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`absolute inset-y-0 left-0 ${styles.iconPad} flex items-center pointer-events-none text-slate-400`}
        >
          <Icon className="w-4 h-4" />
        </div>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${styles.inputLeft} ${rightPad} ${INPUT_BASE}`}
        />
        {toggle && (
          <button
            type="button"
            onClick={toggle.onToggle}
            className={`absolute inset-y-0 right-0 ${styles.togglePad} flex items-center text-slate-400 hover:text-slate-600 transition-colors`}
          >
            {toggle.visible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
