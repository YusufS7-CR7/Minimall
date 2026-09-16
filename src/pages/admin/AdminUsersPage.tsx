import React, { useState, useMemo, useEffect } from "react";
import type { AdminUser, AdminPermission } from "@/data/adminTypes";
import { ALL_ADMIN_PERMISSIONS } from "@/data/adminTypes";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import AdminUserModal from "./AdminUserModal";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";

function translateAdminError(code: string, lang: string): string {
  const ru: Record<string, string> = {
    err_admin_username_exists: "Администратор с таким логином уже существует",
    err_admin_password_short: "Пароль должен содержать не менее 4 символов",
    err_admin_username_empty: "Логин не может быть пустым",
    err_admin_username_short: "Логин должен содержать минимум 3 символа",
    err_fields_required: "Пожалуйста, заполните все обязательные поля",
    err_no_permission: "У вас нет прав на выполнение этого действия",
    err_admin_not_found: "Администратор не найден",
    err_superadmin_self_only: "Только Главный Администратор может изменять свой аккаунт",
    err_cannot_delete_superadmin: "Главного Администратора нельзя удалить!",
    err_cannot_delete_self: "Вы не можете удалить свою текущую учетную запись",
    err_cannot_block_superadmin: "Нельзя заблокировать Главного Администратора",
    err_invalid_credentials: "Неверный логин или пароль",
    err_admin_inactive: "Учетная запись администратора деактивирована",
  };
  const uz: Record<string, string> = {
    err_admin_username_exists: "Bu loginga ega administrator allaqachon mavjud",
    err_admin_password_short: "Parol kamida 4 ta belgidan iborat bo'lishi kerak",
    err_admin_username_empty: "Login bo'sh bo'lishi mumkin emas",
    err_admin_username_short: "Login kamida 3 ta belgidan iborat bo'lishi kerak",
    err_fields_required: "Iltimos, barcha majburiy maydonlarni to'ldiring",
    err_no_permission: "Ushbu amalni bajarish uchun sizda ruxsat yo'q",
    err_admin_not_found: "Administrator topilmadi",
    err_superadmin_self_only: "Faqat Bosh Administrator o'z hisobini o'zgartirishi mumkin",
    err_cannot_delete_superadmin: "Bosh Administratorni o'chirib bo'lmaydi!",
    err_cannot_delete_self: "O'z hisobingizni o'chira olmaysiz",
    err_cannot_block_superadmin: "Bosh Administratorni bloklab bo'lmaydi",
    err_invalid_credentials: "Noto'g'ri login yoki parol",
    err_admin_inactive: "Administrator hisobi faolsizlantirilgan",
  };
  const map = lang === "uz" ? uz : ru;
  return map[code] ?? code;
}

// ── Superadmin own-password change form ───────────────────────────────────────
function SuperAdminPasswordSection() {
  const { adminUser, updateAdmin } = useAdminAuth();
  const { showToast, lang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].users;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 4) {
      setError(
        lang === "uz"
          ? "Parol kamida 4 ta belgidan iborat bo'lishi kerak"
          : "Пароль должен содержать минимум 4 символа"
      );
      return;
    }
    if (newPassword !== confirmPwd) {
      setError(lang === "uz" ? "Parollar mos kelmaydi" : "Пароли не совпадают");
      return;
    }
    setSaving(true);
    const res = await updateAdmin(adminUser!.id, { password: newPassword });
    setSaving(false);
    if (res.success) {
      showToast(
        lang === "uz"
          ? "Bosh Administrator paroli muvaffaqiyatli o'zgartirildi!"
          : "Пароль Главного Администратора успешно изменён!"
      );
      setNewPassword("");
      setConfirmPwd("");
    } else {
      setError(res.error || (lang === "uz" ? "Saqlash xatosi" : "Ошибка сохранения"));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-amber-200 shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center gap-3">
        <span className="text-xl">👑</span>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{t.superAdminPwdTitle}</h3>
          <p className="text-xs text-gray-500">{t.superAdminPwdDesc}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.newPassword} *</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={lang === "uz" ? "Kamida 4 ta belgi" : "Минимум 4 символа"}
                className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">{t.confirmPassword} *</label>
            <input
              type={showPwd ? "text" : "password"}
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder={lang === "uz" ? "Parolni takrorlang" : "Повторите пароль"}
              className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors font-mono"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving || !newPassword || !confirmPwd}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            {saving ? (
              <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />{lang === "uz" ? "Saqlanmoqda..." : "Сохранение..."}</>
            ) : (
              `🔐 ${t.savePassword}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminUsersPage() {
  const {
    adminUser,
    admins,
    isSuperAdmin,
    hasPermission,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    toggleAdminStatus,
    fetchAdmins,
  } = useAdminAuth();
  const { showToast, lang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].users;

  useDocumentMeta({
    title:
      lang === "uz"
        ? "Administratorlarni boshqarish | Minimall Admin"
        : "Управление администраторами | Minimall Admin",
    description:
      lang === "uz"
        ? "Admin panelida administrator logini va kirish huquqlarini boshqarish"
        : "Управление администраторами, логинами и правами доступа в админ-панели",
    noIndex: true,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const canManageAdmins = isSuperAdmin || hasPermission("admins_manage");

  useEffect(() => {
    if (canManageAdmins) {
      fetchAdmins();
    }
  }, [canManageAdmins, fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) return admins;
    const q = searchQuery.toLowerCase();
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q)
    );
  }, [admins, searchQuery]);

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((a) => a.isActive).length;
    const superAdminObj = admins.find((a) => a.isSuperAdmin);
    return { total, active, superAdminLogin: superAdminObj?.username || "admin" };
  }, [admins]);

  const handleOpenCreate = () => {
    setEditingAdmin(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (target: AdminUser) => {
    setEditingAdmin(target);
    setModalOpen(true);
  };

  const handleDelete = async (target: AdminUser) => {
    if (target.isSuperAdmin) {
      alert(
        lang === "uz"
          ? "Bosh administratorni o'chirib bo'lmaydi!"
          : "Главного администратора нельзя удалить!"
      );
      return;
    }

    const confirmMsg =
      lang === "uz"
        ? `"${target.name}" (@${target.username}) administratorini o'chirmoqchimisiz?`
        : `Вы действительно хотите удалить администратора "${target.name}" (@${target.username})?`;
    if (window.confirm(confirmMsg)) {
      const res = await deleteAdmin(target.id);
      if (res.success) {
        showToast(
          lang === "uz"
            ? `"${target.name}" administratori o'chirildi`
            : `Администратор "${target.name}" удален`
        );
      } else {
        const errorMsg = res.error ? translateAdminError(res.error, lang) : (lang === "uz" ? "O'chirish xatosi" : "Ошибка удаления");
        alert(errorMsg);
      }
    }
  };

  const handleToggleStatus = async (target: AdminUser) => {
    if (target.isSuperAdmin) return;
    const res = await toggleAdminStatus(target.id);
    if (res.success) {
      showToast(
        lang === "uz"
          ? target.isActive
            ? `"${target.name}" hisobi bloklandi`
            : `"${target.name}" hisobi faollashtirildi`
          : target.isActive
          ? `Учетная запись "${target.name}" заблокирована`
          : `Учетная запись "${target.name}" активирована`
      );
    }
  };

  const handleSave = async (data: {
    username: string;
    name: string;
    password: string;
    role: "admin" | "manager";
    permissions: AdminPermission[];
  }) => {
    if (editingAdmin) {
      const res = await updateAdmin(editingAdmin.id, {
        name: data.name,
        password: data.password || undefined,
        role: data.role,
        permissions: data.permissions,
      });
      if (res.success) {
        showToast(
          lang === "uz"
            ? `"${data.name}" administrator ma'lumotlari muvaffaqiyatli yangilandi`
            : `Данные администратора "${data.name}" успешно обновлены`
        );
      }
      return res;
    } else {
      const res = await createAdmin({
        username: data.username,
        name: data.name,
        password: data.password,
        role: data.role,
        permissions: data.permissions,
      });
      if (res.success) {
        showToast(
          lang === "uz"
            ? `Yangi "${data.name}" administratori muvaffaqiyatli yaratildi!`
            : `Новый администратор "${data.name}" успешно создан!`
        );
      }
      return res;
    }
  };

  if (!canManageAdmins) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-bold text-gray-900">
          {lang === "uz" ? "Kirish cheklangan" : "Доступ ограничен"}
        </h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          {lang === "uz"
            ? "Sizning hisobingizda administratorlarni boshqarish huquqi yo'q. Huquqlarni olish uchun Bosh Administratorga murojaat qiling."
            : "У вашей учетной записи нет разрешения на управление администраторами. Обратитесь к Главному Администратору системы для предоставления прав."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-black text-gray-900"
              style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            >
              {t.title}
            </h1>
            <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200/60">
              {lang === "uz" ? "Supervisor kirishi" : "Доступ супервайзера"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t.subtitle}</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="text-base font-black">+</span>
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {lang === "uz" ? "Jami administratorlar" : "Всего администраторов"}
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-gray-900 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {lang === "uz" ? "tizimda ro'yxatdan o'tgan" : "зарегистрировано в системе"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {lang === "uz" ? "Bosh administrator" : "Главный администратор"}
          </div>
          <div
            className="text-xl sm:text-2xl font-black text-red-600 mt-1 truncate"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            @{stats.superAdminLogin}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {lang === "uz" ? "to'liq huquqlar (SuperAdmin)" : "полные права (SuperAdmin)"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {lang === "uz" ? "Faol hisoblar" : "Активных аккаунтов"}
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.active} / {stats.total}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">
            {lang === "uz" ? "panelga kirish huquqi bor" : "имеют доступ к панели"}
          </div>
        </div>
      </div>

      {/* Superadmin: Change own password */}
      {isSuperAdmin && <SuperAdminPasswordSection />}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder={
              lang === "uz"
                ? "Administrator ism, login yoki rol bo'yicha qidirish..."
                : "Поиск администратора по имени, логину или роли..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-gray-400 hover:text-gray-600 px-2"
          >
            {lang === "uz" ? "Tozalash" : "Сбросить"}
          </button>
        )}
      </div>

      {/* Mobile Admins List (Cards) */}
      <div className="md:hidden space-y-3">
        {filteredAdmins.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            {lang === "uz" ? "Administratorlar topilmadi" : "Администраторы не найдены"}
          </div>
        ) : (
          filteredAdmins.map((target) => {
            const isCurrent = adminUser?.id === target.id;
            return (
              <div
                key={target.id}
                className={`bg-white rounded-2xl border border-gray-100 p-4 shadow-xs flex flex-col gap-3 ${
                  !target.isActive ? "opacity-60 bg-gray-50/40" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 shadow-xs ${
                        target.isSuperAdmin
                          ? "bg-gradient-to-br from-amber-400 to-red-600 text-white shadow-red-500/20"
                          : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
                      }`}
                    >
                      {target.isSuperAdmin ? "👑" : target.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5 truncate">
                        <span>{target.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                            {lang === "uz" ? "Siz" : "Вы"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">@{target.username}</div>
                    </div>
                  </div>

                  {target.isSuperAdmin ? (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                      {lang === "uz" ? "Muddatsiz" : "Бессрочно"}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(target)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer shrink-0 ${
                        target.isActive
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${target.isActive ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span>{target.isActive ? (lang === "uz" ? "Faol" : "Активен") : (lang === "uz" ? "Blok" : "Блок")}</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{lang === "uz" ? "Rol:" : "Роль:"}</span>
                  {target.isSuperAdmin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-amber-100 to-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full">
                      👑 {lang === "uz" ? "Bosh Administrator" : "Главный Администратор"}
                    </span>
                  ) : target.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-0.5 rounded-full">
                      🛡️ {lang === "uz" ? "Administrator" : "Администратор"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
                      💼 {lang === "uz" ? "Kontent-menejer" : "Контент-менеджер"}
                    </span>
                  )}
                </div>

                {/* Permissions */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-[11px] text-gray-400 font-semibold mb-1">{lang === "uz" ? "Ruxsatlar:" : "Разрешения:"}</div>
                  {target.isSuperAdmin ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      ✨ {lang === "uz" ? "Barcha bo'limlarga to'liq kirish" : "Полный доступ ко всем разделам"}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {target.permissions.map((pId) => {
                        const pDef = ALL_ADMIN_PERMISSIONS.find((p) => p.id === pId);
                        return (
                          <span
                            key={pId}
                            className="text-[10px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md"
                          >
                            {pDef ? pDef.label : pId}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEdit(target)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-colors cursor-pointer"
                    title={lang === "uz" ? "Huquqlar va parolni tahrirlash" : "Редактировать права и пароль"}
                  >
                    <span>✏️</span>
                    <span>{lang === "uz" ? "Tahrirlash" : "Редактировать"}</span>
                  </button>
                  {!target.isSuperAdmin && (
                    <button
                      onClick={() => handleDelete(target)}
                      disabled={isCurrent}
                      className={`p-2 rounded-xl text-xs transition-colors ${
                        isCurrent
                          ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                          : "bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer border border-red-200"
                      }`}
                      title={isCurrent ? (lang === "uz" ? "O'zingizni o'chirib bo'lmaydi" : "Нельзя удалить себя") : (lang === "uz" ? "O'chirish" : "Удалить")}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Admins Table (Desktop) */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-4">{lang === "uz" ? "Administrator / Login" : "Администратор / Логин"}</th>
                <th className="py-3 px-4">{lang === "uz" ? "Rol" : "Роль"}</th>
                <th className="py-3 px-4">{lang === "uz" ? "Paneldagi ruxsatlar" : "Разрешения в панели"}</th>
                <th className="py-3 px-4 text-center">{lang === "uz" ? "Holat" : "Статус"}</th>
                <th className="py-3 px-4 text-right">{lang === "uz" ? "Amallar" : "Действия"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    {lang === "uz" ? "Administratorlar topilmadi" : "Администраторы не найдены"}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((target) => {
                  const isCurrent = adminUser?.id === target.id;
                  return (
                    <tr
                      key={target.id}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        !target.isActive ? "opacity-60 bg-gray-50/30" : ""
                      }`}
                    >
                      {/* Name & Login */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                              target.isSuperAdmin
                                ? "bg-gradient-to-br from-amber-400 to-red-600 text-white shadow-red-500/20"
                                : "bg-gradient-to-br from-gray-700 to-gray-900 text-white"
                            }`}
                          >
                            {target.isSuperAdmin ? "👑" : target.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{target.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.2 rounded">
                                  {lang === "uz" ? "Siz" : "Вы"}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                              @{target.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {target.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-amber-100 to-red-100 text-red-800 border border-red-200 px-2.5 py-1 rounded-full">
                            <span>👑</span> {lang === "uz" ? "Bosh Administrator" : "Главный Администратор"}
                          </span>
                        ) : target.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-1 rounded-full">
                            <span>🛡️</span> {lang === "uz" ? "Administrator" : "Администратор"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                            <span>💼</span> {lang === "uz" ? "Kontent-menejer" : "Контент-менеджер"}
                          </span>
                        )}
                      </td>

                      {/* Permissions Badges */}
                      <td className="py-3.5 px-4">
                        {target.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            ✨ {lang === "uz" ? "To'liq cheklanmagan kirish (Barcha huquqlar)" : "Полный неограниченный доступ (Все права)"}
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-md">
                            {target.permissions.map((pId) => {
                              const pDef = ALL_ADMIN_PERMISSIONS.find((p) => p.id === pId);
                              return (
                                <span
                                  key={pId}
                                  className="text-[11px] bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md border border-gray-200/60"
                                >
                                  {pDef ? pDef.label : pId}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {target.isSuperAdmin ? (
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {lang === "uz" ? "Muddatsiz faol" : "Бессрочно активен"}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(target)}
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                              target.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                            }`}
                            title={lang === "uz" ? "Faollik holatini o'zgartirish uchun bosing" : "Нажмите, чтобы изменить статус активности"}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                target.isActive ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span>{target.isActive ? (lang === "uz" ? "Faol" : "Активен") : (lang === "uz" ? "Bloklangan" : "Заблокирован")}</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(target)}
                            className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                            title={lang === "uz" ? "Huquqlar yoki parolni tahrirlash" : "Редактировать права или пароль"}
                          >
                            ✏️
                          </button>

                          {/* Delete button (forbidden for superadmin) */}
                          {!target.isSuperAdmin && (
                            <button
                              onClick={() => handleDelete(target)}
                              disabled={isCurrent}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-colors ${
                                isCurrent
                                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                  : "bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                              }`}
                              title={isCurrent ? (lang === "uz" ? "O'zingizni o'chirib bo'lmaydi" : "Нельзя удалить себя") : (lang === "uz" ? "Administratorni o'chirish" : "Удалить администратора")}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50/60 border-t border-gray-100 px-4 py-3 text-xs text-gray-400 flex items-center justify-between">
          <span>{lang === "uz" ? `Jami hisoblar: ${admins.length}` : `Всего учетных записей: ${admins.length}`}</span>
          <span className="font-mono text-[11px]">Minimall Role-Based Access Control (RBAC)</span>
        </div>
      </div>

      {/* Modal */}
      <AdminUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        adminToEdit={editingAdmin}
        lang={lang}
        onSave={handleSave}
      />
    </div>
  );
}
