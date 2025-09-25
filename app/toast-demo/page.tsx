import { ToastExample } from "@/components/toast-example"

export default function ToastDemoPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Toast Notification Examples</h1>
      <p className="mb-6">Click the buttons below to see different types of toast notifications.</p>
      <ToastExample />
    </div>
  )
}
