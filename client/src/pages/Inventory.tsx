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
import { Plus, Search, Trash2, Loader2, PackageOpen, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const { data: products, isLoading } = useProducts(search);
  const { toast } = useToast();
  
  // Calcular productos con stock bajo
  const lowStockProducts = products?.filter(p => p.stock < 5) || [];
  
  // Filtrar por marca y modelo
  let filteredProducts = products;
  
  if (brandFilter && brandFilter !== "all") {
    filteredProducts = filteredProducts?.filter(p => 
      p.compatibleBrand && p.compatibleBrand.toLowerCase().includes(brandFilter.toLowerCase())
    );
  }
  
  if (modelFilter && modelFilter !== "all") {
    filteredProducts = filteredProducts?.filter(p => 
      p.compatibleModel && p.compatibleModel.toLowerCase().includes(modelFilter.toLowerCase())
    );
  }
  
  // Obtener marcas y modelos únicos (solo strings válidos no vacíos)
  const uniqueBrands = Array.from(
    new Set(
      products?.map(p => p.compatibleBrand)
        .filter(b => b != null && b.trim() !== "") || []
    )
  ).sort() as string[];
  
  const uniqueModels = Array.from(
    new Set(
      products?.map(p => p.compatibleModel)
        .filter(m => m != null && m.trim() !== "") || []
    )
  ).sort() as string[];
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventario de Repuestos" 
        description="Gestione el stock de repuestos, precios y proveedores."
        action={<AddProductDialog />}
      />

      {/* Alerta de Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive" className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-bold text-orange-900">⚠️ Stock Bajo Detectado</AlertTitle>
          <AlertDescription className="text-orange-800">
            <p className="mb-2">{lowStockProducts.length} producto(s) necesitan reposición:</p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map((product) => (
                <Badge key={product.id} className="bg-orange-600 hover:bg-orange-700 font-mono">
                  {product.partNumber} ({product.stock} u.)
                </Badge>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="card-industrial p-4 bg-white space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por código de freno, modelo o marca..." 
              className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={brandFilter} onValueChange={setBrandFilter}>
            <SelectTrigger className="bg-slate-50 w-48">
              <SelectValue placeholder="🔍 Filtrar por marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {uniqueBrands.map((brand) => (
                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="bg-slate-50 w-48">
              <SelectValue placeholder="🔍 Filtrar por modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los modelos</SelectItem>
              {uniqueModels.map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-industrial bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-display font-bold text-slate-900">Código</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Categoría</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Vehículos Compatibles</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Proveedor</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Stock</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Cargando inventario...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <PackageOpen className="w-12 h-12 text-slate-300" />
                    <p>No se encontraron productos.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts?.map((product) => (
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
      <TableCell className="font-mono text-slate-600 font-medium">
        {product.partNumber}
        {product.disabled && (
          <Badge variant="secondary" className="ml-2 text-xs">Deshabilitado</Badge>
        )}
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-white">
          {product.quality || "General"}
        </span>
      </TableCell>
      <TableCell>
        <div className="font-medium text-slate-900">{product.compatibleBrand}</div>
        <div className="text-xs text-muted-foreground">{product.compatibleModel} ({product.year})</div>
      </TableCell>
      <TableCell className="text-sm text-slate-600">{product.provider}</TableCell>
      <TableCell>
        <div className={!product.disabled && product.stock < 5 ? "text-red-600 font-bold" : "text-slate-900 font-medium"}>
          {product.stock} u.
        </div>
      </TableCell>
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

const CATEGORIES = [
  "Pastillas de Freno",
];

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Array<{brand: string, model: string, yearFrom: number, yearTo: number}>>([]);
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { toast } = useToast();

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      nombre: "",
      categoria_id: 1,
      stock: 0,
      precio_compra: "0",
      precio_venta: "0",
      partNumber: "",
      quality: "",
      compatibleBrand: "",
      compatibleModel: "",
      provider: "",
      disabled: false,
    } as any,
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
            <FormField
              control={form.control as any}
              name="partNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código del Producto</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Ej: FRN-001" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="categoria_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString() || "1"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[...CATEGORIES, ...customCategories].map((cat, idx) => (
                        <SelectItem key={cat} value={(idx + 1).toString()}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control as any}
              name="quality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calidad (Opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Ej: Premium, Estándar, Económica" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Input 
                placeholder="Nueva categoría (ej: Aceite Motor)" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  if (newCategory.trim()) {
                    setCustomCategories([...customCategories, newCategory.trim()]);
                    setNewCategory("");
                    toast({ title: "Categoría agregada", description: newCategory });
                  }
                }}
              >
                Agregar Categoría
              </Button>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
              <h4 className="text-sm font-medium text-slate-700">Vehículos Compatibles</h4>
              <p className="text-xs text-slate-500">Indique los vehículos con los que es compatible este repuesto</p>
              
              {vehicles.map((vehicle, index) => (
                <div key={index} className="flex items-end gap-2 p-3 bg-white rounded border">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs text-slate-600">Marca</label>
                      <Input value={vehicle.brand} disabled className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Modelo</label>
                      <Input value={vehicle.model} disabled className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Desde</label>
                      <Input value={vehicle.yearFrom} disabled className="h-8 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Hasta</label>
                      <Input value={vehicle.yearTo} disabled className="h-8 text-sm" />
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setVehicles(vehicles.filter((_, i) => i !== index))}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Quitar
                  </Button>
                </div>
              ))}
              
              <div className="grid grid-cols-4 gap-2 mt-2">
                <FormField
                  control={form.control as any}
                  name="compatibleBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Marca</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="Toyota" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="compatibleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Modelo</FormLabel>
                      <FormControl><Input {...field} value={field.value || ""} placeholder="Yaris" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <label className="text-xs font-medium">Año Desde</label>
                  <Input 
                    type="number" 
                    placeholder="2023" 
                    id="yearFrom"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Año Hasta</label>
                  <Input 
                    type="number" 
                    placeholder="2025" 
                    id="yearTo"
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                </div>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  const brand = (form.getValues as any)("compatibleBrand") as string;
                  const model = (form.getValues as any)("compatibleModel") as string;
                  const yearFrom = parseInt((document.getElementById("yearFrom") as HTMLInputElement)?.value || "0");
                  const yearTo = parseInt((document.getElementById("yearTo") as HTMLInputElement)?.value || "0");
                  
                  if (brand && model && yearFrom && yearTo) {
                    setVehicles([...vehicles, { brand, model, yearFrom, yearTo }]);
                    (form.setValue as any)("compatibleBrand", "");
                    (form.setValue as any)("compatibleModel", "");
                    (document.getElementById("yearFrom") as HTMLInputElement).value = "";
                    (document.getElementById("yearTo") as HTMLInputElement).value = "";
                  } else {
                    toast({ title: "Complete todos los campos", variant: "destructive" });
                  }
                }}
              >
                + Agregar Vehículo Compatible
              </Button>
            </div>

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <FormControl><Input {...field} value={field.value || ""} placeholder="Nombre del proveedor" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Inicial</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="disabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-slate-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Deshabilitar alertas de stock bajo
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      El producto se mantendrá aunque tenga bajo stock y no aparecerá en las alertas.
                    </p>
                  </div>
                </FormItem>
              )}
            />

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
