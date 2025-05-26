import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import ChatProvider from "@/context/ChatContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
          <ChatProvider>
        <AuthProvider>
            <App />
        </AuthProvider>
          </ChatProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);