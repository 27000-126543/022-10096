import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  GitBranch,
  FileCheck2,
  Store,
  FileSignature,
  ShieldAlert,
  Scale,
  User,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '首页看板', icon: LayoutDashboard },
  { path: '/templates', label: '模板库', icon: Library },
  { path: '/mapping', label: '项目映射', icon: GitBranch },
  { path: '/review', label: '版本审核', icon: FileCheck2 },
  { path: '/publish', label: '门店发布', icon: Store },
  { path: '/signature', label: '签署追踪', icon: FileSignature },
  { path: '/legal-review', label: '法务复盘', icon: Scale },
  { path: '/risk', label: '风险统计', icon: ShieldAlert },
];

export function Sidebar() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-primary-800 text-white flex flex-col shadow-sidebar transition-all duration-300 z-40',
        expanded ? 'w-64' : 'w-20'
      )}
    >
      <div className="h-16 flex items-center px-5 border-b border-primary-700/50">
        <div className="w-9 h-9 rounded bg-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-lg font-bold font-serif">医</span>
        </div>
        {expanded && (
          <div className="ml-3 animate-slide-in">
            <h1 className="text-base font-semibold tracking-wide">医美合规系统</h1>
            <p className="text-[11px] text-primary-300 mt-0.5">Medical Compliance</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'relative flex items-center px-3 py-2.5 rounded transition-all duration-200 group',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-200 hover:bg-primary-700/60 hover:text-white'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary-400 rounded-r" />
                  )}
                  <Icon
                    size={20}
                    className={cn(
                      'flex-shrink-0 transition-transform duration-200',
                      isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'
                    )}
                  />
                  {expanded && (
                    <span className="ml-3 text-sm font-medium animate-slide-in">
                      {item.label}
                    </span>
                  )}
                  {expanded && isActive && (
                    <ChevronRight size={14} className="ml-auto text-primary-300" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-primary-700/50 p-3">
        <div
          className={cn(
            'flex items-center px-2 py-2.5 rounded hover:bg-primary-700/60 cursor-pointer transition-colors',
          )}
        >
          <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0 ring-2 ring-primary-500/50">
            <User size={18} />
          </div>
          {expanded && (
            <div className="ml-3 animate-slide-in min-w-0">
              <p className="text-sm font-medium truncate">张明远</p>
              <p className="text-[11px] text-primary-300 truncate">合规管理员</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
