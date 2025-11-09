"use client";

import { Button } from "@/shared/ui/components/ui/button";
import { Plus } from "lucide-react";
import { useAddAccount } from "../model";
import { AddAccountDialog } from "./AddAccountDialog";

export function AddAccountButton() {
  const {
    open,
    setOpen,
    loading,
    error,
    label,
    setLabel,
    selectedScopes,
    toggleScope,
    handleSubmit,
  } = useAddAccount();

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        <Plus className="size-4" />
        Добавить аккаунт
      </Button>

      <AddAccountDialog
        open={open}
        onOpenChange={setOpen}
        loading={loading}
        error={error}
        label={label}
        onLabelChange={setLabel}
        selectedScopes={selectedScopes}
        onToggleScope={toggleScope}
        onSubmit={handleSubmit}
      />
    </>
  );
}

