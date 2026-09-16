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
  labelRu: string;
  labelUz: string;
  description: string;
  descriptionRu: string;
  descriptionUz: string;
  category: "products" | "system";
}

export const ALL_ADMIN_PERMISSIONS: AdminPermissionDef[] = [
  {
    id: "products_view",
    label: "Просмотр товаров",
    labelRu: "Просмотр товаров",
    labelUz: "Tovarlarni ko'rish",
    description: "Доступ к просмотру каталога, параметров и складских остатков",
    descriptionRu: "Доступ к просмотру каталога, параметров и складских остатков",
    descriptionUz: "Katalog, parametrlar va ombor qoldiqlarini ko'rish huquqi",
    category: "products",
  },
  {
    id: "products_create",
    label: "Создание товаров",
    labelRu: "Создание товаров",
    labelUz: "Yangi tovar yaratish",
    description: "Возможность добавлять новые позиции в каталог магазина",
    descriptionRu: "Возможность добавлять новые позиции в каталог магазина",
    descriptionUz: "Do'kon katalogiga yangi tovarlarni qo'shish imkoniyati",
    category: "products",
  },
  {
    id: "products_edit",
    label: "Редактирование товаров",
    labelRu: "Редактирование товаров",
    labelUz: "Tovarlarni tahrirlash",
    description: "Изменение цен, скидок, фото, описаний и статуса наличия",
    descriptionRu: "Изменение цен, скидок, фото, описаний и статуса наличия",
    descriptionUz: "Narxlar, chegirmalar, rasmlar, tavsiflar va mavjudlikni o'zgartirish",
    category: "products",
  },
  {
    id: "products_delete",
    label: "Удаление товаров",
    labelRu: "Удаление товаров",
    labelUz: "Tovarlarni o'chirish",
    description: "Право удалять товары из каталога Minimall",
    descriptionRu: "Право удалять товары из каталога Minimall",
    descriptionUz: "Minimall katalogidan tovarlarni o'chirish huquqi",
    category: "products",
  },
  {
    id: "products_export",
    label: "Экспорт каталога JSON",
    labelRu: "Экспорт каталога JSON",
    labelUz: "Katalogni JSON eksport qilish",
    description: "Скачивание полной базы каталога в формате JSON",
    descriptionRu: "Скачивание полной базы каталога в формате JSON",
    descriptionUz: "To'liq katalog bazasini JSON formatida yuklab olish",
    category: "products",
  },
  {
    id: "products_reset",
    label: "Сброс каталога",
    labelRu: "Сброс каталога",
    labelUz: "Katalogni tozalash",
    description: "Очистка базы товаров до пустого каталога",
    descriptionRu: "Очистка базы товаров до пустого каталога",
    descriptionUz: "Tovar bazasini boshlang'ich holatga tozalash",
    category: "products",
  },
  {
    id: "admins_manage",
    label: "Управление администраторами",
    labelRu: "Управление администраторами",
    labelUz: "Administratorlarni boshqarish",
    description: "Создание новых админов, смена паролей и настройка прав доступа",
    descriptionRu: "Создание новых админов, смена паролей и настройка прав доступа",
    descriptionUz: "Yangi adminlarni yaratish, parollarni yangilash va kirish huquqlarini sozlash",
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
