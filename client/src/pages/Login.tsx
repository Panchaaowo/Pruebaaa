import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wrench, Lock } from "lucide-react";

export default function Login() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const { login, loginError, isLoggingIn } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ rut, password });
  };

  const formatRut = (value: string) => {
    // Remove all non-numeric characters except 'k' or 'K'
    const cleanRut = value.replace(/[^0-9kK]/g, "");
    
    if (cleanRut.length === 0) return "";
    
    // Separate the verification digit
    const body = cleanRut.slice(0, -1);
    const verifier = cleanRut.slice(-1);
    
    // Format the body with dots
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Return formatted RUT
    return formattedBody + (verifier ? "-" + verifier : "");
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRut(e.target.value);
    setRut(formatted);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary rounded-full">
              <Wrench className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Frenos Aguilera</CardTitle>
          <CardDescription>
            Ingresa tu RUT y contraseña para acceder
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={handleRutChange}
                required
                disabled={isLoggingIn}
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                  className="pl-10 text-base"
                />
              </div>
            </div>

            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>Roles disponibles:</p>
            <p className="mt-1">
              <span className="font-medium">Mecánico</span> · <span className="font-medium">Administrador</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
