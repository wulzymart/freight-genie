import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/trips/')({
  component: () => <div>Hello /_authenticated/trips/!</div>,
})
