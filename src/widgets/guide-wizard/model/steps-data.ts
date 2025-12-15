import { Step01AvitoAccount } from '@/features/guide-step-content/ui/Step01AvitoAccount';
import { Step02KnowledgeBase } from '@/features/guide-step-content/ui/Step02KnowledgeBase';
import { Step03SalesScript } from '@/features/guide-step-content/ui/Step03SalesScript';
import { Step04ScriptSettings } from '@/features/guide-step-content/ui/Step04ScriptSettings';
import { Step05LinkingAds } from '@/features/guide-step-content/ui/Step05LinkingAds';
import { Step06ChatsOverview } from '@/features/guide-step-content/ui/Step06ChatsOverview';
import { Step07LeadsTracking } from '@/features/guide-step-content/ui/Step07LeadsTracking';
import { Step08Notifications } from '@/features/guide-step-content/ui/Step08Notifications';
import { Step09AdvancedFeatures } from '@/features/guide-step-content/ui/Step09AdvancedFeatures';
import { Step10Success } from '@/features/guide-step-content/ui/Step10Success';
import type { WizardStep } from './types';

export const WIZARD_STEPS: WizardStep[] = [
  {
    id: 0,
    title: 'Привязка аккаунта Avito',
    shortTitle: 'Аккаунт',
    description: 'Подключите свой аккаунт Avito для начала работы',
    estimatedTime: '3-5 минут',
    component: Step01AvitoAccount,
    canSkip: false,
    requiredForCompletion: true,
    faqs: [
      {
        question: 'Безопасно ли это?',
        answer: 'Да, используется стандарт OAuth 2.0. Ваш пароль никогда не передаётся приложению.',
        category: 'technical',
      },
      {
        question: 'Какие данные получает приложение?',
        answer: 'Приложение получает доступ только к вашим объявлениям и сообщениям. Доступа к платёжным данным нет.',
        category: 'business',
      },
    ],
  },
  {
    id: 1,
    title: 'Создание базы знаний',
    shortTitle: 'База знаний',
    description: 'Загрузите информацию о товарах для умных ответов AI',
    estimatedTime: '10-15 минут',
    component: Step02KnowledgeBase,
    canSkip: false,
    requiredForCompletion: true,
    technicalTerms: [
      {
        term: 'RAG',
        tooltip: 'Retrieval Augmented Generation',
        detailedExplanation: 'Технология, позволяющая AI использовать вашу базу знаний для генерации точных ответов.',
      },
      {
        term: 'Векторная БД',
        tooltip: 'База данных для семантического поиска',
        detailedExplanation: 'Weaviate - векторная база данных, которая хранит ваши документы в виде числовых векторов для быстрого поиска релевантной информации.',
      },
    ],
  },
  {
    id: 2,
    title: 'Создание скрипта продаж',
    shortTitle: 'Скрипт',
    description: 'Постройте визуальный сценарий диалога с клиентами',
    estimatedTime: '15-20 минут',
    component: Step03SalesScript,
    canSkip: false,
    requiredForCompletion: true,
    faqs: [
      {
        question: 'Нужны ли навыки программирования?',
        answer: 'Нет! Визуальный редактор позволяет создавать скрипты простым соединением блоков.',
        category: 'technical',
      },
    ],
  },
  {
    id: 3,
    title: 'Настройка скрипта продаж',
    shortTitle: 'Настройки',
    description: 'Тонкая настройка поведения AI и параметров диалога',
    estimatedTime: '5-10 минут',
    component: Step04ScriptSettings,
    canSkip: false,
    requiredForCompletion: true,
    technicalTerms: [
      {
        term: 'Температура',
        tooltip: 'Контролирует креативность AI',
        detailedExplanation: 'Значение от 0 до 1. Низкие значения (0.1-0.3) дают более предсказуемые ответы, высокие (0.7-1.0) - более креативные.',
        exampleUseCase: 'Для продаж рекомендуется 0.7 - баланс между точностью и естественностью.',
      },
      {
        term: 'Слоты',
        tooltip: 'Переменные для хранения данных',
        detailedExplanation: 'Слоты - это переменные, в которые извлекается информация из ответов клиента (имя, телефон, требования).',
      },
    ],
  },
  {
    id: 4,
    title: 'Привязка к объявлениям',
    shortTitle: 'Привязка',
    description: 'Подключите автоматизацию к вашим объявлениям',
    estimatedTime: '2-3 минуты',
    component: Step05LinkingAds,
    canSkip: false,
    requiredForCompletion: true,
  },
  {
    id: 5,
    title: 'Мониторинг чатов',
    shortTitle: 'Чаты',
    description: 'Отслеживайте диалоги в реальном времени',
    estimatedTime: '3-5 минут',
    component: Step06ChatsOverview,
    canSkip: false,
    requiredForCompletion: false,
  },
  {
    id: 6,
    title: 'Работа с лидами',
    shortTitle: 'Лиды',
    description: 'Управление потенциальными клиентами',
    estimatedTime: '3-5 минут',
    component: Step07LeadsTracking,
    canSkip: false,
    requiredForCompletion: false,
    faqs: [
      {
        question: 'Чем лид отличается от чата?',
        answer: 'Чат - это просто переписка. Лид - это запись о клиенте с извлечёнными данными (имя, телефон) и статусом сделки.',
        category: 'business',
      },
    ],
  },
  {
    id: 7,
    title: 'Настройка уведомлений',
    shortTitle: 'Уведомления',
    description: 'Будьте в курсе важных событий',
    estimatedTime: '1-2 минуты',
    component: Step08Notifications,
    canSkip: true,
    requiredForCompletion: false,
  },
  {
    id: 8,
    title: 'Дополнительные возможности',
    shortTitle: 'Доп. функции',
    description: 'Продвинутые функции системы',
    estimatedTime: '5-7 минут',
    component: Step09AdvancedFeatures,
    canSkip: true,
    requiredForCompletion: false,
  },
  {
    id: 9,
    title: 'Готово к работе!',
    shortTitle: 'Финиш',
    description: 'Вы завершили настройку системы',
    estimatedTime: '1 минута',
    component: Step10Success,
    canSkip: false,
    requiredForCompletion: false,
  },
];
