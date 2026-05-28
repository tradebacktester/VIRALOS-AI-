import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import CreateVideo from "@/pages/CreateVideo";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Analytics from "@/pages/Analytics";
import Trends from "@/pages/Trends";
import Settings from "@/pages/Settings";
import AgentStudio from "@/pages/AgentStudio";
import StrategyPage from "@/pages/StrategyPage";
import CommandCenter from "@/pages/CommandCenter";
import MemoryVault from "@/pages/MemoryVault";
import Publisher from "@/pages/Publisher";
import ABTesting from "@/pages/ABTesting";
import ContentCalendar from "@/pages/ContentCalendar";
import Insights from "@/pages/Insights";
import Monetization from "@/pages/Monetization";
import PersonalityClone from "@/pages/PersonalityClone";
import Marketplace from "@/pages/Marketplace";
import BrandCreator from "@/pages/BrandCreator";
import StoryUniverse from "@/pages/StoryUniverse";
import EnterpriseOps from "@/pages/EnterpriseOps";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) qc.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);
  return null;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/dashboard" /></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in"><Layout>{children}</Layout></Show>
      <Show when="signed-out"><Redirect to="/sign-in" /></Show>
    </>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/dashboard"><ProtectedPage><Dashboard /></ProtectedPage></Route>
      <Route path="/create"><ProtectedPage><CreateVideo /></ProtectedPage></Route>
      <Route path="/projects"><ProtectedPage><Projects /></ProtectedPage></Route>
      <Route path="/projects/:id">{() => <ProtectedPage><ProjectDetail /></ProtectedPage>}</Route>
      <Route path="/analytics"><ProtectedPage><Analytics /></ProtectedPage></Route>
      <Route path="/trends"><ProtectedPage><Trends /></ProtectedPage></Route>
      <Route path="/settings"><ProtectedPage><Settings /></ProtectedPage></Route>
      <Route path="/agents"><ProtectedPage><AgentStudio /></ProtectedPage></Route>
      <Route path="/strategy"><ProtectedPage><StrategyPage /></ProtectedPage></Route>
      <Route path="/command"><ProtectedPage><CommandCenter /></ProtectedPage></Route>
      <Route path="/memory"><ProtectedPage><MemoryVault /></ProtectedPage></Route>
      <Route path="/publisher"><ProtectedPage><Publisher /></ProtectedPage></Route>
      <Route path="/ab-testing"><ProtectedPage><ABTesting /></ProtectedPage></Route>
      <Route path="/calendar"><ProtectedPage><ContentCalendar /></ProtectedPage></Route>
      <Route path="/insights"><ProtectedPage><Insights /></ProtectedPage></Route>
      <Route path="/monetization"><ProtectedPage><Monetization /></ProtectedPage></Route>
      <Route path="/personality"><ProtectedPage><PersonalityClone /></ProtectedPage></Route>
      <Route path="/marketplace"><ProtectedPage><Marketplace /></ProtectedPage></Route>
      <Route path="/brand"><ProtectedPage><BrandCreator /></ProtectedPage></Route>
      <Route path="/universe"><ProtectedPage><StoryUniverse /></ProtectedPage></Route>
      <Route path="/enterprise"><ProtectedPage><EnterpriseOps /></ProtectedPage></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ClerkQueryClientCacheInvalidator />
          <AppRoutes />
        </TooltipProvider>
      </QueryClientProvider>
      <Toaster />
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}
