import { Routes, Route } from 'react-router-dom'
import { WizardShell } from '@/features/meal-builder/components/WizardShell'
import { AdminGate } from '@/features/admin/components/AdminGate'
import { PrivacyPolicy } from '@/features/legal/components/PrivacyPolicy'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WizardShell />} />
      <Route path="/admin" element={<AdminGate />} />
      <Route path="/privacidade" element={<PrivacyPolicy />} />
    </Routes>
  )
}
