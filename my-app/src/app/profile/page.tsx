import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-cyan-300 mb-6">User Profile</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Name</label>
                <p className="text-white text-lg">{user.firstName} {user.lastName}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Email</label>
                <p className="text-white text-lg">{user.emailAddresses[0]?.emailAddress}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">User ID</label>
                <p className="text-gray-400 text-sm font-mono">{user.id}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-cyan-200 mb-2">Created At</label>
                <p className="text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-center">
              {user.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-cyan-400/50"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
