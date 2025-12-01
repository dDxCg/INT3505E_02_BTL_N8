import { Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppLayout } from "@/layouts/AppLayout"
import { Dashboard } from "@/pages/Dashboard"
import { Orders } from "@/pages/orders"
import { Kitchen } from "@/pages/Kitchen"
import { Dishes } from "@/pages/Dishes"
import { Settings } from "@/pages/Settings"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="resources/dishes" element={<Dishes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
