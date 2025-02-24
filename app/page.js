import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard'); // Redirect to dashboard on load
}