import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertPurchase } from "@shared/routes-client";

export function usePurchases() {
  return useQuery({
    queryKey: [api.purchases.list.path],
    queryFn: async () => {
      const res = await fetch(api.purchases.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch purchases");
      return api.purchases.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertPurchase) => {
      const res = await fetch(api.purchases.create.path, {
        method: api.purchases.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create purchase");
      return api.purchases.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.purchases.list.path] }),
  });
}
