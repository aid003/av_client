'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/shared/ui/components/ui/input';
import { UserCard } from './UserCard';
import type { TenantSearchResult } from '@/entities/tenant-search/model/types';

interface UserSelectionMobileProps {
  tenants: TenantSearchResult[];
  loading: boolean;
  onSearch: (query: string) => void;
  onSelect: (tenantId: string) => void;
  selectedTenantId: string | null;
}

export function UserSelectionMobile({
  tenants,
  loading,
  onSearch,
  onSelect,
  selectedTenantId,
}: UserSelectionMobileProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-3">Выбор пользователя</h2>
        <Input
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && tenants.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {searchQuery ? 'Ничего не найдено' : 'Введите запрос для поиска'}
          </p>
        )}

        {!loading && tenants.map((tenant) => (
          <UserCard
            key={tenant.tenantId}
            tenant={tenant}
            selected={tenant.tenantId === selectedTenantId}
            onClick={() => onSelect(tenant.tenantId)}
          />
        ))}
      </div>
    </div>
  );
}
