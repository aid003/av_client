'use client';

import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { UserAvatar } from '@/entities/tenant-search';
import type { TenantSearchResult } from '@/entities/tenant-search/model/types';

interface UserCardProps {
  tenant: TenantSearchResult;
  selected: boolean;
  onClick: () => void;
}

export function UserCard({ tenant, selected, onClick }: UserCardProps) {
  const { telegramUser } = tenant;
  const displayName = [telegramUser.firstName, telegramUser.lastName]
    .filter(Boolean)
    .join(' ') || 'Пользователь';

  return (
    <div
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all',
        'hover:bg-accent hover:border-primary/30',
        selected && 'bg-primary/5 border-primary'
      )}
    >
      <div className="flex items-center gap-3">
        <UserAvatar
          firstName={telegramUser.firstName}
          lastName={telegramUser.lastName}
          photoUrl={telegramUser.photoUrl}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{displayName}</p>
          {telegramUser.username && (
            <p className="text-sm text-muted-foreground truncate">
              @{telegramUser.username}
            </p>
          )}
          <p className="text-xs text-muted-foreground truncate">
            ID: {tenant.tenantId.slice(0, 8)}...
          </p>
        </div>
        {selected && <Check className="w-5 h-5 text-primary shrink-0" />}
      </div>
    </div>
  );
}
