import TitleCard from '@/components/page-components/title'
import { createFileRoute } from '@tanstack/react-router'
import PasswordForm from './_forms/_password-form'
import PinForm from './_forms/_pin-form'

export const Route = createFileRoute('/_authenticated/user/security/')({
  component: () => (
    <main className="grid gap-8">
      <TitleCard
        title="Security settings"
        description="Make changes to account security settings"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <PasswordForm />
        <PinForm />
      </div>
    </main>
  ),
})
