import React, { useEffect, useState } from "react";
import Modal from "../UI/Modal";
import InputField from "../UI/InputField";
import { useFetchData } from "../hooks/useFetchData";
import levelApi from "../api/LevelApi";
import setsApi from "../api/SetsApi";
import SelectField from "../UI/SelectField";

export default function UpdateQuestionModal({
    open,
    onClose,
    onUpdate,
    question,
    loading,
}) {

    const adminId = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).id
        : null;


    const [form, setForm] = useState({
        id: "",
        paper_name: "",
        level_id: "",
        set_id: "",
        duration: "",
        paper_type: "",
        status: "ACTIVE",
        question_paper_type: "Abacus",
    });

    useEffect(() => {
        if (question) {
            setForm({
                id: question.id,
                paper_name: question.paper_name || "",
                level_id: question.level_id || "",
                set_id: question.set_id || "",
                duration: question.duration || "",
                paper_type: question.paper_type || "",
                status: question.status || "ACTIVE",
                question_paper_type: question.question_paper_type || "Abacus",
            });
        }
    }, [question]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                name === "level_id" ||
                    name === "set_id" ||
                    name === "duration"
                    ? Number(value)
                    : value,
        }));
    };

    const handleSubmit = () => {
        onUpdate(form);
    };

    const { data: levelResponse } = useFetchData(
        () => levelApi.getbyadminid(adminId, 1, 1000, ""),
        [adminId],
        { preserveResponse: true }
    );

    const levels = levelResponse?.data || [];

    const { data: setResponse } = useFetchData(
        () => setsApi.getbyadminid(adminId, 1, 1000, ""),
        [adminId],
        { preserveResponse: true }
    );

    const sets = setResponse?.data || [];

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Update Question Paper"
            width="max-w-lg"
        >
            <div className="space-y-4">
                <InputField
                    label="Paper Name"
                    name="paper_name"
                    value={form.paper_name}
                    onChange={handleChange}
                />

                <SelectField
                    name="level_id"
                    label="Level"
                    value={form.level_id}
                    onChange={handleChange}
                    options={levels.map((item) => ({
                        value: item.id,
                        label: `${item.level} - ${item.level_name}`,
                    }))}
                    placeholder="Select Level"
                />

                <SelectField
                    name="set_id"
                    label="Set"
                    value={form.set_id}
                    onChange={handleChange}
                    options={sets.map((item) => ({
                        value: item.id,
                        label: item.set_name,
                    }))}
                    placeholder="Select Set"
                />

                <InputField
                    label="Duration (Minutes)"
                    name="duration"
                    type="number"
                    value={form.duration}
                    onChange={handleChange}
                />

                <SelectField
                    label="Paper Type"
                    value={form.paper_type}
                    onChange={(e) =>
                        handleChange({
                            target: {
                                name: "paper_type",
                                value: e.target.value,
                            },
                        })
                    }
                    placeholder="Select Paper Type"
                    options={[
                        {
                            value: "PRACTICE",
                            label: "PRACTICE",
                        },
                        {
                            value: "MOCK",
                            label: "MOCK",
                        },
                        {
                            value: "MAIN_EXAM",
                            label: "MAIN EXAM",
                        },
                    ]}
                />

                <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(e) =>
                        handleChange({
                            target: {
                                name: "status",
                                value: e.target.value,
                            },
                        })
                    }
                    placeholder="Select Status"
                    options={[
                        {
                            value: "ACTIVE",
                            label: "ACTIVE",
                        },
                        {
                            value: "INACTIVE",
                            label: "INACTIVE",
                        },
                    ]}
                />

                <SelectField
                    label="Question Paper Type"
                    value={form.question_paper_type}
                    onChange={(e) =>
                        handleChange({
                            target: {
                                name: "question_paper_type",
                                value: e.target.value,
                            },
                        })
                    }
                    placeholder="Select Question Paper Type"
                    options={[
                        {
                            value: "Abacus",
                            label: "Abacus",
                        },
                        {
                            value: "Vedic",
                            label: "Vedic",
                        },
                    ]}
                />


                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}