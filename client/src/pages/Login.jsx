import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function Login() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
email: "",
password: "",
});

const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};

const handleSubmit = async (e) => {
e.preventDefault();


try {
  const response = await axios.post(
    "http://localhost:5000/api/auth/login",
    formData
  );

  localStorage.setItem("token", response.data.token);
  localStorage.setItem(
    "user",
    JSON.stringify(response.data.user)
  );

  toast.success("Login successful!");
  navigate("/");
} catch (error) {
  toast.error(
    error.response?.data?.message || "Login failed"
  );
}


};

return ( <div className="flex min-h-screen items-center justify-center bg-slate-100"> <form
     onSubmit={handleSubmit}
     className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
   > <h2 className="mb-6 text-center text-3xl font-bold">
Login </h2>


    <input
      type="email"
      name="email"
      placeholder="Email"
      value={formData.email}
      onChange={handleChange}
      className="mb-4 w-full rounded border p-3"
      required
    />

    <input
      type="password"
      name="password"
      placeholder="Password"
      value={formData.password}
      onChange={handleChange}
      className="mb-4 w-full rounded border p-3"
      required
    />

    <button
      type="submit"
      className="w-full rounded bg-blue-600 p-3 text-white hover:bg-blue-700"
    >
      Login
    </button>

    <p className="mt-4 text-center">
      Don't have an account?{" "}
      <Link to="/register" className="text-blue-600">
        Register
      </Link>
    </p>
  </form>
</div>


);
}

export default Login;
