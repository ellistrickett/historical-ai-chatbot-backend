import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Sparkles } from 'lucide-react';

function AuthPage({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {isLogin ? (
            <LoginForm onLogin={onLogin} />
          ) : (
            <SignupForm onSignup={onSignup} />
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <span className="font-semibold text-blue-600">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <span className="font-semibold text-blue-600">Sign in</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
