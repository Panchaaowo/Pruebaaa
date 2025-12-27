import { useState } from "react";
import { useProducts, useCreateProduct, useDeleteProduct } from "@/hooks/use-products";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Trash2, Loader2, PackageOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const { data: products, isLoading } = useProducts(search);
  const { toast } = useToast();
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventario de Repuestos" 
        description="Gestione el stock de repuestos, precios y proveedores."
        action={<AddProductDialog />}
      />

      <div className="card-industrial p-4 flex items-center gap-4 bg-white">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por patente, modelo, marca..." 
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card-industrial bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-display font-bold text-slate-900">Part Number</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Marca / Modelo</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Año</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Proveedor</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Stock</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Calidad</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Cargando inventario...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <PackageOpen className="w-12 h-12 text-slate-300" />
                    <p>No se encontraron productos.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products?.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: any }) {
  const { mutate: deleteProduct, isPending } = useDeleteProduct();
  const { toast } = useToast();

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteProduct(product.id, {
        onSuccess: () => toast({ title: "Producto eliminado", className: "bg-slate-900 text-white border-slate-800" }),
      });
    }
  };

  return (
    <TableRow className="table-row-hover group border-slate-100">
      <TableCell className="font-mono text-slate-600 font-medium">{product.partNumber}</TableCell>
      <TableCell>
        <div className="font-medium text-slate-900">{product.compatibleBrand}</div>
        <div className="text-xs text-muted-foreground">{product.compatibleModel}</div>
      </TableCell>
      <TableCell>{product.year}</TableCell>
      <TableCell>{product.provider}</TableCell>
      <TableCell>
        <div className={product.stock < 5 ? "text-red-600 font-bold" : "text-slate-900 font-medium"}>
          {product.stock} u.
        </div>
      </TableCell>
      <TableCell><StatusBadge status={product.quality} /></TableCell>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleDelete}
          disabled={isPending}
          className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { toast } = useToast();

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      partNumber: "",
      compatibleBrand: "",
      compatibleModel: "",
      year: new Date().getFullYear(),
      provider: "",
      stock: 0,
      quality: "Good",
    },
  });

  const onSubmit = (data: InsertProduct) => {
    createProduct(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Producto creado exitosamente", className: "bg-green-600 text-white border-none" });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Agregar Producto</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del nuevo repuesto para el inventario.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="partNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Parte</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="compatibleBrand"
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
                name="compatibleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock Inicial</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Bad">Bad</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full btn-pill" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
