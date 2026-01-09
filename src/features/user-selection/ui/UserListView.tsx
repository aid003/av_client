'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/shared/ui/components/ui/input';
import { UserCard } from './UserCard';
import type { TenantSearchResult } from '@/entities/tenant-search/model/types';

interface UserListViewProps {
  tenants: TenantSearchResult[];
  loading: boolean;
  onSearch: (query: string) => void;
  selectedTenantId: string | null;
  onSelectTenant: (tenantId: string) => void;
}

export function UserListView({
  tenants,
  loading,
  onSearch,
  selectedTenantId,
  onSelectTenant,
}: UserListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Выбор пользователя</h3>
        <Input
          placeholder="Поиск по имени или ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
        {loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && tenants.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-8">
            {searchQuery ? 'Ничего не найдено' : 'Введите запрос для поиска'}
          </p>
        )}

        {!loading && tenants.map((tenant) => (
          <UserCard
            key={tenant.tenantId}
            tenant={tenant}
            selected={tenant.tenantId === selectedTenantId}
            onClick={() => onSelectTenant(tenant.tenantId)}
          />
        ))}
      </div>
    </div>
  );
}
