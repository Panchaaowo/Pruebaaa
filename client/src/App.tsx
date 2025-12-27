import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import NotFound from "@/pages/not-found";
import Inventory from "@/pages/Inventory";
import Purchases from "@/pages/Purchases";
import WorkOrders from "@/pages/WorkOrders";

function Router() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 lg:ml-72 p-6 md:p-8 overflow-y-auto">
        <Switch>
          <Route path="/" component={() => <Redirect to="/inventory" />} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/purchases" component={Purchases} />
          <Route path="/work-orders" component={WorkOrders} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
