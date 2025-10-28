import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import * as z from "zod"
import useAuth from "../ContextAPI/UseAuth"
import { Signin } from "../Utils/userUtil"

const signinSchema = z.object({
  email: z
    .email("Invalid email address. Please try again")
    .min(1, "Please fill in the field.")
    .max(255, "This field cannot exceed 255 characters."),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters.")
    .max(255, "This field cannot exceed 255 characters.")
    .regex(/[0-9]/, "Password must have at least 1 number")
    .regex(/[A-Z]/, "Password must have at least 1 capital letter.")
    .regex(/[a-z]/, "Password must have at least 1 non-capital letter.")
    .regex(/[\W_]/, "Password must have at least 1 special letter."),
})

export default function SignIn() {
  const [serverMsg, setServerMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signinSchema),
    mode: "onChange",
  })
  const { signIn } = useAuth()
  const onSubmit = async (data) => {
    try {
      const res = await Signin(data.email, data.password);

      if (res.errors && res.errors.length) {
        setServerMessage({ type: 'error', text: res.errors[0].message || 'Đăng nhập không thành công.' });
        return;
      }

      const signin = res.data && res.data.signin;
      if (signin && signin.token) {
        setServerMessage({ type: 'success', text: 'Đăng nhập thành công!' });
        signIn(signin.token);
      } else {
        setServerMessage({ type: 'error', text: 'Đăng nhập không thành công.' });
      }
    } catch (err) {
      console.error('Signup error', err);
      setServerMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
    }
  }

  return (
    <div className="font-poppins flex flex-col min-h-screen">
      <div className="flex-grow flex flex-col md:flex-row">
        <div className="w-full md:w-2/3 bg-black relative min-h-screen flex flex-col justify-between p-8 sm:p-12">
          {/* Logo */}
          <div className="text-white text-2xl font-bold">MentorLink</div>

          {/* Center quote */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-white text-3xl sm:text-4xl font-bold leading-tight">
                "Học tập thông minh
                <br />
                phát triển không giới hạn"
              </p>
            </div>
          </div>

          {/* Bottom description */}
          <div className="text-gray-400 text-sm leading-relaxed">
            <p>
              Môi trường học tập nâng động kết nối sinh viên, giảng viên và tư thức. Tạo động lực mỗi ngày để bạn vượt
              xa hơn trên hành trình học hỏi.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/3 flex items-start justify-center p-4 py-16 bg-white">
          <div className="w-full max-w-md mx-auto p-8">
            <h2 className="text-3xl font-bold text-center text-black">Đăng nhập</h2>
            <p className="text-center text-gray-600 text-sm mt-2">Nhập thông tin tài khoản để tiếp tục</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              {serverMsg && (
                <div
                  className={`p-3 text-sm rounded-lg ${serverMsg.type === "success" ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                    }`}
                  role="alert"
                >
                  {serverMsg.text}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="email"
                    maxLength={255}
                    {...register("email")}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm ${errors.email ? "border-red-500" : "border-gray-300"}`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu
                  </label>
                  <a href="#" className="text-xs text-gray-600 hover:text-gray-800">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    maxLength={255}
                    {...register("password")}
                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm ${errors.password ? "border-red-500" : "border-gray-300"}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L12 12"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  Đăng nhập tài khoản
                </button>
              </div>

              <p className="mt-4 text-center text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link to="/SignUpPage" className="font-medium text-black hover:text-gray-700">
                  Đăng ký ngay
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}
