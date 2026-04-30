"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, X, FlipHorizontal, Copy, Check } from "lucide-react";
import jsQR from "jsqr";
import { ExpensePeriod } from "@/lib/types";

interface QrExpenseData {
  name?: string;
  value?: number;
  period?: ExpensePeriod;
}

interface QrScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseScanned?: (data: QrExpenseData) => void;
}

export function QrScanner({ open, onOpenChange, onExpenseScanned }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [scanning, setScanning] = useState(false);

  // Para a câmera e o loop de scan
  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    rafRef.current = null;
    setScanning(false);
  }, []);

  // Inicia a câmera e o loop de scan
  const startCamera = useCallback(async () => {
    setError(null);
    setResult(null);
    setScanning(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        scanFrame();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Permissão de câmera negada. Verifique as configurações do navegador.");
      } else if (msg.includes("NotFound") || msg.includes("DevicesNotFound")) {
        setError("Nenhuma câmera encontrada neste dispositivo.");
      } else {
        setError(`Erro ao acessar câmera: ${msg}`);
      }
    }
  }, [facingMode]);

  // Loop de leitura frame a frame
  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code?.data) {
      setResult(code.data);
      stopCamera();
      return;
    }

    rafRef.current = requestAnimationFrame(scanFrame);
  }, [stopCamera]);

  // Abre/fecha câmera com o dialog
  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setResult(null);
      setError(null);
    }
    return () => stopCamera();
  }, [open]);

  // Reinicia ao trocar câmera
  useEffect(() => {
    if (open) {
      stopCamera();
      startCamera();
    }
  }, [facingMode]);

  // Tenta parsear o QR como dados de despesa (JSON)
  const parseExpenseQr = (raw: string): QrExpenseData | null => {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null && ("name" in parsed || "value" in parsed)) {
        return {
          name: typeof parsed.name === "string" ? parsed.name : undefined,
          value: typeof parsed.value === "number" ? parsed.value : undefined,
          period: parsed.period === "YEAR" ? ExpensePeriod.YEAR : ExpensePeriod.MONTH,
        };
      }
    } catch {
      // não é JSON — ignora
    }
    return null;
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenLink = () => {
    if (!result) return;
    try {
      const url = new URL(result);
      window.open(url.toString(), "_blank", "noopener,noreferrer");
    } catch {
      // não é uma URL válida
    }
  };

  const isUrl = (str: string) => {
    try { new URL(str); return true; } catch { return false; }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Leitor de QR Code
          </DialogTitle>
          <DialogDescription>
            Aponte a câmera para um QR code para lê-lo.
          </DialogDescription>
        </DialogHeader>

        {/* Área da câmera */}
        <div className="relative bg-black aspect-video w-full overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />

          {/* Canvas oculto para processamento */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay de mira */}
          {scanning && !result && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-52 h-52">
                {/* Cantos da mira */}
                <span className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-sm" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-sm" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-sm" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-sm" />
                {/* Linha de scan animada */}
                <span className="absolute left-2 right-2 h-0.5 bg-green-400/80 animate-[scan_2s_ease-in-out_infinite]" style={{ top: "50%" }} />
              </div>
              <p className="absolute bottom-4 text-white/70 text-xs">Procurando QR code...</p>
            </div>
          )}

          {/* Botão de virar câmera */}
          {scanning && (
            <button
              onClick={() => setFacingMode((f) => f === "environment" ? "user" : "environment")}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              aria-label="Virar câmera"
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>
          )}

          {/* Estado de erro */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3 px-6 text-center">
              <X className="h-10 w-10 text-destructive" />
              <p className="text-white text-sm">{error}</p>
              <Button size="sm" variant="outline" onClick={startCamera}>
                Tentar novamente
              </Button>
            </div>
          )}
        </div>

        {/* Resultado */}
        {result && (
          <div className="px-4 py-4 space-y-3 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              QR Code lido
            </p>
            <div className="rounded-md bg-muted px-3 py-2 text-sm break-all font-mono">
              {result}
            </div>
            <div className="flex flex-col gap-2">
              {/* Botão principal: cadastrar como despesa */}
              {(() => {
                const expenseData = parseExpenseQr(result);
                return (
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      onExpenseScanned?.(expenseData ?? { name: result });
                      onOpenChange(false);
                    }}
                  >
                    Cadastrar como despesa
                  </Button>
                );
              })()}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2 flex-1" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
                {isUrl(result) && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={handleOpenLink}>
                    Abrir link
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setResult(null); startCamera(); }}
                >
                  Escanear outro
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
