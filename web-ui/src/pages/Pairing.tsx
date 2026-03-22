import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MiniHandsLogo } from "@/components/MiniHandsLogo";
import { useNavigate } from "react-router-dom";
import { WebRTCClient } from "../lib/webrtc";

const Pairing = () => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (pin.length < 6) {
      setError(true);
      return;
    }
    setError(false);
    WebRTCClient.instance.connect(pin);
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Logo */}
        <MiniHandsLogo size="md" />

        {/* Text */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Pair Your Device
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter the 6-digit PIN shown in your MiniHands CLI to connect.
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex flex-col items-center gap-3">
          <InputOTP
            maxLength={6}
            value={pin}
            onChange={(v) => {
              setPin(v);
              if (error) setError(false);
            }}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={`h-12 w-11 text-lg font-mono border-input bg-card ${
                    error ? "border-destructive ring-destructive/30" : ""
                  }`}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <p className="text-xs font-medium text-destructive">
              Please enter a valid 6-digit PIN.
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={pin.length < 6}
          className="w-full gap-2 h-11 text-sm font-medium transition-all duration-200 active:scale-[0.97]"
        >
          Connect
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          Run <code className="font-mono text-foreground/70 bg-muted px-1.5 py-0.5 rounded">minihands pair</code> in your terminal to get your PIN.
        </p>
      </div>
    </div>
  );
};

export default Pairing;
