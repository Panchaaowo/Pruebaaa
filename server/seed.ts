import { db } from "./db";
import { storage } from "./storage";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Iniciando seed de la base de datos...");

  try {
    // Crear usuario administrador por defecto
    const adminRut = "11.111.111-1";
    const existingAdmin = await storage.getUserByRut(adminRut);

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await storage.createUser({
        rut: adminRut,
        password: hashedPassword,
        name: "Administrador",
        role: "administrador",
      });
      console.log("✅ Usuario administrador creado:");
      console.log("   RUT: 11.111.111-1");
      console.log("   Contraseña: admin123");
      console.log("   Rol: administrador");
    } else {
      console.log("ℹ️  Usuario administrador ya existe");
    }

    // Crear usuario mecánico de ejemplo
    const mechanicRut = "22.222.222-2";
    const existingMechanic = await storage.getUserByRut(mechanicRut);

    if (!existingMechanic) {
      const hashedPassword = await bcrypt.hash("mecanico123", 10);
      await storage.createUser({
        rut: mechanicRut,
        password: hashedPassword,
        name: "Juan Pérez",
        role: "mecanico",
      });
      console.log("✅ Usuario mecánico creado:");
      console.log("   RUT: 22.222.222-2");
      console.log("   Contraseña: mecanico123");
      console.log("   Rol: mecanico");
    } else {
      console.log("ℹ️  Usuario mecánico ya existe");
    }

    console.log("\n🎉 Seed completado exitosamente!");
  } catch (error) {
    console.error("❌ Error durante el seed:", error);
    process.exit(1);
  }

  process.exit(0);
}

seed();
