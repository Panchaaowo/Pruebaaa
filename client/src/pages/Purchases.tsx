import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Plus, Pencil, Trash2, Search, Filter, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreatePurchase } from "@/hooks/use-purchases";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseSchema, type InsertPurchase } from "@shared/routes-client";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useProducts } from "@/hooks/use-products";

// 1. DATOS MOCKEADOS
const MOCK_PURCHASES = [
  { id: 1, date: "2024-04-15", supplier: "Frenos Chile S.A.", items: Array(12).fill(0), totalCost: 1250000 },
  { id: 2, date: "2024-04-10", supplier: "Importadora Indra", items: Array(45).fill(0), totalCost: 3500000 },
  { id: 3, date: "2024-04-01", supplier: "AutoPlanet", items: Array(5).fill(0), totalCost: 125000 },
  { id: 4, date: "2024-03-25", supplier: "Frenos San Francisco", items: Array(20).fill(0), totalCost: 890000 },
  { id: 5, date: "2024-03-15", supplier: "Würth Chile", items: Array(10).fill(0), totalCost: 450000 },
  { id: 6, date: "2024-03-01", supplier: "Frenos Chile S.A.", items: Array(8).fill(0), totalCost: 620000 },
  { id: 7, date: "2024-02-20", supplier: "Lubricantes Copec", items: Array(15).fill(0), totalCost: 380000 },
  { id: 8, date: "2024-02-10", supplier: "Importadora Indra", items: Array(30).fill(0), totalCost: 2100000 },
  { id: 9, date: "2024-01-30", supplier: "Auto Parts SA", items: Array(6).fill(0), totalCost: 250000 },
  { id: 10, date: "2024-01-15", supplier: "Frenos San Francisco", items: Array(25).fill(0), totalCost: 1150000 },
];

export default function Purchases() {
  // 2. USAR DATOS DIRECTOS (Ya no usamos el hook usePurchases para la tabla)
  const purchases = MOCK_PURCHASES; 
  const isLoading = false;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Compras" 
        description="Registre nuevas adquisiciones de stock y gestione proveedores."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="btn-pill border-slate-300">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              Importar Excel
            </Button>
            <CreatePurchaseDialog />
          </div>
        }
      />

      <div className="card-industrial bg-white p-4 space-y-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <Input 
            placeholder="    Buscar compra por factura o proveedor..." 
            className="pl-12 rounded-full bg-slate-50 border-slate-200"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Proveedor" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Mes" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Costo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
          <Select><SelectTrigger className="bg-slate-50 border-slate-200"><SelectValue placeholder="Items" /></SelectTrigger><SelectContent><SelectItem value="all">Todos</SelectItem></SelectContent></Select>
        </div>
      </div>

      <div className="card-industrial bg-white p-6">
        <h3 className="text-lg font-display font-bold mb-4">Historial de Compras</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Costo Total</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id} className="table-row-hover group">
                <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">{purchase.supplier}</TableCell>
                <TableCell>{purchase.items.length} items</TableCell>
                <TableCell className="text-right font-mono font-bold text-slate-700">
                  ${purchase.totalCost.toLocaleString()}
                </TableCell>
                <TableCell>
                    {/* BOTONES DE ACCIÓN (ESTILO INVENTARIO) */}
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CreatePurchaseDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createPurchase, isPending } = useCreatePurchase();
  const { data: products } = useProducts();
  const { toast } = useToast();

  const form = useForm<InsertPurchase>({
    resolver: zodResolver(insertPurchaseSchema),
    defaultValues: {
      supplier: "",
      totalCost: 0,
      items: [{ productId: 0, quantity: 1, cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items" as any, // casting due to complex json type in schema
  });

  // Calculate total automatically
  const watchItems = form.watch("items");
  const calculatedTotal = (watchItems as any[]).reduce((sum, item) => sum + (item.cost * item.quantity), 0);

  const onSubmit = (data: InsertPurchase) => {
    // Ensure total matches calculated
    data.totalCost = calculatedTotal;
    
    createPurchase(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Compra registrada", className: "bg-green-600 text-white" });
      },
      onError: () => {
        toast({ title: "Error al registrar", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill bg-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Compra</DialogTitle>
          <DialogDescription>Ingrese los detalles de la factura de compra.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-center items-end border p-4 rounded-lg bg-slate-50">
                <span className="text-sm text-muted-foreground uppercase">Total Estimado</span>
                <span className="text-2xl font-bold text-primary font-mono">${calculatedTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm uppercase text-slate-500">Items de la compra</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: 0, quantity: 1, cost: 0 })}>
                  Agregar Item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1">
                    <FormLabel className="text-xs">Producto</FormLabel>
                    <Select 
                      onValueChange={(val) => {
                        const product = products?.find(p => p.id.toString() === val);
                        form.setValue(`items.${index}.productId` as any, parseInt(val));
                        // Auto-fill cost if we had it (simulated)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.partNumber} - {p.compatibleBrand} {p.compatibleModel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="w-24">
                    <FormLabel className="text-xs">Cantidad</FormLabel>
                    <Input 
                      type="number" 
                      min="1"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...form.register(`items.${index}.quantity` as any, { valueAsNumber: true })} 
                    />
                  </div>

                  <div className="w-32">
                    <FormLabel className="text-xs">Costo Unit.</FormLabel>
                    <Input 
                      type="number" 
                      min="0"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      {...form.register(`items.${index}.cost` as any, { valueAsNumber: true })} 
                    />
                  </div>

                  <Button type="button" variant="ghost" size="icon" className="text-red-500" onClick={() => remove(index)}>
                    <Upload className="w-4 h-4 rotate-45" /> {/* Using upload as cross for delete */}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="btn-pill w-full md:w-auto" disabled={isPending}>
                {isPending ? "Registrando..." : "Confirmar Compra"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
