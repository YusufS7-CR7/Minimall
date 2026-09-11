import { useState, useEffect } from "react";
import type { AdminUser, AdminPermission } from "@/data/adminTypes";
import { ALL_ADMIN_PERMISSIONS } from "@/data/adminTypes";
import CustomSelect from "@/components/ui/CustomSelect";

interface AdminUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminToEdit: AdminUser | null;
  onSave: (data: {
    username: string;
    name: string;
    password: string;
    role: "admin" | "manager";
    permissions: AdminPermission[];
  }) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };
}

export default function AdminUserModal({
  isOpen,
  onClose,
  adminToEdit,
  onSave,
}: AdminUserModalProps) {
  const isEditing = !!adminToEdit;
  const isSuperAdmin = adminToEdit?.isSuperAdmin;

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "manager">("admin");
  const [permissions, setPermissions] = useState<AdminPermission[]>([
    "products_view",
    "products_create",
    "products_edit",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (adminToEdit) {
      setUsername(adminToEdit.username);
      setName(adminToEdit.name);
      setPassword(""); // Blank means don't change password
      setRole(adminToEdit.role === "manager" ? "manager" : "admin");
      setPermissions(adminToEdit.permissions);
    } else {
      setUsername("");
      setName("");
      setPassword("");
      setRole("admin");
      setPermissions([
        "products_view",
        "products_create",
        "products_edit",
      ]);
    }
    setError(null);
  }, [adminToEdit, isOpen]);

  if (!isOpen) return null;

  const togglePermission = (permId: AdminPermission) => {
    if (isSuperAdmin) return; // Cannot alter superadmin rights
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleSelectAll = () => {
    setPermissions(ALL_ADMIN_PERMISSIONS.map((p) => p.id));
  };

  const handleSelectContentManager = () => {
    setPermissions(["products_view", "products_create", "products_edit", "products_export"]);
  };

  const handleSelectReadOnly = () => {
    setPermissions(["products_view"]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEditing && !username.trim()) {
      setError("Укажите логин для входа");
      return;
    }

    if (!name.trim()) {
      setError("Укажите имя администратора");
      return;
    }

    if (!isEditing && (!password || password.length < 4)) {
      setError("Пароль должен содержать минимум 4 символа");
      return;
    }

    if (permissions.length === 0 && !isSuperAdmin) {
      setError("Выберите хотя бы одно разрешение для администратора");
      return;
    }

    setSaving(true);
    try {
      const res = await onSave({
        username: username.trim().toLowerCase(),
        name: name.trim(),
        password,
        role,
        permissions: isSuperAdmin ? ALL_ADMIN_PERMISSIONS.map((p) => p.id) : permissions,
      });

      if (!res.success) {
        setError(res.error || "Ошибка сохранения");
      } else {
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="bg-white text-gray-900 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="text-xl sm:text-2xl">
              {isSuperAdmin ? "👑" : isEditing ? "✏️" : "👤"}
            </span>
            <div>
              <h2
                className="text-lg sm:text-xl font-bold tracking-wide text-gray-900"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {isSuperAdmin
                  ? "Редактирование Главного Администратора"
                  : isEditing
                  ? `Редактирование: ${adminToEdit?.name}`
                  : "Создание нового администратора"}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400">
                {isSuperAdmin
                  ? "Главный администратор обладает всеми правами доступа"
                  : "Назначьте персональный логин, пароль и индивидуальные права доступа"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-sm transition-colors cursor-pointer shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-gray-900">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Имя сотрудника / Администратора <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="например, Азиз Каримов"
                className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>

            {/* Username / Login */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Логин для входа <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="логин, например, aziz_admin"
                className={`w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors ${
                  isEditing ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-gray-50/50 focus:bg-white"
                }`}
              />
              {isEditing && (
                <span className="text-[11px] text-gray-400 mt-1 block">Логин нельзя изменить после создания</span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {isEditing ? "Новый пароль (оставьте пустым, если не меняете)" : "Пароль *"}
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "Без изменений" : "Минимум 4 символа"}
                className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors font-mono"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Роль в системе
              </label>
              <CustomSelect
                disabled={isSuperAdmin}
                value={isSuperAdmin ? "superadmin" : role}
                onChange={(val) => setRole(val as "admin" | "manager")}
                options={
                  isSuperAdmin
                    ? [{ value: "superadmin", label: "Главный Администратор (Суперадмин)", icon: "👑" }]
                    : [
                        { value: "admin", label: "Администратор", icon: "🛡️" },
                        { value: "manager", label: "Контент-менеджер", icon: "💼" },
                      ]
                }
              />
            </div>
          </div>

          {/* Permissions Section */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>Разрешения в админ-панели</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Определите, к каким функциям и кнопкам этот администратор будет иметь доступ
                </p>
              </div>

              {!isSuperAdmin && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Все права
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectContentManager}
                    className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Товары (без админов)
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectReadOnly}
                    className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    Только просмотр
                  </button>
                </div>
              )}
            </div>

            {isSuperAdmin && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-3 flex items-center gap-2">
                <span>👑</span>
                <span>Главный Администратор всегда имеет неограниченный доступ ко всем разделам и функциям.</span>
              </div>
            )}

            {/* Checklist */}
            <div className="space-y-2.5">
              {ALL_ADMIN_PERMISSIONS.map((p) => {
                const checked = isSuperAdmin || permissions.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                      checked
                        ? "bg-red-50/50 border-red-200"
                        : "bg-gray-50/50 border-gray-100 hover:bg-gray-50"
                    } ${isSuperAdmin ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      disabled={isSuperAdmin}
                      checked={checked}
                      onChange={() => togglePermission(p.id)}
                      className="mt-0.5 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 accent-red-600 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{p.label}</span>
                        {p.category === "system" && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.2 rounded">
                            Система
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{p.description}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Сохранение...
                </>
              ) : isEditing ? (
                "Сохранить изменения"
              ) : (
                "Создать администратора"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
