import { AdminDashboard } from "./AdminDashboard";

export const metadata = {
  title: "管理後台 · KC Space Admin",
  description: "個人品牌數位花園後台管理系統，維護關於我、專案成果、深度文章與全站設定。",
};

export default function AdminPage() {
  return (
    <div className="py-6">
      <AdminDashboard />
    </div>
  );
}

