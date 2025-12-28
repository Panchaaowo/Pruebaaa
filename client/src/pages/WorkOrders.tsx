import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useWorkOrders, useCreateWorkOrder, useUpdateWorkOrder } from "@/hooks/use-work-orders";
import { useProducts } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Package, Mail, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkOrderSchema, type InsertWorkOrder, type WorkOrder } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center h-32">Cargando...</TableCell></TableRow>
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
  { id: "cambioAceite", label: "Cambio de Aceite", price: true },
  { id: "otros", label: "Otros", price: true },
];

function CreateWorkOrderDialog() {
  const [open, setOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [servicePrices, setServicePrices] = useState<{[key: string]: number}>({});
  const { mutate: createWorkOrder, isPending } = useCreateWorkOrder();
  const { data: products } = useProducts();
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

  // Calcular total automáticamente
  const calculateTotal = () => {
    const servicesTotal = Object.values(servicePrices).reduce((sum, price) => sum + (price || 0), 0);
    return servicesTotal;
  };

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
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
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
                    <FormLabel>Realizado por (Mecánico)</FormLabel>
                    <FormControl><Input {...field} placeholder="Nombre del mecánico" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supervisor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Revisado por (Supervisor)</FormLabel>
                    <FormControl><Input {...field} placeholder="Nombre del supervisor" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Client Email - Opcional */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-sm text-blue-900">Correo del Cliente (Opcional)</h4>
                <Badge variant="secondary" className="text-xs">Servicio 2+</Badge>
              </div>
              <Input 
                type="email" 
                placeholder="cliente@ejemplo.com" 
                className="bg-white"
              />
              <p className="text-xs text-blue-700 mt-1">Para envío automático de la orden de servicio</p>
            </div>

            {/* Productos Usados - Descuento Automático */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h4 className="font-medium text-sm text-slate-700 uppercase tracking-wide">Productos Usados en el Servicio</h4>
                </div>
                <Badge variant="outline" className="text-xs">
                  Descuento automático de stock
                </Badge>
              </div>
              
              {selectedProducts.length === 0 ? (
                <Alert>
                  <Package className="h-4 w-4" />
                  <AlertDescription>
                    Selecciona los productos utilizados en este servicio. El stock se descontará automáticamente.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Package className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="font-medium text-sm">{product.partNumber}</p>
                          <p className="text-xs text-muted-foreground">{product.compatibleBrand} - Stock: {product.stock}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-700">
                          -1 unidad
                        </Badge>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedProducts(selectedProducts.filter(p => p.id !== product.id))}
                        >
                          Quitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Select onValueChange={(value) => {
                const product = products?.find(p => p.id === parseInt(value));
                if (product && !selectedProducts.find(p => p.id === product.id)) {
                  setSelectedProducts([...selectedProducts, product]);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="+ Agregar producto usado" />
                </SelectTrigger>
                <SelectContent>
                  {products?.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.partNumber} - {product.compatibleBrand} {product.compatibleModel} (Stock: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Services Checkboxes */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium text-sm text-slate-700 uppercase tracking-wide">Servicios y Trabajos Realizados</h4>
              <div className="space-y-2">
                {SERVICE_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <FormField
                      control={form.control}
                      name={`services.${option.id}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
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
                        className="w-32 text-right font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={servicePrices[option.id] || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setServicePrices(prev => ({...prev, [option.id]: value}));
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total and Signature */}
            <div className="space-y-4 border-t pt-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-700">TOTAL</span>
                  <Badge variant="outline" className="bg-green-500 text-white border-green-600">
                    <span className="text-xs">✨ Cálculo Automático</span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">$</span>
                  <div className="font-bold text-3xl text-green-600 w-48 text-right font-mono">
                    {calculateTotal().toLocaleString('es-CL')}
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="clientSignature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma del Cliente</FormLabel>
                    <FormControl><Input {...field} placeholder="Nombre y Apellido del cliente" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full btn-pill mt-4" disabled={isPending}>
              {isPending ? "Creando..." : "Crear Orden de Trabajo"}
            </Button>

            {/* Servicio 3 Features */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Button type="button" variant="outline" className="gap-2 border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700" disabled>
                <FileText className="h-4 w-4" />
                <span>Generar PDF</span>
                <Badge className="ml-auto bg-blue-600 text-white">Servicio 3</Badge>
              </Button>
              <Button type="button" variant="outline" className="gap-2 border-green-300 bg-green-50 hover:bg-green-100 text-green-700" disabled>
                <Mail className="h-4 w-4" />
                <span>Enviar Email</span>
                <Badge className="ml-auto bg-green-600 text-white">Servicio 3</Badge>
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
