import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider, Show, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { dark } from "@clerk/themes";
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
import Insights from "@/pages/Insights";
import Monetization from "@/pages/Monetization";
import PersonalityClone from "@/pages/PersonalityClone";
import Marketplace from "@/pages/Marketplace";
import BrandCreator from "@/pages/BrandCreator";
import StoryUniverse from "@/pages/StoryUniverse";
import EnterpriseOps from "@/pages/EnterpriseOps";
import CinematicEngine from "@/pages/CinematicEngine";
import LandingPage from "@/pages/LandingPage";

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

const clerkAppearance = {
  baseTheme: dark,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#2563eb",
    colorForeground: "#f0f4f8",
    colorMutedForeground: "#8b9ab0",
    colorDanger: "#ef4444",
    colorBackground: "#0d1117",
    colorInput: "#1a2332",
    colorInputForeground: "#f0f4f8",
    colorNeutral: "#2a3a4f",
    fontFamily: "'Space Grotesk', 'Inter', sans-serif",
    borderRadius: "0.625rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[#0d1117] border border-[#1e2d40] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-white font-semibold",
    headerSubtitle: "text-[#8b9ab0]",
    socialButtonsBlockButtonText: "text-white",
    formFieldLabel: "text-[#c8d8e8]",
    footerActionLink: "text-[#2563eb]",
    footerActionText: "text-[#8b9ab0]",
    dividerText: "text-[#8b9ab0]",
    identityPreviewEditButton: "text-[#2563eb]",
    formFieldSuccessText: "text-green-400",
    alertText: "text-white",
    logoBox: "flex items-center justify-center py-2",
    logoImage: "h-8",
    socialButtonsBlockButton: "border border-[#1e2d40] bg-[#111827] hover:bg-[#1a2332]",
    formButtonPrimary: "bg-[#2563eb] hover:bg-[#1d4ed8] text-white",
    formFieldInput: "bg-[#1a2332] border-[#2a3a4f] text-white",
    footerAction: "border-t border-[#1e2d40]",
    dividerLine: "bg-[#1e2d40]",
    alert: "bg-[#1a2332] border-[#2a3a4f]",
    otpCodeFieldInput: "bg-[#1a2332] border-[#2a3a4f] text-white",
    formFieldRow: "gap-2",
    main: "px-2",
  },
};

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
      <Show when="signed-out"><LandingPage /></Show>
    </>
  );
}

function ProtectedPage({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in"><Layout>{children}</Layout></Show>
      <Show when="signed-out"><Redirect to="/" /></Show>
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
      <Route path="/insights"><ProtectedPage><Insights /></ProtectedPage></Route>
      <Route path="/monetization"><ProtectedPage><Monetization /></ProtectedPage></Route>
      <Route path="/personality"><ProtectedPage><PersonalityClone /></ProtectedPage></Route>
      <Route path="/marketplace"><ProtectedPage><Marketplace /></ProtectedPage></Route>
      <Route path="/brand"><ProtectedPage><BrandCreator /></ProtectedPage></Route>
      <Route path="/universe"><ProtectedPage><StoryUniverse /></ProtectedPage></Route>
      <Route path="/enterprise"><ProtectedPage><EnterpriseOps /></ProtectedPage></Route>
      <Route path="/cinematic"><ProtectedPage><CinematicEngine /></ProtectedPage></Route>
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
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your VIRALOS account",
          },
        },
        signUp: {
          start: {
            title: "Get started",
            subtitle: "Create your VIRALOS account",
          },
        },
      }}
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
