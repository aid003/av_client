"use client";

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/shared/ui/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Ошибка</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

