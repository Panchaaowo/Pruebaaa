import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const products = await storage.getProducts(search);
    res.json(products);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        throw err;
      }
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(id, input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteProduct(id);
    res.status(204).send();
  });

  // Purchases
  app.get(api.purchases.list.path, async (req, res) => {
    const purchases = await storage.getPurchases();
    res.json(purchases);
  });

  app.post(api.purchases.create.path, async (req, res) => {
    try {
      const input = api.purchases.create.input.parse(req.body);
      const purchase = await storage.createPurchase(input);
      res.status(201).json(purchase);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        throw err;
      }
    }
  });

  // Work Orders
  app.get(api.workOrders.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const orders = await storage.getWorkOrders(search);
    res.json(orders);
  });

  app.post(api.workOrders.create.path, async (req, res) => {
    try {
      const input = api.workOrders.create.input.parse(req.body);
      const order = await storage.createWorkOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        throw err;
      }
    }
  });

  app.put(api.workOrders.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.workOrders.update.input.parse(req.body);
      const order = await storage.updateWorkOrder(id, input);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(404).json({ message: "Work order not found" });
      }
    }
  });

  app.delete(api.workOrders.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteWorkOrder(id);
    res.status(204).send();
  });

  return httpServer;
}

// Seed function
async function seedDatabase() {
  const existingProducts = await storage.getProducts();
  if (existingProducts.length === 0) {
    await storage.createProduct({
      partNumber: "BRK-001",
      compatibleBrand: "Toyota",
      compatibleModel: "Corolla",
      year: 2020,
      provider: "Frenos Chile",
      stock: 50,
      quality: "Excellent"
    });
    await storage.createProduct({
      partNumber: "BRK-002",
      compatibleBrand: "Nissan",
      compatibleModel: "Versa",
      year: 2019,
      provider: "Importadora Central",
      stock: 30,
      quality: "Good"
    });
  }

  const existingOrders = await storage.getWorkOrders();
  if (existingOrders.length === 0) {
    await storage.createWorkOrder({
      patent: "ABCD-12",
      brand: "Toyota",
      model: "Yaris",
      km: 45000,
      total: 150000,
      mechanic: "Juan Perez",
      supervisor: "Carlos Jefe",
      clientSignature: "Signed",
      status: "completed",
      services: { padReplacement: true, discReplacement: false }
    });
  }
}

// Execute seed
seedDatabase().catch(console.error);
