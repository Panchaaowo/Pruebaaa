import bcrypt from "bcryptjs";
import type { User, Product, Purchase, WorkOrder, InsertUser, InsertProduct, InsertPurchase, InsertWorkOrder } from "@shared/schema";

// In-memory storage
let users: User[] = [];
let products: Product[] = [];
let purchases: Purchase[] = [];
let workOrders: WorkOrder[] = [];

// Initialize with mock data
async function initializeMockData() {
  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const mechanicPassword = await bcrypt.hash("mecanico123", 10);
  
  users = [
    {
      id: 1,
      rut: "11.111.111-1",
      password: adminPassword,
      nombre: "Administrador",
      rol: "administrador",
      name: "Administrador",
      role: "administrador",
      createdAt: new Date(),
    },
    {
      id: 2,
      rut: "22.222.222-2",
      password: mechanicPassword,
      nombre: "Juan Pérez",
      rol: "mecanico",
      name: "Juan Pérez",
      role: "mecanico",
      createdAt: new Date(),
    },
  ];

  // Create sample products
  products = [
    {
      id: 1,
      nombre: "Pastilla de Freno Toyota Corolla",
      categoria_id: 1,
      stock: 50,
      precio_compra: "15000",
      precio_venta: "25000",
      partNumber: "BRK-001",
      quality: "Excelente",
      compatibleBrand: "Toyota",
      compatibleModel: "Corolla",
      provider: "Frenos Chile",
      disabled: false,
    },
    {
      id: 2,
      nombre: "Pastilla de Freno Nissan Versa",
      categoria_id: 1,
      stock: 30,
      precio_compra: "12000",
      precio_venta: "20000",
      partNumber: "BRK-002",
      quality: "Buena",
      compatibleBrand: "Nissan",
      compatibleModel: "Versa",
      provider: "Auto Parts SA",
      disabled: false,
    },
  ];

  // Create sample purchases
  purchases = [
    {
      id: 1,
      date: new Date(),
      supplier: "Frenos Chile",
      totalCost: 250000,
      items: [{ productId: 1, quantity: 10, cost: 25000 }],
    },
  ];

  // Create sample work orders
  workOrders = [
    {
      id: 1,
      usuario_id: 2,
      fecha: new Date().toISOString().split('T')[0],
      marca: "Toyota",
      modelo: "Corolla",
      patente: "AB-1234",
      km: 50000,
      total: "150000",
      correo_cliente: null,
      status: "pending",
      otNumber: "1001",
      patent: "AB-1234",
      model: "Corolla",
      brand: "Toyota",
      entryDate: new Date(),
    },
  ];
}

initializeMockData();

export interface IStorage {
  // Users
  getUserByRut(rut: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Products
  getProducts(search?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Purchases
  getPurchases(): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;

  // Work Orders
  getWorkOrders(search?: string): Promise<WorkOrder[]>;
  getWorkOrder(id: number): Promise<WorkOrder | undefined>;
  createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder>;
  updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder>;
  deleteWorkOrder(id: number): Promise<void>;
}

export class MemoryStorage implements IStorage {
  // Users
  async getUserByRut(rut: string): Promise<User | undefined> {
    return users.find(u => u.rut === rut);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return users.find(u => u.id === id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: users.length + 1,
      ...user,
      name: user.name || user.nombre,
      role: user.role || user.rol,
      createdAt: new Date(),
    };
    users.push(newUser);
    return newUser;
  }

  // Products
  async getProducts(search?: string): Promise<Product[]> {
    if (search) {
      const searchLower = search.toLowerCase();
      return products.filter(p => 
        (p.partNumber?.toLowerCase().includes(searchLower)) ||
        (p.compatibleModel?.toLowerCase().includes(searchLower)) ||
        (p.compatibleBrand?.toLowerCase().includes(searchLower)) ||
        (p.nombre?.toLowerCase().includes(searchLower))
      );
    }
    return [...products];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return products.find(p => p.id === id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct: Product = {
      id: products.length + 1,
      nombre: product.nombre,
      categoria_id: product.categoria_id,
      stock: product.stock || 0,
      precio_compra: product.precio_compra || "0",
      precio_venta: product.precio_venta || "0",
      partNumber: (product as any).partNumber || null,
      quality: (product as any).quality || null,
      compatibleBrand: (product as any).compatibleBrand || null,
      compatibleModel: (product as any).compatibleModel || null,
      provider: (product as any).provider || null,
      disabled: (product as any).disabled || false,
    };
    products.push(newProduct);
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const index = products.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Product not found");
    products[index] = { ...products[index], ...product };
    return products[index];
  }

  async deleteProduct(id: number): Promise<void> {
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products.splice(index, 1);
    }
  }

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    return [...purchases].sort((a, b) => 
      (b.date?.getTime() || 0) - (a.date?.getTime() || 0)
    );
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const newPurchase: Purchase = {
      id: purchases.length + 1,
      date: new Date(),
      ...purchase,
    };
    purchases.push(newPurchase);
    return newPurchase;
  }

  // Work Orders
  async getWorkOrders(search?: string): Promise<WorkOrder[]> {
    if (search) {
      const searchLower = search.toLowerCase();
      return workOrders.filter(wo =>
        (wo.patent?.toLowerCase().includes(searchLower)) ||
        (wo.patente?.toLowerCase().includes(searchLower)) ||
        (wo.model?.toLowerCase().includes(searchLower)) ||
        (wo.modelo?.toLowerCase().includes(searchLower))
      );
    }
    return [...workOrders].sort((a, b) => 
      (b.entryDate?.getTime() || 0) - (a.entryDate?.getTime() || 0)
    );
  }

  async getWorkOrder(id: number): Promise<WorkOrder | undefined> {
    return workOrders.find(wo => wo.id === id);
  }

  async createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
    const newOrder: WorkOrder = {
      id: workOrders.length + 1,
      usuario_id: workOrder.usuario_id,
      fecha: workOrder.fecha,
      status: workOrder.status || "pending",
      marca: workOrder.marca || null,
      modelo: workOrder.modelo || null,
      patente: workOrder.patente || null,
      km: workOrder.km || null,
      total: workOrder.total || "0",
      correo_cliente: workOrder.correo_cliente || null,
      otNumber: (workOrder as any).otNumber || String(1000 + workOrders.length + 1),
      patent: (workOrder as any).patent || workOrder.patente || null,
      model: (workOrder as any).model || workOrder.modelo || null,
      brand: (workOrder as any).brand || workOrder.marca || null,
      entryDate: new Date(),
    };
    workOrders.push(newOrder);
    return newOrder;
  }

  async updateWorkOrder(id: number, workOrder: Partial<InsertWorkOrder>): Promise<WorkOrder> {
    const index = workOrders.findIndex(wo => wo.id === id);
    if (index === -1) throw new Error("Work order not found");
    workOrders[index] = { ...workOrders[index], ...workOrder };
    return workOrders[index];
  }

  async deleteWorkOrder(id: number): Promise<void> {
    const index = workOrders.findIndex(wo => wo.id === id);
    if (index !== -1) {
      workOrders.splice(index, 1);
    }
  }
}

export const storage = new MemoryStorage();
