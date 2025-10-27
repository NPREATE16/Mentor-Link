import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom" // (useNavigate vẫn được dùng ở đây, nhưng không dùng trong onSubmit)
import * as z from "zod"
import useAuth from "../ContextAPI/UseAuth" 
import { Signup } from "../Utils/userUtil"

// (Schema... giữ nguyên)
const signupSchema = z
  .object({
    username: z.string()
      .min(1, "Vui lòng điền vào trường này.")
      .max(27, "Tên đăng nhập không được vượt quá  ký tự."),
    email: z
      .email("Địa chỉ email không hợp lệ. Vui lòng thử lại")
      .min(1, "Vui lòng điền vào trường này.")
      .max(255, "Trường này không thể vượt quá 255 ký tự."),
    password: z
      .string()
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự.")
      .max(255, "Trường này không thể vượt quá 255 ký tự.")
      .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 số")
      .regex(/[A-Z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết hoa.")
      .regex(/[a-z]/, "Mật khẩu phải có ít nhất 1 chữ cái viết thường.")
      .regex(/[\W_]/, "Mật khẩu phải có ít nhất 1 ký tự đặc biệt."),
    confirmedPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu của bạn."),
    role: z.enum(["tutor", "student"], {
      required_error: "Vui lòng chọn loại tài khoản.",
      invalid_type_error: "Vui lòng chọn loại tài khoản hợp lệ.",
    }),
  })
  .refine((data) => data.password === data.confirmedPassword, {
    message: "Mật khẩu xác nhận không khớp.",
    path: ["confirmedPassword"],
  })

export default function SignUp() {
  const [serverMessage, setServerMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Mặc dù useNavigate có thể không dùng, nhưng để an toàn cứ giữ lại
  //const navigate = useNavigate() 
  

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
  })

  const selectedrole = watch("role")
  const { signIn } = useAuth()

  const onSubmit = async (data) => {
    console.log("data", data);
    try {
      const res = await Signup(data.username, data.email, data.password, data.role);
      console.log('res', res);

      if (res.errors && res.errors.length) {
        setServerMessage({ type: 'error', text: res.errors[0].message || 'Đăng ký không thành công.' });
        return;
      }

      const signup = res.data && res.data.signup;
      if (signup && signup.token) {
        setServerMessage({ type: 'success', text: 'Đăng ký thành công!' });
        signIn(signup.token);
      } else {
        setServerMessage({ type: 'error', text: 'Đăng ký không thành công.' });
      }
    } catch (err) {
      console.error('Signup error', err);
      setServerMessage({ type: 'error', text: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.' });
    }
  }

  return (
    // ... (Toàn bộ phần JSX của bạn giữ nguyên, nó không có lỗi)
    <div className="flex min-h-screen bg-white">
      {/* (Phần code bên trái màu đen) */}
      <div className="hidden md:flex md:w-2/3 bg-black text-white flex-col justify-between p-12">
        <div>
          <h1 className="text-2xl font-bold">MentorLink</h1>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold leading-tight mb-8">
            "Học tập thông minh
            <br />
            phát triển không giới hạn"
          </p>
        </div>
        <div className="text-sm text-gray-400">
          <p>
            Môi trường học tập nâng động kết nối sinh viên, giảng viên và tư thức. Tạo động lực mỗi ngày để bạn vượt xa
            hơn trên hành trình học hỏi.
          </p>
        </div>
      </div>

      {/* (Phần code form bên phải) */}
      <div className="w-full md:w-1/3 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-center text-black">Đăng ký</h2>
            <p className="text-center text-gray-600 text-sm mt-2">Tạo tài khoản mới để bắt đầu</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* (Tất cả các input field và button giữ nguyên) */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-black mb-2">
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                maxLength={20}
                placeholder="Tên đăng nhập"
                {...register("username")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition ${errors.username ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.username && <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                maxLength={255}
                placeholder="example@email.com"
                {...register("email")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition ${errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            {/* (Password) */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  maxLength={255}
                  placeholder="•••••••"
                  {...register("password")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition ${errors.password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {/* (SVG Icon) */}
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    {showPassword ? (<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L12 12" />) : (<> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </>)}
                  </svg>
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            {/* (Confirmed Password) */}
            <div>
              <label htmlFor="confirmedPassword" className="block text-sm font-semibold text-black mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  id="confirmedPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  maxLength={255}
                  placeholder="•••••••"
                  {...register("confirmedPassword")}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition ${errors.confirmedPassword ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {/* (SVG Icon) */}
                  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">

                    {showConfirmPassword ? (<path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L12 12" />) : (<> <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /> </>)}
                  </svg>
                </button>
              </div>
              {errors.confirmedPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmedPassword.message}</p>
              )}
            </div>

            {/* (Role) */}
            <div>
              <label className="block text-sm font-semibold text-black mb-3">Loại tài khoản</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("role", "tutor", { shouldValidate: true })}
                  className={`py-2 px-4 rounded-lg border-2 font-medium transition ${selectedrole === "tutor" ? "border-black bg-gray-100 text-black" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}
                >
                  Tutor
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "student", { shouldValidate: true })}
                  className={`py-2 px-4 rounded-lg border-2 font-medium transition ${selectedrole === "student" ? "border-black bg-gray-100 text-black" : "border-gray-300 text-gray-700 hover:border-gray-400"}`}
                >
                  Sinh viên
                </button>
              </div>
              <input type="hidden" {...register("role")} />
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
            </div>

            {/* (Server Message) */}
            {serverMessage && (
              <div
                className={`p-3 rounded-lg text-sm ${serverMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                role="alert"
              >
                {serverMessage.text}
              </div>
            )}

            {/* (Submit Button) */}
            <div>
              <button
                type="submit"
                className="w-full bg-black text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-800 transition"
              >
                Tạo tài khoản
              </button>
            </div>
            <p className="text-center text-sm text-gray-600">
              Đã có tài khoản?{" "}
              <Link to="/SignInPage" className="font-semibold text-black hover:text-gray-700">
                Đăng nhập ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}