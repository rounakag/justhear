import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button/button";
import { useAuth } from "@/hooks/useAuth.tsx";
import { TermsAndConditions } from "../TermsAndConditions";

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  // email: z
  //   .string()
  //   .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/\d/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { signUp, isLoading } = useAuth();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const username = watch("username");

  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) return;
    
    setUsernameStatus('checking');
    
    // Simulate API call - replace with actual API
    setTimeout(() => {
      const takenUsernames = ['admin', 'user', 'test', 'guest']; // Mock taken usernames
      setUsernameStatus(takenUsernames.includes(username.toLowerCase()) ? 'taken' : 'available');
    }, 500);
  };

  React.useEffect(() => {
    if (username && username.length >= 3) {
      const timer = setTimeout(() => checkUsernameAvailability(username), 300);
      return () => clearTimeout(timer);
    } else {
      setUsernameStatus(null);
    }
  }, [username]);

  const [signupError, setSignupError] = useState<string | null>(null);

  const onSubmit = async (data: SignUpFormData) => {
    if (usernameStatus !== 'available') return;
    
    if (!termsAccepted) {
      setShowTerms(true);
      return;
    }
    
    setSignupError(null);
    const success = await signUp(data.username, `${data.username}@anonymous.com`, data.password);
    if (success) {
      onSuccess();
    } else {
      setSignupError('Signup failed. Please try again.');
    }
  };

  const handleAcceptTerms = () => {
    setTermsAccepted(true);
    setShowTerms(false);
    // Re-submit the form
    const formData = watch();
    if (usernameStatus === 'available') {
      onSubmit(formData);
    }
  };

  const getUsernameStatusColor = () => {
    switch (usernameStatus) {
      case 'available': return 'text-green-600';
      case 'taken': return 'text-red-600';
      case 'checking': return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case 'available': return '✅ Username available';
      case 'taken': return '❌ Username already taken';
      case 'checking': return '⏳ Checking availability...';
      default: return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username *
        </label>
        <input
          {...register("username")}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter your unique username"
        />
        {errors.username && (
          <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
        )}
        {usernameStatus && (
          <p className={`text-sm mt-1 ${getUsernameStatusColor()}`}>
            {getUsernameStatusText()}
          </p>
        )}
      </div>



      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password *
        </label>
        <input
          {...register("password")}
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Create a strong password"
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
        )}
        <div className="mt-2 text-xs text-gray-500">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>At least 8 characters</li>
            <li>One uppercase & lowercase letter</li>
            <li>One number & special character</li>
          </ul>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password *
        </label>
        <input
          {...register("confirmPassword")}
          type="password"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Core Guidelines - Visible to All Users */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <h4 className="font-semibold text-blue-800 flex items-center">
          💬 Important Guidelines
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <div className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Share feelings, emotions, and life experiences</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">✅</span>
            <span>Seek validation and emotional support</span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">❌</span>
            <span><strong>No sexual content, explicit language, or inappropriate topics</strong></span>
          </div>
          <div className="flex items-start">
            <span className="mr-2">❌</span>
            <span><strong>No harassment, threats, or abusive behavior</strong></span>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <p className="text-red-700 text-xs font-medium">
            ⚠️ <strong>Inappropriate conversations will result in immediate call termination.</strong>
          </p>
        </div>
      </div>

      {/* Error Message */}
      {signupError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{signupError}</p>
        </div>
      )}

      {/* Terms & Conditions Checkbox */}
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="terms"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{' '}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
          >
            full Terms & Conditions
          </button>
          {' '}and understand this is for emotional support only
        </label>
      </div>

      <Button
        type="submit"
        disabled={isLoading || usernameStatus !== 'available' || !termsAccepted}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        {isLoading ? 'Creating Account...' : 'Create Anonymous Account'}
      </Button>

      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsAndConditions
        open={showTerms}
        onOpenChange={setShowTerms}
        onAccept={handleAcceptTerms}
        title="Terms & Conditions - Account Creation"
      />
    </form>
  );
}
