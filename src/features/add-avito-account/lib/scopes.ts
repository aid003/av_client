export interface ScopeDefinition {
  scope: string;
  description: string;
  required: boolean;
}

export const AVITO_SCOPES: ScopeDefinition[] = [
  {
    scope: "user:read",
    description: "Получение информации о пользователе",
    required: true,
  },
  {
    scope: "messenger:read",
    description: "Чтение сообщений в мессенджере Авито",
    required: true,
  },
  {
    scope: "messenger:write",
    description: "Модифицирование сообщений в мессенджере Авито",
    required: true,
  },
  {
    scope: "autoload:reports",
    description: "Получение отчетов Автозагрузки",
    required: false,
  },
  {
    scope: "items:apply_vas",
    description: "Применение дополнительных услуг",
    required: false,
  },
  {
    scope: "items:info",
    description: "Получение информации об объявлениях",
    required: false,
  },
  {
    scope: "job:cv",
    description: "Получение информации резюме",
    required: false,
  },
  {
    scope: "job:applications",
    description: "Получение информации об откликах на вакансии",
    required: false,
  },
  {
    scope: "job:vacancy",
    description: "Работа с вакансиями",
    required: false,
  },
  {
    scope: "job:write",
    description: "Изменение объявлений вертикали Работа",
    required: false,
  },
  {
    scope: "short_term_rent:read",
    description: "Получение информации об объявлениях краткосрочной аренды",
    required: false,
  },
  {
    scope: "short_term_rent:write",
    description: "Изменение объявлений краткосрочной аренды",
    required: false,
  },
  {
    scope: "stats:read",
    description: "Получение статистики объявлений",
    required: false,
  },
  {
    scope: "user_balance:read",
    description: "Получение баланса пользователя",
    required: false,
  },
  {
    scope: "user_operations:read",
    description: "Получение истории операций пользователя",
    required: false,
  },
];

export const DEFAULT_SCOPES = AVITO_SCOPES.filter((s) => s.required).map(
  (s) => s.scope
);

