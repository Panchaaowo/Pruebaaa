import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export interface User {
  id: number;
  rut: string;
  name: string;
  role: "mecanico" | "administrador";
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });
        
        if (!response.ok) {
          return null;
        }
        
        return response.json();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { rut: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al iniciar sesión");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["user"], data);
      setLocation("/inventory");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error al cerrar sesión");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(["user"], null);
      setLocation("/login");
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "administrador",
    isMechanic: user?.role === "mecanico" || user?.role === "administrador",
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
  };
}
