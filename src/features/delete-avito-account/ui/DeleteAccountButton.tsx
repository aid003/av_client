"use client";

import { Button } from "@/shared/ui/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeleteAccount } from "../model";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

interface DeleteAccountButtonProps {
  accountId: string;
  accountLabel: string;
  onSuccess?: () => void;
}

export function DeleteAccountButton({
  accountId,
  accountLabel,
  onSuccess,
}: DeleteAccountButtonProps) {
  const { open, setOpen, loading, error, setError, handleDelete } =
    useDeleteAccount(onSuccess);

  const handleConfirm = () => {
    handleDelete(accountId);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setError(null);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-8 w-8"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>

      <DeleteAccountDialog
        open={open}
        onOpenChange={handleOpenChange}
        loading={loading}
        error={error}
        accountLabel={accountLabel}
        onConfirm={handleConfirm}
      />
    </>
  );
}

