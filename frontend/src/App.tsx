import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './layouts/AppLayout'
import { ClientsPage } from './pages/ClientsPage'
import { HomePage } from './pages/HomePage'
import { NewQuotePage } from './pages/NewQuotePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PaymentsPage } from './pages/PaymentsPage'
import { PaymentReceiptPage } from './pages/PaymentReceiptPage'
import { QuoteDetailPage } from './pages/QuoteDetailPage'
import { QuoteDocumentPage } from './pages/QuoteDocumentPage'
import { QuotesPage } from './pages/QuotesPage'
import { UpcomingDeparturesPage } from './pages/UpcomingDeparturesPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="cotizaciones" element={<QuotesPage />} />
        <Route path="cotizaciones/nueva" element={<NewQuotePage />} />
        <Route path="pagos" element={<PaymentsPage />} />
        <Route path="pagos/:id/comprobante" element={<PaymentReceiptPage />} />
        <Route path="cotizaciones/:id" element={<QuoteDetailPage />} />
        <Route path="cotizaciones/:id/documento" element={<QuoteDocumentPage />} />
        <Route path="salidas" element={<UpcomingDeparturesPage />} />
        <Route path="clientes" element={<ClientsPage />} />
        <Route path="404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  )
}

export default App
