import React from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Line, Pie, Bar } from "react-chartjs-2";

const EmissionCharts = ({
  theme,
  monthlyChartData,
  typeChartData,
  stackedChartData,
}) => {
  return (
    <Row className="mb-4">
      <Col md={12} lg={6} className="mb-3">
        <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
          <Card.Body>
            <Card.Title className="mb-4">Monthly Energy Consumption</Card.Title>
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
      <Col md={12} lg={6} className="mb-3">
        <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
          <Card.Body>
            <Card.Title className="mb-4">Emissions by Energy Source</Card.Title>
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
      {stackedChartData && (
        <Col md={12} className="mb-3">
          <Card className={`bg-${theme} shadow-sm h-100 m-0`}>
            <Card.Body>
              <Card.Title className="mb-4">
                Energy Emissions by Source Over Time
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
      )}
    </Row>
  );
};

export default EmissionCharts;
