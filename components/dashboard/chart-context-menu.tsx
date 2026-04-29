"use client";

import { useEffect, useRef } from "react";
import { Search, PlusCircle } from "lucide-react";
import { MONTHS_PT } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

interface ChartContextMenuProps {
  x: number;
  y: number;
  month: number;
  year: number;
  onViewDetails: () => void;
  onAddExpense: () => void;
  onClose: () => void;
}

// Item de menu reutilizável
function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex w-full cursor-default select-none items-center gap-3 rounded-sm px-3 py-2.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </button>
  );
}

// Versão desktop: popover posicionado no cursor
function DesktopContextMenu({
  x,
  y,
  month,
  year,
  onViewDetails,
  onAddExpense,
  onClose,
}: ChartContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const MENU_WIDTH = 220;
  const MENU_HEIGHT = 110;
  const adjustedX = x + MENU_WIDTH > window.innerWidth ? x - MENU_WIDTH : x;
  const adjustedY = y + MENU_HEIGHT > window.innerHeight ? y - MENU_HEIGHT : y;

  return (
    <div
      ref={menuRef}
      style={{ top: adjustedY, left: adjustedX }}
      className="fixed z-50 min-w-[220px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
    >
      <div className="px-3 py-2 border-b">
        <p className="text-xs font-medium text-muted-foreground">
          {MONTHS_PT[month - 1]} {year}
        </p>
      </div>
      <div className="p-1">
        <MenuItem
          icon={Search}
          label="Ver detalhes do mês"
          onClick={() => { onViewDetails(); onClose(); }}
        />
        <MenuItem
          icon={PlusCircle}
          label="Adicionar despesa"
          onClick={() => { onAddExpense(); onClose(); }}
        />
      </div>
    </div>
  );
}

// Versão mobile: bottom sheet estilo iOS
function MobileContextMenu({
  month,
  year,
  onViewDetails,
  onAddExpense,
  onClose,
}: Omit<ChartContextMenuProps, "x" | "y">) {
  return (
    <Drawer open onOpenChange={(open) => { if (!open) onClose(); }} direction="bottom">
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle className="text-base">{MONTHS_PT[month - 1]} {year}</DrawerTitle>
          <DrawerDescription>Selecione uma ação</DrawerDescription>
        </DrawerHeader>
        <div className="px-3 pb-6 space-y-1">
          <MenuItem
            icon={Search}
            label="Ver detalhes do mês"
            onClick={() => { onViewDetails(); onClose(); }}
          />
          <MenuItem
            icon={PlusCircle}
            label="Adicionar despesa"
            onClick={() => { onAddExpense(); onClose(); }}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// Componente principal — escolhe a variante conforme o breakpoint
export function ChartContextMenu(props: ChartContextMenuProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileContextMenu {...props} />;
  }

  return <DesktopContextMenu {...props} />;
}
