import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, User, Car, MapPin, Mail, Phone } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// 1. DATOS MOCKEADOS (10 Clientes Reales)
const MOCK_CLIENTS = [
  { id: 1, run: "12.345.678-9", name: "Juan Pérez González", phone: "+569 8765 4321", email: "juan.perez@gmail.com", comuna: "La Florida", registerDate: "2023-11-15", vehicle: { brand: "Toyota", model: "Yaris", patent: "BB-CL-12" }, otCount: 3 },
  { id: 2, run: "15.443.221-K", name: "María Angélica Rojas", phone: "+569 1122 3344", email: "maria.rojas@hotmail.com", comuna: "Puente Alto", registerDate: "2024-01-10", vehicle: { brand: "Nissan", model: "Kicks", patent: "PP-RT-99" }, otCount: 1 },
  { id: 3, run: "9.876.543-2", name: "Transportes Soto SpA", phone: "+569 5555 6666", email: "contacto@transportessoto.cl", comuna: "Maipú", registerDate: "2023-05-20", vehicle: { brand: "Mitsubishi", model: "L200", patent: "LL-KK-55" }, otCount: 12 },
  { id: 4, run: "18.990.123-4", name: "Carlos Patricio Díaz", phone: "+569 9988 7766", email: "carlos.diaz@vtr.net", comuna: "Santiago Centro", registerDate: "2024-02-01", vehicle: { brand: "Hyundai", model: "Accent", patent: "GH-HJ-12" }, otCount: 2 },
  { id: 5, run: "7.654.321-0", name: "Roberto Gómez Bolaños", phone: "+569 4433 2211", email: "r.gomez@gmail.com", comuna: "Ñuñoa", registerDate: "2023-08-14", vehicle: { brand: "Kia", model: "Rio 4", patent: "JK-LM-34" }, otCount: 5 },
  { id: 6, run: "16.777.888-1", name: "Ana María Silva", phone: "+569 1234 5678", email: "ana.silva@outlook.com", comuna: "Providencia", registerDate: "2024-03-05", vehicle: { brand: "Suzuki", model: "Swift", patent: "DD-FF-88" }, otCount: 0 },
  { id: 7, run: "10.111.222-3", name: "Constructora Vial Ltda", phone: "+562 2233 4455", email: "adquisiciones@vial.cl", comuna: "San Bernardo", registerDate: "2022-12-01", vehicle: { brand: "Chevrolet", model: "Silverado", patent: "RR-SS-11" }, otCount: 8 },
  { id: 8, run: "14.222.333-5", name: "Pedro Pascal (Tocayo)", phone: "+569 7777 8888", email: "p.pascal@yahoo.com", comuna: "Las Condes", registerDate: "2023-10-30", vehicle: { brand: "Mazda", model: "CX-5", patent: "PP-ZZ-99" }, otCount: 1 },
  { id: 9, run: "19.555.444-6", name: "Valentina Paz López", phone: "+569 6655 4433", email: "vale.lopez@gmail.com", comuna: "Macul", registerDate: "2024-02-20", vehicle: { brand: "Peugeot", model: "208", patent: "TT-YY-22" }, otCount: 1 },
  { id: 10, run: "13.666.777-K", name: "Jorge González", phone: "+569 3322 1100", email: "jorge.prisioneros@gmail.com", comuna: "San Miguel", registerDate: "2023-01-15", vehicle: { brand: "Citroën", model: "C3", patent: "AA-BB-11" }, otCount: 4 },
];

export default function Clients() {
  const [search, setSearch] = useState("");
  
  // 2. FILTRADO LOCAL
  const clients = MOCK_CLIENTS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.run.includes(search) ||
    c.vehicle.patent.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Clientes" 
        description="Base de datos de clientes, historial de vehículos y contacto."
        action={<AddClientDialog />}
      />

      <div className="card-industrial p-4 bg-white flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
          <Input 
            placeholder="    Buscar por RUN, Nombre o Patente..." 
            className="pl-12 bg-slate-50 border-slate-200 focus:bg-white transition-colors rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card-industrial bg-white">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="font-display font-bold text-slate-900">Cliente (RUN)</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Contacto</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Ubicación</TableHead>
              <TableHead className="font-display font-bold text-slate-900">Vehículo Principal</TableHead>
              <TableHead className="font-display font-bold text-slate-900 text-center">Historial</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <ClientRow key={client.id} client={client} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ClientRow({ client }: { client: typeof MOCK_CLIENTS[0] }) {
  const { toast } = useToast();
  const handleEdit = () => toast({ title: "Editar Cliente", description: `Editando a ${client.name}` });
  const handleDelete = () => confirm(`¿Eliminar cliente ${client.name}?`) && toast({ title: "Cliente eliminado" });

  return (
    <TableRow className="table-row-hover group border-slate-100">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-full text-slate-500">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="font-medium text-slate-900">{client.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{client.run}</div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Phone className="w-3 h-3 text-slate-400" />
            {client.phone}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[150px]">{client.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-slate-600 bg-slate-50 font-normal">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            {client.comuna}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Car className="w-4 h-4 text-blue-600" />
          <div>
            <div className="font-bold text-slate-700 font-mono text-xs border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50 inline-block mb-0.5">
              {client.vehicle.patent}
            </div>
            <div className="text-xs text-muted-foreground">
              {client.vehicle.brand} {client.vehicle.model}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="secondary" className="font-mono bg-blue-50 text-blue-700 hover:bg-blue-100">
          {client.otCount} OTs
        </Badge>
      </TableCell>
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

// ... (El componente AddClientDialog se mantiene igual que te pasé antes) ...
//funion AddClientDialog() {
    // ... Código del diálogo ...
    //turn <Dialog><DialogTrigger><Button>Nuevo</Button></DialogTrigger></Dialog>; 
//}
function AddClientDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      run: "", name: "", phone: "", email: "", comuna: "", 
      brand: "", model: "", patent: ""
    }
  });

  const onSubmit = (data: any) => {
    console.log(data);
    toast({ title: "Cliente registrado", className: "bg-green-600 text-white" });
    setOpen(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Cliente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
          <DialogDescription>Ingrese los datos personales y del vehículo principal.</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            
            {/* Sección Personal */}
            <h4 className="text-sm font-medium text-slate-500 border-b pb-1 mb-3">Datos Personales</h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="run" render={({ field }) => (
                <FormItem><FormLabel>RUN</FormLabel><FormControl><Input {...field} placeholder="12.345.678-9" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} placeholder="+569..." /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem className="col-span-2"><FormLabel>Correo</FormLabel><FormControl><Input {...field} type="email" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            
            <FormField control={form.control} name="comuna" render={({ field }) => (
                <FormItem><FormLabel>Comuna</FormLabel><FormControl><Input {...field} placeholder="Ej: La Florida" /></FormControl><FormMessage /></FormItem>
              )} />

            {/* Sección Vehículo */}
            <h4 className="text-sm font-medium text-slate-500 border-b pb-1 mb-3 mt-4">Vehículo Principal</h4>
            <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg">
              <FormField control={form.control} name="patent" render={({ field }) => (
                <FormItem><FormLabel>Patente</FormLabel><FormControl><Input {...field} className="uppercase" placeholder="AA-BB-11" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="brand" render={({ field }) => (
                <FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} placeholder="Toyota" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field }) => (
                <FormItem><FormLabel>Modelo</FormLabel><FormControl><Input {...field} placeholder="Yaris" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="btn-pill w-full md:w-auto">Guardar Cliente</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}