import { FaPlus, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import SuccessMessage, { Count } from "../Count";
import { ErrorMessage } from "../ErrorMessage";
import Spinner from "../Spinner";
import { BiEdit } from "react-icons/bi";
import { Link } from "react-router-dom";

export const Attendance = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [todaysAttandance, setTodaysAttandance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingNumber, setLoadingNumber] = useState(false);
  const [AllUsers, setAllUsers] = useState([]);

  //Hide input state
  const [hide, setHide] = useState(false);

  // hide Error message
  const [closeError, setCloseError] = useState(false);

  const close = () => setCloseError(!closeError);

  //The add user btn
  const addUser = () => setHide(!hide);

  //phone number length
  const [phoneNumberLength, setPhoneNumberLength] = useState(0);

  //Error state
  const [Error, setError] = useState("");

  const [checkInput, setCheckInput] = useState({
    phonenumber: "",
    username: "",
    levelinschool: "",
    lodgename: "",
    courseofstudy: "",
    dcg: "",
    day: "",
    month: "",
    stateoforigin: "",
    gender: "",
    area: "",
    weeknumber: "",
  });

  const validateInput = async () => {
    if (checkInput.phonenumber === "" || checkInput.phonenumber.length < 11) {
      setError("Please input a valid  phonenumber");
      return;
    }

    if (checkInput.username === "") {
      setError("Input attandant name");
      return;
    }
    if (checkInput.levelinschool === "") {
      setError("Attendant level in school cannot be empty");
      return;
    }

    if (checkInput.lodgename === "") {
      setError("Input the name of attadendant lodge");
      return;
    }

    if (checkInput.courseofstudy === "") {
      setError("Course of study cannot be empty");
      return;
    }
    if (checkInput.dcg === "") {
      setError("Dcg center cannot be empty");
      return;
    }
    if (parseInt(checkInput.day, 10) > 31) {
      setError("Day of birth cannot be greater than 31");
      return;
    }
    if (checkInput.day === "" || checkInput.month === "") {
      if (parseInt(checkInput.day, 10) > 31) {
        setError("Day of birth cannot be greater than 31");
        return;
      }

      setError("please input the day and month of birth of the attandant");
      return;
    }
    if (checkInput.stateoforigin === "") {
      setError("State of origin field cannot be empty");
      return;
    }
    if (checkInput.gender === "") {
      setError("Please select attendant gender");
      return;
    }
    if (checkInput.area === "") {
      setError("Please input Area");
      return;
    }

    try {
      setLoading(true);
      const reqData = await fetch(
        "https://attendance-backend-rosy.vercel.app/submit",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkInput),
        }
      );
      const resData = await reqData.json();

      if (reqData.ok) {
        console.log(resData.message);
        setShowSuccess(true);
        setShowSuccessMessage(resData.message);
        setCheckInput({
          phonenumber: "",
          username: "",
          levelinschool: "",
          lodgename: "",
          courseofstudy: "",
          dcg: "",
          day: "",
          month: "",
          stateoforigin: "",
          gender: "",
          area: "",
        });
        setError("");
      } else {
        console.log(reqData);
        setError(
          typeof resData.message === "string"
            ? resData.message
            : JSON.stringify(resData.message)
        );
      }
    } catch (error) {
      console.log(error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentUsers = async () => {
    try {
      const response = await fetch("https://attendance-backend-rosy.vercel.app/currentusers");
      const result = await response.json();

      if (response.ok) {
        setTodaysAttandance(result);
      } else {
        // console.log(response);
      }
    } catch (e) {
      console.log(e.message);
    }
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);

      const response = await fetch(
        `https://attendance-backend-rosy.vercel.app/delete-users/${userId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (response.ok) {
        alert("User deleted successfully");
        setLoading(false);
        setTodaysAttandance((prev) =>
          prev.filter((user) => user._id !== userId)
        );

        console.log(todaysAttandance);
      } else {
        alert(result.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  //Get all users
  const handleGetAllUsers = async () => {
    try {
      const response = await fetch("https://attendance-backend-rosy.vercel.app/allUsers");
      const result = await response.json();

      if (response.ok) {
        setAllUsers(result);
        console.log(result);
      } else {
        console.log(response);
      }
    } catch (e) {
      console.log(
        "Error occurred while trying to get all users, trying again......"
      );
      setTimeout(() => {
        // handleGetAllUsers();
      }, 4000);
    }
  };

  const checkPhoneNumber = async () => {
    const checkUserByNumber = AllUsers.filter((el) =>
      el.phonenumber.includes(checkInput.phonenumber)
    );

    if (checkUserByNumber.length !== 0) {
      let userId = checkUserByNumber[0]._id;
      try {
        setLoadingNumber(true);
        const request = await fetch("https://attendance-backend-rosy.vercel.app/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userId,
            weeknumber: checkInput.weeknumber,
          }),
        });

        const resData = await request.json();

        if (request.ok) {
          console.log(resData.message);
          if (resData.message == "Attendant is now present for today") {
            setError(
              `${checkUserByNumber[0].username} is now present for today`
            );
            currentUsers()
          }
        } else {
          setLoadingNumber(false);
          console.log(resData.message);
          if (
            resData.message == "This Attendant is already present for today"
          ) {
            setError(
              `${checkUserByNumber[0].username} has already been marked present for today`
            );
            return;
          }
        }
      } catch (error) {
        setError(error.message);
        setLoadingNumber(false);
      } finally {
        setLoadingNumber(false);
      }

      return;
    } else {
      setError("Attendant do not exist in the DataBase");
    }
  };

  if (Error !== "") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Hide the success message
  const handleClose = () => {
    setShowSuccess(false);
    setShowSuccessMessage("");
  };

  useEffect(() => {
    if (checkInput.phonenumber.trim().length >= 8) {
      //fire the function that checks for phone number in the db
      checkPhoneNumber();
    }
  }, [phoneNumberLength]);

  useEffect(() => {
    currentUsers();
    handleGetAllUsers();
  }, []);

  const onchange = (e) => {
    if (e.target.name === "phonenumber") {
      setPhoneNumberLength(e.target.value.length);
    }
    setCheckInput({
      ...checkInput,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
    <>
      {loadingNumber && (
        <p className="text-base text-center w-full py-2 bg-black  text-white">
          {" "}
          Searching for user please wait...{" "}
        </p>
      )}

      {Error && (
        <ErrorMessage className="mx-auto border z-10 border-red-500 text-center text-[16px] font-semibold">
          <p>{Error}</p>
        </ErrorMessage>
      )}

      {showSuccess && (
        <SuccessMessage message={showSuccessMessage} onClose={handleClose} />
      )}

      <div
        className={`w-full mx-auto  md:w-1/2 bg-white ${
          !hide ? "grid-cols-1" : "md:grid-cols-2"
        } relative  p-2 grid  gap-2`}
      >
        <div className="w-full border-2 flex gap-1 border-black rounded-md bg-white ">
          <select
            name="weeknumber"
            className="w-full bg-white font-medium text-black  p-1  border-black"
            onChange={onchange}
            value={checkInput.weeknumber}
            id="weeknumber"
          >
            <option value="">Select the week *Optional</option>
            <option value="1">Last sunday</option>
            <option value="">This Week</option>
          </select>
        </div>

        <div className="w-full   flex flex-col gap-2">
          <label htmlFor="phonenumber" className="font-bold text-sm">
            {" "}
            Input attendant phone number
          </label>

          <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
            <input
              type="text"
              id="phonenumber"
              onChange={onchange}
              value={checkInput.phonenumber}
              name="phonenumber"
              className="w-full bg-white font-semibold outline-none"
            />
            <p
              onClick={addUser}
              className="justify-center text-[15px] rounded-md p-1 cursor-pointer  items-center bg-black text-white"
            >
              <FaPlus />
            </p>
          </div>
        </div>

        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="username" className="font-bold text-sm">
              {" "}
              Attendant Name
            </label>
            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                onChange={onchange}
                value={checkInput.username}
                name="username"
                id="username"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}
        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="levelinschool" className="font-bold text-sm">
              {" "}
              Level in school{" "}
            </label>

            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                onChange={onchange}
                value={checkInput.levelinschool}
                name="levelinschool"
                id="levelinschool"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}

        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="lodgename" className="font-bold text-sm">
              {" "}
              Name of Lodge{" "}
            </label>

            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                id="lodgename"
                onChange={onchange}
                value={checkInput.lodgename}
                name="lodgename"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}

        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="courseofstudy" className="font-bold text-sm">
              {" "}
              Course of study
            </label>

            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                id="courseofstudy"
                onChange={onchange}
                value={checkInput.courseofstudy}
                name="courseofstudy"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}

        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="dcg" className="font-bold text-sm">
              {" "}
              Dcg Center
            </label>

            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                id="dcg"
                onChange={onchange}
                value={checkInput.dcg}
                name="dcg"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}

        {hide && (
          <div className="w-full   flex flex-col gap-1">
            <label htmlFor="dateofbirth" className="font-bold text-sm">
              {" "}
              Date of birth
            </label>

            <div className="w-full border-2 flex gap-1 border-black rounded-md bg-white p-1 ">
              <input
                type="number"
                min={1}
                onChange={onchange}
                value={checkInput.day}
                name="day"
                max={31}
                placeholder="Day"
                id="day"
                className="w-1/2 bg-white font-semibold   border-2 border-black"
              />

              <select
                name="month"
                className="w-1/2 bg-white font-semibold text-black  border-2 border-black"
                onChange={onchange}
                value={checkInput.month}
                id="month"
              >
                <option value=""></option>
                <option value="Jan-01">Jan</option>
                <option value="Feb-02">Feb</option>
                <option value="March-03">March</option>
                <option value="Ap-04">Ap</option>
                <option value="May-05">May</option>
                <option value="June-06">June</option>
                <option value="July-7">July</option>
                <option value="Aug-08">Aug</option>
                <option value="Sept-09">Sept</option>
                <option value="Oct-10">Oct</option>
                <option value="Nov-11">Nov</option>
                <option value="Dec-12">Dec</option>
              </select>
            </div>
          </div>
        )}

        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="stateoforigin" className="font-bold text-sm">
              {" "}
              State of origin
            </label>

            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                id="stateoforigin"
                onChange={onchange}
                value={checkInput.stateoforigin}
                name="stateoforigin"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}

        {hide && (
          <div className="w-full   flex flex-col gap-2">
            <label htmlFor="gender" className="font-bold text-sm">
              {" "}
              Gender
            </label>

            <select
              name="gender"
              id="gender"
              onChange={onchange}
              value={checkInput.gender}
              className="p-2 bg-white outline-none border-2 text-sm font-semibold border-black rounded-lg"
            >
              <option value=""></option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        )}

        {hide && (
          <div className="w-full flex flex-col gap-2">
            <label htmlFor="area" className="font-bold text-sm">
              Area
            </label>

            <div className="w-full border-2 border-black rounded-md bg-white p-1 flex">
              <input
                type="text"
                id="area"
                onChange={onchange}
                value={checkInput.area}
                name="area"
                className="w-full bg-white font-semibold outline-none"
              />
            </div>
          </div>
        )}

        {hide && (
          <button
            className="w-full  p-3 mt-4 shadow-sm hover:-translate-y-1  duration-300 shadow-black md:p-2 px-10  bg-black font-semibold text-sm text-white rounded-md mx-auto"
            onClick={validateInput}
          >
            {" "}
            Submit
          </button>
        )}
      </div>
      <Count className="rounded-md my-3 md:w-1/2 mx-auto ">
        <p className="font-semibold text-sm items-center">
          {" "}
          Total Attendant For Today:
        </p>
        <p className="font-bold text-base">{todaysAttandance.length}</p>
      </Count>

      <div className="w-full mx-auto md:w-1/2 my-5 flex flex-col gap-3 px-2">
        {todaysAttandance && todaysAttandance.length > 0 ? (
          todaysAttandance.map((el) => (
            <p key={el._id} className="flex justify-between text-black">
              {el.userId?.username || "Unknown"}{" "}
              {/* Ensure it doesn't break if userId is missing */}
              <span className="flex items-center gap-3">
                <Link
                  to={`/edituser/${el?.userId._id}`}
                  className=" text-black  rounded"
                >
                  <BiEdit size={20} />
                </Link>
                <FaTrash
                  className="cursor-pointer"
                  onClick={() => handleDelete(el._id)}
                  size={17}
                />
              </span>
            </p>
          ))
        ) : (
          <p>No attendance records found.</p>
        )}
      </div>
    </>
  );
};
