import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  FileCheck,
  AlertTriangle,
  Clock,
  Eye,
  Plus,
  ClipboardCheck,
  Send,
  ListTodo,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const signatureTrendData = [
  { date: '06-09', count: 156 },
  { date: '06-10', count: 178 },
  { date: '06-11', count: 142 },
  { date: '06-12', count: 198 },
  { date: '06-13', count: 210 },
  { date: '06-14', count: 185 },
  { date: '06-15', count: 225 },
  { date: '06-16', count: 268 },
  { date: '06-17', count: 245 },
  { date: '06-18', count: 289 },
  { date: '06-19', count: 312 },
  { date: '06-20', count: 295 },
  { date: '06-21', count: 335 },
  { date: '06-22', count: 358 },
];

const categoryData = [
  { name: '注射类', value: 38, color: '#7B4B94' },
  { name: '皮肤类', value: 27, color: '#2D7DD2' },
  { name: '整形类', value: 22, color: '#2E7D5B' },
  { name: '抗衰类', value: 13, color: '#B8860B' },
];

const pendingReviews = [
  { id: 1, title: '玻尿酸注射知情同意书 V2.1.0', submitter: '李晓明', time: '2小时前' },
  { id: 2, title: '双眼皮手术知情同意书 V1.3.2', submitter: '王慧敏', time: '4小时前' },
  { id: 3, title: '热玛吉治疗知情同意书 V1.0.5', submitter: '张建国', time: '昨天' },
];

const pendingPublishes = [
  { id: 1, title: '肉毒素注射知情同意书 V3.0.0', approver: '赵主任', time: '1小时前' },
  { id: 2, title: '光子嫩肤知情同意书 V2.2.1', approver: '钱院长', time: '3小时前' },
];

const pendingComplaints = [
  { id: 1, customer: '王**', project: '线雕提升', content: '术后淤青严重', time: '30分钟前' },
  { id: 2, customer: '陈**', project: '水光针', content: '对效果不满意', time: '2小时前' },
];

const quickActions = [
  { icon: Plus, label: '新建模板', color: 'bg-primary-500 hover:bg-primary-600' },
  { icon: ClipboardCheck, label: '进入审核', color: 'bg-warning-500 hover:bg-warning-600' },
  { icon: Send, label: '发布模板', color: 'bg-success-500 hover:bg-success-600' },
];

interface KpiCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  iconBg: string;
  iconColor: string;
}

function KpiCard({ icon: Icon, label, value, trend, iconBg, iconColor }: KpiCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-paper p-5 hover:shadow-paper-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-neutral-500 mb-2">{label}</p>
          <p className="text-2xl font-semibold text-neutral-900">{value}</p>
          {trend && (
            <p className={cn(
              'text-xs mt-2 flex items-center',
              trend.positive ? 'text-success-600' : 'text-danger-600'
            )}>
              <ChevronRight className={cn(
                'w-3 h-3 -rotate-90 mr-0.5',
                trend.positive ? '' : 'rotate-90'
              )} />
              {trend.value} 较上期
            </p>
          )}
        </div>
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
}

interface TodoItemProps {
  title: string;
  subtitle: string;
  meta: string;
  time: string;
  badge?: { text: string; color: string };
}

function TodoItem({ title, subtitle, meta, time, badge }: TodoItemProps) {
  return (
    <div className="flex items-start py-3 px-4 hover:bg-neutral-50 transition-colors cursor-pointer border-b border-neutral-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-neutral-800 truncate">{title}</p>
          {badge && (
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded-sm flex-shrink-0',
              badge.color
            )}>
              {badge.text}
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mb-1">{subtitle}</p>
        <p className="text-xs text-neutral-400">{meta}</p>
      </div>
      <span className="text-xs text-neutral-400 ml-4 flex-shrink-0">{time}</span>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">运营看板</h1>
          <p className="text-sm text-neutral-500 mt-1">实时监控签署数据与待办事项</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <Clock className="w-4 h-4" />
          数据更新时间：2026-06-22 14:30
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <KpiCard
          icon={FileCheck}
          label="近30天签署总数"
          value="8,526"
          trend={{ value: '12.5%', positive: true }}
          iconBg="bg-primary-50"
          iconColor="text-primary-500"
        />
        <KpiCard
          icon={AlertTriangle}
          label="补签率"
          value="3.8%"
          trend={{ value: '0.6%', positive: false }}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
        />
        <KpiCard
          icon={Eye}
          label="平均阅读时长"
          value="186 秒"
          trend={{ value: '8.2%', positive: true }}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <KpiCard
          icon={Bell}
          label="待审核数"
          value="23"
          trend={{ value: '4', positive: false }}
          iconBg="bg-danger-50"
          iconColor="text-danger-600"
        />
      </div>

      <div className="grid grid-cols-5 gap-5">
        <div className="col-span-3 bg-white rounded-lg shadow-paper p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-neutral-800">签署趋势</h2>
              <p className="text-xs text-neutral-500 mt-0.5">近14天签署量变化</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-neutral-500">
              <span className="w-3 h-0.5 bg-primary-500 rounded" />
              签署数量
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signatureTrendData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: '#757575' }}
                  axisLine={{ stroke: '#E0E0E0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#757575' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  labelStyle={{ color: '#424242', fontWeight: 500 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="签署量"
                  stroke="#1E3A5F"
                  strokeWidth={2.5}
                  dot={{ fill: '#1E3A5F', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, fill: '#1E3A5F', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg shadow-paper p-5">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-neutral-800">各分类签署占比</h2>
            <p className="text-xs text-neutral-500 mt-0.5">按项目分类统计</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, '占比']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E0E0E0',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-neutral-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-lg shadow-paper overflow-hidden">
          <div className="flex border-b border-neutral-100">
            {[
              { key: 'review', label: '待审核', count: pendingReviews.length, badgeColor: 'bg-warning-500' },
              { key: 'publish', label: '待发布', count: pendingPublishes.length, badgeColor: 'bg-primary-500' },
              { key: 'complaint', label: '待处理客诉', count: pendingComplaints.length, badgeColor: 'bg-danger-500' },
            ].map((tab, idx) => (
              <button
                key={tab.key}
                className={cn(
                  'flex-1 px-5 py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  idx === 0
                    ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/30'
                    : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                )}
              >
                <ListTodo className="w-4 h-4" />
                {tab.label}
                <span className={cn(
                  'text-[10px] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                  tab.badgeColor
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {pendingReviews.map((item) => (
              <TodoItem
                key={item.id}
                title={item.title}
                subtitle={`提交人：${item.submitter}`}
                meta="等待法务审核"
                time={item.time}
                badge={{ text: '紧急', color: 'bg-danger-50 text-danger-600' }}
              />
            ))}
            {pendingPublishes.map((item) => (
              <TodoItem
                key={item.id + 100}
                title={item.title}
                subtitle={`审批人：${item.approver}`}
                meta="审批通过，等待发布"
                time={item.time}
              />
            ))}
            {pendingComplaints.map((item) => (
              <TodoItem
                key={item.id + 200}
                title={`${item.customer} · ${item.project}`}
                subtitle={item.content}
                meta="客诉处理中"
                time={item.time}
                badge={{ text: '客诉', color: 'bg-warning-50 text-warning-700' }}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-paper p-5">
          <h2 className="text-base font-semibold text-neutral-800 mb-5">快捷入口</h2>
          <div className="space-y-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-white font-medium transition-all transform hover:-translate-y-0.5 hover:shadow-lg',
                    action.color
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm">{action.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-80" />
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-5 border-t border-neutral-100">
            <h3 className="text-sm font-medium text-neutral-700 mb-4">近期公告</h3>
            <div className="space-y-3">
              <div className="p-3 bg-primary-50 rounded-md border-l-2 border-primary-500">
                <p className="text-xs font-medium text-primary-700">系统升级通知</p>
                <p className="text-xs text-primary-600 mt-1">06-25 凌晨2点进行系统维护</p>
              </div>
              <div className="p-3 bg-success-50 rounded-md border-l-2 border-success-500">
                <p className="text-xs font-medium text-success-700">新规提醒</p>
                <p className="text-xs text-success-600 mt-1">整形类模板新增必填风险提示</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
