import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PostList } from "./pages/postList";
import { PostDetail } from "./pages/postDetail";
import { Signup } from "./pages/signup";
import { Login } from "./pages/login";
import { Logout } from "./pages/logout";
import { NotFound } from "./pages/notFound";
// import { CreatePost } from "./pages/createPost";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/", element: <PostList /> },
  { path: "/post/:id", element: <PostDetail /> },
  // { path: "/create-post", element: <CreatePost /> },

  { path: "/signup", element: <Signup /> },
  { path: "/login", element: <Login /> },
  { path: "/logout", element: <Logout /> },

  { path: "*", element: <NotFound /> },
]);

function App() {
  return (
    <React.Fragment>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router}></RouterProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </React.Fragment>
  );
}

export default App;
