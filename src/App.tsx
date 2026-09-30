import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { NotifyProvider } from "@/components/common/Notify";
import { I18nProvider } from "@/i18n/I18nProvider";
import { DemoStoreProvider } from "@/store/DemoStore";
import { Landing } from "@/pages/Landing";
import { Login } from "@/pages/Login";
import { Credits, NotFound } from "@/pages/Credits";
import { BuyerOverview, Catalog, LotDetail } from "@/pages/buyer/Buyer";
import { MyLots, PublishLot, SellerOverview } from "@/pages/seller/Seller";
import { Certificates, Farms, OwnerOverview, RegisterFarm, Samples } from "@/pages/owner/Owner";
import { CarrierOrders } from "@/pages/carrier/Carrier";
import { AdminCertificates, AdminCommissions, AdminDisputes, AdminOverview, AdminUsers } from "@/pages/admin/Admin";
import { TechAudit, TechOverview } from "@/pages/tech/Tech";
import { NegotiationDetail, NegotiationList } from "@/pages/shared/Negotiations";
import { TransactionDetail, TransactionList } from "@/pages/shared/Transactions";

/**
 * HashRouter: la demo es un sitio estático (S3 + CloudFront más adelante) y no
 * necesita reglas de reescritura en el servidor.
 */
export default function App() {
  return (
    <I18nProvider>
      <DemoStoreProvider>
        <NotifyProvider>
          <HashRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<Landing />} />
                <Route path="ingresar" element={<Login />} />
                <Route path="creditos" element={<Credits />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              <Route path="buyer" element={<AppLayout role="buyer" />}>
                <Route index element={<BuyerOverview />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="catalog/:lotId" element={<LotDetail />} />
                <Route path="negotiations" element={<NegotiationList role="buyer" />} />
                <Route path="negotiations/:id" element={<NegotiationDetail role="buyer" />} />
                <Route path="purchases" element={<TransactionList role="buyer" />} />
                <Route path="transactions/:id" element={<TransactionDetail role="buyer" />} />
              </Route>

              <Route path="seller" element={<AppLayout role="seller" />}>
                <Route index element={<SellerOverview />} />
                <Route path="publish" element={<PublishLot />} />
                <Route path="lots" element={<MyLots />} />
                <Route path="negotiations" element={<NegotiationList role="seller" />} />
                <Route path="negotiations/:id" element={<NegotiationDetail role="seller" />} />
                <Route path="sales" element={<TransactionList role="seller" />} />
                <Route path="transactions/:id" element={<TransactionDetail role="seller" />} />
              </Route>

              <Route path="owner" element={<AppLayout role="owner" />}>
                <Route index element={<OwnerOverview />} />
                <Route path="farms" element={<Farms />} />
                <Route path="farms/new" element={<RegisterFarm />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="samples" element={<Samples />} />
                <Route path="transactions/:id" element={<TransactionDetail role="owner" />} />
              </Route>

              <Route path="carrier" element={<AppLayout role="carrier" />}>
                <Route index element={<CarrierOrders />} />
                <Route path="transactions/:id" element={<TransactionDetail role="carrier" />} />
              </Route>

              <Route path="admin" element={<AppLayout role="admin" />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="certificates" element={<AdminCertificates />} />
                <Route path="disputes" element={<AdminDisputes />} />
                <Route path="commissions" element={<AdminCommissions />} />
                <Route path="transactions/:id" element={<TransactionDetail role="admin" />} />
              </Route>

              <Route path="tech" element={<AppLayout role="tech" />}>
                <Route index element={<TechOverview />} />
                <Route path="audit" element={<TechAudit />} />
              </Route>

              <Route path="app" element={<Navigate to="/ingresar" replace />} />
            </Routes>
          </HashRouter>
        </NotifyProvider>
      </DemoStoreProvider>
    </I18nProvider>
  );
}
