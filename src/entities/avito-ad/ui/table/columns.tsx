import { createColumnHelper } from '@tanstack/react-table';
import type { AvitoAd } from '../../model/types';
import {
  StatusCell,
  PriceCell,
  DateCell,
  LinkCell,
  CategoryCell,
  KnowledgeBasesCell,
  ScriptCell,
} from './cells';

const columnHelper = createColumnHelper<AvitoAd>();

export const createColumns = (
  onViewKnowledgeBases: (ad: AvitoAd) => void
) => [
  columnHelper.accessor('itemId', {
    id: 'itemId',
    header: 'ID',
    cell: (info) => <span className="font-mono text-sm">{info.getValue()}</span>,
    size: 120,
    enableSorting: false,
  }),
  columnHelper.accessor('title', {
    id: 'title',
    header: 'Название',
    cell: (info) => (
      <div className="max-w-[300px] truncate" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
    size: 300,
    enableSorting: true,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Статус',
    cell: (info) => <StatusCell status={info.getValue()} />,
    size: 140,
    enableSorting: true,
  }),
  columnHelper.accessor('price', {
    id: 'price',
    header: 'Цена',
    cell: (info) => <PriceCell price={info.getValue()} />,
    size: 120,
    enableSorting: true,
  }),
  columnHelper.accessor('category', {
    id: 'category',
    header: 'Категория',
    cell: (info) => <CategoryCell category={info.getValue()} />,
    size: 180,
    enableSorting: false,
  }),
  columnHelper.accessor('address', {
    id: 'address',
    header: 'Адрес',
    cell: (info) => (
      <div className="max-w-[200px] truncate" title={info.getValue()}>
        {info.getValue()}
      </div>
    ),
    size: 200,
    enableSorting: false,
  }),
  columnHelper.accessor('url', {
    id: 'url',
    header: 'Ссылка',
    cell: (info) => <LinkCell url={info.getValue()} />,
    size: 80,
    enableSorting: false,
  }),
  columnHelper.display({
    id: 'knowledgeBases',
    header: 'Базы знаний',
    cell: (info) => (
      <KnowledgeBasesCell
        ad={info.row.original}
        onViewKnowledgeBases={onViewKnowledgeBases}
      />
    ),
    size: 140,
  }),
  columnHelper.display({
    id: 'script',
    header: 'Скрипт продаж',
    cell: (info) => <ScriptCell adId={info.row.original.id} />,
    size: 200,
  }),
  columnHelper.accessor('startTime', {
    id: 'startTime',
    header: 'Дата начала',
    cell: (info) => <DateCell date={info.getValue()} />,
    size: 160,
    enableSorting: true,
  }),
  columnHelper.accessor('finishTime', {
    id: 'finishTime',
    header: 'Дата окончания',
    cell: (info) => <DateCell date={info.getValue()} />,
    size: 160,
    enableSorting: true,
  }),
  columnHelper.accessor('lastSyncedAt', {
    id: 'lastSyncedAt',
    header: 'Синхронизация',
    cell: (info) => <DateCell date={info.getValue()} />,
    size: 160,
    enableSorting: true,
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: 'Создано',
    cell: (info) => <DateCell date={info.getValue()} />,
    size: 160,
    enableSorting: true,
  }),
];

export const defaultVisibleColumns = [
  'itemId',
  'title',
  'status',
  'price',
  'category',
  'knowledgeBases',
  'script',
];
