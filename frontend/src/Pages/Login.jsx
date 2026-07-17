import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import userApi from "../api/userApi";
import MessageModal from "../utils/MessageModal";
import colors from "../utils/Color";
import InputField from "../UI/InputField";

const Login = () => {
  const navigate = useNavigate();
  const logoUrl =
    "https://raw.githubusercontent.com/Abhishekthakre2001/The_Wonder_TezzDimag_Abacus_Claasess/refs/heads/main/frontend/public/Maharashtra%20Abacus%20Association.jpg";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    title: "",
    message: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await userApi.login({ username, password });

      console.log("login user", res.data.accessToken);

      const { token, user } = res.data;

      // clear old data
      localStorage.clear();
      sessionStorage.clear();

      if (rememberMe) {
        // ✅ persistent login
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isremeber", "true");
      } else {
        // ✅ session-only login
        sessionStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("isremeber", "false");
      }

      // role based redirect AFTER login
      if (user.usertype.toLowerCase() === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/dashboard");
      }

      localStorage.setItem("token", res.data.accessToken);
      sessionStorage.setItem("token", res.data.accessToken);


    } catch (err) {
      setModal({
        open: true,
        type: "error",
        title: "Login Failed",
        message: err?.response?.data?.message || "Invalid username or password",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <MessageModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />

      <div className="h-screen flex overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${colors.background.pageGradientFrom}, ${colors.background.pageGradientTo})`
        }}
      >
        {/* Floating animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* LEFT SIDE - WELCOME */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-y-auto z-10 overflow-hidden" style={{ color: colors.text.gray800 }}>
          <div className="flex flex-col justify-center items-start w-full px-8 lg:px-12 xl:px-16 py-8 lg:py-12">
            <div className="max-w-lg mx-auto w-full">
              <div className="flex items-center gap-3 mb-3 lg:mb-4">
                {/* <Sparkles className="text-yellow-500 animate-pulse" size={32} /> */}
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight" style={{ color: colors.text.gray800 }}>
                  Welcome to
                </h1>
              </div>
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 lg:mb-4 leading-tight">
                <span className="bg-gradient-to-r bg-clip-text text-transparent animate-gradient" style={{ backgroundImage: `linear-gradient(90deg, ${colors.primary.blue600}, ${colors.primary.blue500}, ${colors.primary.blue700}, ${colors.primary.blue600})`, backgroundSize: '200% auto' }}>
                  Maharashtra Abacus Association
                </span>
              </h1>

              <p className="text-base lg:text-lg mb-8 lg:mb-12" style={{ color: colors.text.gray500 }}>
                A virtual way productive journey starts from here.
              </p>

              {/* Illustration */}
              <div className="mb-8 lg:mb-12 flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full opacity-75 group-hover:opacity-100 blur-md transition-opacity duration-300 animate-spin-slow"></div>

                  <div
                    className="relative w-56 h-56 lg:w-72 lg:h-72 xl:w-80 xl:h-80 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border-4 border-white/50 hover:scale-105 transition-transform duration-500 overflow-hidden bg-white"
                  >
                    <img
                      src={logoUrl}
                      alt="Maharashtra Abacus Association"
                      className="w-60 h-40  "
                    />
                  </div>

                  <div className="absolute -top-3 -right-3 lg:-top-4 lg:-right-4 w-14 h-14 lg:w-20 lg:h-20 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-70 animate-pulse shadow-lg"></div>
                  <div className="absolute -bottom-3 -left-3 lg:-bottom-4 lg:-left-4 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-300 to-purple-400 rounded-full opacity-70 animate-pulse shadow-lg animation-delay-1000"></div>
                  <div className="absolute top-1/2 -right-6 lg:-right-8 w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-300 to-cyan-400 rounded-full opacity-60 animate-bounce shadow-lg animation-delay-2000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-6 sm:mb-8 text-center flex flex-col items-center">
              <img
                src={logoUrl}
                alt="Maharashtra Abacus Association"
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full shadow-lg border-4 border-white mb-3"
              />
              <h1
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1"
                style={{ color: colors.text.gray800 }}
              >
                Welcome to
              </h1>
              <h2
                className="text-lg sm:text-xl md:text-2xl font-semibold"
                style={{ color: colors.primary.blue600 }}
              >
                Maharashtra Abacus Association
              </h2>
            </div>

            <div className="bg-white/90 backdrop-blur-2xl p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] border border-white/60 hover:shadow-[0_25px_80px_-15px_rgba(0,0,0,0.35)] transition-shadow duration-300 relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 pointer-events-none"></div>

              <div className="mb-6 sm:mb-8 relative z-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2" style={{ color: colors.text.gray800 }}>
                  Sign in to Continue
                </h2>
                <p className="text-sm ml-1" style={{ color: colors.text.gray500 }}>
                  Enter your credentials to access your account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
                {/* Email/Username */}
                <InputField
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />

                {/* Password */}
                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  icon={Lock}
                  required
                />

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs sm:text-sm flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group" style={{ color: colors.text.gray600 }}>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      />
                    </div>
                    <span className="transition mb-2">Remember Me</span>
                  </label>

                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative w-full text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_15px_50px_-10px_rgba(37,99,235,0.8)] transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
                  style={{ background: `linear-gradient(135deg, ${colors.primary.blue600}, ${colors.primary.blue700}, ${colors.primary.blue600})`, backgroundSize: '200% 100%' }}
                >
                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-out"></div>

                  <span className="relative z-10">
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign in
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              {/* <div className="relative my-5 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white" style={{ color: colors.text.gray500 }}>or continue with</span>
                </div>
              </div> */}




              {/* Footer */}
              <div className="mt-5 sm:mt-6 text-center relative z-10">
                <p className="text-xs sm:text-sm" style={{ color: colors.text.gray600 }}>
                  Maintain And Developed By
                  <a href="https://deveraa.com/" className="font-semibold transition ml-2" style={{ color: colors.primary.blue600 }}>
                    DevEraa
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Login;