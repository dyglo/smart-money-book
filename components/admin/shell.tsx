"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BookOpen,
  LayoutDashboard,
  PenLine,
  Files,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react";
import { useWorkspace } from "../workspace-provider";
const navigation = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/editor", label: "Editor", icon: PenLine },
  { href: "/admin/resources", label: "Resources", icon: Files },
];
export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { session, signOut, ready, error } = useWorkspace();
  const router = useRouter();
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setCollapsed(localStorage.getItem("smb-sidebar-collapsed") === "true");
  }, []);
  useEffect(() => {
    if (ready && !session) router.replace("/admin/login");
  }, [ready, session, router]);
  if (!ready || !session)
    return (
      <main className="admin-loading" role="status">
        Opening your workspace…
      </main>
    );
  return (
    <div className={`admin-workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
      <button
        className={`sidebar-scrim ${mobile ? "visible" : ""}`}
        aria-label="Close navigation"
        onClick={() => setMobile(false)}
      />
      <aside
        className={`admin-sidebar ${mobile ? "mobile-open" : ""}`}
        aria-label="Admin navigation"
      >
        <Link
          href="/admin/dashboard"
          className="admin-brand"
          title="Smart Money Book"
        >
          <span>
            <BookOpen size={22} />
          </span>
          <b>
            Smart Money<small>BOOK / ADMIN</small>
          </b>
        </Link>
        <button
          className="sidebar-collapse"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          onClick={() => {
            setCollapsed(!collapsed);
            localStorage.setItem("smb-sidebar-collapsed", String(!collapsed));
          }}
        >
          {collapsed ? (
            <PanelLeftOpen size={19} />
          ) : (
            <PanelLeftClose size={19} />
          )}
          <span>Collapse sidebar</span>
        </button>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              aria-current={path === item.href ? "page" : undefined}
              onClick={() => setMobile(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/" title="View website">
            <ArrowUpRight size={20} />
            <span>View website</span>
          </Link>
          <button
            title="Sign out"
            aria-label="Sign out"
            onClick={async () => {
              try { await signOut(); router.replace("/admin/login"); }
              catch (e) { window.alert(e instanceof Error ? e.message : "Unable to sign out."); }
            }}
          >
            <LogOut size={20} />
            <span>Sign out</span>
          </button>
          <div className="admin-profile">
            <span>{session.name[0].toUpperCase()}</span>
            <div>
              <strong>{session.name}</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <button
              className="mobile-sidebar-toggle"
              aria-label={mobile ? "Close navigation" : "Open navigation"}
              onClick={() => setMobile(!mobile)}
            >
              {mobile ? <X size={22} /> : <Menu size={22} />}
            </button>
            <span className="admin-breadcrumb">
              Workspace <span>/</span> <strong>{title}</strong>
            </span>
          </div>
          <span className="demo-badge">Admin workspace</span>
        </header>
        <div className="admin-device-note">
          <span>Content is saved to your library.</span>
          <span>Published content is available to everyone.</span>
        </div>
        {error && (
          <p role="alert" className="admin-error">
            {error}
          </p>
        )}
        <main id="main" className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
