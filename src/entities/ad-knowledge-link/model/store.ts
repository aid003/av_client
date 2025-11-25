import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { AdKnowledgeBaseLink } from '@/entities/avito-ad/model/types';
import {
  getAdKnowledgeBases,
  attachKnowledgeBasesToAd,
  detachKnowledgeBaseFromAd,
} from '@/entities/avito-ad/api';

interface AdKbState {
  linksByAdId: Record<string, AdKnowledgeBaseLink[] | undefined>;
  loadingByAdId: Record<string, boolean | undefined>;
  errorsByAdId: Record<string, string | null | undefined>;
  loadLinks: (adId: string, tenantId: string, force?: boolean) => Promise<void>;
  setLinks: (adId: string, links: AdKnowledgeBaseLink[]) => void;
  attachLinks: (
    adIds: string[],
    tenantId: string,
    knowledgeBaseId: string,
    priority?: number
  ) => Promise<{ success: string[]; failed: Array<{ adId: string; error: string }> }>;
  detachLink: (adId: string, tenantId: string, kbId: string) => Promise<void>;
  clearAd: (adId: string) => void;
}

export const useAdKbStore = create<AdKbState>()((set, get) => ({
  linksByAdId: {},
  loadingByAdId: {},
  errorsByAdId: {},

  async loadLinks(adId, tenantId, force = false) {
    const state = get();
    if (state.loadingByAdId[adId]) return;
    if (!force && state.linksByAdId[adId]) return;

    set((s) => ({
      loadingByAdId: { ...s.loadingByAdId, [adId]: true },
      errorsByAdId: { ...s.errorsByAdId, [adId]: null },
    }));

    try {
      const resp = await getAdKnowledgeBases(adId, tenantId);
      set((s) => ({
        linksByAdId: { ...s.linksByAdId, [adId]: resp.data },
        loadingByAdId: { ...s.loadingByAdId, [adId]: false },
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ошибка при загрузке привязок баз знаний';
      set((s) => ({
        loadingByAdId: { ...s.loadingByAdId, [adId]: false },
        errorsByAdId: { ...s.errorsByAdId, [adId]: message },
      }));
    }
  },

  setLinks(adId, links) {
    set((s) => ({ linksByAdId: { ...s.linksByAdId, [adId]: links } }));
  },

  async attachLinks(adIds, tenantId, knowledgeBaseId, priority = 1) {
    const results = await Promise.allSettled(
      adIds.map(async (adId) => {
        const resp = await attachKnowledgeBasesToAd(adId, tenantId, {
          knowledgeBaseIds: [knowledgeBaseId],
          priorities: [priority],
        });
        // Обновляем кеш для конкретного объявления
        set((s) => ({
          linksByAdId: { ...s.linksByAdId, [adId]: resp.data },
        }));
        return adId;
      })
    );

    const success: string[] = [];
    const failed: Array<{ adId: string; error: string }> = [];
    results.forEach((r, idx) => {
      const adId = adIds[idx];
      if (r.status === 'fulfilled') {
        success.push(adId);
      } else {
        failed.push({ adId, error: r.reason instanceof Error ? r.reason.message : 'Ошибка' });
      }
    });
    return { success, failed };
  },

  async detachLink(adId, tenantId, kbId) {
    await detachKnowledgeBaseFromAd(adId, kbId, tenantId);
    // После успешного удаления - убираем из кеша
    set((s) => {
      const current = s.linksByAdId[adId] || [];
      return {
        linksByAdId: {
          ...s.linksByAdId,
          [adId]: current.filter((l) => l.knowledgeBaseId !== kbId),
        },
      };
    });
  },

  clearAd(adId) {
    set((s) => {
      const { [adId]: _, ...restLinks } = s.linksByAdId;
      const { [adId]: __, ...restLoading } = s.loadingByAdId;
      const { [adId]: ___, ...restErrors } = s.errorsByAdId;
      return {
        linksByAdId: restLinks,
        loadingByAdId: restLoading,
        errorsByAdId: restErrors,
      };
    });
  },
}));

// Селекторы/хуки
export const useAdKbLinks = (adId: string) =>
  useAdKbStore((s) => s.linksByAdId[adId]);

export const useAdKbLoading = (adId: string) =>
  useAdKbStore((s) => s.loadingByAdId[adId] ?? false);

export const useAdKbError = (adId: string) =>
  useAdKbStore((s) => s.errorsByAdId[adId] ?? null);

export const useAdKbActions = () =>
  useAdKbStore(
    useShallow((s) => ({
      loadLinks: s.loadLinks,
      setLinks: s.setLinks,
      attachLinks: s.attachLinks,
      detachLink: s.detachLink,
      clearAd: s.clearAd,
    }))
  );


