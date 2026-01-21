import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/hooks/use-products";
import { useWorkOrders } from "@/hooks/use-work-orders";
import { usePurchases } from "@/hooks/use-purchases";
import { Package, ShoppingCart, Wrench, TrendingUp, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: products } = useProducts();
  const { data: workOrders } = useWorkOrders();
  const { data: purchases } = usePurchases();

  // Calcular estadísticas
  const lowStockProducts = products?.filter(p => p.stock < 5) || [];
  const pendingOrders = workOrders?.filter(w => w.status === 'pending').length || 0;
  const completedOrders = workOrders?.filter(w => w.status === 'completed').length || 0;
  const totalRevenue = workOrders?.reduce((sum, wo) => sum + (wo.total || 0), 0) || 0;

  // Servicios más realizados (simulado)
  const topServices = [
    { name: "Cambio de Pastillas", count: 15, percentage: 35 },
    { name: "Cambio de Balatas", count: 12, percentage: 28 },
    { name: "Sangrado", count: 8, percentage: 18 },
    { name: "Cambio de Líquido", count: 5, percentage: 12 },
    { name: "Rectificado", count: 3, percentage: 7 },
  ];

  // Productos más usados (simulado)
  const topProducts = [
    { name: "Pastillas Toyota", category: "Frenos", used: 24 },
    { name: "Balatas Nissan", category: "Balatas", used: 18 },
    { name: "Líquido DOT 4", category: "Aceite", used: 15 },
    { name: "Gomas Honda", category: "Accesorios", used: 12 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Resumen general del taller y estadísticas de servicios."
      />

      {/* Alertas de Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">⚠️ Alerta de Stock Bajo</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{lowStockProducts.length} producto(s) con stock crítico:</p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <Badge key={product.id} variant="destructive" className="font-mono">
                  {product.partNumber} - {product.stock} u.
                </Badge>
              ))}
              {lowStockProducts.length > 5 && (
                <Badge variant="outline">+{lowStockProducts.length - 5} más</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts.length} con stock bajo
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              En proceso
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Este período
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Servicios Más Realizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Servicios Más Realizados
          </CardTitle>
          <CardDescription>Top 5 servicios del taller</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {topServices.map((service, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{service.name}</span>
                <span className="text-muted-foreground">{service.count} veces</span>
              </div>
              <Progress value={service.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Productos Más Usados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Productos Más Usados
          </CardTitle>
          <CardDescription>Repuestos con mayor rotación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {product.used} usos
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
