"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/components/ui/dialog";
import { Button } from "@/shared/ui/components/ui/button";
import { Label } from "@/shared/ui/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/ui/select";
import { Alert, AlertDescription } from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { BlacklistUser } from "@/entities/message";

interface BlacklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avitoUserId: string;
  userName?: string;
  itemId?: string;
  onConfirm: (users: BlacklistUser[]) => void;
  loading?: boolean;
  error?: string | null;
}

const BLACKLIST_REASONS = [
  { id: 1, label: "Спам" },
  { id: 2, label: "Мошенничество" },
  { id: 3, label: "Неадекватное поведение" },
  { id: 4, label: "Другое" },
];

export function BlacklistDialog({
  open,
  onOpenChange,
  avitoUserId,
  userName,
  itemId,
  onConfirm,
  loading,
  error,
}: BlacklistDialogProps) {
  const [reasonId, setReasonId] = useState<number>(1);

  const handleConfirm = () => {
    const users: BlacklistUser[] = [
      {
        avitoUserId,
        itemId: itemId || null,
        reasonId,
      },
    ];
    onConfirm(users);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить в черный список</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите заблокировать пользователя{" "}
            {userName || "без имени"}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Причина блокировки</Label>
            <Select
              value={reasonId.toString()}
              onValueChange={(value) => setReasonId(parseInt(value))}
            >
              <SelectTrigger id="reason">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLACKLIST_REASONS.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id.toString()}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Добавление..." : "Заблокировать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

