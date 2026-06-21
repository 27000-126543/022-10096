import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ChevronRight, Scale, Stethoscope, Building2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserRole = 'legal' | 'medical' | 'store';

interface RoleOption {
  value: UserRole;
  label: string;
  subLabel: string;
  icon: LucideIcon;
  description: string;
  color: string;
  defaultUser: { username: string; password: string; realName: string };
}

const roles: RoleOption[] = [
  {
    value: 'legal',
    label: '法务专员',
    subLabel: 'Legal Affairs',
    icon: Scale,
    description: '负责知情同意书模板的起草、修改，提交医务审核',
    color: 'from-blue-500 to-primary-500',
    defaultUser: { username: 'li_fa_wu', password: '123456', realName: '李晓明' },
  },
  {
    value: 'medical',
    label: '医务负责人',
    subLabel: 'Medical Director',
    icon: Stethoscope,
    description: '审核模板医学合规性，驳回或通过，管控门店发布',
    color: 'from-emerald-500 to-success-500',
    defaultUser: { username: 'wang_zhu_ren', password: '123456', realName: '王建国' },
  },
  {
    value: 'store',
    label: '门店院长',
    subLabel: 'Clinic Manager',
    icon: Building2,
    description: '查看已发布模板，使用模板签署，查询签署记录',
    color: 'from-amber-500 to-warning-500',
    defaultUser: { username: 'zhang_yuan_zhang', password: '123456', realName: '张美丽' },
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>('legal');
  const [username, setUsername] = useState('li_fa_wu');
  const [password, setPassword] = useState('123456');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: RoleOption) => {
    setSelectedRole(role.value);
    setUsername(role.defaultUser.username);
    setPassword(role.defaultUser.password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const selected = roles.find(r => r.value === selectedRole)!;

    await new Promise(res => setTimeout(res, 800));

    localStorage.setItem(
      'auth_user',
      JSON.stringify({
        username,
        realName: selected.defaultUser.realName,
        role: selected.value,
        roleLabel: selected.label,
        department:
          selected.value === 'legal'
            ? '法务部'
            : selected.value === 'medical'
            ? '医务管理部'
            : '华东区·上海旗舰店',
        loginTime: new Date().toISOString(),
      })
    );

    setLoading(false);
    navigate('/', { replace: true });
  };

  const currentRole = roles.find(r => r.value === selectedRole)!;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.07]">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative z-10 w-full max-w-[1100px] bg-white rounded-lg shadow-2xl overflow-hidden flex animate-fade-in">
        <div className="hidden lg:flex flex-col justify-between w-[460px] bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded bg-white/15 backdrop-blur flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-xl font-serif font-semibold tracking-wide">医美合规管理系统</div>
                <div className="text-xs text-primary-300 tracking-widest">MEDICAL COMPLIANCE PLATFORM</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl font-serif font-semibold leading-snug">
              术前知情同意<br />
              <span className="text-primary-300">全生命周期管控</span>
            </h2>
            <p className="text-primary-200 text-sm leading-relaxed max-w-sm">
              统一模板管理 · 分级审核流程 · 门店智能发布<br />
              签署全程留痕 · 风险数据洞察 · 客诉快速举证
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {[
                { num: '10+', label: '标准模板' },
                { num: '29', label: '覆盖门店' },
                { num: '8,500+', label: '月签署量' },
                { num: '3.8%', label: '低补签率' },
              ].map((item, i) => (
                <div key={i} className="bg-white/8 backdrop-blur rounded p-3 border border-white/10">
                  <div className="text-2xl font-mono font-semibold text-white">{item.num}</div>
                  <div className="text-[11px] text-primary-300 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-xs text-primary-400">
            © 2026 连锁医美集团 · 法务部 & 医务部 联合监制
          </div>
        </div>

        <div className="flex-1 p-10 lg:p-14">
          <div className="max-w-md mx-auto w-full">
            <div className="lg:hidden flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-600" strokeWidth={2} />
              </div>
              <div>
                <div className="text-lg font-serif font-semibold text-primary-800">医美合规管理系统</div>
              </div>
            </div>

            <h1 className="text-2xl font-serif font-semibold text-neutral-900 mb-2">账号登录</h1>
            <p className="text-sm text-neutral-500 mb-8">请选择您的身份后，使用分配的账号登录系统</p>

            <div className="mb-6">
              <label className="block text-xs font-medium text-neutral-600 mb-3 tracking-wide uppercase">选择身份</label>
              <div className="space-y-2.5">
                {roles.map(role => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={cn(
                        'w-full text-left p-3.5 rounded border-2 transition-all relative overflow-hidden group',
                        isSelected
                          ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                          : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'
                      )}
                    >
                      {isSelected && (
                        <div className={cn('absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b', role.color)} />
                      )}
                      <div className="flex items-start gap-3 pl-1">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all',
                          isSelected
                            ? `bg-gradient-to-br ${role.color} text-white shadow-md`
                            : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200'
                        )}>
                          <Icon className="w-5 h-5" strokeWidth={1.8} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={cn('font-medium', isSelected ? 'text-primary-800' : 'text-neutral-800')}>
                              {role.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 tracking-wider">{role.subLabel}</span>
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                            {role.description}
                          </div>
                        </div>
                        {isSelected && (
                          <ChevronRight className="w-4 h-4 text-primary-500 shrink-0 mt-1" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-2">账号</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.8} />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 text-sm border border-neutral-200 rounded focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-neutral-50/50 focus:bg-white"
                    placeholder="请输入登录账号"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" strokeWidth={1.8} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 text-sm border border-neutral-200 rounded focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all bg-neutral-50/50 focus:bg-white"
                    placeholder="请输入登录密码"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  记住登录身份
                </label>
                <a href="#" className="text-xs text-primary-600 hover:text-primary-700 hover:underline">
                  忘记密码？
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full h-11.5 mt-2 text-sm font-medium text-white rounded transition-all relative overflow-hidden group',
                  'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600',
                  'shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30',
                  'active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2'
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    登录中...
                  </>
                ) : (
                  <>
                    以{currentRole.label}身份登录
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-neutral-100">
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded">
                <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.8} />
                <div className="text-[11px] text-amber-800 leading-relaxed">
                  <strong className="font-medium">演示提示：</strong>系统已预置3个角色账号，密码均为 <code className="bg-amber-100 px-1 rounded text-amber-900">123456</code>，选择身份后自动填充。所有操作均为本地模拟演示。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
