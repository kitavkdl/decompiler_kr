import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const INTERVIEW_DATA: Record<string, string> = {
  "117710759": "08:00 PM",
  "118470557": "08:15 PM",
  "118451729": "08:30 PM",
  "117710315": "08:45 PM",
  "118450845": "09:00 PM",
  "117924653": "09:15 PM",
  "117710777": "09:30 PM",
  "117667536": "09:45 PM",
  "117710661": "10:15 PM",
  "117668368": "10:30 PM",
};

const LOCATION = "IGC #3042";

interface InterviewEasterEggProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InterviewEasterEgg = ({ open, onOpenChange }: InterviewEasterEggProps) => {
  const [studentId, setStudentId] = useState("");
  const [result, setResult] = useState<{ time: string } | "not_found" | null>(null);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (open) {
      setLocked(true);
      timerRef.current = setTimeout(() => setLocked(false), 3000);
    }
    return () => clearTimeout(timerRef.current);
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = studentId.trim();
      if (INTERVIEW_DATA[trimmed]) {
        setResult({ time: INTERVIEW_DATA[trimmed] });
      } else {
        setResult("not_found");
      }
    },
    [studentId]
  );

  const handleOpenChange = (val: boolean) => {
    if (!val && locked) return;
    if (!val) {
      setStudentId("");
      setResult(null);
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="backdrop-blur-xl bg-background/90 border-primary/20 shadow-[0_0_40px_rgba(255,0,255,0.15)] max-w-md"
        onInteractOutside={(e) => { if (locked) e.preventDefault(); }}
        onEscapeKeyDown={(e) => { if (locked) e.preventDefault(); }}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-primary text-glow text-xl tracking-wide">
            ACCESS GRANTED
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-mono text-xs">
            Information related to executive face-to-face interviews
          </DialogDescription>
        </DialogHeader>

        {!result || result === "not_found" ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="text-xs font-mono text-secondary/70 tracking-widest uppercase mb-2 block">
                Student ID
              </label>
              <Input
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setResult(null);
                }}
                placeholder="Enter your student ID"
                className="bg-background/50 border-foreground/10 font-mono text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50"
                maxLength={20}
                autoFocus
              />
            </div>
            {result === "not_found" && (
              <p className="text-destructive text-xs font-mono animate-fade-in">
                ⚠ Student ID not found in the system.
              </p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-primary/10 border border-primary/40 text-primary font-mono text-sm tracking-wider uppercase rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              LOOK UP
            </button>
          </form>
        ) : (
          <div className="space-y-4 mt-2 animate-fade-in">
            <div className="space-y-3 p-4 rounded-lg border border-secondary/20 bg-secondary/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Interview Time
                </span>
                <span className="text-secondary text-glow-cyan font-display font-bold text-lg">
                  {result.time}
                </span>
              </div>
              <div className="h-px bg-foreground/5" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Location
                </span>
                <span className="text-foreground font-mono text-sm">
                  {LOCATION}
                </span>
              </div>
            </div>
            <p className="text-center text-primary text-glow font-display font-bold text-lg tracking-wide">
              See you on Wed
            </p>
            <button
              onClick={() => {
                setStudentId("");
                setResult(null);
              }}
              className="w-full px-4 py-2 border border-foreground/10 text-muted-foreground font-mono text-xs tracking-wider uppercase rounded-lg hover:border-primary/40 hover:text-primary transition-all duration-300"
            >
              LOOK UP ANOTHER
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InterviewEasterEgg;
