import React from "react";

const SignIn = () => {
  return (
    <div className="m-auto w-4/5 border border-blue-500 flex items-center flex-col ">
      <div className="mt-14">
        <h1 className="text-4xl flex justify-center items-center">
          <span className="text-gold">Hire</span>Me
        </h1>
        <h3 className="text-2xl mt-10">Sign In to your Account</h3>
      </div>
      <div className="flex flex-col items-center gap-3 mt-3 w-full">
        <input
          type="text"
          placeholder="Email"
          className="border border-gray-500 rounded-2xl p-1.5 w-3/12"
        />
        <input
          type="text"
          placeholder="Password"
          className="border border-gray-500 rounded-2xl p-1.5 w-3/12"
        />
      </div>
      <div className="flex w-1/4 items-center justify-end mt-3">
        <p className="underline">Forgot Password?</p>
      </div>
      <div className="w-1/4 flex justify-end">
        <button className="bg-gold inline-block w-24 h-12 rounded-3xl"></button>
      </div>
    </div>
  );
};

export default SignIn;
