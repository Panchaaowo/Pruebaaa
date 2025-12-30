import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertWorkOrder } from "@shared/routes-client";

export function useWorkOrders(search?: string) {
  return useQuery({
    queryKey: [api.workOrders.list.path, search],
    queryFn: async () => {
      const url = buildUrl(api.workOrders.list.path);
      const res = await fetch(search ? `${url}?search=${encodeURIComponent(search)}` : url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch work orders");
      return api.workOrders.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWorkOrder) => {
      const res = await fetch(api.workOrders.create.path, {
        method: api.workOrders.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create work order");
      return api.workOrders.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workOrders.list.path] }),
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertWorkOrder>) => {
      const url = buildUrl(api.workOrders.update.path, { id });
      const res = await fetch(url, {
        method: api.workOrders.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update work order");
      return api.workOrders.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workOrders.list.path] }),
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.workOrders.delete.path, { id });
      const res = await fetch(url, { method: api.workOrders.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete work order");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.workOrders.list.path] }),
  });
}
