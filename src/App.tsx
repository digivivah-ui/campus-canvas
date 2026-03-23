import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";

// Public Pages
import Index from "./pages/Index";
import Departments from "./pages/Departments";
import Faculty from "./pages/Faculty";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminFaculty from "./pages/admin/AdminFaculty";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminStats from "./pages/admin/AdminStats";
import AdminHomepage from "./pages/admin/AdminHomepage";
import AdminAbout from "./pages/admin/AdminAbout";
import AdminSocialLinks from "./pages/admin/AdminSocialLinks";
import AdminExploreVideos from "./pages/admin/AdminExploreVideos";
import { SiteSettingsProvider } from "@/hooks/useSiteSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SiteSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<Index />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/stats" element={<AdminStats />} />
              <Route path="/admin/homepage" element={<AdminHomepage />} />
              <Route path="/admin/about" element={<AdminAbout />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/members" element={<AdminMembers />} />
              <Route path="/admin/faculty" element={<AdminFaculty />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/social-links" element={<AdminSocialLinks />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
