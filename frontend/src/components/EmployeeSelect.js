import Select from "react-select";

const EmployeeSelect = ({
  modalData,
  employeesState,
  handleEmployeeChange,
  theme = "light",
}) => {
  const formatEmployeeData = (employee) => {
    // Make sure we have valid data
    if (!employee) return null;

    return {
      value: employee._id ? employee._id : employee.value,
      label:
        employee.firstName && employee.lastName
          ? `${employee.firstName} ${employee.lastName}`
          : employee.label || "",
      key: employee._id ? employee._id : employee.value,
    };
  };

  // Filter out any null values from the formatted data
  const selectedEmployees = modalData?.employees
    ?.map(formatEmployeeData)
    .filter(Boolean);

  const employeeOptions = employeesState.map(formatEmployeeData);
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#272b30" : provided.backgroundColor,
      borderColor: theme === "dark" ? "#272b30" : provided.borderColor,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#272b30" : provided.backgroundColor,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor:
        theme === "dark"
          ? state.isSelected
            ? "#0d6efd"
            : state.isFocused
            ? "#272b30"
            : "#272b30"
          : provided.backgroundColor,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    input: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#adb5bd" : provided.color,
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === "dark" ? "#272b30" : provided.backgroundColor,
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: theme === "dark" ? "#e9ecef" : provided.color,
    }),
  };

  return (
    <div className="mb-3">
      <label htmlFor="employees" className="form-label">
        Employees
      </label>
      <Select
        id="employees"
        isMulti
        value={selectedEmployees}
        onChange={handleEmployeeChange}
        options={employeeOptions}
        classNamePrefix="react-select"
        styles={customStyles}
      />
    </div>
  );
};

export default EmployeeSelect;
