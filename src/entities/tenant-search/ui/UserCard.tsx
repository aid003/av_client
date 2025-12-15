import { memo } from 'react';
import { Checkbox } from '@/shared/ui/components/ui/checkbox';
import { Card } from '@/shared/ui/components/ui/card';
import { UserAvatar } from './UserAvatar';
import type { TenantSearchResult } from '../model/types';

interface UserCardProps {
  user: TenantSearchResult;
  isSelected: boolean;
  onToggle: (tenantId: string) => void;
}

function UserCardComponent({ user, isSelected, onToggle }: UserCardProps) {
  const { tenantId, telegramUser } = user;
  const { firstName, lastName, username, photoUrl, createdAt } = telegramUser;

  const displayName = `${firstName} ${lastName || ''}`.trim();
  const formattedDate = new Date(createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card
      className="p-3 sm:p-4 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={() => onToggle(tenantId)}
    >
      <div className="flex items-center gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggle(tenantId)}
          onClick={(e) => e.stopPropagation()}
        />

        <UserAvatar
          firstName={firstName}
          lastName={lastName}
          photoUrl={photoUrl}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="font-medium text-sm sm:text-base truncate">{displayName}</h3>
            {username && (
              <span className="text-xs text-muted-foreground truncate">@{username}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Зарегистрирован: {formattedDate}
          </p>
        </div>
      </div>
    </Card>
  );
}

export const UserCard = memo(UserCardComponent);
