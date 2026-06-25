import LoginForm from "@/components/login/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-slate-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Desa Digital</h1>
          <p className="text-sm text-slate-500 mt-1">Sistem Informasi & Layanan Petugas Desa</p>
        </div>
        
        <LoginForm />
        
      </div>
    </div>
  );
}