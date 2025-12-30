import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useCreateWorkOrder, useUpdateWorkOrder } from "@/hooks/use-work-orders"; // Quitamos useWorkOrders
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Package, Mail, FileText, Pencil, Trash2, Filter, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkOrderSchema, type InsertWorkOrder, type WorkOrder } from "@shared/routes-client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

// 1. DATOS MOCKEADOS
const MOCK_WORK_ORDERS = [
  { id: 1, otNumber: 1054, patent: "BB-CL-12", brand: "Toyota", model: "Yaris", mechanic: "Juan Pérez", supervisor: "Roberto A.", status: "completed", total: 125000, createdAt: "2023-12-01" },
  { id: 2, otNumber: 1055, patent: "LL-KK-55", brand: "Mitsubishi", model: "L200", mechanic: "Pedro González", supervisor: "Roberto A.", status: "completed", total: 450000, createdAt: "2024-02-15" },
  { id: 3, otNumber: 1056, patent: "GH-HJ-12", brand: "Hyundai", model: "Accent", mechanic: "Juan Pérez", supervisor: "Roberto A.", status: "working", total: 85000, createdAt: "2024-04-20" },
  { id: 4, otNumber: 1057, patent: "JK-LM-34", brand: "Kia", model: "Rio 4", mechanic: "Lucas M.", supervisor: "Roberto A.", status: "pending", total: 65000, createdAt: "2024-04-21" },
  { id: 5, otNumber: 1058, patent: "RR-SS-11", brand: "Chevrolet", model: "Silverado", mechanic: "Pedro González", supervisor: "Roberto A.", status: "completed", total: 280000, createdAt: "2024-03-10" },
  { id: 6, otNumber: 1059, patent: "PP-RT-99", brand: "Nissan", model: "Kicks", mechanic: "Juan Pérez", supervisor: "Roberto A.", status: "completed", total: 95000, createdAt: "2023-11-20" },
  { id: 7, otNumber: 1060, patent: "DD-FF-88", brand: "Suzuki", model: "Swift", mechanic: "Lucas M.", supervisor: "Roberto A.", status: "completed", total: 65000, createdAt: "2024-04-18" },
  { id: 8, otNumber: 1061, patent: "AA-BB-11", brand: "Citroën", model: "C3", mechanic: "Pedro González", supervisor: "Roberto A.", status: "working", total: 120000, createdAt: "2024-04-19" }, 
  { id: 9, otNumber: 1062, patent: "PP-ZZ-99", brand: "Mazda", model: "CX-5", mechanic: "Juan Pérez", supervisor: "Roberto A.", status: "completed", total: 180000, createdAt: "2024-01-05" },
  { id: 10, otNumber: 1063, patent: "XX-YY-00", brand: "Peugeot", model: "Partner", mechanic: "Lucas M.", supervisor: "Roberto A.", status: "pending", total: 95000, createdAt: "2024-04-22" },
];

function getWarrantyStatus(dateStr: string | Date, durationMonths: number) {
  if (!dateStr || !durationMonths) return { status: 'none', label: 'Sin garantía' };
  const startDate = new Date(dateStr);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'expired', label: 'Vencida', days: diffDays };
  const monthsLeft = Math.floor(diffDays / 30);
  const daysLeft = diffDays % 30;
  let label = "";
  if (monthsLeft > 0) label += `${monthsLeft} mes(es) `;
  if (daysLeft > 0) label += `${daysLeft} día(s)`;
  if (label === "") label = "Vence hoy";
  return { status: 'active', label: label, days: diffDays };
}

export default function WorkOrders() {
  const [search, setSearch] = useState("");
  const [warrantyFilter, setWarrantyFilter] = useState("all"); 
  
  // 2. USAR DATOS DIRECTOS
  const workOrders = MOCK_WORK_ORDERS; 

  const filteredOrders = workOrders.filter(wo => {
    const matchesSearch = wo.patent.toLowerCase().includes(search.toLowerCase()) || wo.otNumber.toString().includes(search);
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Órdenes de Trabajo" 
        description="Seguimiento de reparaciones, garantías y entregas."
        action={<CreateWorkOrderDialog />}
      />

      <div className="card-industrial bg-white p-4 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <Input 
            placeholder="    Buscar por patente u OT..." 
            className="pl-12 rounded-full bg-slate-50 border-slate-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ... (Se mantienen los Filtros iguales a la versión anterior) ... */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
             <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Vehículo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
             <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Mecánico" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
             <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Estado" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
             <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Garantía" /></SelectTrigger><SelectContent><SelectItem value="all">Todas</SelectItem></SelectContent></Select>
             <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Rango" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OT #</TableHead>
              <TableHead>Vehículo</TableHead>
              <TableHead>Mecánico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Garantía Restante</TableHead> 
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((wo) => (
              <WorkOrderRow key={wo.id} workOrder={wo} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function WorkOrderRow({ workOrder }: { workOrder: any }) { // Usamos any o definimos tipo para el mock
  // Usamos la fecha real del mock para calcular la garantía
  const warrantyInfo = getWarrantyStatus(workOrder.createdAt, 3); 

  const handleEdit = () => alert("Editar Orden #" + workOrder.otNumber);
  const handleDelete = () => confirm("¿Eliminar Orden #" + workOrder.otNumber + "?");

  return (
    <TableRow className="table-row-hover group">
      <TableCell className="font-mono font-bold text-slate-500">#{workOrder.otNumber}</TableCell>
      <TableCell>
        <div className="font-bold text-slate-900">{workOrder.patent}</div>
        <div className="text-xs text-muted-foreground">{workOrder.brand} {workOrder.model}</div>
      </TableCell>
      <TableCell>{workOrder.mechanic}</TableCell>
      <TableCell><StatusBadge status={workOrder.status} /></TableCell>
      
      <TableCell>
        <div className={cn(
          "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium border",
          warrantyInfo.status === 'active' 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-slate-100 text-slate-500 border-slate-200"
        )}>
          {warrantyInfo.status === 'active' ? <Clock className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
          <span>{warrantyInfo.label}</span>
        </div>
      </TableCell>

      <TableCell className="text-right font-mono font-bold">${workOrder.total.toLocaleString()}</TableCell>
      <TableCell>
        {/* BOTONES DE ACCIÓN (ESTILO INVENTARIO) */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={handleEdit} className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

const SERVICE_OPTIONS = [
  { id: "cambioPastillas", label: "Cambio de Pastillas", price: true },
  { id: "cambioBalatas", label: "Cambio de Balatas", price: true },
  { id: "cambioLiquido", label: "Cambio de Líquido", price: true },
  { id: "cambioGomas", label: "Cambio de Gomas", price: true },
  { id: "rectificado", label: "Rectificado", price: true },
  { id: "sangrado", label: "Sangrado", price: true },
  { id: "cambioPiola", label: "Cambio de Piola", price: true },
  { id: "revision", label: "Revisión", price: true },
  { id: "otros", label: "Otros", price: true, hasText: true },
];

function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [servicePrices, setServicePrices] = useState<{[key: string]: number}>({});
  
  // Estado para el texto de "Otros"
  const [otherDescription, setOtherDescription] = useState("");

  const { mutate: createWorkOrder, isPending } = useCreateWorkOrder();
  const { data: products } = useProducts();
  const { toast } = useToast();

  const form = useForm<InsertWorkOrder>({
    resolver: zodResolver(insertWorkOrderSchema),
    defaultValues: {
      patent: "", brand: "", model: "", km: 0, total: 0,
      mechanic: "", supervisor: "", clientSignature: "", status: "pending", services: {},
      // Aquí podrías agregar warrantyDuration al schema si lo actualizas en el backend
    },
  });

  const calculateTotal = () => {
    return Object.values(servicePrices).reduce((sum, price) => sum + (price || 0), 0);
  };

  const onSubmit = (data: InsertWorkOrder) => {
    // Aquí concatenaríamos la descripción de "otros" si es necesario
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
          <DialogDescription>Ingrese los datos del vehículo y los servicios.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            {/* ... (Se mantienen los campos de Vehículo y Staff iguales) ... */}
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
               <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="model" render={({ field }) => (<FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="km" render={({ field }) => (<FormItem><FormLabel>Kilometraje</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FormField control={form.control} name="mechanic" render={({ field }) => (<FormItem><FormLabel>Mecánico</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
               <FormField control={form.control} name="supervisor" render={({ field }) => (<FormItem><FormLabel>Supervisor</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>

            {/* NUEVO: Selector de Garantía */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-sm text-blue-900">Garantía del Trabajo</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <FormLabel className="text-xs">Duración</FormLabel>
                    <Select defaultValue="3">
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin Garantía</SelectItem>
                        <SelectItem value="1">1 Mes</SelectItem>
                        <SelectItem value="3">3 Meses (Estándar)</SelectItem>
                        <SelectItem value="6">6 Meses</SelectItem>
                        <SelectItem value="12">1 Año</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <FormLabel className="text-xs">Fecha Inicio</FormLabel>
                    <Input type="date" className="bg-white" defaultValue={new Date().toISOString().split('T')[0]} />
                 </div>
              </div>
            </div>

            {/* ... (Sección de Productos igual que antes) ... */}
            
            {/* Servicios y Opción OTROS con texto */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm text-slate-700 uppercase tracking-wide">Servicios</h4>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map((option) => (
                  <div key={option.id} className="flex flex-col p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FormField
                        control={form.control}
                        name={`services.${option.id}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="font-normal cursor-pointer text-slate-700 min-w-[200px]">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-slate-500 text-sm">$</span>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          className="w-32 text-right font-mono"
                          value={servicePrices[option.id] || ''}
                          onChange={(e) => setServicePrices(prev => ({...prev, [option.id]: parseInt(e.target.value) || 0}))}
                        />
                      </div>
                    </div>
                    
                    {/* Input extra si es "Otros" y está seleccionado */}
                    {option.id === "otros" && form.watch(`services.${option.id}` as any) && (
                      <div className="mt-3 pl-7 animate-in fade-in slide-in-from-top-1">
                        <Input 
                          placeholder="Describa el servicio adicional..." 
                          value={otherDescription}
                          onChange={(e) => setOtherDescription(e.target.value)}
                          className="bg-yellow-50 border-yellow-200 focus:bg-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total y Firma */}
            <div className="space-y-4 border-t pt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-700">TOTAL</span>
                <span className="text-2xl font-bold text-green-600">${calculateTotal().toLocaleString('es-CL')}</span>
              </div>
              
              <FormField
                control={form.control}
                name="clientSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma del Cliente (Nombre + RUT)</FormLabel>
                    <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Nombre Apellido - 12.345.678-9" />
                    </FormControl>
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