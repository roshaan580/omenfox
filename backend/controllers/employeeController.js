const Employee = require("../models/Employee");
const Transportation = require("../models/Transportation");

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    console.log("Fetching employees from database...");
    const employees = await Employee.find().populate("car").populate("company");
    console.log("Found employees:", employees.length);
    console.log("Employee sample:", employees.slice(0, 2).map(e => ({ 
      id: e._id, 
      name: `${e.firstName} ${e.lastName}`,
      email: e.email,
      company: e.company?.name || 'No company'
    })));
    res.json(employees);
  } catch (err) {
    console.error("Error in getEmployees:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get an employee by ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Create a new employee
exports.createEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    homeAddress,
    homeLocation,
    companyAddress,
    companyLocation,
    company,
    phone,
    position,
    car,
  } = req.body;

  try {
    // First, save the car details to the Transportation model
    const newCar = new Transportation({
      name: car.name,
      type: car.type,
      licensePlate: car.licensePlate,
      companyCar: car.companyCar,
    });

    // Save the car and wait for it to be saved before proceeding
    const savedCar = await newCar.save();

    // Now, create the employee and link the car by its ObjectId
    const newEmployee = new Employee({
      firstName,
      lastName,
      email,
      password,
      homeAddress,
      homeLocation: {
        lat: parseFloat(homeLocation.lat),
        lon: parseFloat(homeLocation.lon),
      },
      companyAddress,
      companyLocation: {
        lat: parseFloat(companyLocation.lat),
        lon: parseFloat(companyLocation.lon),
      },
      car: savedCar._id, // Save the car's ID in the employee
      company: company || undefined, // Link to company if provided
      phone: phone || undefined,
      position: position || undefined,
    });

    // Save the employee
    await newEmployee.save();

    // Now, update the saved car with the employee ID
    savedCar.employeeId = newEmployee._id;
    await savedCar.save();

    // If employee is linked to a company, add employee to company's employees array
    if (company) {
      const Companies = require("../models/Companies");
      await Companies.findByIdAndUpdate(
        company,
        { $addToSet: { employees: newEmployee._id } }, // $addToSet prevents duplicates
        { new: true }
      );
    }

    // Return the newly created employee along with the car info
    res.status(201).json({
      employee: newEmployee,
      car: savedCar,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update an employee
exports.updateEmployee = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    homeAddress,
    homeLocation,
    companyAddress,
    companyLocation,
    company,
    phone,
    position,
    car,
  } = req.body;

  try {
    // Check if the employee exists
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // If car details need to be updated, update the car model first
    if (car && (car.name || car.licensePlate)) {
      // Check if there's a car associated with the employee
      const existingCar = await Transportation.findById(employee.car);

      // If the car exists, update it; otherwise, create a new car
      if (existingCar) {
        existingCar.name = car.name || existingCar.name;
        existingCar.type = car.type || existingCar.type;
        existingCar.licensePlate = car.licensePlate || existingCar.licensePlate;
        existingCar.companyCar = car.companyCar !== undefined ? car.companyCar : existingCar.companyCar;
        await existingCar.save();
      } else {
        // If no car exists, create a new car
        const newCar = new Transportation({
          name: car.name,
          type: car.type || "car",
          licensePlate: car.licensePlate,
          companyCar: car.companyCar || false,
        });
        const savedCar = await newCar.save();
        employee.car = savedCar._id; // Assign the new car to the employee
      }
    }

    // Update the employee details
    employee.firstName = firstName || employee.firstName;
    employee.lastName = lastName || employee.lastName;
    employee.email = email || employee.email;
    if (password) employee.password = password;
    employee.homeAddress = homeAddress || employee.homeAddress;
    if (homeLocation) {
      employee.homeLocation = {
        lat: parseFloat(homeLocation.lat),
        lon: parseFloat(homeLocation.lon),
      };
    }
    employee.companyAddress = companyAddress || employee.companyAddress;
    if (companyLocation) {
      employee.companyLocation = {
        lat: parseFloat(companyLocation.lat),
        lon: parseFloat(companyLocation.lon),
      };
    }
    
    // Handle company changes
    const oldCompany = employee.company;
    if (company !== undefined) {
      employee.company = company || null;
      
      // If company changed, update both old and new company employee arrays
      if (oldCompany && oldCompany.toString() !== company) {
        // Remove from old company
        const Companies = require("../models/Companies");
        await Companies.findByIdAndUpdate(
          oldCompany,
          { $pull: { employees: employee._id } },
          { new: true }
        );
      }
      
      // Add to new company if provided
      if (company) {
        const Companies = require("../models/Companies");
        await Companies.findByIdAndUpdate(
          company,
          { $addToSet: { employees: employee._id } },
          { new: true }
        );
      }
    }
    
    // Update additional fields
    if (phone !== undefined) employee.phone = phone;
    if (position !== undefined) employee.position = position;

    // Save the updated employee details
    const updatedEmployee = await employee.save();

    // Populate the employee with car and company details
    await updatedEmployee.populate("car");
    await updatedEmployee.populate("company");

    res.json({
      employee: updatedEmployee,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete an employee
exports.deleteEmployee = async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
