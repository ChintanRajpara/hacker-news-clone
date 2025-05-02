import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PostList } from "./pages/postList";
import { PostDetail } from "./pages/postDetail";
import { NotFound } from "./pages/notFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppContextProvider } from "./components/appContextProvider";
import { AppDialogsContainer } from "./components/appDialogsContainer";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <PostList /> },
  { path: "/post/:id", element: <PostDetail /> },

  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <RouterProvider router={router} />
        <AppDialogsContainer />
        <ReactQueryDevtools />
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
