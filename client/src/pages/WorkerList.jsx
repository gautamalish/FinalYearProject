import React from "react";
import electrician from "../assets/electrician.avif";
const WorkerList = () => {
  return (
    <div>
      <h1>Electricians near you</h1>
      <div className="flex items-center">
        <div className="left w-1/4">
          <div className="border border-gray-300 flex gap-3 bg-gray-200 ">
            <img
              src={electrician}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-bold">Hannah Baker</h1>
              <p>Rating: 4.0</p>
              <p>Age: 31</p>
              <p>Price: Rs 800/hr</p>
              <p>Location : KTM</p>
            </div>
            <div>
              <button className="bg-gold">Hire</button>
            </div>
          </div>
        </div>
        <div className="right border border-gray-300 bg-gray-200 w-1/4 border border-red-500">
          <h1 className="text-xl font-bold">Filter</h1>
          <div className="flex flex-col">
            <div className="flex">
              <div>
                <label for="rating">Rating</label>
                <select name="rating" id="rating" className="w-32">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div>
                <label for="age">Age</label>
                <select name="age" id="age" className="w-32">
                  <option value="18 or above">18 or above</option>
                  <option value="30 or above">30 or above</option>
                  <option value="40 or above">40 or above</option>
                  <option value="50 or above">50 or above</option>
                </select>
              </div>
            </div>
            <div className="flex">
              <div>
                <label for="exp">Experience</label>
                <select name="exp" id="exp" className="w-32">
                  <option value="Beginner">Beginner</option>
                  <option value="1">1+ Year</option>
                  <option value="2">2+ Year</option>
                  <option value="4">4+ Year</option>
                  <option value="5">10+ Year</option>
                </select>
              </div>
              <div>
                <label for="price">Price:</label>
                <input type="number" id="price" name="price" className="w-32" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerList;
