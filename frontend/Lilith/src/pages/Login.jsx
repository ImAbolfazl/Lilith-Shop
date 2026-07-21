import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { GiGamepad } from "react-icons/gi";
import { FaPhoneAlt } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { useNavigate } from "react-router";

const Field = ({ label, name, value, onChange, placeholder, type = "text", icon }) => (
  <div className="mb-4">
    <label className="text-textSecondary text-sm mb-1 block">{label}</label>

    <div className="flex items-center bg-bgSecondary border border-white/10 rounded-xl px-3 py-2 shadow-[0_0_10px_rgba(255,91,170,0.15)]">
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

const Login = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState("password"); // password | sms | verify
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  const [form, setForm] = useState({
    number: "",
    password: "",
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- LOGIN WITH PASSWORD ----------------
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        form
      );

      if (res.status === 200 && res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      } else {
        setError(res.data.data || "شماره یا رمز اشتباه است");
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

  // ---------------- REQUEST SMS LOGIN ----------------
  const handleSMSLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/loginWithNumber`,
        { number: form.number }
      );

      if (res.status === 200 && res.data.status === "success") {
        setMessage("کد پیامکی ارسال شد. لطفاً کد را وارد کن.");
        setStep("verify");
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

  // ---------------- VERIFY SMS LOGIN ----------------
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/verifyLogin`,
        {
          number: form.number,
          code,
        }
      );

      if (res.status === 201 && res.data.status === "success") {
        localStorage.setItem("token", res.data.token);
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
        className="relative w-full max-w-md bg-cardPrimary rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.45)] overflow-hidden border border-white/5"
      >
        {/* نوار نئونی حرفه‌ای */}
        <motion.div
          initial={{ x: "-120%" }}
          animate={{ x: "120%" }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "linear" }}
          className="absolute top-0 left-0 w-1/2 h-[4px] bg-gradient-to-r from-accentPrimary to-accentSecondary blur-[2px]"
        />

        {/* Glow دور کارت */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl border border-accentPrimary/20 shadow-[0_0_25px_var(--color-accent-primary)]"></div>

        {/* هدر */}
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
              ورود به لیلیث
            </h2>
            <p className="text-textSecondary text-sm">
              دنیای گیمینگ همین‌جاست.
            </p>
          </div>
        </div>

        {/* پیام‌ها */}
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

        {/* فرم‌ها */}
        <AnimatePresence mode="wait">
          {step === "password" && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handlePasswordLogin}
            >
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
                placeholder="رمز عبور"
                type="password"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white transition-all bg-gradient-to-r from-accentPrimary to-accentSecondary shadow-[0_0_15px_var(--color-accent-primary)] ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_var(--color-accent-secondary)]"
                }`}
              >
                {loading ? "در حال ورود..." : "ورود"}
              </motion.button>

              <button
                type="button"
                onClick={() => setStep("sms")}
                className="mt-3 w-full text-center text-accentSecondary text-sm underline hover:text-accentPrimary transition"
              >
                ورود با کد پیامکی
              </button>

              <div className="text-center mt-4 text-textSecondary text-sm">
                حساب نداری؟
                <button
                  onClick={() => navigate("/register")}
                  className="text-accentSecondary underline mr-2 hover:text-accentPrimary transition"
                >
                  ثبت‌نام کن
                </button>
              </div>
            </motion.form>
          )}

          {step === "sms" && (
            <motion.form
              key="sms"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onSubmit={handleSMSLogin}
            >
              <Field
                label="شماره موبایل"
                name="number"
                value={form.number}
                onChange={handleChange}
                icon={<FaPhoneAlt />}
                placeholder="09123456789"
              />

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white transition-all bg-gradient-to-r from-accentSecondary to-accentPrimary shadow-[0_0_15px_var(--color-accent-secondary)] ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_var(--color-accent-primary)]"
                }`}
              >
                {loading ? "در حال ارسال..." : "ارسال کد پیامکی"}
              </motion.button>

              <button
                type="button"
                onClick={() => setStep("password")}
                className="mt-3 w-full text-center text-textSecondary text-sm underline hover:text-accentSecondary transition"
              >
                برگشت
              </button>
            </motion.form>
          )}

          {step === "verify" && (
            <motion.form
              key="verify"
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white transition-all bg-gradient-to-r from-accentPrimary to-accentSecondary shadow-[0_0_15px_var(--color-accent-primary)] ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:shadow-[0_0_25px_var(--color-accent-secondary)]"
                }`}
              >
                {loading ? "در حال تأیید..." : "ورود"}
              </motion.button>

              <button
                type="button"
                onClick={() => setStep("sms")}
                className="mt-3 w-full text-center text-textSecondary text-sm underline hover:text-accentSecondary transition"
              >
                برگشت
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
