import React, { useEffect, useState } from "react";
import Input from "../UI/InputField";
import SelectField from "../UI/SelectField";
import Button from "../UI/Button";
import { Save, X } from "lucide-react";

import userApi from "../api/userApi";
import levelApi from "../api/LevelApi";
import stateApi from "../api/StateApi";
import districtApi from "../api/DistrictApi";
import instituteApi from "../api/Institute";

import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

import MessageModal from "../utils/MessageModal";
import { validateStudent } from "../utils/studentValidator";
import AppBar from "../UI/AppBar";

export default function AddStudent() {

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [institutes, setInstitutes] = useState([]);
    const [levels, setLevels] = useState([]);

    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : {};

    const [formData, setFormData] = useState({
        name: "",
        class: "",
        address: "",
        mobileNumber: "",
        username: "",
        password: "",
        confirmPassword: "",
        level: "",
        dob: "",
        subscription_end_date: "",
        status: 1,
        usertype: "student",
        student_category: "",
        state_id: "",
        district_id: "",
        city: "",
        pincode: "",
        institute_id: ""
    });

    const [errors, setErrors] = useState({});

    const [modal, setModal] = useState({
        open: false,
        type: "",
        title: "",
        message: ""
    });

    const categoryOptions = [
        { value: "Abacus", label: "Abacus" },
        { value: "Vedic", label: "Vedic" },
    ];

    // ---------------- API LOAD ----------------

    useEffect(() => {
        stateApi.getAll(1, 1000, "").then(res => {
            setStates(res?.data?.data || []);
        });
    }, []);

    useEffect(() => {
        instituteApi.getAll(1, 1000, "").then(res => {
            setInstitutes(res?.data?.data || []);
        });
    }, []);

    useEffect(() => {
        const adminid = user?.id;
        levelApi.getbyadminid(adminid).then(res => {
            const payload = res?.data ?? res;
            console.log("payload", payload.data)
            setLevels(Array.isArray(payload.data) ? payload.data : []);
        });
    }, []);

    // ---------------- DISTRICT LOAD FIX ----------------

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

    // ---------------- HANDLE CHANGE ----------------

    const handleChange = (field) => (e) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));

        setErrors(prev => ({
            ...prev,
            [field]: ""
        }));
    };

    // ---------------- CREATE / UPDATE ----------------

    const { create, loading: createLoading } = useCreate(userApi.create, () => {
        setModal({
            open: true,
            type: "success",
            title: "Success",
            message: "Student added successfully"
        });
        setTimeout(handleCancel, 1200);
    });

    const { update, loading: updateLoading } = useUpdate(userApi.update, () => {
        setModal({
            open: true,
            type: "success",
            title: "Success",
            message: "Student updated successfully"
        });

        setTimeout(() => {
            navigate("/students-list");
        }, 1200);
    });

    // ---------------- SUBMIT ----------------

    const handleSubmit = async (e) => {
        console.log("onlcik Submit")
        e.preventDefault();

        if (!id && formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return;
        }

        const validationErrors = validateStudent(formData);
        if (Object.keys(validationErrors).length > 0) {
            console.log("validation Error ", validationErrors)
            setErrors(validationErrors);
            return;
        }

        const payload = {
            name: formData.name,
            class: formData.class,
            address: formData.address,
            mobilenumber: formData.mobileNumber,
            username: formData.username,
            level: formData.level,
            dob: formData.dob,
            subscription_end_date: formData.subscription_end_date,
            usertype: "student",
            createdby: user.id,
            status: formData.status,
            student_category: formData.student_category,
            state_id: formData.state_id,
            district_id: formData.district_id,
            city: formData.city,
            pincode: formData.pincode,
            institute_id: formData.institute_id
        };

        if (!id || formData.password) {
            payload.password = formData.password;
        }

        try {
            if (id) await update(id, payload);
            else await create(payload);
        } catch (err) {
            const errorMsg =
                err?.response?.data?.error ||
                err?.response?.data?.message ||
                "";

            if (
                errorMsg.includes("Duplicate entry") &&
                errorMsg.includes("username")
            ) {
                setErrors((prev) => ({
                    ...prev,
                    username: "Username already exists. Please use another username."
                }));
            } else {
                setModal({
                    open: true,
                    type: "error",
                    title: "Error",
                    message: errorMsg || "Something went wrong"
                });
            }
        }
    };

    // ---------------- CANCEL ----------------

    const handleCancel = () => {
        navigate("/students-list");

        setFormData({
            name: "",
            class: "",
            address: "",
            mobileNumber: "",
            username: "",
            password: "",
            confirmPassword: "",
            level: "",
            dob: "",
            subscription_end_date: "",
            status: 1,
            usertype: "student",
            student_category: "",
            state_id: "",
            district_id: "",
            city: "",
            pincode: "",
            institute_id: ""
        });

        setErrors({});
    };

    // ---------------- LOAD EDIT DATA ----------------

    useEffect(() => {
        if (!id) return;

        userApi.getbyid(id).then(res => {
            const u = res?.data || res;

            setFormData({
                name: u.name || "",
                class: u.class || "",
                address: u.address || "",
                mobileNumber: u.mobilenumber || "",
                username: u.username || "",
                password: u.password || "",
                confirmPassword: u.password || "",
                level: u.level || "",
                dob: u.dob ? u.dob.split("T")[0] : "",
                subscription_end_date: u.subscription_end_date ? u.subscription_end_date.split("T")[0] : "",
                status: u.status,
                student_category: u.student_category || "",
                state_id: u.state_id || "",
                district_id: u.district_id || "",
                city: u.city || "",
                pincode: u.pincode || "",
                institute_id: u.institute_id || ""
            });
        });
    }, [id]);

    // ---------------- UI ----------------

    return (
        <>
            <MessageModal {...modal} onClose={() => setModal(p => ({ ...p, open: false }))} />

            <AppBar title="Student Management" subtitle="Add / Update Student" />

            <div className="p-4">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">

                    <Input label="Name" value={formData.name} onChange={handleChange("name")} error={errors.name}
                        showError={!!errors.name} required />
                    <Input label="Class" value={formData.class} onChange={handleChange("class")} error={errors.class}
                        showError={!!errors.class} required />
                    <Input label="Mobile" value={formData.mobileNumber} onChange={handleChange("mobileNumber")} error={errors.mobileNumber}
                        showError={!!errors.mobileNumber} required />
                    <SelectField
                        label="Institute"
                        value={formData.institute_id}
                        onChange={handleChange("institute_id")}
                        options={institutes.map(i => ({
                            value: i.id,
                            label: i.institute_name
                        }))}
                        error={errors.institute_id}
                        showError={!!errors.institute_id} required
                    />

                    <SelectField
                        label="Student Category"
                        value={formData.student_category}
                        onChange={handleChange("student_category")}
                        options={categoryOptions.map(sc => ({
                            value: sc.value,
                            label: sc.label
                        }))}
                        error={errors.student_category}
                        showError={!!errors.student_category} required
                    />

                    <Input
                        type="date"
                        label="Date of Birth"
                        value={formData.dob}
                        onChange={handleChange("dob")}
                        error={errors.dob}
                        showError={!!errors.dob} required
                    />

                    <Input
                        type="date"
                        label="Subscription Expiry Date"
                        value={formData.subscription_end_date}
                        onChange={handleChange("subscription_end_date")}
                        error={errors.subscription_end_date}
                        showError={!!errors.subscription_end_date} required
                    />

                    <Input label="Address" value={formData.address} onChange={handleChange("address")} error={errors.address}
                        showError={!!errors.address} required />

                    <SelectField
                        label="State"
                        value={formData.state_id}
                        onChange={handleChange("state_id")}
                        options={states.map(s => ({
                            value: s.id,
                            label: s.name
                        }))}
                        error={errors.state_id}
                        showError={!!errors.state_id} required
                    />

                    <SelectField
                        label="District"
                        value={formData.district_id}
                        onChange={handleChange("district_id")}
                        options={districts.map(d => ({
                            value: d.id,
                            label: d.name
                        }))}
                        error={errors.district_id} required
                        showError={!!errors.district_id}
                    />

                    <Input label="City" value={formData.city} onChange={handleChange("city")} error={errors.city}
                        showError={!!errors.city} required />
                    <Input label="Pincode" value={formData.pincode} onChange={handleChange("pincode")} error={errors.pincode}
                        showError={!!errors.pincode} required />



                    <SelectField
                        label="Level"
                        value={formData.level}
                        onChange={handleChange("level")}
                        options={levels.map(l => ({
                            value: l.id,
                            label: `${l.level_name} - ${l.level}`
                        }))}
                        error={errors.level}
                        showError={!!errors.level}
                        required
                    />

                    <Input label="Username" value={formData.username} onChange={handleChange("username")} error={errors.username}
                        showError={!!errors.username} required />
                    <Input type="password" label="Password" value={formData.password} onChange={handleChange("password")} error={errors.password}
                        showError={!!errors.password} required />
                    <Input type="password" label="Confirm Password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} error={errors.confirmPassword}
                        showError={!!errors.confirmPassword} required />

                    <div className="flex gap-2 col-span-4">
                        <Button type="submit" icon={Save}>
                            {id ? "Update" : "Save"}
                        </Button>

                        <Button type="button" variant="secondary" icon={X} onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>

                </form>
            </div>
        </>
    );
}