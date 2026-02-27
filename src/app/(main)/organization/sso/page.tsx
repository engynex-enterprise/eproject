import { redirect } from 'next/navigation';

export default function SsoPage() {
  redirect('/organization/security');
}
