import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Activity, User, Clock, Globe, Download, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface UserLogWithUser {
  id: string;
  userId: string | null;
  action: string;
  description: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
}

export default function Logs() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      toast({
        title: "Geen toegang",
        description: "U heeft geen rechten voor deze pagina",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, isAdmin, toast]);

  // Fetch logs
  const { data: logs, isLoading: logsLoading } = useQuery<UserLogWithUser[]>({
    queryKey: ["/api/logs"],
    retry: false,
  });

  // Clear logs mutation
  const clearLogsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logs", {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to clear logs");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Logs gewist",
        description: "Alle logs zijn succesvol verwijderd.",
      });
    },
    onError: () => {
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het wissen van de logs.",
        variant: "destructive",
      });
    },
  });

  const exportToExcel = () => {
    if (!logs || logs.length === 0) {
      toast({
        title: "Geen data",
        description: "Er zijn geen logs om te exporteren.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const csvHeaders = "Tijdstip,Gebruiker,Email,Actie,Beschrijving,IP Adres\n";
    const csvContent = logs.map(log => {
      const userName = log.user 
        ? (log.user.firstName && log.user.lastName 
          ? `${log.user.firstName} ${log.user.lastName}` 
          : log.user.email.split('@')[0])
        : 'Systeem';
      const userEmail = log.user ? log.user.email : '';
      const timestamp = new Date(log.createdAt).toLocaleString('nl-NL');
      
      return `"${timestamp}","${userName}","${userEmail}","${log.action}","${log.description.replace(/"/g, '""')}","${log.ipAddress || 'Onbekend'}"`;
    }).join('\n');

    const csvData = csvHeaders + csvContent;
    
    // Create and download file
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `koemar-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export gelukt",
      description: "Logs zijn geëxporteerd naar Excel bestand.",
    });
  };

  const clearLogs = () => {
    if (window.confirm('Weet je zeker dat je alle logs wilt wissen? Deze actie kan niet ongedaan worden gemaakt.')) {
      clearLogsMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'login':
        return <User className="h-4 w-4 text-green-500" />;
      case 'logout':
        return <User className="h-4 w-4 text-red-500" />;
      case 'create_user':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'delete_user':
        return <User className="h-4 w-4 text-red-600" />;
      case 'change_password':
        return <User className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-red-100 text-red-800';
      case 'create_user':
        return 'bg-blue-100 text-blue-800';
      case 'delete_user':
        return 'bg-red-100 text-red-800';
      case 'change_password':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Terug naar Dashboard</span>
            </button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Activiteiten Logboek</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={exportToExcel}
                className="flex items-center space-x-2"
                variant="outline"
                data-testid="button-export-logs"
              >
                <Download className="h-4 w-4" />
                <span>Exporteer naar Excel</span>
              </Button>
              <Button
                onClick={clearLogs}
                variant="destructive"
                className="flex items-center space-x-2"
                data-testid="button-clear-logs"
                disabled={clearLogsMutation.isPending}
              >
                <Trash2 className="h-4 w-4" />
                <span>Logs Wissen</span>
              </Button>
            </div>
          </div>
          <p className="text-gray-600">Overzicht van alle gebruikersactiviteiten en systeemgebeurtenissen</p>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Activiteiten Logboek</h3>
            <p className="text-sm text-gray-500 mt-1">Laatste 50 activiteiten</p>
          </div>
          
          <div className="overflow-x-auto">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : logs && logs.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tijdstip</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gebruiker</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschrijving</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Adres</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{new Date(log.createdAt).toLocaleString('nl-NL')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {log.user ? (
                          <div>
                            <div className="font-medium">
                              {log.user.firstName && log.user.lastName 
                                ? `${log.user.firstName} ${log.user.lastName}` 
                                : log.user.email.split('@')[0]}
                            </div>
                            <div className="text-xs text-gray-500">{log.user.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Systeem</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                        <div className="truncate" title={log.description}>
                          {log.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <span>{log.ipAddress || 'Onbekend'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Geen activiteiten</h3>
                <p className="mt-1 text-sm text-gray-500">Er zijn nog geen activiteiten gelogd.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}