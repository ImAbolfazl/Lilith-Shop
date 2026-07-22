import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { GiGamepad } from "react-icons/gi";
import { FaUser, FaPhoneAlt } from "react-icons/fa";
import { MdEmail, MdPassword } from "react-icons/md";
import { useNavigate } from "react-router";
import { UserContext } from "../App";

const Field = ({ label, name, value, onChange, placeholder, type = "text", icon }) => (
  <div className="mb-4">
    <label className="text-textSecondary text-sm mb-1 block">{label}</label>

    <div className="flex items-center bg-bgSecondary rounded-xl px-3 py-2 shadow-[0_0_10px_rgba(255,91,170,0.15)]">
      {icon && <span className="text-textSecondary ml-2">{icon}</span>}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-textPrimary text-sm"
      />
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const {token, setToken} = useContext(UserContext)

  useEffect(() => {
    if(token){
        navigate("/")
    }
  }, [token])

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    number: "",
    password: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/register`,
        form
      );

      if (res.status === 200 && res.data.status === "success") {
        setMessage("کد تأیید برایت ارسال شد. لطفاً کد را وارد کن.");
        setStep(2);
      } else {
        setError(res.data.data || "خطایی رخ داد");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.data || "مشکلی در سرور پیش آمد");
      } else {
        setError("اتصال برقرار نشد");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verifyRegister`,
        {
          number: form.number,
          code,
        }
      );

      if (res.status === 201 && res.data.status === "success") {
        setMessage("ثبت‌نام با موفقیت انجام شد! 🎮");
        setToken(res.data.token)
        navigate("/");
      } else {
        setError(res.data.data || "کد اشتباه است یا زمان تمام شده");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.data || "مشکلی در سرور پیش آمد");
      } else {
        setError("اتصال برقرار نشد");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPrimary px-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md bg-cardPrimary rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.45)] overflow-hidden"
      >
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
          className="absolute top-0 left-0 w-1/2 h-1 bg-leaner-to-r from-accentPrimary to-accentSecondary blur-[2px]"
        />

        <div className="absolute inset-0 pointer-events-none rounded-2xl  shadow-[0_0_25px_var(--color-accent-primary)]"></div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            initial={{ rotate: -15, scale: 0.7 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="drop-shadow-[0_0_10px_var(--color-accent-primary)]"
          >
            <GiGamepad className="text-accentPrimary" size={48} />
          </motion.div>

          <div className="text-center">
            <h2 className="text-textPrimary text-2xl font-bold drop-shadow-[0_0_6px_var(--color-accent-secondary)]">
              ثبت‌نام در لیلیث
            </h2>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full p-3 mb-3 rounded-lg bg-accentSecondary/20 text-accentSecondary text-sm text-right shadow-[0_0_10px_var(--color-accent-secondary)]"
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full p-3 mb-3 rounded-lg bg-accentPrimary/20 text-accentPrimary text-sm text-right shadow-[0_0_10px_var(--color-accent-primary)]"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleRegister}
            >
              <Field
                label="نام (به فارسی)"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                icon={<FaUser />}
                placeholder="نام"
              />

              <Field
                label="نام خانوادگی (به فارسی)"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                icon={<FaUser />}
                placeholder="نام خانوادگی"
              />

              <Field
                label="ایمیل"
                name="email"
                value={form.email}
                onChange={handleChange}
                icon={<MdEmail />}
                placeholder="you@example.com"
                type="email"
              />

              <Field
                label="شماره موبایل"
                name="number"
                value={form.number}
                onChange={handleChange}
                icon={<FaPhoneAlt />}
                placeholder="09123456789"
              />

              <Field
                label="رمز عبور"
                name="password"
                value={form.password}
                onChange={handleChange}
                icon={<MdPassword />}
                placeholder="بین ۶ تا ۱۲ کاراکتر"
                type="password"
              />

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-text-primary transition-all bg-leaner-to-r from-accentPrimary to-accentSecondary shadow-[0_0_15px_var(--color-accent-primary)] cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_var(--color-accent-secondary)]"
                }`}
              >
                {loading ? "در حال ارسال..." : "ارسال کد تأیید"}
              </motion.button>

              <div className="text-center mt-4 text-textSecondary text-sm">
                حساب داری؟
                <button
                  onClick={() => navigate("/login")}
                  className="text-accentSecondary underline mr-2 hover:text-accentPrimary transition"
                >
                  وارد شو
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleVerify}
            >
              <p className="text-textSecondary text-sm mb-2 text-right">
                کد پیامکی ارسال‌شده به{" "}
                <span className="text-accentSecondary">{form.number}</span> را وارد کن.
              </p>

              <Field
                label="کد تأیید"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="مثلاً: 12345"
              />

              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white transition-all bg-leaner-to-r from-accentSecondary to-accentPrimary shadow-[0_0_15px_var(--color-accent-secondary)] cursor-pointer ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_var(--color-accent-primary)]"
                }`}
              >
                {loading ? "در حال تأیید..." : "تکمیل ثبت‌نام"}
              </motion.button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-3 w-full text-center text-textSecondary text-sm underline hover:text-accentSecondary transition"
              >
                برگشت به مرحله قبل
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Register;
