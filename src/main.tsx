import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { I18nProvider } from "./i18n/I18nContext.tsx";
import { WalletProvider } from "./context/WalletContext.tsx";
import { PaymentProvider } from "./context/PaymentContext.tsx";
import { ProfileProvider } from "./context/ProfileContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <WalletProvider>
        <PaymentProvider>
          <ProfileProvider>
            <App />
          </ProfileProvider>
        </PaymentProvider>
      </WalletProvider>
    </I18nProvider>
  </React.StrictMode>
);
