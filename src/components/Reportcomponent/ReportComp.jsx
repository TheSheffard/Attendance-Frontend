import { useState } from "react";
import { FaArrowDown, FaDownload } from "react-icons/fa";
import { Count } from "../Count";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Spinner from "../Spinner.jsx";
import * as XLSX from "xlsx";

export const ReportComp = () => {
  const [close, setClose] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const toggle = () => setClose(!close);

  const [checkValue, setCheckValue] = useState({
    month: "",
    day: ""
  });

  const handleChange = (e) => {
    setCheckValue({
      ...checkValue,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const submit = () => {
    fetchData();
  };

  const fetchData = async () => {
    if (checkValue.month === "" && checkValue.day === "") {
      return setError("You'll have to select either monthly or daily to get a report.");
    } else if (checkValue.month !== "" && checkValue.day !== "") {
      return setError("You can only select one input field at a time.");
    }

    const dataToSend = checkValue.month ? { month: checkValue.month } : { date: checkValue.day };

    try {
      setLoading(true);
      const reqData = await fetch("https://attendance-backend-rosy.vercel.app/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });
      const resData = await reqData.json();

      if (reqData.ok) {
        setData(resData);
        console.log("The result", resData)
      } else {
        if (resData.message === "No user was recorded on the specified date") {
          setData([]);
        }
        setError(resData.message);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add title
    doc.setFontSize(18);
    doc.text("Nifes Unizik Monthly Report", pageWidth / 2, 20, { align: "center" });

    // Add subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });

    // Add table headers
    const headers = [
      "Name",
      "Level in School",
      "Lodge Name",
      "Phone Number",
      "Course of Study",
      "DCG",
      "State of Origin",
      "Gender",
      "Area",
      "Timestamp"
    ];
    const rows = data.map((info) => [
      info.username,
      info.levelinschool,
      info.lodgename,
      info.phonenumber,
      info.courseofstudy,
      info.dcg,
      info.stateoforigin,
      info.gender,
      info.area,
      new Date(info.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    ]);

    // Table styling options
    const tableConfig = {
      startY: 40,
      head: [headers],
      body: rows,
      styles: {
        fontSize: 10,
        halign: "center",
        valign: "middle"
      },
      headStyles: {
        fillColor: [0, 102, 204],
        textColor: [255, 255, 255],
        fontSize: 12,
        halign: "center"
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    };

    // Use autoTable to create a styled table
    doc.autoTable(tableConfig);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(`${new Date().getFullYear()}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    // Save the PDF
    doc.save("Nifes_Unizik.pdf");
  };

  const downloadExcel = () => {
    const headers = [
      "Name",
      "Level in School",
      "Lodge Name",
      "Phone Number",
      "Course of Study",
      "DCG",
      "State of Origin",
      "Gender",
      "Timestamp"
    ];
    const rows = data.map((info) => ({
      Name: info.username,
      "Level in School": info.levelinschool,
      "Lodge Name": info.lodgename,
      "Phone Number": info.phonenumber,
      "Course of Study": info.courseofstudy,
      DCG: info.dcg,
      "State of Origin": info.stateoforigin,
      Gender: info.gender,
      Timestamp: new Date(info.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // Format the timestamp
    }));
  
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
    XLSX.writeFile(workbook, "Nifes_Unizik.xlsx");
  };
  

  if (loading) {
    return <Spinner loading={loading} />;
  }

  return (
    <>
      <div className="w-full mx-auto p-4 mb-10">
        {error && <p className="text-red-600 text-center border border-red-500 p-2 rounded">{error}</p>}

        <div className="flex gap-2 items-center mb-4">
          <div className="w-full flex border-2 border-black rounded-lg p-3 justify-between items-center cursor-pointer" onClick={toggle}>
            <p className="font-semibold text-sm">Get Report By</p>
            <FaArrowDown className="ml-2" />
          </div>
          <button className="h-full bg-black text-white rounded-md p-1 hover:bg-gray-800" onClick={submit}>
            Get Report
          </button>
        </div>

        <Count>
          <p className="font-semibold">Total number of attendants for the selected period:</p>
          <p className="font-bold">{data.length}</p>
        </Count>

        {close && (
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="border-2 border-black flex justify-between px-2">
              <label htmlFor="month" className="font-semibold">Monthly report</label>
              <input type="month" value={checkValue.month} onChange={handleChange} className="w-full outline-none px-2" name="month" id="month" />
            </div>
            <div className="border-2 border-black flex justify-between px-2">
              <label htmlFor="day" className="font-semibold">Daily report</label>
              <input type="date" value={checkValue.day} onChange={handleChange} className="w-full outline-none px-2" name="day" id="day" />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-black text-white">
                <th className="py-2 px-4 whitespace-nowrap">Name</th>
                <th className="py-2 px-4 whitespace-nowrap">Level in School</th>
                <th className="py-2 px-4 whitespace-nowrap">Lodge Name</th>
                <th className="py-2 px-4 whitespace-nowrap">Phone Number</th>
                <th className="py-2 px-4 whitespace-nowrap">Course of Study</th>
                <th className="py-2 px-4 whitespace-nowrap">DCG</th>
                <th className="py-2 px-4 whitespace-nowrap">State of Origin</th>
                <th className="py-2 px-4 whitespace-nowrap">Gender</th>
                <th className="py-2 px-4 whitespace-nowrap">Area</th>
                <th className="py-2 px-4 whitespace-nowrap">TimeStamp</th>
              </tr>
            </thead>
            <tbody>
              {data.map((info, index) => (
                <tr key={info._id} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                  <td className="py-2 px-4">{info.username}</td>
                  <td className="py-2 px-4">{info.levelinschool}</td>
                  <td className="py-2 px-4">{info.lodgename}</td>
                  <td className="py-2 px-4">{info.phonenumber}</td>
                  <td className="py-2 px-4">{info.courseofstudy}</td>
                  <td className="py-2 px-4">{info.dcg}</td>
                  <td className="py-2 px-4">{info.stateoforigin}</td>
                  <td className="py-2 px-4">{info.gender}</td>
                  <td className="py-2 px-4">{info.area}</td>
                  <td className="py-2 px-4">
                    {new Date(info.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.length > 0 && (
          <>
            <button
              className="mt-4 bg-blue-500 text-white rounded-md p-2 flex items-center gap-4 hover:bg-blue-600"
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            >
              Download Report <FaDownload />
            </button>

            {showDownloadOptions && (
              <div className="flex gap-2 mt-2">
                <button className="bg-gray-800 text-white rounded-md p-2 hover:bg-gray-700" onClick={downloadPDF}>
                  Download as PDF
                </button>
                <button className="bg-gray-800 text-white rounded-md p-2 hover:bg-gray-700" onClick={downloadExcel}>
                  Download as Excel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
