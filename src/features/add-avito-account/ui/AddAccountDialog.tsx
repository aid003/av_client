"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/ui/dialog";
import { Button } from "@/shared/ui/components/ui/button";
import { Input } from "@/shared/ui/components/ui/input";
import { Label } from "@/shared/ui/components/ui/label";
import { Alert, AlertDescription } from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ScopeSelector } from "./ScopeSelector";

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  error: string | null;
  label: string;
  onLabelChange: (label: string) => void;
  selectedScopes: string[];
  onToggleScope: (scope: string) => void;
  onSubmit: () => void;
}

export function AddAccountDialog({
  open,
  onOpenChange,
  loading,
  error,
  label,
  onLabelChange,
  selectedScopes,
  onToggleScope,
  onSubmit,
}: AddAccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить аккаунт Авито</DialogTitle>
          <DialogDescription>
            Укажите название аккаунта и выберите необходимые разрешения
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="account-label">Название аккаунта</Label>
            <Input
              id="account-label"
              value={label}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="Основной аккаунт"
              disabled={loading}
            />
          </div>

          <ScopeSelector
            selectedScopes={selectedScopes}
            onToggleScope={onToggleScope}
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Отмена
          </Button>
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? "Загрузка..." : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

