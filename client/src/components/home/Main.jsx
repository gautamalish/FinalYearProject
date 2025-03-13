import React from "react";
import electrician from "../../assets/electrician.avif";
const Main = () => {
  return (
    <div className="ml-4 mt-2">
      <h1 className="font-medium text-2xl">Services</h1>
      <div className="flex gap-8 flex-wrap m-auto w-11/12 mainDiv justify-center">
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
        <div className="mt-2 w-56 text-center">
          <img
            src={electrician}
            alt="Electrician"
            className="w-56 rounded-md"
          />
          <p className="text-xl">Electricity</p>
        </div>
      </div>
    </div>
  );
};

export default Main;
