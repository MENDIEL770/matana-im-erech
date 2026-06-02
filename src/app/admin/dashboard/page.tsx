import { Card } from "@/components/ui/Card";
import {
  ShoppingCart, FileText, Users, TrendingUp,
  AlertTriangle, Clock, Package, DollarSign
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// TODO: replace with real DB queries
const stats = [
  { label: "הזמנות היום", value: "0", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "לידים היום", value: "0", icon: Users, color: "text-green-600", bg: "bg-green-50" },
  { label: "הכנסה היום", value: "₪0", icon: DollarSign, color: "text-amber-600", bg: "bg-amber-50" },
  { label: "רווח היום", value: "₪0", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
];

const alerts = [
  { type: "warning", message: "3 הצעות מחיר ממתינות לאישור", icon: Clock },
  { type: "warning", message: "2 מוצרים מתחת למלאי מינימום", icon: Package },
  { type: "info", message: "5 הזמנות בייצור", icon: ShoppingCart },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F2747]">לוח בקרה</h1>
        <p className="text-sm text-gray-500 mt-1">ברוך הבא! הנה סקירה של המצב הנוכחי.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-[#0F2747]">{value}</p>
              </div>
              <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center`}>
                <Icon size={20} className={color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      <Card padding="md">
        <h2 className="text-lg font-semibold text-[#0F2747] mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          התראות ומשימות
        </h2>
        <div className="space-y-3">
          {alerts.map(({ type, message, icon: Icon }) => (
            <div
              key={message}
              className={`flex items-center gap-3 p-3 rounded-sm text-sm ${
                type === "warning" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
              }`}
            >
              <Icon size={15} className="shrink-0" />
              {message}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">אין התראות פתוחות</p>
          )}
        </div>
      </Card>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-[#0F2747] mb-4">הזמנות אחרונות</h2>
          <div className="text-sm text-gray-500 text-center py-8">
            אין הזמנות עדיין
          </div>
        </Card>

        {/* Monthly chart placeholder */}
        <Card padding="md">
          <h2 className="text-lg font-semibold text-[#0F2747] mb-4">מכירות החודש</h2>
          <div className="text-sm text-gray-500 text-center py-8 flex flex-col items-center gap-2">
            <TrendingUp size={32} className="text-gray-300" />
            <span>הגרף יוצג כאן</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
