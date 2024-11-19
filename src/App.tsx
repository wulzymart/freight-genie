import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAuth } from "./hooks/auth-context";
import useVendor from "./hooks/vendor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
const router = createRouter({
  routeTree,
  context: { auth: undefined!, vendor: undefined!, queryClient },
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const auth = useAuth();
  const vendor = useVendor();

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth, vendor, queryClient }} />
    </QueryClientProvider>
  );
}

export default App;
