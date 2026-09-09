export type AdminPermission =
  | "products_view"       // Просмотр товаров каталога
  | "products_create"     // Добавление новых товаров
  | "products_edit"       // Редактирование товаров и остатков
  | "products_delete"     // Удаление товаров
  | "products_export"     // Экспорт каталога JSON
  | "products_reset"      // Сброс каталога к исходным данным
  | "admins_manage";      // Управление администраторами и назначение прав

export interface AdminPermissionDef {
  id: AdminPermission;
  label: string;
  description: string;
  category: "products" | "system";
}

export const ALL_ADMIN_PERMISSIONS: AdminPermissionDef[] = [
  {
    id: "products_view",
    label: "Просмотр товаров",
    description: "Доступ к просмотру каталога, параметров и складских остатков",
    category: "products",
  },
  {
    id: "products_create",
    label: "Создание товаров",
    description: "Возможность добавлять новые позиции в каталог магазина",
    category: "products",
  },
  {
    id: "products_edit",
    label: "Редактирование товаров",
    description: "Изменение цен, скидок, фото, описаний и статуса наличия",
    category: "products",
  },
  {
    id: "products_delete",
    label: "Удаление товаров",
    description: "Право удалять товары из каталога Minimall",
    category: "products",
  },
  {
    id: "products_export",
    label: "Экспорт каталога JSON",
    description: "Скачивание полной базы каталога в формате JSON",
    category: "products",
  },
  {
    id: "products_reset",
    label: "Сброс каталога",
    description: "Очистка базы товаров до пустого каталога",
    category: "products",
  },
  {
    id: "admins_manage",
    label: "Управление администраторами",
    description: "Создание новых админов, смена паролей и настройка прав доступа",
    category: "system",
  },
];

export interface AdminUser {
  id: string;
  username: string; // Логин для входа
  name: string; // Отображаемое имя
  password: string; // Пароль
  role: "superadmin" | "admin" | "manager";
  isSuperAdmin: boolean; // Главный администратор
  permissions: AdminPermission[];
  createdAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}
