import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExportMenu } from "./shared/AdminShared";
import { Teacher } from "@/types/admin";
import { adminService } from "@/api/adminService";
import { exportTeachersCSV, exportTeachersDOCX } from "@/lib/adminExport";
import TeacherModal, { TeacherFormData } from "@/components/admin/TeacherModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

import { useUserFilters } from "./users/useUserFilters";
import { UserStatsBar } from "./users/UserStatsBar";
import { UserFilterDropdown } from "./users/UserFilterDropdown";
import { UserBulkActionsBar } from "./users/UserBulkActionsBar";
import { UserTable } from "./users/UserTable";
import { ResetPasswordModal } from "./users/ResetPasswordModal";

interface UserManagementProps {
  teachers: Teacher[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  toggleBlock: (id: number) => void;
  showResetModal: number | null;
  setShowResetModal: (v: number | null) => void;
  isLoading: boolean;
  onRefresh: () => void;
  onImpersonate: (id: number) => void;
  selectedIds: number[];
  setSelectedIds: (v: number[] | ((prev: number[]) => number[])) => void;
  onPromote: (id: number) => void;
  onDemote: (id: number) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  teachers, searchQuery, setSearchQuery, toggleBlock, showResetModal, setShowResetModal, isLoading, onRefresh, onImpersonate,
  selectedIds, setSelectedIds, onPromote, onDemote,
}) => {
  const { t } = useTranslation();
  const filters = useUserFilters(teachers);
  const [filterOpen, setFilterOpen] = useState(false);
  const [modal, setModal] = useState<{ isOpen: boolean; data?: TeacherFormData }>({ isOpen: false });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const handleClickOutside = () => setFilterOpen(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [filterOpen]);

  const handleSave = async (data: TeacherFormData) => {
    if (data.id) await adminService.updateTeacher(data.id, data);
    else await adminService.createTeacher({ ...data, password: data.password! });
    onRefresh();
    toast.success("Saved successfully");
  };

  const handleDelete = (id: number) => setConfirmDeleteId(id);

  const confirmDelete = async () => {
    if (confirmDeleteId === null) return;
    await adminService.deleteTeacher(confirmDeleteId);
    onRefresh();
    toast.success("Deleted");
  };

  return (
    <div className="space-y-4">
      <UserStatsBar teachers={filters.filtered} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("admin_search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl font-sans"
          />
        </div>
        <UserFilterDropdown
          open={filterOpen}
          setOpen={setFilterOpen}
          statusFilter={filters.statusFilter}
          planFilter={filters.planFilter}
          schoolFilter={filters.schoolFilter}
          expiryFilter={filters.expiryFilter}
          setStatusFilter={filters.setStatusFilter}
          setPlanFilter={filters.setPlanFilter}
          setSchoolFilter={filters.setSchoolFilter}
          setExpiryFilter={filters.setExpiryFilter}
          activeFilterCount={filters.activeFilterCount}
        />
        <ExportMenu
          onCSV={() => exportTeachersCSV(teachers, t)}
          onPDF={() => exportTeachersDOCX(teachers, t)}
        />
        <Button className="gap-2 rounded-xl font-sans" onClick={() => setModal({ isOpen: true })}>
          <Plus className="w-4 h-4" /> {t("admin_add_teacher")}
        </Button>
      </div>

      <UserBulkActionsBar
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        onRefresh={onRefresh}
      />

      <UserTable
        filtered={filters.filtered}
        isLoading={isLoading}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        toggleBlock={toggleBlock}
        onImpersonate={onImpersonate}
        onPromote={onPromote}
        onDemote={onDemote}
        onEdit={(data) => setModal({ isOpen: true, data })}
        onResetPassword={setShowResetModal}
        onDelete={handleDelete}
      />

      <ResetPasswordModal
        teacherId={showResetModal}
        teachers={teachers}
        onClose={() => setShowResetModal(null)}
      />

      <TeacherModal
        isOpen={modal.isOpen}
        onClose={() => setModal({ isOpen: false })}
        onSave={handleSave}
        initialData={modal.data}
      />

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Удалить учителя?"
        message="Учитель будет удалён безвозвратно. Все его данные и классы будут потеряны."
        confirmLabel="Удалить"
        onConfirm={confirmDelete}
        onClose={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};
