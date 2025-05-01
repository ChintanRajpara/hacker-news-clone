import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PostList } from "./pages/postList";
import { PostDetail } from "./pages/postDetail";
import { NotFound } from "./pages/notFound";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppContextProvider } from "./components/appContextProvider";
import { AppContext } from "./utils/appContext/context";
import { AppDialogsContainer } from "./components/appDialogsContainer";

const router = createBrowserRouter([
  { path: "/", element: <PostList /> },
  { path: "/post/:id", element: <PostDetail /> },

  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <AppContextProvider>
      <AppContext.Consumer>
        {({ queryClient }) => (
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <AppDialogsContainer />
            <ReactQueryDevtools />
          </QueryClientProvider>
        )}
      </AppContext.Consumer>
    </AppContextProvider>
  );
}

export default App;
