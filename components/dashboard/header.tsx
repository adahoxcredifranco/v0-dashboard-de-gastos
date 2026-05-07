"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Wallet, QrCode, Menu, PlusCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { IncomeForm } from "./income-form";
import { QrScanner } from "./qr-scanner";
import { ExpenseForm } from "./expense-form";
import { ExpensePeriod, IncomeType } from "@/lib/types";

interface ImportResult {
  success: boolean;
  message: string;
}

interface DashboardHeaderProps {
  onExport: () => void;
  onImport: (json: string) => ImportResult;
  onClearAll: () => void;
  onAddExpense: (expense: { name: string; value: number; period: ExpensePeriod; month: number; year: number }) => void;
  onAddIncome: (income: {
    name: string;
    value: number;
    type: IncomeType;
    period: ExpensePeriod;
    month: number;
    year: number;
  }) => void;
}

export function DashboardHeader({ onExport, onImport, onClearAll, onAddIncome, onAddExpense }: DashboardHeaderProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [qrExpenseData, setQrExpenseData] = useState<{ name?: string; value?: number; period?: ExpensePeriod } | null>(null);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    setImportResult(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = onImport(text);
      setImportResult(result);
      // Limpa o input para permitir reimportar o mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileChange}
      />

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold truncate">Gestor de Gastos</h1>
              <p className="text-sm text-muted-foreground truncate">Controle suas despesas</p>
            </div>
          </div>

          {/* Feedback de importação */}
          {importResult && (
            <div
              className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border ${
                importResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
                  : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400"
              }`}
            >
              {importResult.success ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{importResult.message}</span>
              <button
                onClick={() => setImportResult(null)}
                className="ml-1 opacity-60 hover:opacity-100"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          )}

          {/* Mobile: menu sanduíche */}
          <div className="flex items-center justify-end sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:max-w-sm">
                <SheetHeader>
                  <SheetTitle>Ações</SheetTitle>
                </SheetHeader>
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => { setMobileMenuOpen(false); setQrOpen(true); }}
                  >
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => { setMobileMenuOpen(false); onExport(); }}
                  >
                    <Download className="h-4 w-4" />
                    Exportar JSON
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => { setMobileMenuOpen(false); handleImportClick(); }}
                  >
                    <Upload className="h-4 w-4" />
                    Importar JSON
                  </Button>

                  <IncomeForm
                    onSubmit={onAddIncome}
                    trigger={
                      <Button
                        variant="outline"
                        className="justify-start gap-2 border-success text-success hover:bg-success hover:text-success-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Nova Entrada
                      </Button>
                    }
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="justify-start gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Limpar Tudo
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação irá remover permanentemente todas as despesas cadastradas.
                          Recomendamos exportar seus dados antes de continuar.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={onClearAll}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sim, limpar tudo
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop / tablet: botões visíveis */}
          <div className="hidden sm:flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQrOpen(true)}
              aria-label="Abrir leitor de QR Code"
            >
              <QrCode className="h-4 w-4" />
            </Button>

            <Button variant="outline" onClick={onExport} className="h-9 px-3">
              <Download className="mr-2 h-4 w-4" />
              Exportar JSON
            </Button>

            <Button variant="outline" onClick={handleImportClick} className="h-9 px-3">
              <Upload className="mr-2 h-4 w-4" />
              Importar JSON
            </Button>

            <IncomeForm onSubmit={onAddIncome} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="h-9 px-3">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Limpar Tudo</span>
                  <span className="sm:hidden">Limpar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Limpar todos os dados?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação irá remover permanentemente todas as despesas cadastradas.
                    Recomendamos exportar seus dados antes de continuar.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onClearAll}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Sim, limpar tudo
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <QrScanner
        open={qrOpen}
        onOpenChange={setQrOpen}
        onExpenseScanned={(data) => {
          setQrExpenseData(data);
          setExpenseFormOpen(true);
        }}
      />

      {/* ExpenseForm aberto após leitura do QR */}
      <ExpenseForm
        onSubmit={onAddExpense}
        open={expenseFormOpen}
        onOpenChange={(o) => {
          setExpenseFormOpen(o);
          if (!o) setQrExpenseData(null);
        }}
        defaultValues={qrExpenseData ?? undefined}
        trigger={<span />}
      />
    </>
  );
}
