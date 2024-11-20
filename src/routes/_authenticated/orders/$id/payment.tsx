import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/orders/$id/payment')({
  component: () => <div>Hello /_authenticated/orders/$id/payment!</div>,
})
