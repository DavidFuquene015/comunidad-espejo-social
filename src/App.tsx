
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Groups from "./pages/Groups";
import GroupChat from "./pages/GroupChat";
import SuggestedFriends from "./pages/SuggestedFriends";
import PrivateChats from "./pages/PrivateChats";
import PrivateChat from "./pages/PrivateChat";
import AcademicLibrary from "./pages/AcademicLibrary";
import SharedRides from "./pages/SharedRides";
import CreateRideRequest from "./pages/CreateRideRequest";
import CreateRideOffer from "./pages/CreateRideOffer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:groupId" element={<GroupChat />} />
            <Route path="/friends" element={<SuggestedFriends />} />
            <Route path="/chats" element={<PrivateChats />} />
            <Route path="/chat/:chatId" element={<PrivateChat />} />
            <Route path="/library" element={<AcademicLibrary />} />
            <Route path="/shared-rides" element={<SharedRides />} />
            <Route path="/create-ride-request" element={<CreateRideRequest />} />
            <Route path="/create-ride-offer" element={<CreateRideOffer />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
