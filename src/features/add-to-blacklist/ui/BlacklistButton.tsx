"use client";

import { Ban } from "lucide-react";
import {
  DropdownMenuItem,
} from "@/shared/ui/components/ui/dropdown-menu";

interface BlacklistButtonProps {
  onClick: () => void;
}

export function BlacklistButton({ onClick }: BlacklistButtonProps) {
  return (
    <DropdownMenuItem onClick={onClick} className="text-destructive">
      <Ban className="size-4 mr-2" />
      Добавить в ЧС
    </DropdownMenuItem>
  );
}

