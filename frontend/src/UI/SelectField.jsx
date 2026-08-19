import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";


const SelectField = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select option...",
  error = "",
  showError = false,
  required = false,
  disabled = false,
  containerClassName = "",
  className = "",
  onBlur,
  name="",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  // const [touched, setTouched] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const shouldShowError = showError && !!error;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
        setSearch("");
        // setTouched(true);
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) => {
    const optLabel = typeof opt === 'string' ? opt : opt.label;
    return String(optLabel).toLowerCase().includes(search.toLowerCase());
  });


  // const handleSelect = (option) => {
  //   const selectedValue = typeof option === 'string' ? option : option.value;
  //   onChange({ target: { value: selectedValue } }); // ✅ sends event-like object
  //   // setTouched(true);
  //   setSearch("");
  //   setOpen(false);
  //   onBlur?.();
  // };




  const handleSelect = (option) => {
    const selectedValue =
        typeof option === "string" ? option : option.value;

    onChange({
        target: {
            name,
            value: selectedValue,
        },
    });

    setSearch("");
    setOpen(false);
    onBlur?.();
};
  const handleFocus = () => {
    if (!disabled) {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <div className={`space-y-1 ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={`w-full px-3 py-2 border rounded-md bg-white flex justify-between items-center cursor-pointer
          ${shouldShowError ? "border-red-500" : "border-gray-300"}
          ${disabled ? "bg-gray-100 opacity-50 cursor-not-allowed" : ""}
          ${className}`}
          onClick={handleFocus}
        >
          <input
            ref={inputRef}
            type="text"
            value={open ? search : (
              typeof value === 'object'
                ? (options.find(o => o.value === value)?.label || value?.label || '')
                : (options.find(o => (typeof o === 'object' ? o.value === value : o === value))?.label || value || '')
            )}
            placeholder={!value ? placeholder : ""}
            onChange={(e) => setSearch(e.target.value)}
            disabled={disabled}
            className="w-full focus:outline-none bg-transparent"
            onBlur={() => {
              // setTouched(true);
              onBlur?.();
            }}
            readOnly={!open}
          />

          <ChevronDown size={18} className={`${open ? "rotate-180" : ""}`} onClick={(e) => {
            e.stopPropagation();   // 🔑 IMPORTANT
            setOpen(prev => !prev);
          }} />
        </div>

        {open && (
          <div className="absolute z-50 w-full bg-white  border border-gray-300
 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optValue = typeof option === 'string' ? option : option.value;
                const optLabel = typeof option === 'string' ? option : option.label;
                return (
                  <div
                    key={`${optValue}-${index}`}
                    className={`px-3 py-2 cursor-pointer transition-all
  hover:bg-gray-100
  ${value === optValue
                        ? "bg-gray-100 text-gray-900 border border-gray-400 rounded-md"
                        : "border border-transparent"
                      }
`}

                    onClick={() => handleSelect(option)}
                  >
                    {optLabel}
                  </div>
                );
              })
            ) : (
              <p className="px-3 py-2 text-gray-500 text-sm">No results found</p>
            )}
          </div>
        )}
      </div>

      {shouldShowError && (
        <p className="text-red-600 text-sm flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
};

export default SelectField;




// how to use this component:

// import SelectField from "../UI/SelectField";

// const parties = ["Tesla", "Tata Motors", "Reliance", "Infosys", "Wipro"];

// <SelectField
//   label="Select Party"
//   options={parties}
//   value={party}
//   onChange={setParty}
//   required
// />;
