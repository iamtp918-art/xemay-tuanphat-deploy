import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoadingScreen from "./components/LoadingScreen";
import ChatWidget from "./components/ChatWidget";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Policy from "./pages/Policy";
import Dashboard from "./pages/admin/Dashboard";
import AdminMotorcycles from "./pages/admin/AdminMotorcycles";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminChat from "./pages/admin/AdminChat";
import AdminPolicies from "./pages/admin/AdminPolicies";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import StaffChat from "./pages/staff/StaffChat";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/san-pham" component={Products} />
      <Route path="/xe/:slug" component={ProductDetail} />
      <Route path="/lien-he" component={Contact} />
      <Route path="/chinh-sach/:slug" component={Policy} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/motorcycles" component={AdminMotorcycles} />
      <Route path="/admin/brands" component={AdminBrands} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/contacts" component={AdminContacts} />
      <Route path="/admin/chat" component={AdminChat} />
      <Route path="/admin/policies" component={AdminPolicies} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/staff/chat" component={StaffChat} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <LoadingScreen />
          <Toaster />
          <Router />
          <ChatWidget />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
