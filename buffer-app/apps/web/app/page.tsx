import { redirect } from 'next/navigation';

/** Root: redirect to splash / login. Dashboard auth guard handles the rest. */
export default function RootPage() {
  redirect('/login');
}
