import React, { useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderOpen,
  Clock,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Toaster, toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.info("Vous êtes déconnecté.");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Stagiaires", path: "/stagiaires", icon: <Users size={20} /> },
    { name: "Formations", path: "/formations", icon: <BookOpen size={20} /> },
    { name: "Dossiers", path: "/dossiers", icon: <FolderOpen size={20} /> },
    { name: "Absences", path: "/absences", icon: <Clock size={20} /> },
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return {
          title: "Vue d'ensemble",
          subtitle: "Gestion des dossiers et suivi",
        };
      case "/stagiaires":
        return { title: "Stagiaires", subtitle: "Annuaire et suivi" };
      case "/formations":
        return { title: "Formations", subtitle: "Gestion des cursus" };
      case "/dossiers":
        return { title: "Dossiers", subtitle: "Gestion documentaire" };
      case "/absences":
        return { title: "Absences", subtitle: "Suivi de l'assiduité" };
      default:
        return { title: "Espace Admin", subtitle: "MNS Metz Numeric School" };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="flex h-[100dvh] w-full bg-[#F5F5F5] font-sans overflow-hidden text-[#1A1F3D]">
      <Toaster position="top-right" richColors />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-[#1A1F3D] h-full flex flex-col shrink-0
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}
      >
        <div className="w-full h-[70px] lg:h-[80px] flex items-center justify-between px-6 lg:justify-center border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MNS" className="h-8 lg:h-10 w-auto" />
            <span className="text-sm font-normal text-gray-400 hidden lg:inline">
              Admin
            </span>
          </div>
          <button
            className="lg:hidden p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
            Menu Principal
          </p>
          <nav className="flex flex-col gap-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-lg text-base lg:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#FF6600] text-white shadow-sm"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Header */}
        <header className="h-[70px] lg:h-[80px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="truncate">
              <h1 className="text-lg lg:text-2xl font-bold text-[#1A1F3D] truncate">
                {title}
              </h1>
              <p className="text-xs lg:text-sm text-gray-500 hidden sm:block truncate">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-6 shrink-0">
            <div className="hidden md:flex items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              <span className="text-sm font-medium text-gray-600">
                Session active
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-gray-400 hover:text-[#1A1F3D] transition-colors rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <Bell size={20} className="lg:w-[22px] lg:h-[22px]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF6600] rounded-full border-2 border-white box-content"></span>
              </button>

              {isNotificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationsOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                      <h3 className="font-bold text-[#1A1F3D]">
                        Notifications
                      </h3>
                      <button className="text-xs text-[#FF6600] font-semibold hover:underline">
                        Tout marquer comme lu
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto">
                      <div className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start cursor-pointer group">
                        <div className="p-1.5 bg-orange-50 text-[#FF6600] rounded-full mt-0.5 shrink-0">
                          <AlertCircle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1F3D] leading-tight">
                            Dossier en attente
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Alan Turing n'a pas encore fourni sa convention de
                            stage.
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            Il y a 10 min
                          </p>
                        </div>
                      </div>

                      <div className="p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start cursor-pointer group">
                        <div className="p-1.5 bg-red-50 text-red-500 rounded-full mt-0.5 shrink-0">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1F3D] leading-tight">
                            Nouvelle absence signalée
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Marie Curie est signalée absente aujourd'hui
                            (Matin).
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            Il y a 1 heure
                          </p>
                        </div>
                      </div>

                      <div className="p-3 hover:bg-gray-50 transition-colors flex gap-3 items-start cursor-pointer group">
                        <div className="p-1.5 bg-green-50 text-green-600 rounded-full mt-0.5 shrink-0">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1F3D] leading-tight">
                            Dossier validé
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Le dossier de Grace Hopper a été vérifié et validé.
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            Hier
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 border-t border-gray-100 text-center bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <span className="text-sm font-semibold text-[#1A1F3D]">
                        Voir toutes les notifications
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 lg:gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#1A1F3D] leading-none">
                    {user?.nom ?? "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-[100px]">
                    {user?.email}
                  </p>
                </div>
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1579171817110-e4aa2d543305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWlsaW5nJTIwcHJvZmVzc2lvbmFsJTIwcGVyc29uJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzczMzA1MjMxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="User Avatar"
                  className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover shadow-sm border-2 border-white ring-1 ring-gray-200 shrink-0"
                />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 sm:hidden border-b border-gray-100 mb-1.5">
                      <p className="text-sm font-bold text-[#1A1F3D]">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">Administrateur</p>
                    </div>
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1A1F3D] rounded-md transition-colors font-medium text-left"
                    >
                      <User size={16} /> Mon Profil
                    </button>
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#1A1F3D] rounded-md transition-colors font-medium text-left"
                    >
                      <Settings size={16} /> Paramètres
                    </button>
                    <div className="h-px bg-gray-100 my-1.5" />
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-bold text-left"
                    >
                      <LogOut size={16} /> Déconnexion
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
