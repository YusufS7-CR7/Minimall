import type { Lang } from "./types";

export interface AdminNavTranslations {
  brandAdmin: string;
  tagline: string;
  products: string;
  productsShort: string;
  admins: string;
  adminsShort: string;
  orders: string;
  banners: string;
  bannersShort: string;
  categories: string;
  categoriesShort: string;
  help: string;
  helpShort: string;
  management: string;
  toStore: string;
  logout: string;
  logoutConfirm: string;
  logoutSuccess: string;
  superAdmin: string;
  admin: string;
  manager: string;
  systemTitle: string;
  systemDesc: string;
  statusLabel: string;
  authorized: string;
  helpSectionsCount: string;
}

export interface AdminProductsTranslations {
  title: string;
  subtitle: string;
  addBtn: string;
  exportBtn: string;
  statTotal: string;
  statInStock: string;
  statOutOfStock: string;
  statValue: string;
  searchPlaceholder: string;
  allCategories: string;
  allBrands: string;
  allStatuses: string;
  statusInStock: string;
  statusOutOfStock: string;
  resetFilters: string;
  colProduct: string;
  colCategory: string;
  colPrice: string;
  colStatus: string;
  colActions: string;
  edit: string;
  delete: string;
  deleteConfirm: string;
  deletedToast: string;
  inStockBadge: string;
  outOfStockBadge: string;
  toggleStockToOut: string;
  toggleStockToIn: string;
  emptyTitle: string;
  emptyDesc: string;
}

export interface AdminProductFormTranslations {
  createTitle: string;
  editTitle: string;
  tabGeneral: string;
  tabMedia: string;
  tabSpecs: string;
  tabSeo: string;
  nameRu: string;
  nameUz: string;
  brand: string;
  category: string;
  subcategory: string;
  price: string;
  oldPrice: string;
  badge: string;
  inStock: string;
  descRu: string;
  descUz: string;
  translateToUz: string;
  translating: string;
  saveBtn: string;
  cancelBtn: string;
  dropzone: string;
  cover: string;
  removePhoto: string;
  addSpec: string;
  specName: string;
  specValue: string;
}

export interface AdminOrdersTranslations {
  title: string;
  subtitle: string;
  statTotal: string;
  statNew: string;
  statInProgress: string;
  statRevenue: string;
  searchPlaceholder: string;
  allStatuses: string;
  dateAll: string;
  dateToday: string;
  dateWeek: string;
  tgSettingsBtn: string;
  colOrder: string;
  colCustomer: string;
  colItems: string;
  colPayment: string;
  colTotal: string;
  colStatus: string;
  colActions: string;
  printInvoice: string;
  deleteOrder: string;
  deleteOrderConfirm: string;
  orderDeleted: string;
  statusUpdated: string;
}

export interface AdminInvoiceTranslations {
  invoiceTitle: string;
  invoiceSubtitle: string;
  printBtn: string;
  seller: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  payment: string;
  date: string;
  colNum: string;
  colItem: string;
  colPrice: string;
  colQty: string;
  colSum: string;
  totalToPay: string;
  stamp: string;
  buyerSign: string;
  paymentCash: string;
  paymentClick: string;
  paymentPayme: string;
  paymentBank: string;
}

export interface AdminCategoriesTranslations {
  title: string;
  subtitle: string;
  addBtn: string;
  statCategories: string;
  statSubcategories: string;
  searchPlaceholder: string;
  expandAll: string;
  collapseAll: string;
  subcategoriesCount: string;
  addSubcategory: string;
  edit: string;
  delete: string;
  deleteConfirmCat: string;
  deleteConfirmSub: string;
  modalCreateCat: string;
  modalEditCat: string;
  modalCreateSub: string;
  modalEditSub: string;
  labelRu: string;
  labelUz: string;
  slug: string;
  icon: string;
  image: string;
  save: string;
  cancel: string;
}

export interface AdminBannersTranslations {
  title: string;
  subtitle: string;
  badgeMainScreen: string;
  addBtn: string;
  recommendedSize: string;
  activeBadge: string;
  hiddenBadge: string;
  deleteConfirm: string;
  modalCreate: string;
  modalEdit: string;
  titleRu: string;
  titleUz: string;
  descRu: string;
  descUz: string;
  image: string;
  link: string;
  isActive: string;
  badges: string;
  save: string;
  cancel: string;
}

export interface AdminUsersTranslations {
  title: string;
  subtitle: string;
  addBtn: string;
  superAdminPwdTitle: string;
  superAdminPwdDesc: string;
  newPassword: string;
  confirmPassword: string;
  savePassword: string;
  colUser: string;
  colUsername: string;
  colRole: string;
  colStatus: string;
  colCreated: string;
  colActions: string;
  statusActive: string;
  statusBlocked: string;
  deleteConfirm: string;
  modalTitleCreate: string;
  modalTitleEdit: string;
  name: string;
  username: string;
  password: string;
  role: string;
  permissions: string;
  save: string;
  cancel: string;
}

export interface AdminHelpTranslations {
  title: string;
  subtitle: string;
  saveSection: string;
  resetSection: string;
  resetAll: string;
  preview: string;
  tabRu: string;
  tabUz: string;
  sectionTitle: string;
  sectionBadge: string;
  sectionDesc: string;
  sectionContent: string;
}

export interface AdminLoginTranslations {
  title: string;
  tagline: string;
  subtitle: string;
  notice: string;
  username: string;
  password: string;
  submit: string;
  toStore: string;
  errUsername: string;
  errPassword: string;
  errAuth: string;
}

export interface AdminTelegramTranslations {
  modalTitle: string;
  botStatus: string;
  botActive: string;
  botSubscribers: string;
  botToken: string;
  chatId: string;
  testBtn: string;
  testing: string;
  saveBtn: string;
  cancelBtn: string;
  guideTitle: string;
  guideStep1: string;
  guideStep2: string;
  guideStep3: string;
}

export interface AdminTranslations {
  nav: AdminNavTranslations;
  products: AdminProductsTranslations;
  productForm: AdminProductFormTranslations;
  orders: AdminOrdersTranslations;
  invoice: AdminInvoiceTranslations;
  categories: AdminCategoriesTranslations;
  banners: AdminBannersTranslations;
  users: AdminUsersTranslations;
  help: AdminHelpTranslations;
  login: AdminLoginTranslations;
  telegram: AdminTelegramTranslations;
}

export const ADMIN_TRANSLATIONS: Record<Lang, AdminTranslations> = {
  ru: {
    nav: {
      brandAdmin: "minimall.admin",
      tagline: "Панель управления маркетплейсом",
      products: "Товары каталога",
      productsShort: "Товары",
      admins: "Администраторы",
      adminsShort: "Админы",
      orders: "Заказы",
      banners: "Баннеры карусели",
      bannersShort: "Баннеры",
      categories: "Категории каталога",
      categoriesShort: "Категории",
      help: "Справочный центр",
      helpShort: "Справка",
      management: "Управление",
      toStore: "В магазин",
      logout: "Выйти",
      logoutConfirm: "Выйти из панели администратора?",
      logoutSuccess: "Вы успешно вышли из панели управления",
      superAdmin: "Главный Администратор",
      admin: "Администратор",
      manager: "Контент-менеджер",
      systemTitle: "Minimall RBAC v1",
      systemDesc:
        "Разграничение прав доступа администраторов активно. Данные защищены и привязаны к локальной сессии.",
      statusLabel: "Текущий статус:",
      authorized: "Авторизован",
      helpSectionsCount: "10 разд.",
    },
    products: {
      title: "Каталог товаров",
      subtitle: "Управление ассортиментом, ценами и наличием",
      addBtn: "+ Добавить товар",
      exportBtn: "Экспорт",
      statTotal: "Всего товаров",
      statInStock: "В наличии",
      statOutOfStock: "Нет в наличии",
      statValue: "Общая стоимость каталога",
      searchPlaceholder: "Поиск по названию, бренду, артикулу...",
      allCategories: "Все категории",
      allBrands: "Все бренды",
      allStatuses: "Все статусы",
      statusInStock: "Только в наличии",
      statusOutOfStock: "Нет в наличии",
      resetFilters: "Сбросить фильтры",
      colProduct: "Товар",
      colCategory: "Категория",
      colPrice: "Цена",
      colStatus: "Статус",
      colActions: "Действия",
      edit: "Редактировать",
      delete: "Удалить",
      deleteConfirm: "Вы уверены, что хотите удалить товар",
      deletedToast: "удален",
      inStockBadge: "В наличии",
      outOfStockBadge: "Нет в наличии",
      toggleStockToOut: "Товар переведен в статус «Нет в наличии»",
      toggleStockToIn: "Товар переведен в статус «В наличии»",
      emptyTitle: "Товары не найдены",
      emptyDesc: "Попробуйте изменить параметры поиска или фильтрации",
    },
    productForm: {
      createTitle: "Добавление нового товара",
      editTitle: "Редактирование товара",
      tabGeneral: "Основное",
      tabMedia: "Фотографии",
      tabSpecs: "Характеристики",
      tabSeo: "SEO и Ссылка",
      nameRu: "Название на русском",
      nameUz: "Название на узбекском",
      brand: "Бренд",
      category: "Категория",
      subcategory: "Подкатегория",
      price: "Цена (сум)",
      oldPrice: "Старая цена (сум)",
      badge: "Бейдж (акция, хит...)",
      inStock: "В наличии на складе",
      descRu: "Описание (русский)",
      descUz: "Описание (узбекский)",
      translateToUz: "Перевести на узбекский",
      translating: "Перевод...",
      saveBtn: "Сохранить товар",
      cancelBtn: "Отмена",
      dropzone: "Перетащите фото сюда или нажмите для выбора",
      cover: "Обложка",
      removePhoto: "Удалить фото",
      addSpec: "+ Добавить характеристику",
      specName: "Название характеристики",
      specValue: "Значение",
    },
    orders: {
      title: "Управление заказами",
      subtitle: "Просмотр и обработка заказов интернет-магазина mini-mall.uz",
      statTotal: "Всего заказов",
      statNew: "Новые",
      statInProgress: "В обработке и доставке",
      statRevenue: "Общая сумма заказов",
      searchPlaceholder: "Поиск по номеру заказа, имени или телефону...",
      allStatuses: "Все статусы",
      dateAll: "За всё время",
      dateToday: "Сегодня",
      dateWeek: "За последние 7 дней",
      tgSettingsBtn: "Telegram-оповещения",
      colOrder: "Заказ",
      colCustomer: "Клиент",
      colItems: "Состав",
      colPayment: "Оплата",
      colTotal: "Сумма",
      colStatus: "Статус",
      colActions: "Действия",
      printInvoice: "Печать чека / накладной",
      deleteOrder: "Удалить заказ",
      deleteOrderConfirm: "Удалить заказ? Это действие необратимо.",
      orderDeleted: "Заказ удалён",
      statusUpdated: "Статус заказа обновлён",
    },
    invoice: {
      invoiceTitle: "Накладная заказа",
      invoiceSubtitle: "Товарный чек для курьера и склада",
      printBtn: "Печать / Сохранить PDF",
      seller: "Продавец",
      customer: "Покупатель",
      phone: "Телефон",
      city: "Город",
      address: "Адрес доставки",
      payment: "Способ оплаты",
      date: "Дата и время",
      colNum: "№",
      colItem: "Наименование товара",
      colPrice: "Цена",
      colQty: "Кол-во",
      colSum: "Сумма",
      totalToPay: "ИТОГО К ОПЛАТЕ:",
      stamp: "М.П. / Подпись продавца",
      buyerSign: "Подпись получателя",
      paymentCash: "Наличными курьеру при получении",
      paymentClick: "Click (онлайн)",
      paymentPayme: "Payme (онлайн)",
      paymentBank: "Перевод на р/с (юр. лица)",
    },
    categories: {
      title: "Управление категориями",
      subtitle:
        "Создавайте, редактируйте и настраивайте категории каталога и подкатегории",
      addBtn: "+ Новая категория",
      statCategories: "Категорий",
      statSubcategories: "Подкатегорий",
      searchPlaceholder: "Поиск категории или подкатегории...",
      expandAll: "Развернуть все",
      collapseAll: "Свернуть все",
      subcategoriesCount: "подкатегорий",
      addSubcategory: "+ Добавить подкатегорию",
      edit: "Редактировать",
      delete: "Удалить",
      deleteConfirmCat: "Вы уверены, что хотите удалить категорию?",
      deleteConfirmSub: "Удалить подкатегорию?",
      modalCreateCat: "Создание категории",
      modalEditCat: "Редактирование категории",
      modalCreateSub: "Создание подкатегории",
      modalEditSub: "Редактирование подкатегории",
      labelRu: "Название (Русский)",
      labelUz: "Название (Узбекский)",
      slug: "URL-ключ (slug)",
      icon: "Иконка",
      image: "URL изображения",
      save: "Сохранить",
      cancel: "Отмена",
    },
    banners: {
      title: "Баннеры и карусель новостей",
      subtitle:
        "Добавляйте новые слайды, загружайте фото, редактируйте тексты и ссылки",
      badgeMainScreen: "Главный экран",
      addBtn: "+ Добавить баннер",
      recommendedSize:
        "Рекомендуемый размер фото для карусели: 1200 × 500 px (16:9 / 2.4:1)",
      activeBadge: "Активен",
      hiddenBadge: "Скрыт",
      deleteConfirm: "Удалить баннер?",
      modalCreate: "Новый баннер",
      modalEdit: "Редактирование баннера",
      titleRu: "Заголовок (Русский)",
      titleUz: "Заголовок (Узбекский)",
      descRu: "Описание (Русский)",
      descUz: "Описание (Узбекский)",
      image: "Изображение баннера",
      link: "Ссылка для перехода",
      isActive: "Отображать на сайте",
      badges: "Бейджи и теги",
      save: "Сохранить баннер",
      cancel: "Отмена",
    },
    users: {
      title: "Администраторы и сотрудники",
      subtitle: "Управление учетными записями, ролями и правами доступа",
      addBtn: "+ Добавить сотрудника",
      superAdminPwdTitle: "Сменить мой пароль",
      superAdminPwdDesc:
        "Только Главный Администратор может изменить свой собственный пароль",
      newPassword: "Новый пароль",
      confirmPassword: "Подтверждение пароля",
      savePassword: "Сохранить новый пароль",
      colUser: "Сотрудник",
      colUsername: "Логин",
      colRole: "Роль",
      colStatus: "Статус",
      colCreated: "Создан",
      colActions: "Действия",
      statusActive: "Активен",
      statusBlocked: "Отключен",
      deleteConfirm: "Удалить учетную запись сотрудника?",
      modalTitleCreate: "Новый сотрудник",
      modalTitleEdit: "Редактирование сотрудника",
      name: "Имя сотрудника",
      username: "Логин для входа",
      password: "Пароль",
      role: "Роль в системе",
      permissions: "Права доступа",
      save: "Сохранить",
      cancel: "Отмена",
    },
    help: {
      title: "Управление справочным центром",
      subtitle:
        "Редактирование информации о магазине, доставке, оплате и гарантиях",
      saveSection: "Сохранить раздел",
      resetSection: "Сбросить раздел",
      resetAll: "Сбросить весь справочный центр",
      preview: "Предпросмотр на сайте",
      tabRu: "Русский (RU)",
      tabUz: "Узбекский (UZ)",
      sectionTitle: "Заголовок раздела",
      sectionBadge: "Подзаголовок / Бейдж",
      sectionDesc: "Краткое описание",
      sectionContent: "Подробный текст раздела",
    },
    login: {
      title: "Вход в панель управления",
      tagline: "Панель управления",
      subtitle: "Безопасный доступ к управлению маркетплейсом и каталогом",
      notice:
        "Панель защищена сквозным шифрованием. Вход разрешен только авторизованным администраторам.",
      username: "Логин администратора",
      password: "Пароль",
      submit: "Войти в систему",
      toStore: "← Вернуться в магазин",
      errUsername: "Пожалуйста, введите логин",
      errPassword: "Пожалуйста, введите пароль",
      errAuth: "Неверный логин или пароль",
    },
    telegram: {
      modalTitle: "Настройка Telegram бота",
      botStatus: "Статус бота",
      botActive: "Бот активен и принимает запросы",
      botSubscribers: "Подключенные администраторы",
      botToken: "Токен Telegram бота",
      chatId: "ID чата администратора",
      testBtn: "Отправить тест",
      testing: "Отправка...",
      saveBtn: "Сохранить настройки",
      cancelBtn: "Закрыть",
      guideTitle: "Инструкция по подключению:",
      guideStep1: "1. Откройте бота @MiniMall_Uz_bot в Telegram",
      guideStep2: "2. Нажмите Start и выберите язык (Русский или O'zbekcha)",
      guideStep3: "3. Введите ваш логин и пароль администратора для привязки",
    },
  },
  uz: {
    nav: {
      brandAdmin: "minimall.admin",
      tagline: "Marketpleys boshqaruv paneli",
      products: "Katalog tovarlari",
      productsShort: "Tovarlar",
      admins: "Administratorlar",
      adminsShort: "Adminlar",
      orders: "Buyurtmalar",
      banners: "Karusel bannerlari",
      bannersShort: "Bannerlar",
      categories: "Katalog kategoriyalari",
      categoriesShort: "Kategoriyalar",
      help: "Ma'lumot markazi",
      helpShort: "Ma'lumot",
      management: "Boshqaruv",
      toStore: "Do'konga",
      logout: "Chiqish",
      logoutConfirm: "Administrator panelidan chiqishni xohlaysizmi?",
      logoutSuccess: "Boshqaruv panelidan muvaffaqiyatli chiqdingiz",
      superAdmin: "Bosh Administrator",
      admin: "Administrator",
      manager: "Kontent-menejer",
      systemTitle: "Minimall RBAC v1",
      systemDesc:
        "Administratorlarning kirish huquqlari tizimi faol. Ma'lumotlar himoyalangan va xavfsiz saqlanadi.",
      statusLabel: "Joriy holat:",
      authorized: "Tizimga kirilgan",
      helpSectionsCount: "10 ta bo'lim",
    },
    products: {
      title: "Tovarlar katalogi",
      subtitle: "Assortiment, narxlar va mavjudlikni boshqarish",
      addBtn: "+ Tovar qo'shish",
      exportBtn: "Eksport",
      statTotal: "Jami tovarlar",
      statInStock: "Mavjud",
      statOutOfStock: "Mavjud emas",
      statValue: "Katalogning umumiy qiymati",
      searchPlaceholder: "Nomi, brendi yoki artikul bo'yicha qidirish...",
      allCategories: "Barcha kategoriyalar",
      allBrands: "Barcha brendlar",
      allStatuses: "Barcha holatlar",
      statusInStock: "Faqat mavjud",
      statusOutOfStock: "Mavjud emas",
      resetFilters: "Filtrlarni tozalash",
      colProduct: "Tovar",
      colCategory: "Kategoriya",
      colPrice: "Narx",
      colStatus: "Holat",
      colActions: "Amallar",
      edit: "Tahrirlash",
      delete: "O'chirish",
      deleteConfirm: "Haqiqatan ham ushbu tovarni o'chirmoqchimisiz",
      deletedToast: "o'chirildi",
      inStockBadge: "Mavjud",
      outOfStockBadge: "Mavjud emas",
      toggleStockToOut: "Tovar «Mavjud emas» holatiga o'tkazildi",
      toggleStockToIn: "Tovar «Mavjud» holatiga o'tkazildi",
      emptyTitle: "Tovarlar topilmadi",
      emptyDesc: "Qidiruv yoki filtr parametrlarini o'zgartirib ko'ring",
    },
    productForm: {
      createTitle: "Yangi tovar qo'shish",
      editTitle: "Tovarni tahrirlash",
      tabGeneral: "Asosiy",
      tabMedia: "Rasmlar",
      tabSpecs: "Xususiyatlar",
      tabSeo: "SEO va Havola",
      nameRu: "Nomi (Ruscha)",
      nameUz: "Nomi (O'zbekcha)",
      brand: "Brend",
      category: "Kategoriya",
      subcategory: "Kichik kategoriya",
      price: "Narxi (so'm)",
      oldPrice: "Eski narxi (so'm)",
      badge: "Nishon (aksiya, xit...)",
      inStock: "Omborda mavjud",
      descRu: "Tavsif (ruscha)",
      descUz: "Tavsif (o'zbekcha)",
      translateToUz: "O'zbek tiliga tarjima qilish",
      translating: "Tarjima qilinmoqda...",
      saveBtn: "Tovarni saqlash",
      cancelBtn: "Bekor qilish",
      dropzone: "Rasmlarni bu yerga torting yoki tanlash uchun bosing",
      cover: "Muqova",
      removePhoto: "Rasmni o'chirish",
      addSpec: "+ Xususiyat qo'shish",
      specName: "Xususiyat nomi",
      specValue: "Qiymati",
    },
    orders: {
      title: "Buyurtmalarni boshqarish",
      subtitle:
        "mini-mall.uz internet-do'koni buyurtmalarini ko'rish va boshqarish",
      statTotal: "Jami buyurtmalar",
      statNew: "Yangi",
      statInProgress: "Jarayonda va yetkazilmoqda",
      statRevenue: "Buyurtmalarning umumiy summasi",
      searchPlaceholder: "Buyurtma raqami, ism yoki telefon bo'yicha qidirish...",
      allStatuses: "Barcha holatlar",
      dateAll: "Barcha vaqt",
      dateToday: "Bugun",
      dateWeek: "Oxirgi 7 kun",
      tgSettingsBtn: "Telegram-bildirishnomalar",
      colOrder: "Buyurtma",
      colCustomer: "Mijoz",
      colItems: "Tarkibi",
      colPayment: "To'lov",
      colTotal: "Summa",
      colStatus: "Holat",
      colActions: "Amallar",
      printInvoice: "Chek / Hisob-faktura chop etish",
      deleteOrder: "Buyurtmani o'chirish",
      deleteOrderConfirm:
        "Buyurtmani o'chirilsinmi? Bu amalni ortga qaytarib bo'lmaydi.",
      orderDeleted: "Buyurtma o'chirildi",
      statusUpdated: "Buyurtma holati yangilandi",
    },
    invoice: {
      invoiceTitle: "Buyurtma hisob-fakturasi",
      invoiceSubtitle: "Kuryer va ombor uchun tovar cheki",
      printBtn: "Chop etish / PDF saqlash",
      seller: "Sotuvchi",
      customer: "Xaridor",
      phone: "Telefon",
      city: "Shahar",
      address: "Yetkazib berish manzili",
      payment: "To'lov usuli",
      date: "Sana va vaqt",
      colNum: "№",
      colItem: "Tovar nomi",
      colPrice: "Narx",
      colQty: "Miqdor",
      colSum: "Summa",
      totalToPay: "JAMI TO'LOV:",
      stamp: "M.O'. / Sotuvchi imzosi",
      buyerSign: "Qabul qiluvchi imzosi",
      paymentCash: "Qabul qilishda kuryerga naqd pul",
      paymentClick: "Click (onlayn)",
      paymentPayme: "Payme (onlayn)",
      paymentBank: "Bank hisobiga o'tkazish (yuridik shaxslar)",
    },
    categories: {
      title: "Kategoriyalarni boshqarish",
      subtitle:
        "Katalog kategoriyalari va kichik kategoriyalarni yarating va boshqaring",
      addBtn: "+ Yangi kategoriya",
      statCategories: "Kategoriyalar",
      statSubcategories: "Kichik kategoriyalar",
      searchPlaceholder: "Kategoriya yoki kichik kategoriyani qidirish...",
      expandAll: "Barchasini ochish",
      collapseAll: "Barchasini yopish",
      subcategoriesCount: "ta kichik kategoriya",
      addSubcategory: "+ Kichik kategoriya qo'shish",
      edit: "Tahrirlash",
      delete: "O'chirish",
      deleteConfirmCat: "Haqiqatan ham ushbu kategoriyani o'chirmoqchimisiz?",
      deleteConfirmSub: "Kichik kategoriyani o'chirmoqchimisiz?",
      modalCreateCat: "Kategoriya yaratish",
      modalEditCat: "Kategoriyani tahrirlash",
      modalCreateSub: "Kichik kategoriya yaratish",
      modalEditSub: "Kichik kategoriyani tahrirlash",
      labelRu: "Nomi (Ruscha)",
      labelUz: "Nomi (O'zbekcha)",
      slug: "URL-kalit (slug)",
      icon: "Belgi / Emotsiya",
      image: "Rasm URL manzili",
      save: "Saqlash",
      cancel: "Bekor qilish",
    },
    banners: {
      title: "Bannerlar va yangiliklar karuseli",
      subtitle:
        "Yangi slaydlarni qo'shing, rasmlarni yuklang, matnlar va havolalarni tahrirlang",
      badgeMainScreen: "Bosh ekran",
      addBtn: "+ Banner qo'shish",
      recommendedSize:
        "Karusel uchun tavsiya etilgan rasm o'lchami: 1200 × 500 px (16:9 / 2.4:1)",
      activeBadge: "Faol",
      hiddenBadge: "Yashirilgan",
      deleteConfirm: "Bannerni o'chirmoqchimisiz?",
      modalCreate: "Yangi banner",
      modalEdit: "Bannerni tahrirlash",
      titleRu: "Sarlavha (Ruscha)",
      titleUz: "Sarlavha (O'zbekcha)",
      descRu: "Tavsif (Ruscha)",
      descUz: "Tavsif (O'zbekcha)",
      image: "Banner rasmi",
      link: "O'tish havolasi",
      isActive: "Saytda ko'rsatish",
      badges: "Nishonlar va teglar",
      save: "Bannerni saqlash",
      cancel: "Bekor qilish",
    },
    users: {
      title: "Administratorlar va xodimlar",
      subtitle: "Hisoblar, rollar va kirish huquqlarini boshqarish",
      addBtn: "+ Xodim qo'shish",
      superAdminPwdTitle: "Mening parolimni o'zgartirish",
      superAdminPwdDesc:
        "Faqat Bosh Administrator o'z parolini o'zgartirishi mumkin",
      newPassword: "Yangi parol",
      confirmPassword: "Parolni tasdiqlash",
      savePassword: "Yangi parolni saqlash",
      colUser: "Xodim",
      colUsername: "Login",
      colRole: "Rol",
      colStatus: "Holat",
      colCreated: "Yaratilgan",
      colActions: "Amallar",
      statusActive: "Faol",
      statusBlocked: "O'chirilgan",
      deleteConfirm: "Foydalanuvchi hisobini o'chirmoqchimisiz?",
      modalTitleCreate: "Yangi xodim",
      modalTitleEdit: "Xodimni tahrirlash",
      name: "Xodimning ismi",
      username: "Kirish uchun login",
      password: "Parol",
      role: "Tizimdagi roli",
      permissions: "Kirish huquqlari",
      save: "Saqlash",
      cancel: "Bekor qilish",
    },
    help: {
      title: "Ma'lumot markazini boshqarish",
      subtitle:
        "Do'kon, yetkazib berish, to'lov va kafolatlar haqidagi ma'lumotlarni tahrirlash",
      saveSection: "Bo'limni saqlash",
      resetSection: "Bo'limni asl holiga qaytarish",
      resetAll: "Barcha ma'lumot markazini tiklash",
      preview: "Saytda ko'rish",
      tabRu: "Ruscha (RU)",
      tabUz: "O'zbekcha (UZ)",
      sectionTitle: "Bo'lim sarlavhasi",
      sectionBadge: "Quyi sarlavha / Nishon",
      sectionDesc: "Qisqacha tavsif",
      sectionContent: "Bo'limning batafsil matni",
    },
    login: {
      title: "Boshqaruv paneliga kirish",
      tagline: "Boshqaruv paneli",
      subtitle: "Marketpleys va katalogni boshqarish uchun xavfsiz kirish",
      notice:
        "Panel shifrlash bilan himoyalangan. Kirish faqat tasdiqlangan administratorlar uchun ruxsat etilgan.",
      username: "Administrator logini",
      password: "Parol",
      submit: "Tizimga kirish",
      toStore: "← Do'konga qaytish",
      errUsername: "Iltimos, loginni kiriting",
      errPassword: "Iltimos, parolni kiriting",
      errAuth: "Noto'g'ri login yoki parol",
    },
    telegram: {
      modalTitle: "Telegram botni sozlash",
      botStatus: "Bot holati",
      botActive: "Bot faol va so'rovlarni qabul qilmoqda",
      botSubscribers: "Ulangan administratorlar",
      botToken: "Telegram bot tokeni",
      chatId: "Administrator chat ID",
      testBtn: "Sinov xabarini yuborish",
      testing: "Yuborilmoqda...",
      saveBtn: "Sozlamalarni saqlash",
      cancelBtn: "Yopish",
      guideTitle: "Ulash bo'yicha yo'riqnoma:",
      guideStep1: "1. Telegramda @MiniMall_Uz_bot manzilini oching",
      guideStep2: "2. Start bosing va tilni tanlang (Русский yoki O'zbekcha)",
      guideStep3: "3. Ulanish uchun administrator logini va parolini kiriting",
    },
  },
};
