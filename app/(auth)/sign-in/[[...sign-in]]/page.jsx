import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <section className="bg-gray-900 min-h-screen flex items-center justify-center">
      
      <div className="lg:grid lg:grid-cols-12 w-full max-w-6xl shadow-xl rounded-2xl overflow-hidden">
        {/* Left Section (Image & Welcome Message) */}
        <section className="relative hidden lg:block lg:col-span-5 xl:col-span-6">
          <img
            src="https://images.unsplash.com/photo-1617195737496-bc30194e3a19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
            alt="Interview AI"
            className="absolute inset-0 h-full w-full object-cover brightness-75"
          />
          <div className="relative z-10 p-12 text-white">
            <h2 className="text-4xl font-extrabold">Welcome to Interview Elevate 🤖🎤</h2>
            <p className="mt-4 text-lg">
              AI-driven mock interview platform designed to help users improve their interview skills with 
              real-time AI feedback, speech-to-text analysis, and audio-video recording.
            </p>
            <ul className="mt-4 space-y-2">
              <li>✅ AI-Powered Mock Interviews</li>
              <li>✅ Real-Time AI Feedback</li>
              <li>✅ Speech & Video Analysis</li>
              <li>✅ Personalized Dashboard</li>
              <li>✅ Seamless Google & GitHub Sign-In</li>
            </ul>
          </div>
        </section>

        {/* Right Section (Login Form) */}
        <main className="lg:col-span-7 xl:col-span-6 bg-gray-100 flex flex-col items-center justify-center p-8">
          <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 className="text-3xl font-semibold text-gray-900">Sign In</h1>
            <p className="text-gray-600 mt-2">Start practicing with AI today! 🚀</p>
            <div className="mt-6">
              <SignIn />
            </div>
          </div>
        </main>
      </div>
    </section>
    
  );
}
