import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            card: "bg-slate-800 border border-cyan-400/30",
            headerTitle: "text-cyan-300",
            headerSubtitle: "text-blue-200",
            formFieldInput: "bg-slate-700 border-cyan-400/30 text-white",
            formFieldLabel: "text-cyan-200",
            footerActionLink: "text-cyan-400 hover:text-cyan-300"
          }
        }}
      />
    </div>
  );
}
