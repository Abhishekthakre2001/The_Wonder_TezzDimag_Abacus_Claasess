import React, { useState, useEffect} from "react";
import { useFetchData } from "../hooks/useFetchData";
import examScheduleApi from "../api/examScheduleApi";
import InputField from "../UI/InputField";
import SelectField from "../UI/SelectField";
import Button from "../UI/Button";

const ExamScheduleForm = ({ onClose, onSuccess, editingData = null }) => {
  // ==========================================
  // Form State
  // ==========================================
  const [formData, setFormData] = useState({
    exam_title: "",
    start_datetime: "",
    end_datetime: "",
    exam_status: "Active",
    exam_category: "",
    exam_type: "",
    exam_level: "",
    exam_set: "",
    exam_state: "",
    exam_district: "",
    exam_institute: "",
    exam_paper_id: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});

  // ==========================================
  // Fetch Dependent Data
  // ==========================================
  const { data: levelsData } = useFetchData(
    () => examScheduleApi.getLevels(),
    [],
    { preserveResponse: true },
  );

  const { data: setsData } = useFetchData(() => examScheduleApi.getSets(), [], {
    preserveResponse: true,
  });

  const { data: statesData } = useFetchData(
    () => examScheduleApi.getStates(1, 100),
    [],
    { preserveResponse: true },
  );

  useEffect(() => {
    console.log("Selected State:", formData.exam_state);
  }, [formData.exam_state]);

  // ==========================================
  // Conditional Data Fetching
  // ==========================================
  const { data: districtData } = useFetchData(
    () =>
      formData.exam_state
        ? examScheduleApi.getDistricts(formData.exam_state)
        : Promise.resolve({ data: [] }),
    [formData.exam_state],
    { preserveResponse: true },
  );

  const { data: instituteData } = useFetchData(
    () => examScheduleApi.getInstitutes(),
    { preserveResponse: true },
  );

  // const { data: paperData } = useFetchData(
  //   () =>
  //     formData.exam_level && formData.exam_set
  //       ? examScheduleApi.getQuestionPapers(formData.exam_level, formData.exam_set)
  //       : Promise.resolve({ data: [] }),
  //   [formData.exam_level, formData.exam_set],
  //   { preserveResponse: true }
  // );
  const { data: paperData } = useFetchData(
    () =>
      formData.exam_level &&
      formData.exam_set &&
      formData.exam_category &&
      formData.exam_type
        ? examScheduleApi.getQuestionPapers({
            question_paper_type: formData.exam_category,
            level_id: formData.exam_level,
            set_id: formData.exam_set,
            paper_type: formData.exam_type?.toUpperCase(),
          })
        : Promise.resolve({ data: { records: [] } }),
    [
      formData.exam_category,
      formData.exam_type,
      formData.exam_level,
      formData.exam_set,
    ],
    { preserveResponse: true },
  );

  // ==========================================
  // Populate form when editing
  // ==========================================

  const formatDateTimeLocal = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (editingData) {
      setFormData({
        exam_title: editingData.exam_title || "",
        start_datetime: formatDateTimeLocal(editingData.start_datetime),
        end_datetime: formatDateTimeLocal(editingData.end_datetime),
        exam_status: editingData.exam_status || "Active",
        exam_category: editingData.exam_category || "",
        exam_type: editingData.exam_type || "",
        exam_level: editingData.exam_level || [],
        exam_set: editingData.exam_set || [],
        exam_state: editingData.exam_state || [],
        exam_district: editingData.exam_district || [],
        exam_institute: editingData.exam_institute || [],
        exam_paper_id: editingData.exam_paper_id || "",
      });
    }
  }, [editingData]);

  // ==========================================
  // Options for Dropdowns
  // ==========================================
  const levelsOptions = (
    Array.isArray(levelsData) ? levelsData : levelsData?.data || []
  ).map((item) => ({
    value: item.id,
    label: item.level_name,
  }));

  const setsOptions = (
    Array.isArray(setsData) ? setsData : setsData?.data || []
  ).map((item) => ({
    value: item.id,
    label: item.set_name,
  }));

  const statesOptions = (statesData?.data || []).map((item) => ({
    value: item.id,
    label: item.name,
  }));

  const districtOptions = (
    Array.isArray(districtData) ? districtData : districtData?.data || []
  ).map((item) => ({
    value: item.id,
    label: item.name,
  }));

  console.log("editingData", editingData);

  const instituteOptions = (instituteData || []).map((item) => ({
    value: item.id,
    label: item.institute_name,
  }));

  const paperOptions = (paperData?.records || []).map((item) => ({
    value: item.id,
    label: item.paper_name,
  }));

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  const categoryOptions = [
    { value: "Abacus", label: "Abacus" },
    { value: "Vedic", label: "Vedic" },
  ];

  const typeOptions = [
    { value: "Mock", label: "Mock" },
    { value: "Main Exam", label: "Main Exam" },
    { value: "Practice", label: "Practice" },
  ];

  // ==========================================
  // Validation Logic
  // ==========================================
  const validateForm = () => {
    const newErrors = {};

    if (!formData.exam_title?.trim()) {
      newErrors.exam_title = "Exam title is required";
    }

    if (!formData.start_datetime) {
      newErrors.start_datetime = "Start date and time is required";
    }

    if (!formData.end_datetime) {
      newErrors.end_datetime = "End date and time is required";
    }

    if (formData.start_datetime && formData.end_datetime) {
      const startTime = new Date(formData.start_datetime);
      const endTime = new Date(formData.end_datetime);
      if (endTime <= startTime) {
        newErrors.end_datetime =
          "End date and time must be greater than start date and time";
      }
    }

    if (!formData.exam_status) {
      newErrors.exam_status = "Exam status is required";
    }

    if (!formData.exam_category) {
      newErrors.exam_category = "Exam category is required";
    }

    if (!formData.exam_type) {
      newErrors.exam_type = "Exam type is required";
    }

    if (!formData.exam_level) {
      newErrors.exam_level = "At least one level is required";
    }

    if (!formData.exam_set) {
      newErrors.exam_set = "At least one set is required";
    }

    if (!formData.exam_paper_id) {
      newErrors.exam_paper_id = "Question paper is required";
    }

    if (!formData.exam_state) {
      newErrors.exam_state = "State is required";
    }

    if (!formData.exam_district) {
      newErrors.exam_district = "District is required";
    }

    if (!formData.exam_institute) {
      newErrors.exam_institute = "Institute is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ==========================================
  // Form Handlers
  // ==========================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleMultiSelectChange = (fieldName, selectedOptions) => {
    const values = selectedOptions.map((opt) =>
      typeof opt === "string" ? opt : opt.value,
    );

    setFormData((prev) => ({
      ...prev,
      [fieldName]: values,
    }));

    // Reset dependent fields
    if (fieldName === "exam_level" || fieldName === "exam_set") {
      setFormData((prev) => ({
        ...prev,
        exam_paper_id: "",
      }));
    }

    if (fieldName === "exam_state") {
      setFormData((prev) => ({
        ...prev,
        exam_district: [],
        exam_institute: [],
      }));
    }

    if (fieldName === "exam_district") {
      setFormData((prev) => ({
        ...prev,
        exam_institute: [],
      }));
    }

    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleSelectChange = (fieldName, e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  // ==========================================
  // Submit Handler
  // ==========================================
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        exam_title: formData.exam_title.trim(),
        start_datetime: formData.start_datetime,
        end_datetime: formData.end_datetime,
        exam_status: formData.exam_status,
        exam_category: formData.exam_category,
        exam_type: formData.exam_type,
        exam_level: formData.exam_level,
        exam_set: formData.exam_set,
        exam_paper_id: formData.exam_paper_id,
        exam_state: formData.exam_state,
        exam_district: formData.exam_district,
        exam_institute: formData.exam_institute,
      };

      if (editingData?.id) {
        await examScheduleApi.update(editingData.id, payload);
      } else {
        await examScheduleApi.create(payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save exam schedule";
      setErrors({ submit: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Component Render
  // ==========================================
  return (
    <div className="space-y-4">
      {/* Title */}
      <InputField
        label="Exam Title"
        name="exam_title"
        value={formData.exam_title}
        onChange={handleInputChange}
        onBlur={() => setTouched((prev) => ({ ...prev, exam_title: true }))}
        placeholder="Enter exam title"
        error={errors.exam_title}
        showError={touched.exam_title}
        required
      />

      {/* Date/Time Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="start_datetime"
            value={formData.start_datetime}
            onChange={handleInputChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, start_datetime: true }))
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.start_datetime && touched.start_datetime
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.start_datetime && touched.start_datetime && (
            <p className="text-red-500 text-sm mt-1">{errors.start_datetime}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            name="end_datetime"
            value={formData.end_datetime}
            onChange={handleInputChange}
            onBlur={() =>
              setTouched((prev) => ({ ...prev, end_datetime: true }))
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.end_datetime && touched.end_datetime
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
          />
          {errors.end_datetime && touched.end_datetime && (
            <p className="text-red-500 text-sm mt-1">{errors.end_datetime}</p>
          )}
        </div>
      </div>

      {/* Status, Category, Type */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField
          label="Exam Status"
          value={formData.exam_status}
          onChange={(e) => handleSelectChange("exam_status", e)}
          onBlur={() => setTouched((prev) => ({ ...prev, exam_status: true }))}
          options={statusOptions}
          error={errors.exam_status}
          showError={touched.exam_status}
          required
        />

        <SelectField
          label="Exam Category"
          value={formData.exam_category}
          // onChange={(e) => handleSelectChange("exam_category", e)}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              exam_category: e.target.value,
              exam_paper_id: "",
            }));
          }}
          onBlur={() =>
            setTouched((prev) => ({ ...prev, exam_category: true }))
          }
          options={categoryOptions}
          error={errors.exam_category}
          showError={touched.exam_category}
          required
        />

        <SelectField
          label="Exam Type"
          value={formData.exam_type}
          // onChange={(e) => handleSelectChange("exam_type", e)}
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              exam_type: e.target.value,
              exam_paper_id: "",
            }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, exam_type: true }))}
          options={typeOptions}
          error={errors.exam_type}
          showError={touched.exam_type}
          required
        />
      </div>

      {/* Level & Set (Multi-select) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Levels <span className="text-red-500">*</span>
          </label>
          <SelectField
            value={formData.exam_level}
            // onChange={(e) => {
            //   setFormData(prev => ({
            //     ...prev,
            //     exam_level: e.target.value,
            //     exam_paper_id: "",
            //   }));
            // }}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                exam_level: e.target.value,
                exam_paper_id: "",
              }));
            }}
            options={levelsOptions}
          />
          {errors.exam_level && touched.exam_level && (
            <p className="text-red-500 text-sm mt-1">{errors.exam_level}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Sets <span className="text-red-500">*</span>
          </label>
          <SelectField
            value={formData.exam_set}
            // onChange={(e) => {
            //   setFormData(prev => ({
            //     ...prev,
            //     exam_set: e.target.value,
            //     exam_paper_id: "",
            //   }));
            // }}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                exam_set: e.target.value,
                exam_paper_id: "",
              }));
            }}
            options={setsOptions}
          />
          {errors.exam_set && touched.exam_set && (
            <p className="text-red-500 text-sm mt-1">{errors.exam_set}</p>
          )}
        </div>
      </div>

      {/* Question Paper (enabled only if level and set selected) */}
      <SelectField
        label="Question Paper"
        value={formData.exam_paper_id}
        onChange={(e) => handleSelectChange("exam_paper_id", e)}
        options={paperOptions}
        placeholder={
          !formData.exam_category ||
          !formData.exam_type ||
          !formData.exam_level ||
          !formData.exam_set
            ? "Select Category, Type, Level & Set first"
            : "Select Question Paper"
        }
        disabled={
          !formData.exam_category ||
          !formData.exam_type ||
          !formData.exam_level ||
          !formData.exam_set
        }
      />

      {/* State & District & Institute */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State <span className="text-red-500">*</span>
          </label>
          <SelectField
            value={formData.exam_state}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                exam_state: e.target.value,
                exam_district: "",
                exam_institute: "",
              }));
            }}
            options={statesOptions}
          />
          {errors.exam_state && touched.exam_state && (
            <p className="text-red-500 text-sm mt-1">{errors.exam_state}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            District <span className="text-red-500">*</span>
          </label>
          <SelectField
            value={formData.exam_district}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                exam_district: e.target.value,
                exam_institute: "",
              }));
            }}
            options={districtOptions}
          />
          {errors.exam_district && touched.exam_district && (
            <p className="text-red-500 text-sm mt-1">{errors.exam_district}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Institute <span className="text-red-500">*</span>
          </label>
          <SelectField
            value={formData.exam_institute}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                exam_institute: e.target.value,
              }));
            }}
            options={instituteOptions}
          />
          {errors.exam_institute && touched.exam_institute && (
            <p className="text-red-500 text-sm mt-1">{errors.exam_institute}</p>
          )}
        </div>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.submit}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={saving}
          disabled={saving}
        >
          {editingData?.id ? "Update" : "Create"} Exam Schedule
        </Button>
      </div>
    </div>
  );
};

export default ExamScheduleForm;
