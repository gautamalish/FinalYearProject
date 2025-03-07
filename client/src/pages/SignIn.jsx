import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import googleIcon from "../assets/googleIcon.png";
import "firebase/auth";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase-config";
const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
  const loginWithGoogle = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("User signed in: ", result.user);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error during sign-in ", error.message);
      });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("User Logged In Successfully");
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  }
  return (
    <div className="m-auto w-4/5 border border-blue-500 flex items-center flex-col ">
      <div className="mt-14">
        <h1 className="text-4xl flex justify-center items-center">
          <span className="text-gold">Hire</span>Me
        </h1>
        <h3 className="text-2xl mt-10">Sign In to your Account</h3>
      </div>
      <form className="w-full">
        <div className="flex flex-col items-center gap-3 mt-3 w-full">
          <input
            type="text"
            placeholder="Email"
            className="border border-gray-500 rounded-2xl p-1.5 w-3/12 max-md:w-full"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <input
            type="text"
            placeholder="Password"
            className="border border-gray-500 rounded-2xl p-1.5 w-3/12 max-md:w-full"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
          />
        </div>
      </form>
      <div className="max-md:w-1/2 w-1/4 items-center justify-end mt-3 border border-blue-700 relative flex ml-auto">
        <p className="underline cursor-pointer border border-red-500">
          Forgot Password?
        </p>
      </div>
      <div className="max-md:w-full w-1/4 flex justify-end mt-3">
        <button
          className="bg-gold w-24 h-12 rounded-3xl flex justify-center items-center"
          onClick={handleSubmit}
        >
          <FaArrowRight size={30} color="white" />
        </button>
      </div>
      <div className="mt-3">
        <p className="flex justify-center">Or</p>
        <button
          className="border border-gray-400 rounded-lg flex items-center gap-1 p-2 m-auto mt-3"
          onClick={loginWithGoogle}
        >
          <img src={googleIcon} alt="GoogleImage" width="24px" />
          Sign In With Google
        </button>
        <p className="mt-3 ">
          Don't have an account?
          <span
            className="underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            {" "}
            Create
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
