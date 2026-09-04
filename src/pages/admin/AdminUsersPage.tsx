import { useState, useMemo } from "react";
import type { AdminUser, AdminPermission } from "@/data/adminTypes";
import { ALL_ADMIN_PERMISSIONS } from "@/data/adminTypes";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import AdminUserModal from "./AdminUserModal";

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
  } = useAdminAuth();
  const { showToast } = useApp();

  useDocumentMeta({
    title: "Управление администраторами | Minimall Admin",
    description: "Управление администраторами, логинами и правами доступа в админ-панели",
    noIndex: true,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const canManageAdmins = isSuperAdmin || hasPermission("admins_manage");

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

  const handleDelete = (target: AdminUser) => {
    if (target.isSuperAdmin) {
      alert("Главного администратора нельзя удалить!");
      return;
    }

    if (window.confirm(`Вы действительно хотите удалить администратора "${target.name}" (@${target.username})?`)) {
      const res = deleteAdmin(target.id);
      if (res.success) {
        showToast(`Администратор "${target.name}" удален`);
      } else {
        alert(res.error || "Ошибка удаления");
      }
    }
  };

  const handleToggleStatus = (target: AdminUser) => {
    if (target.isSuperAdmin) return;
    const res = toggleAdminStatus(target.id);
    if (res.success) {
      showToast(
        target.isActive
          ? `Учетная запись "${target.name}" заблокирована`
          : `Учетная запись "${target.name}" активирована`
      );
    }
  };

  const handleSave = (data: {
    username: string;
    name: string;
    password: string;
    role: "admin" | "manager";
    permissions: AdminPermission[];
  }) => {
    if (editingAdmin) {
      const res = updateAdmin(editingAdmin.id, {
        name: data.name,
        password: data.password || undefined,
        role: data.role,
        permissions: data.permissions,
      });
      if (res.success) {
        showToast(`Данные администратора "${data.name}" успешно обновлены`);
      }
      return res;
    } else {
      const res = createAdmin({
        username: data.username,
        name: data.name,
        password: data.password,
        role: data.role,
        permissions: data.permissions,
      });
      if (res.success) {
        showToast(`Новый администратор "${data.name}" успешно создан!`);
      }
      return res;
    }
  };

  if (!canManageAdmins) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-bold text-gray-900">Доступ ограничен</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          У вашей учетной записи нет разрешения на управление администраторами. Обратитесь к Главному Администратору системы для предоставления прав.
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
              Администраторы и права доступа
            </h1>
            <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200/60">
              Доступ супервайзера
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Создавайте дополнительных администраторов, задавайте им персональные логины, пароли и гибкие права доступа
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span className="text-base font-black">+</span>
          <span>Добавить админа</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Всего администраторов
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-gray-900 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">зарегистрировано в системе</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Главный администратор
          </div>
          <div
            className="text-xl sm:text-2xl font-black text-red-600 mt-1 truncate"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            @{stats.superAdminLogin}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">полные права (SuperAdmin)</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Активных аккаунтов
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.active} / {stats.total}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">имеют доступ к панели</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Поиск администратора по имени, логину или роли..."
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
            Сбросить
          </button>
        )}
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-4">Администратор / Логин</th>
                <th className="py-3 px-4">Роль</th>
                <th className="py-3 px-4">Разрешения в панели</th>
                <th className="py-3 px-4 text-center">Статус</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    Администраторы не найдены
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
                                  Вы
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
                            <span>👑</span> Главный Администратор
                          </span>
                        ) : target.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2.5 py-1 rounded-full">
                            <span>🛡️</span> Администратор
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                            <span>💼</span> Контент-менеджер
                          </span>
                        )}
                      </td>

                      {/* Permissions Badges */}
                      <td className="py-3.5 px-4">
                        {target.isSuperAdmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            ✨ Полный неограниченный доступ (Все права)
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
                            Бессрочно активен
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
                            title="Нажмите, чтобы изменить статус активности"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                target.isActive ? "bg-emerald-500" : "bg-red-500"
                              }`}
                            />
                            <span>{target.isActive ? "Активен" : "Заблокирован"}</span>
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
                            title="Редактировать права или пароль"
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
                              title={isCurrent ? "Нельзя удалить себя" : "Удалить администратора"}
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
          <span>Всего учетных записей: {admins.length}</span>
          <span className="font-mono text-[11px]">Minimall Role-Based Access Control (RBAC)</span>
        </div>
      </div>

      {/* Modal */}
      <AdminUserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        adminToEdit={editingAdmin}
        onSave={handleSave}
      />
    </div>
  );
}
