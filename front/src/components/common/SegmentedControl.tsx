import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";

interface SegmentedControlProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  segId: string;
}

export const SegmentedControl = ({ label, options, value, onChange, segId }: SegmentedControlProps) => (
  <div className="space-y-2">
    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</Label>
    <div className="flex bg-muted rounded-xl p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`relative flex-1 py-2.5 text-sm font-medium font-sans rounded-lg transition-colors ${value === opt ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {value === opt && (
            <motion.div
              layoutId={`seg-${segId}`}
              className="absolute inset-0 bg-primary rounded-lg shadow-sm"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{opt}</span>
        </button>
      ))}
    </div>
  </div>
);
