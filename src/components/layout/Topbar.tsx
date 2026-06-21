import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ChevronRight,
  Bell,
  ChevronDown,
  User,
  ShieldHalf,
  UserCheck,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  '/': { label: '首页看板' },
  '/templates': { label: '模板库', parent: '内容管理' },
  '/mapping': { label: '项目映射', parent: '内容管理' },
  '/review': { label: '版本审核', parent: '审核流程' },
  '/publish': { label: '门店发布', parent: '运营管理' },
  '/signature': { label: '签署追踪', parent: '签署管理' },
  '/risk': { label: '风险统计', parent: '风险管理' },
};

const roleOptions = [
  { value: 'admin', label: '合规管理员', icon: ShieldHalf },
  { value: 'auditor', label: '审核员', icon: UserCheck },
  { value: 'operator', label: '运营人员', icon: Building2 },
];

export function Topbar() {
  const location = useLocation();
  const [roleOpen, setRoleOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(roleOptions[0]);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPath = breadcrumbMap[location.pathname] || { label: '未知页面' };
  const CurrentRoleIcon = currentRole.icon;

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 sticky top-0 z-30">
      <nav className="flex items-center text-sm">
        <Link
          to="/"
          className="text-neutral-500 hover:text-primary-600 transition-colors"
        >
          首页
        </Link>
        {currentPath.parent && (
          <>
            <ChevronRight size={14} className="mx-2 text-neutral-400" />
            <span className="text-neutral-500">{currentPath.parent}</span>
          </>
        )}
        <ChevronRight size={14} className="mx-2 text-neutral-400" />
        <span className="text-neutral-800 font-medium">{currentPath.label}</span>
      </nav>

      <div className="ml-auto flex items-center space-x-2">
        <button className="relative w-10 h-10 rounded hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <Bell size={19} className="text-neutral-600" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="w-px h-6 bg-neutral-200 mx-2" />

        <div ref={roleRef} className="relative">
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className={cn(
              'flex items-center px-3 py-1.5 rounded border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all',
              roleOpen && 'border-primary-300 bg-primary-50/30'
            )}
          >
            <CurrentRoleIcon size={15} className="text-primary-600" />
            <span className="ml-2 text-sm text-neutral-700">{currentRole.label}</span>
            <ChevronDown
              size={14}
              className={cn(
                'ml-1.5 text-neutral-500 transition-transform',
                roleOpen && 'rotate-180'
              )}
            />
          </button>
          {roleOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-neutral-200 rounded shadow-paper py-1 animate-fade-in">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isActive = role.value === currentRole.value;
                return (
                  <button
                    key={role.value}
                    onClick={() => {
                      setCurrentRole(role);
                      setRoleOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    <Icon size={15} className={isActive ? 'text-primary-600' : 'text-neutral-500'} />
                    <span className="ml-2.5">{role.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-neutral-200 mx-2" />

        <button className="flex items-center px-2 py-1.5 rounded hover:bg-neutral-100 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center ring-1 ring-primary-200">
            <User size={16} className="text-primary-700" />
          </div>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
