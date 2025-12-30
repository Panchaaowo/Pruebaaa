import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Trash2, PackageOpen, AlertTriangle, Pencil, Filter, DollarSign, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function Inventory() {
  const [search, setSearch] = useState("");
  //const { data: products, isLoading } = useProducts(search);
  const { toast } = useToast();
  
    const MOCK_PRODUCTS = [
  { id: 1, partNumber: "TOY-YAR-001", compatibleBrand: "Toyota", compatibleModel: "Yaris", year: 2019, provider: "Frenos Chile", stock: 45, quality: "Excelente", price: 35990 },
  { id: 2, partNumber: "NIS-V16-002", compatibleBrand: "Nissan", compatibleModel: "V16", year: 2010, provider: "Importadora Indra", stock: 12, quality: "Buena", price: 18990 },
  { id: 3, partNumber: "KIA-RIO-003", compatibleBrand: "Kia", compatibleModel: "Rio 4", year: 2021, provider: "AutoPlanet", stock: 2, quality: "Original", price: 42500 }, // Stock Bajo
  { id: 4, partNumber: "MIT-L200-004", compatibleBrand: "Mitsubishi", compatibleModel: "L200", year: 2022, provider: "Frenos San Francisco", stock: 80, quality: "Heavy Duty", price: 65000 },
  { id: 5, partNumber: "HYU-ACC-005", compatibleBrand: "Hyundai", compatibleModel: "Accent", year: 2018, provider: "Frenos Chile", stock: 28, quality: "Buena", price: 28900 },
  { id: 6, partNumber: "CHE-SAIL-006", compatibleBrand: "Chevrolet", compatibleModel: "Sail", year: 2020, provider: "Importadora Indra", stock: 4, quality: "Alternativa", price: 15990 }, // Stock Bajo
  { id: 7, partNumber: "SUZ-SWI-007", compatibleBrand: "Suzuki", compatibleModel: "Swift", year: 2017, provider: "AutoPlanet", stock: 15, quality: "Excelente", price: 32000 },
  { id: 8, partNumber: "PEU-PAR-008", compatibleBrand: "Peugeot", compatibleModel: "Partner", year: 2021, provider: "Frenos San Francisco", stock: 60, quality: "Original", price: 48900 },
  { id: 9, partNumber: "MAZ-BT50-009", compatibleBrand: "Mazda", compatibleModel: "BT-50", year: 2019, provider: "Frenos Chile", stock: 35, quality: "Excelente", price: 62000 },
  { id: 10, partNumber: "CHE-SIL-010", compatibleBrand: "Chevrolet", compatibleModel: "Silverado", year: 2023, provider: "Importadora Indra", stock: 10, quality: "Premium", price: 85000 },
  { id: 11, partNumber: "CIT-BER-011", compatibleBrand: "Citroën", compatibleModel: "Berlingo", year: 2020, provider: "Frenos San Francisco", stock: 1, quality: "Buena", price: 45000 }, // Stock Crítico
  { id: 12, partNumber: "FOR-RAN-012", compatibleBrand: "Ford", compatibleModel: "Ranger", year: 2022, provider: "AutoPlanet", stock: 22, quality: "Heavy Duty", price: 72000 },
];
// Para usarlo en la tabla:
// const products = MOCK_PRODUCTS.filter(...)
// Usa los datos mockeados directos
  const products = MOCK_PRODUCTS.filter(p => 
    p.partNumber.toLowerCase().includes(search.toLowerCase()) || 
    p.compatibleModel.toLowerCase().includes(search.toLowerCase())
  );
  const isLoading = false;

  // Calcular productos con stock bajo
  const lowStockProducts = products?.filter(p => p.stock < 5) || [];
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Inventario de Repuestos" 
        description="Gestione el stock, precios (Neto/IVA) y proveedores."
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

      {/* Buscador y Filtros */}
      <div className="card-industrial p-4 bg-white space-y-4">
        {/* Barra de Búsqueda (Arreglada) */}
        <div className="relative max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <Input 
            placeholder="    Buscar por codigo, modelo, marca..." 
            className="pl-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filtros Actualizados (Con Precio) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Select>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-3 h-3" />
                <SelectValue placeholder="Categoría" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="frenos">Frenos</SelectItem>
              <SelectItem value="balatas">Balatas</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Marca Vehículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="toyota">Toyota</SelectItem>
              <SelectItem value="nissan">Nissan</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="frenoschile">Frenos Chile</SelectItem>
            </SelectContent>
          </Select>

          {/* NUEVO: Filtro de Precio */}
          <Select>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-slate-500" />
                <SelectValue placeholder="Precio" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Menor a Mayor</SelectItem>
              <SelectItem value="desc">Mayor a Menor</SelectItem>
              <SelectItem value="range1">$0 - $20.000</SelectItem>
              <SelectItem value="range2">$20.000 - $50.000</SelectItem>
              <SelectItem value="range3">+ $50.000</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="bg-slate-50 border-slate-200">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="low">⚠️ Stock Bajo</SelectItem>
              <SelectItem value="good">✅ Stock Normal</SelectItem>
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
              <TableHead className="font-display font-bold text-slate-900">Precio</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Stock</TableHead>
              <TableHead className="w-[100px]"></TableHead>
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
  const { toast } = useToast();

  // Simulación de cálculo IVA para la demo (si el backend solo guarda uno)
  // Asumimos que product.price es el precio final con IVA
  const priceWithIva = product.price || 0;
  const priceNeto = Math.round(priceWithIva / 1.19);

  const handleDelete = () => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      toast({ title: "Producto eliminado", description: `Producto ${product.partNumber} eliminado (demo)`, className: "bg-slate-900 text-white border-slate-800" });
    }
  };

  const handleEdit = () => {
    toast({ title: "Modo edición", description: "Funcionalidad pendiente de implementar" });
  };

  return (
    <TableRow className="table-row-hover group border-slate-100">
      <TableCell className="font-mono text-slate-600 font-medium">{product.partNumber}</TableCell>
      <TableCell>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.quality || "General"}
        </span>
      </TableCell>
      <TableCell>
        <div className="font-medium text-slate-900">{product.compatibleBrand}</div>
        <div className="text-xs text-muted-foreground">{product.compatibleModel} ({product.year})</div>
      </TableCell>
      <TableCell className="text-sm text-slate-600">{product.provider}</TableCell>
      
      {/* NUEVA COLUMNA DE PRECIOS */}
      <TableCell>
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-sm">
            ${priceWithIva.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">
            ${priceNeto.toLocaleString()} Neto
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className={product.stock < 5 ? "text-red-600 font-bold" : "text-slate-900 font-medium"}>
          {product.stock} u.
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEdit}
            className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

const CATEGORIES = [
  "Frenos",
  "Aceite",
  "Balatas",
  "Accesorios",
  "Repuestos",
  "Otros",
];

function AddProductDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      partNumber: "",
      compatibleBrand: "",
      compatibleModel: "",
      year: new Date().getFullYear(),
      provider: "",
      stock: 0,
      quality: "Good",
      price: 0,
    },
  });

  const onSubmit = (data: any) => {
    console.log("Producto creado (demo):", data);
    setOpen(false);
    form.reset();
    toast({ title: "Producto creado exitosamente", description: "En modo demo, los datos no se guardan", className: "bg-green-600 text-white border-none" });
  };

  // Función para calcular IVA automáticamente
  const handleNetPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const netPrice = parseInt(e.target.value) || 0;
    const grossPrice = Math.round(netPrice * 1.19); // Calcula IVA 19%
    
    // Actualizamos el campo visible 'price' (que sería el Bruto/Venta)
    form.setValue("price", grossPrice);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Agregar Producto</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del repuesto. Los precios se calcularán automáticamente.
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
                    <FormLabel>Código del Producto</FormLabel>
                    <FormControl><Input {...field} placeholder="Ej: FRN-001" className="uppercase font-mono" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border">
              <h4 className="text-sm font-medium text-slate-700">Vehículos Compatibles</h4>
              
              <div className="grid grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="compatibleBrand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Marca</FormLabel>
                      <FormControl><Input {...field} placeholder="Ej: Toyota" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="compatibleModel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Modelo</FormLabel>
                      <FormControl><Input {...field} placeholder="Ej: Yaris" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem className="mt-2">
                    <FormLabel className="text-xs">Año(s)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} placeholder="Ej: 2015" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SECCIÓN PRECIOS ACTUALIZADA */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-sm text-blue-900">Precios y Stock</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Campo Simulado para Neto */}
                <div className="space-y-2">
                  <FormLabel className="text-xs text-muted-foreground">Precio Neto (Sin IVA)</FormLabel>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    onChange={handleNetPriceChange}
                    className="bg-white"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="price" // Usamos 'price' como el valor final con IVA
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate-700">Precio Venta (Con IVA)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value))} 
                          className="bg-white font-bold text-slate-900 border-blue-200 focus:border-blue-400"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="col-span-2 mt-2">
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
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <FormControl><Input {...field} placeholder="Nombre del proveedor" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full btn-pill">
                Guardar Producto
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}