import { Routes, Route } from 'react-router-dom'
import { WizardShell } from '@/features/meal-builder/components/WizardShell'
import { AdminGate } from '@/features/admin/components/AdminGate'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WizardShell />} />
      <Route path="/admin" element={<AdminGate />} />
    </Routes>
  )
}
