'use client';

import { useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/components/ui/alert';
import { UserCard } from '@/entities/tenant-search';
import type { TenantSearchResult } from '@/entities/tenant-search';

interface UserListViewProps {
  users: TenantSearchResult[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  isSelected: (tenantId: string) => boolean;
  onToggleUser: (tenantId: string) => void;
}

export function UserListView({
  users,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  onLoadMore,
  isSelected,
  onToggleUser,
}: UserListViewProps) {
  // Intersection Observer for infinite scroll
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastCardRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoadingMore, hasMore, onLoadMore]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Загрузка пользователей...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <div className="text-center p-12">
        <p className="text-muted-foreground">
          Пользователи не найдены. Попробуйте изменить фильтры.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div
          key={user.tenantId}
          ref={index === users.length - 1 ? lastCardRef : null}
        >
          <UserCard
            user={user}
            isSelected={isSelected(user.tenantId)}
            onToggle={onToggleUser}
          />
        </div>
      ))}

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Загрузка...</span>
        </div>
      )}

      {/* Error during load more */}
      {error && users.length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
