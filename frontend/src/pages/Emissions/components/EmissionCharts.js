import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Line, Pie, Bar } from "react-chartjs-2";

const EmissionCharts = ({
  theme,
  monthlyChartData,
  typeChartData,
  emissionsBySource,
  emissionsByType,
  filteredRecords,
}) => {
  // Process data for stacked bar chart
  const prepareStackedChartData = () => {
    // Get unique months and emission types
    const months = [];
    const emissionTypes = new Set();

    // First pass - collect unique months and types
    filteredRecords.forEach((record) => {
      if (record.date) {
        const month = new Date(record.date).toLocaleString("default", {
          month: "short",
        });
        if (!months.includes(month)) {
          months.push(month);
        }

        let type = "Other";
        if (record.transportEmission) {
          type = "Transport";
        } else if (record.energyEmission) {
          type = "Energy";
        } else if (record.transportRecord) {
          type = record.emissionType?.name || "Transport";
        } else {
          type = record.emissionType?.name || "Other";
        }

        emissionTypes.add(type);
      }
    });

    // Sort months chronologically
    const sortedMonths = months.sort((a, b) => {
      const monthOrder = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };
      return monthOrder[a] - monthOrder[b];
    });

    // Create datasets for each emission type
    const datasets = [];
    const colors = [
      "rgba(255, 99, 132, 0.7)",
      "rgba(54, 162, 235, 0.7)",
      "rgba(255, 206, 86, 0.7)",
      "rgba(75, 192, 192, 0.7)",
      "rgba(153, 102, 255, 0.7)",
      "rgba(255, 159, 64, 0.7)",
    ];

    // Convert Set to Array
    const typeArray = Array.from(emissionTypes);

    // Create a dataset for each emission type
    typeArray.forEach((type, typeIndex) => {
      const monthlyData = new Array(sortedMonths.length).fill(0);

      // Calculate total for each month by this type
      filteredRecords.forEach((record) => {
        if (record.date) {
          const month = new Date(record.date).toLocaleString("default", {
            month: "short",
          });
          const monthIndex = sortedMonths.indexOf(month);

          let recordType = "Other";
          if (record.transportEmission) {
            recordType = "Transport";
          } else if (record.energyEmission) {
            recordType = "Energy";
          } else if (record.transportRecord) {
            recordType = record.emissionType?.name || "Transport";
          } else {
            recordType = record.emissionType?.name || "Other";
          }

          if (recordType === type) {
            monthlyData[monthIndex] += parseFloat(record.co2Equivalent || 0);
          }
        }
      });

      datasets.push({
        label: type,
        data: monthlyData,
        backgroundColor: colors[typeIndex % colors.length],
        borderColor: colors[typeIndex % colors.length].replace("0.7", "1"),
        borderWidth: 1,
      });
    });

    return {
      labels: sortedMonths,
      datasets,
    };
  };

  const stackedChartData = prepareStackedChartData();

  return (
    <>
      <Row className="mb-4">
        <Col md={12} lg={6}>
          <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
            <Card.Body>
              <Card.Title className="mb-4">Monthly Emissions Trend</Card.Title>
              <div style={{ height: "300px", padding: "10px" }}>
                <Line
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color:
                            theme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: theme === "dark" ? "#fff" : "#666",
                          font: {
                            size: 11,
                          },
                        },
                        title: {
                          display: true,
                          text: "CO₂ Emissions (kg)",
                          color: theme === "dark" ? "#fff" : "#666",
                          font: {
                            weight: "bold",
                            size: 12,
                          },
                        },
                      },
                      x: {
                        grid: {
                          color:
                            theme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: theme === "dark" ? "#fff" : "#666",
                          font: {
                            size: 11,
                          },
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === "dark" ? "#fff" : "#666",
                          font: {
                            size: 12,
                          },
                        },
                      },
                      tooltip: {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(0, 0, 0, 0.8)"
                            : "rgba(255, 255, 255, 0.8)",
                        titleColor: theme === "dark" ? "#fff" : "#000",
                        bodyColor: theme === "dark" ? "#fff" : "#000",
                        borderColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.2)",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12} lg={6}>
          <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
            <Card.Body>
              <Card.Title className="mb-4">Emissions by Type</Card.Title>
              <div style={{ height: "300px", padding: "10px" }}>
                <Pie
                  data={typeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          color: theme === "dark" ? "#fff" : "#666",
                          padding: 15,
                          font: {
                            size: 11,
                          },
                        },
                        display: Object.keys(emissionsByType).length <= 8,
                      },
                      tooltip: {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(0, 0, 0, 0.8)"
                            : "rgba(255, 255, 255, 0.8)",
                        titleColor: theme === "dark" ? "#fff" : "#000",
                        bodyColor: theme === "dark" ? "#fff" : "#000",
                        borderColor:
                          theme === "dark"
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(0, 0, 0, 0.2)",
                        borderWidth: 1,
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12} lg={6}>
          <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
            <Card.Body>
              <Card.Title className="mb-4">
                Emissions by Source (All Modules)
              </Card.Title>
              <div style={{ height: "300px", padding: "10px" }}>
                <Bar
                  data={emissionsBySource}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color:
                            theme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: theme === "dark" ? "#fff" : "#666",
                        },
                        title: {
                          display: true,
                          text: "CO₂ Emissions (kg)",
                          color: theme === "dark" ? "#fff" : "#666",
                          font: {
                            weight: "bold",
                          },
                        },
                      },
                      x: {
                        grid: {
                          color:
                            theme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: theme === "dark" ? "#fff" : "#666",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: theme === "dark" ? "#fff" : "#666",
                        },
                      },
                      tooltip: {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(0, 0, 0, 0.8)"
                            : "rgba(255, 255, 255, 0.8)",
                        titleColor: theme === "dark" ? "#fff" : "#000",
                        bodyColor: theme === "dark" ? "#fff" : "#000",
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={12} lg={6}>
          <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
            <Card.Body>
              <Card.Title className="mb-4">
                Monthly Emissions by Type
              </Card.Title>
              <div style={{ height: "300px", padding: "10px" }}>
                <Bar
                  data={stackedChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true,
                        grid: {
                          color:
                            theme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: theme === "dark" ? "#fff" : "#666",
                        },
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true,
                        grid: {
                          color:
                            theme === "dark"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(0, 0, 0, 0.1)",
                        },
                        ticks: {
                          color: theme === "dark" ? "#fff" : "#666",
                        },
                        title: {
                          display: true,
                          text: "CO₂ Emissions (kg)",
                          color: theme === "dark" ? "#fff" : "#666",
                          font: {
                            weight: "bold",
                          },
                        },
                      },
                    },
                    plugins: {
                      tooltip: {
                        backgroundColor:
                          theme === "dark"
                            ? "rgba(0, 0, 0, 0.8)"
                            : "rgba(255, 255, 255, 0.8)",
                        titleColor: theme === "dark" ? "#fff" : "#000",
                        bodyColor: theme === "dark" ? "#fff" : "#000",
                      },
                      legend: {
                        position: "top",
                        labels: {
                          color: theme === "dark" ? "#fff" : "#666",
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EmissionCharts;
