import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from "@/hooks/use-work-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, CarFront, CheckCircle, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkOrderSchema, type InsertWorkOrder, type WorkOrder } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function WorkOrders() {
  const [search, setSearch] = useState("");
  const { data: workOrders, isLoading } = useWorkOrders(search);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Órdenes de Trabajo" 
        description="Seguimiento de reparaciones, asignación de mecánicos y entregas."
        action={<CreateWorkOrderDialog />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-industrial p-4 flex items-center gap-4 border-l-4 border-l-yellow-400">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase font-bold">Pendientes</p>
            <p className="text-2xl font-display font-bold">{workOrders?.filter(w => w.status === 'pending').length || 0}</p>
          </div>
        </div>
        <div className="card-industrial p-4 flex items-center gap-4 border-l-4 border-l-green-500">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase font-bold">Completadas</p>
            <p className="text-2xl font-display font-bold">{workOrders?.filter(w => w.status === 'completed').length || 0}</p>
          </div>
        </div>
        <div className="card-industrial p-4 flex items-center gap-4 border-l-4 border-l-blue-500">
          <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <CarFront className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground uppercase font-bold">Entregadas</p>
            <p className="text-2xl font-display font-bold">{workOrders?.filter(w => w.status === 'delivered').length || 0}</p>
          </div>
        </div>
      </div>

      <div className="card-industrial bg-white p-4">
        <div className="mb-4 relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por patente u OT..." 
            className="pl-9 rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OT #</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Mecánico</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center h-32">Cargando...</TableCell></TableRow>
            ) : workOrders?.map((wo) => (
              <WorkOrderRow key={wo.id} workOrder={wo} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function WorkOrderRow({ workOrder }: { workOrder: WorkOrder }) {
  const { mutate: updateStatus } = useUpdateWorkOrder();
  
  const handleStatusChange = (newStatus: string) => {
    updateStatus({ id: workOrder.id, status: newStatus });
  };

  return (
    <TableRow className="table-row-hover group">
      <TableCell className="font-mono font-bold text-slate-500">#{workOrder.otNumber}</TableCell>
      <TableCell>
        <div className="font-bold text-slate-900">{workOrder.patent}</div>
        <div className="text-xs text-muted-foreground">{workOrder.brand} {workOrder.model}</div>
      </TableCell>
      <TableCell>{workOrder.mechanic}</TableCell>
      <TableCell>{workOrder.supervisor}</TableCell>
      <TableCell><StatusBadge status={workOrder.status} /></TableCell>
      <TableCell className="text-right font-mono font-bold">${workOrder.total.toLocaleString()}</TableCell>
      <TableCell>
        <Select defaultValue={workOrder.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[110px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
    </TableRow>
  );
}

const SERVICE_OPTIONS = [
  { id: "pads", label: "Pastillas de Freno" },
  { id: "discs", label: "Discos de Freno" },
  { id: "fluid", label: "Líquido de Freno" },
  { id: "oil", label: "Cambio de Aceite" },
  { id: "filters", label: "Filtros" },
];

function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createWorkOrder, isPending } = useCreateWorkOrder();
  const { toast } = useToast();

  const form = useForm<InsertWorkOrder>({
    resolver: zodResolver(insertWorkOrderSchema),
    defaultValues: {
      patent: "",
      brand: "",
      model: "",
      km: 0,
      total: 0,
      mechanic: "",
      supervisor: "",
      clientSignature: "",
      status: "pending",
      services: {},
    },
  });

  const onSubmit = (data: InsertWorkOrder) => {
    createWorkOrder(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Orden de trabajo creada", className: "bg-green-600 text-white" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Orden
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
          <DialogDescription>Ingrese los datos del vehículo y los servicios a realizar.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            {/* Vehicle Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border">
              <FormField
                control={form.control}
                name="patent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patente</FormLabel>
                    <FormControl><Input {...field} className="uppercase font-mono" placeholder="AA123BB" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilometraje</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Staff */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mechanic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mecánico Asignado</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supervisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supervisor</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Services Checkboxes */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm text-slate-500 uppercase">Servicios Requeridos</h4>
              <div className="grid grid-cols-2 gap-4">
                {SERVICE_OPTIONS.map((option) => (
                  <FormField
                    key={option.id}
                    control={form.control}
                    name={`services.${option.id}` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-slate-700">
                          {option.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Total and Signature */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <FormField
                control={form.control}
                name="total"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Estimado ($)</FormLabel>
                    <FormControl>
                      <Input type="number" className="font-bold text-lg" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma Cliente (Texto)</FormLabel>
                    <FormControl><Input {...field} placeholder="Nombre y Apellido" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full btn-pill mt-4" disabled={isPending}>
              {isPending ? "Creando..." : "Crear Orden de Trabajo"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
