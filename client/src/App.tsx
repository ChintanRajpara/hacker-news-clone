import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PostDetailContainer from "./pages/postDetail/postDetailContainer";
import { NotFound } from "./pages/notFound";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppContextProvider } from "./components/appContextProvider";
import { AppDialogsContainer } from "./components/appDialogsContainer";
import { PostListContainer } from "./pages/postList/postListContainer";
import { PostDetail } from "./pages/postDetail";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <PostListContainer /> },
  { path: "/post/:id", element: <PostDetailContainer /> },
  { path: "/p/:id", element: <PostDetail /> },

  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <RouterProvider router={router} />
        <AppDialogsContainer />
      </AppContextProvider>
    </QueryClientProvider>
  );
}

export default App;
