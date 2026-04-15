import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import UserQuizPage from "./pages/UserQuizPage";
import AdminPage from "./pages/AdminPage";
import Login from "./pages/Login"
import { Switch, Route, Redirect } from "wouter";

function Router() {
  const token = localStorage.getItem("jwt_token");
  const user = JSON.parse(localStorage.getItem("library_current_user") || "{}");
  return (
    <Switch>
      <Route path="/" >
        {!token ? (
          <Redirect to="/login" />
        ) : user.role === "ADMIN" ? (
          <Redirect to="/admin" />
        ) : (
          <Redirect to="/user" />
        )
        }
      </Route>

      <Route path="/login" >
        {token ? (
          <Redirect to={user.role === "ADMIN" ? "/admin" : "/user"} />
        ) : (<Login />)}
      </Route>

      <Route path="/user">
        {!token ? <Redirect to="/login" /> : user.role === "ADMIN" ? <Redirect to="/admin" /> : <UserQuizPage />}
      </Route>



      <Route path="/admin" >
        {!token ? <Redirect to="/login" />: user.role === "USER" ? <Redirect to = "/user"/> : <AdminPage />}
      </Route>
    </Switch>
  );
}
function App() {
  useEffect(() => {
    // initializeBooks();
  }, []);



  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;