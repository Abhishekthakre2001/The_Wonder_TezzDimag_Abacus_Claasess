import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import InputField from "../UI/InputField";
import SelectField from "../UI/SelectField";

import { useCreate } from "../hooks/useCreate";

import examRegistartionApi from "../api/exam_registartion";

import stateApi from "../api/StateApi";
import districtApi from "../api/DistrictApi";
// import examRegistartionApi from "../api/exam_registartion";

import MessageModal from "../utils/MessageModal";

import DefaultLogo from "../assets/Maharashtra_Abacus_Association.jpg";

const initialFormData = {
  name: "",
  class: "",
  mobile: "",
  institute_id: "",
  dob: "",
  address: "",
  city: "",
  state_id: "",
  district_id: "",
  pincode: "",
  level: "",
  student_category: "",
  username: "",
  password: "",
  confirmPassword: "",
};

export default function Registration() {
  const { username } = useParams();

  const [formData, setFormData] = useState(initialFormData);

  const [errors, setErrors] = useState({});

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(true);
  const [invalidLink, setInvalidLink] = useState(false);

  const [logo, setLogo] = useState(DefaultLogo);
  const [associationName, setAssociationName] = useState(
    "Maharashtra Abacus Association"
  );

  const [institutes, setInstitutes] = useState([]);
  const [levels, setLevels] = useState([]);

  const levelOptions = levels.map((item) => ({
    label: item.level_name,
    value: item.level,
  }));

  const instituteOptions = institutes.map((item) => ({
    label: item.institute_name,
    value: item.id,
  }));

  const statesOptions = states.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const districtsOptions = districts.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  const studentCategoryOptions = [
    {
      label: "Abacus",
      value: "Abacus",
    },
    {
      label: "Vedic",
      value: "Vedic",
    },
  ];

  const nameRegex = /^[A-Za-z ]+$/;
  const mobileRegex = /^[0-9]{10}$/;
  const pinRegex = /^[0-9]{6}$/;

  useEffect(() => {
    if (username) {
      loadRegistrationPage();
    }
  }, [username]);

  useEffect(() => {
    stateApi.getAll(1, 1000, "").then(res => {
      setStates(res?.data?.data || []);
    });
  }, []);


  useEffect(() => {
    if (!formData.state_id) {
      setDistricts([]);
      return;
    }

    districtApi
      .getByState(formData.state_id)
      .then(res => {
        setDistricts(res?.data || []);
      })
      .catch(() => setDistricts([]));
  }, [formData.state_id]);

  const loadRegistrationPage = async () => {
    try {
      setLoading(true);

      const res = await examRegistartionApi.getRegistrationData(username);

      const data = res.data;

      setAssociationName(data.admin?.name || "Maharashtra Abacus Association");

      setLogo(data.settings?.logo_url || DefaultLogo);

      setInstitutes(data.institutes || []);

      setLevels(data.levels || []);
    } catch (err) {
      console.log(err);

      setInvalidLink(true);
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field, value) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (!nameRegex.test(value)) return "Only letters allowed";
        break;

      case "mobile":
        if (!mobileRegex.test(value))
          return "Enter valid mobile number";
        break;

      case "class":
        if (!value.trim())
          return "Enter valid Class";
        break;

      case "address":
        if (!value.trim())
          return "Address required";
        break;

      case "city":
        if (!value.trim())
          return "City required";
        break;

      case "pincode":
        if (!pinRegex.test(value))
          return "Invalid pincode";
        break;

      case "username":
        if (!value.trim())
          return "Username required";
        break;

      case "password":
        if (value.length < 6)
          return "Minimum 6 characters";
        break;

      case "confirmPassword":
        if (value !== formData.password)
          return "Passwords do not match";
        break;

      case "dob":
        if (!value)
          return "Select DOB";
        break;

      case "student_category":
        if (!value) return "Student Category is required";
        break;

      case "state_id":
        if (!value) return "State is required";
        break;

      case "district_id":
        if (!value) return "District is required";
        break;

      case "level":
        if (!value) return "Level is required";
        break;

      case "institute_id":
        if (!value) return "Institute is required";
        break;

      default:
        break;
    }

    return "";
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));

    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword:
          formData.confirmPassword &&
            formData.confirmPassword !== value
            ? "Passwords do not match"
            : "",
      }));
    }
  };

  const validateAll = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);

      if (error)
        newErrors[key] = error;
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };
  const { create, loading: createLoading } = useCreate(
    examRegistartionApi.create,

    // Success
    () => {
      setModal({
        open: true,
        type: "success",
        title: "Success",
        message: "Registration Successful",
      });

      setFormData(initialFormData);
      setErrors({});
    },

    // Error
    (err) => {
      const message = err?.response?.data?.message;

      if (message === "Username already exists.") {
        setErrors((prev) => ({
          ...prev,
          username: "Username is already in use. Please use another username.",
        }));
        return;
      }

      setModal({
        open: true,
        type: "error",
        title: "Error",
        message: message || "Something went wrong.",
      });
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("validateAll", validateAll)
    if (!validateAll()) return;

    await create({
      ...formData,
      createdByUsername: username,
    });
  };

  console.log("states", states);
  console.log("districts", districts)

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-xl font-semibold">
        Loading...
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-xl rounded-xl p-10 text-center">
          <h1 className="text-3xl font-bold text-red-600">
            Invalid Registration Link
          </h1>

          <p className="mt-4 text-gray-600">
            This registration link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <MessageModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white py-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

            <h1 className="text-xl md:text-3xl font-bold flex items-center gap-3">
              <img
                src={logo}
                alt="Logo"
                className="h-12 w-12 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = DefaultLogo;
                }}
              />

              {associationName}
            </h1>

            <span className="hidden md:block text-lg">
              Student Registration
            </span>

          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">

          <div className="bg-white rounded-3xl shadow-xl p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-10"
            >

              <SectionTitle title="Student Details" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <InputField
                  label="Student Name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  error={errors.name}
                  showError={!!errors.name}
                  required
                />

                <InputField
                  label="Class"
                  value={formData.class}
                  onChange={handleChange("class")}
                  error={errors.class}
                  showError={!!errors.class}
                  required
                />

                <InputField
                  label="Mobile Number"
                  value={formData.mobile}
                  onChange={handleChange("mobile")}
                  error={errors.mobile}
                  showError={!!errors.mobile}
                  required
                />

                <InputField
                  label="Date Of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange("dob")}
                  error={errors.dob}
                  showError={!!errors.dob}
                  required
                />

                <SelectField
                  label="Level"
                  value={formData.level}
                  options={levelOptions}
                  onChange={handleChange("level")}
                  required
                  error={errors.level}
                  showError={!!errors.level}
                />

                <SelectField
                  label="Student Category"
                  value={formData.student_category}
                  options={studentCategoryOptions}
                  onChange={handleChange("student_category")}
                  required
                  error={errors.student_category}
                  showError={!!errors.student_category}
                />

                <SelectField
                  label="Institute"
                  value={formData.institute_id}
                  options={instituteOptions}
                  onChange={handleChange("institute_id")}
                  required
                  error={errors.institute_id}
                  showError={!!errors.institute_id}
                />


              </div>

              <SectionTitle title="Address Details" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <SelectField
                  label="State"
                  value={formData.state_id}
                  options={statesOptions}
                  onChange={handleChange("state_id")}
                  required
                  error={errors.state_id}
                  showError={!!errors.state_id}
                />

                <SelectField
                  label="District"
                  value={formData.district_id}
                  options={districtsOptions}
                  onChange={handleChange("district_id")}
                  required
                  error={errors.district_id}
                  showError={!!errors.district_id}
                />

                <InputField
                  label="City"
                  value={formData.city}
                  onChange={handleChange("city")}
                  error={errors.city}
                  showError={!!errors.city}
                  required
                />

                <InputField
                  label="Address"
                  value={formData.address}
                  onChange={handleChange("address")}
                  error={errors.address}
                  showError={!!errors.address}
                  required
                />

                <InputField
                  label="Pincode"
                  value={formData.pincode}
                  onChange={handleChange("pincode")}
                  error={errors.pincode}
                  showError={!!errors.pincode}
                  required
                />

              </div>

              <SectionTitle title="Login Details" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                <InputField
                  label="Username"
                  value={formData.username}
                  onChange={handleChange("username")}
                  error={errors.username}
                  showError={!!errors.username}
                  required
                />

                <InputField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange("password")}
                  error={errors.password}
                  showError={!!errors.password}
                  required
                />

                <InputField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={errors.confirmPassword}
                  showError={!!errors.confirmPassword}
                  required
                />

              </div>

              <div className="pt-6">

                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-700 to-cyan-500 text-white font-semibold text-lg hover:opacity-90 transition disabled:opacity-50"
                >
                  {createLoading
                    ? "Registering..."
                    : "Submit Registration"}
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>

    </>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="border-b pb-3">
      <h2 className="text-xl font-semibold text-blue-700">
        {title}
      </h2>
    </div>
  );
}