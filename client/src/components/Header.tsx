import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Truck, Bell, ChevronDown, User, Settings, LogOut, Wifi, WifiOff, Home, Package, FileText, Search, Activity, DollarSign, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { isConnected } = useWebSocket();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { 
        method: "POST",
        credentials: "include"
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/";
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || "";
    const last = lastName?.charAt(0)?.toUpperCase() || "";
    return first + last || "U";
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <div>
                <h1 className="text-xl font-semibold"><span className="text-blue-600">Koemar</span> <span className="text-gray-900">Shipping</span></h1>
              </div>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex space-x-8">
            <Link href="/">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
              }`}>
                <Home className="mr-2" size={16} />
                Begin
              </a>
            </Link>
            
            <Link href="/pakket-aanmelden">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/pakket-aanmelden") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
              }`}>
                <Package className="mr-2" size={16} />
                Pakket Aanmelden
              </a>
            </Link>
            
            <Link href="/pakket-opzoeken">
              <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive("/pakket-opzoeken") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
              }`}>
                <Search className="mr-2" size={16} />
                Tracking
              </a>
            </Link>
            
            {isAdmin && (
              <>
                <Link href="/manifest">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/manifest") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}>
                    <FileText className="mr-2" size={16} />
                    Manifest
                  </a>
                </Link>
                
                <Link href="/gebruikersbeheer">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/gebruikersbeheer") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}>
                    <User className="mr-2" size={16} />
                    Gebruikersbeheer
                  </a>
                </Link>
                
                <Link href="/logs">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/logs") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}>
                    <Activity className="mr-2" size={16} />
                    Logs
                  </a>
                </Link>

                <Link href="/prijzen-beheer">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/prijzen-beheer") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}>
                    <DollarSign className="mr-2" size={16} />
                    Prijzen
                  </a>
                </Link>

                <Link href="/afvaartschema">
                  <a className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive("/afvaartschema") ? "bg-primary text-white" : "text-gray-700 hover:text-primary hover:bg-gray-100"
                  }`}>
                    <Ship className="mr-2" size={16} />
                    Schema
                  </a>
                </Link>
              </>
            )}
          </nav>


          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="text-green-500" size={16} />
              ) : (
                <WifiOff className="text-red-500" size={16} />
              )}
              <span className="text-xs text-gray-500">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2" data-testid="button-notifications">
              <Bell className="text-gray-400 hover:text-gray-600" size={20} />
              <span className="absolute top-1 right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 p-2" data-testid="button-user-menu">
                  <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium" data-testid="text-user-initials">
                      {getInitials(user?.firstName || undefined, user?.lastName || undefined)}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500" data-testid="text-user-role">
                      Logistiek Manager
                    </p>
                  </div>
                  <ChevronDown className="text-gray-400" size={16} />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="link-profile">
                  <User className="mr-2 h-4 w-4" />
                  Profiel
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="link-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Instellingen
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

    </header>
  );
}
