import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginError, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ rut, password });
  };

  const formatRut = (value: string) => {
    const cleanRut = value.replace(/[^0-9kK]/g, "");
    if (cleanRut.length === 0) return "";
    const body = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1);
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return formattedBody + (verifier ? "-" + verifier : "");
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md">
        {/* Logo y Header */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-t-2xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-4xl font-black text-white">FA</span>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-wider mb-2">
            FRENOS AGUILERA
          </h1>
          <p className="text-slate-400 text-sm">Sistema de Gestión de Taller</p>
        </div>

        {/* Formulario */}
        <div className="bg-slate-900/50 backdrop-blur-sm border-x border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">RUT / Usuario</label>
              <Input
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={handleRutChange}
                required
                disabled={isLoggingIn}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Contraseña</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoggingIn}
                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus-visible:border-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
              />
            </div>

            {loginError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-600/50 text-red-200">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 text-base shadow-lg shadow-red-600/20"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "VERIFICANDO..." : "INGRESAR AL SISTEMA"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-b-2xl p-4 text-center">
          <p className="text-xs text-slate-400">
            ACCESO EXCLUSIVO PERSONAL AUTORIZADO
          </p>
        </div>
      </div>
    </div>
  );
}
