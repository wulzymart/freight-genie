import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/routes/')({
  component: () => <div>Hello /_authenticated/routes/!</div>,
})
