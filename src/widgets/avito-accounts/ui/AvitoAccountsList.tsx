"use client";

import { useAvitoAccounts } from "../model";
import { AccountCard } from "./AccountCard";
import { AccountsLoader } from "./AccountsLoader";
import { EmptyAccounts } from "./EmptyAccounts";
import { ErrorAlert } from "./ErrorAlert";

export function AvitoAccountsList() {
  const { accounts, total, loading, error } = useAvitoAccounts();

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Аккаунты Авито</h1>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AccountsLoader />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Аккаунты Авито</h1>
        <ErrorAlert message={error} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Аккаунты Авито</h1>
      </div>

      {accounts.length === 0 ? (
        <EmptyAccounts />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
}

