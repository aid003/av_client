"use client";

import { Checkbox } from "@/shared/ui/components/ui/checkbox";
import { Label } from "@/shared/ui/components/ui/label";
import { ScrollArea } from "@/shared/ui/components/ui/scroll-area";
import { AVITO_SCOPES } from "../lib";

interface ScopeSelectorProps {
  selectedScopes: string[];
  onToggleScope: (scope: string) => void;
}

export function ScopeSelector({
  selectedScopes,
  onToggleScope,
}: ScopeSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Разрешения</div>
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="space-y-3">
          {AVITO_SCOPES.map((scopeDef) => {
            const isChecked = selectedScopes.includes(scopeDef.scope);
            const isRequired = scopeDef.required;

            return (
              <div key={scopeDef.scope} className="flex items-start space-x-3">
                <Checkbox
                  id={scopeDef.scope}
                  checked={isChecked}
                  disabled={isRequired}
                  onCheckedChange={() => {
                    if (!isRequired) {
                      onToggleScope(scopeDef.scope);
                    }
                  }}
                />
                <Label
                  htmlFor={scopeDef.scope}
                  className="flex-1 font-normal text-sm leading-relaxed cursor-pointer"
                >
                  {scopeDef.description}
                  {isRequired && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      (обязательное)
                    </span>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

