import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import {
  Card,
  Spinner,
  Alert,
  Tab,
  Nav,
  Row,
  Col,
  Table,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import {
  StarFill,
  CheckCircleFill,
  ClockFill,
  CashStack,
  CalendarEvent,
  GraphUp,
} from "react-bootstrap-icons";
import { lazy, Suspense } from "react";

// Dynamically import charts using React.lazy
const Chart = lazy(() => import("react-apexcharts"));

const WorkerStats = ({ workerId }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = await currentUser?.getIdToken();
        if (!token) throw new Error("Authentication required");

        const response = await axios.get(`/api/workers/${workerId}/stats`, {
          params: { range: timeRange },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data) throw new Error("No data received");
        setStats(response.data);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load statistics"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [workerId, timeRange, currentUser]);

  // Default chart options
  const chartOptions = {
    chart: {
      toolbar: { show: false },
      animations: { enabled: false }, // Better for performance
    },
    stroke: { width: 2 },
    colors: ["#3a86ff", "#ffbe0b", "#4cc700"],
    tooltip: { enabled: true },
    dataLabels: { enabled: false },
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!stats) return null;

    const jobsChart = {
      options: {
        ...chartOptions,
        xaxis: {
          categories: stats.jobTrends?.map((t) => t.date) || [],
          type: "datetime",
        },
        yaxis: { title: { text: "Jobs Completed" } },
      },
      series: [
        {
          name: "Jobs",
          data: stats.jobTrends?.map((t) => t.count) || [],
        },
      ],
    };

    const ratingsChart = {
      options: {
        ...chartOptions,
        xaxis: {
          categories: ["1", "2", "3", "4", "5"],
          title: { text: "Star Rating" },
        },
        plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
      },
      series: [
        {
          name: "Ratings",
          data: [
            stats.ratingDistribution?.["1"] || 0,
            stats.ratingDistribution?.["2"] || 0,
            stats.ratingDistribution?.["3"] || 0,
            stats.ratingDistribution?.["4"] || 0,
            stats.ratingDistribution?.["5"] || 0,
          ],
        },
      ],
    };

    const earningsChart = {
      options: {
        ...chartOptions,
        xaxis: {
          categories: stats.earningsTrend?.map((t) => t.month) || [],
          type: "category",
        },
        yaxis: { title: { text: "Amount ($)" } },
      },
      series: [
        {
          name: "Earnings",
          data: stats.earningsTrend?.map((t) => t.amount) || [],
        },
      ],
    };

    return { jobsChart, ratingsChart, earningsChart };
  };

  const charts = prepareChartData();

  // Format money values
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Render metric card
  const MetricCard = ({
    icon,
    title,
    value,
    subValue,
    variant = "primary",
  }) => (
    <Card className="h-100 metric-card">
      <Card.Body className="text-center">
        <div className={`icon-container bg-${variant}-light mb-3`}>
          {React.cloneElement(icon, { className: `text-${variant}` })}
        </div>
        <h5>{title}</h5>
        <h3 className="mb-1">{value}</h3>
        {subValue && <small className="text-muted">{subValue}</small>}
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <strong>Error loading statistics:</strong> {error}
        <div className="mt-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => {
              setLoading(true);
              setError(null);
            }}
          >
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert variant="info" className="my-4">
        No statistics available for this worker yet.
      </Alert>
    );
  }

  return (
    <div className="worker-stats-container">
      <div className="stats-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <GraphUp className="me-2" />
            Performance Dashboard
          </h4>
          <div className="time-range-selector">
            <select
              className="form-select form-select-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="overview">Overview</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="jobs">Jobs</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reviews">Reviews</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="earnings">Earnings</Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Overview Tab */}
          <Tab.Pane eventKey="overview">
            <Row className="g-4 mb-4">
              <Col md={3} sm={6}>
                <MetricCard
                  icon={<StarFill size={20} />}
                  title="Average Rating"
                  value={stats.averageRating?.toFixed(1) || "0.0"}
                  subValue={`${stats.totalRatings || 0} reviews`}
                  variant="warning"
                />
              </Col>
              <Col md={3} sm={6}>
                <MetricCard
                  icon={<CheckCircleFill size={20} />}
                  title="Jobs Completed"
                  value={stats.jobsCompleted || 0}
                  subValue={`${stats.jobsInProgress || 0} in progress`}
                  variant="success"
                />
              </Col>
              <Col md={3} sm={6}>
                <MetricCard
                  icon={<ClockFill size={20} />}
                  title="Avg Response"
                  value={`${stats.avgResponseTime || 0}h`}
                  subValue={`Last ${stats.responseTimeSample || 0} jobs`}
                  variant="info"
                />
              </Col>
              <Col md={3} sm={6}>
                <MetricCard
                  icon={<CashStack size={20} />}
                  title="Total Earnings"
                  value={formatMoney(stats.totalEarnings)}
                  subValue={`Avg ${formatMoney(stats.avgEarningsPerJob)}/job`}
                  variant="primary"
                />
              </Col>
            </Row>

            <Row className="g-4">
              <Col lg={6}>
                <Card className="h-100">
                  <Card.Header>
                    <CalendarEvent className="me-2" />
                    Job Activity
                  </Card.Header>
                  <Card.Body>
                    {charts?.jobsChart && (
                      <Chart
                        options={charts.jobsChart.options}
                        series={charts.jobsChart.series}
                        type="area"
                        height={300}
                      />
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card className="h-100">
                  <Card.Header>
                    <StarFill className="me-2" />
                    Customer Ratings
                  </Card.Header>
                  <Card.Body>
                    {charts?.ratingsChart && (
                      <Chart
                        options={charts.ratingsChart.options}
                        series={charts.ratingsChart.series}
                        type="bar"
                        height={300}
                      />
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Jobs Tab */}
          <Tab.Pane eventKey="jobs">
            <Card>
              <Card.Header>Job Performance</Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Total Completed Jobs</td>
                        <td>{stats.jobsCompleted || 0}</td>
                        <td>
                          <TrendBadge
                            value={stats.jobsTrend}
                            isIncreasePositive={true}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Completion Rate</td>
                        <td>{stats.completionRate || 0}%</td>
                        <td>
                          <TrendBadge
                            value={stats.completionTrend}
                            isIncreasePositive={true}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Average Duration</td>
                        <td>{stats.avgJobDuration || 0} hours</td>
                        <td>
                          <TrendBadge
                            value={stats.durationTrend}
                            isIncreasePositive={false}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Repeat Clients</td>
                        <td>{stats.repeatClients || 0}</td>
                        <td>
                          <TrendBadge
                            value={stats.repeatClientTrend}
                            isIncreasePositive={true}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Reviews Tab */}
          <Tab.Pane eventKey="reviews">
            <Card>
              <Card.Header>Customer Feedback</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5>Rating Distribution</h5>
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = stats.ratingDistribution?.[rating] || 0;
                      const percentage = stats.totalRatings
                        ? ((count / stats.totalRatings) * 100).toFixed(1)
                        : 0;

                      return (
                        <div key={rating} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span>
                              {rating} <StarFill className="text-warning" />
                            </span>
                            <span>
                              {count} ({percentage}%)
                            </span>
                          </div>
                          <ProgressBar
                            now={percentage}
                            variant="warning"
                            className="rating-progress"
                          />
                        </div>
                      );
                    })}
                  </Col>
                  <Col md={6}>
                    <h5>Recent Feedback</h5>
                    <div className="reviews-list">
                      {stats.recentReviews?.length > 0 ? (
                        stats.recentReviews.map((review, i) => (
                          <div
                            key={i}
                            className="review-item p-3 mb-3 border rounded"
                          >
                            <div className="d-flex justify-content-between mb-2">
                              <div className="rating-stars">
                                {[...Array(5)].map((_, starIdx) => (
                                  <StarFill
                                    key={starIdx}
                                    className={
                                      starIdx < review.rating
                                        ? "text-warning"
                                        : "text-muted"
                                    }
                                  />
                                ))}
                              </div>
                              <small className="text-muted">
                                {new Date(review.date).toLocaleDateString()}
                              </small>
                            </div>
                            <p className="mb-1">
                              {review.comment || "No comment provided"}
                            </p>
                            <small className="text-muted">
                              — {review.clientName || "Anonymous"}
                            </small>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">No reviews yet</p>
                      )}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Earnings Tab */}
          <Tab.Pane eventKey="earnings">
            <Card>
              <Card.Header>Earnings Summary</Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="mb-3">Financial Overview</h5>
                    <div className="earnings-summary">
                      <EarningItem
                        label="Total Earnings"
                        value={formatMoney(stats.totalEarnings)}
                      />
                      <EarningItem
                        label="Average per Job"
                        value={formatMoney(stats.avgEarningsPerJob)}
                      />
                      <EarningItem
                        label="Pending Payments"
                        value={formatMoney(stats.pendingEarnings)}
                        variant="warning"
                      />
                      <EarningItem
                        label="Service Fees"
                        value={formatMoney(stats.totalFees)}
                        variant="danger"
                      />
                      <EarningItem
                        label="Net Earnings"
                        value={formatMoney(stats.netEarnings)}
                        variant="success"
                        isTotal={true}
                      />
                    </div>
                  </Col>
                  <Col md={6}>
                    <h5 className="mb-3">Earnings Trend</h5>
                    {charts?.earningsChart && (
                      <Chart
                        options={charts.earningsChart.options}
                        series={charts.earningsChart.series}
                        type="line"
                        height={300}
                      />
                    )}
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

// Helper Components
const TrendBadge = ({ value, isIncreasePositive }) => {
  if (value === undefined || value === null) return <span>-</span>;

  const isPositive = value >= 0;
  const variant = isPositive
    ? isIncreasePositive
      ? "success"
      : "danger"
    : isIncreasePositive
    ? "danger"
    : "success";

  return (
    <Badge bg={variant} className="trend-badge">
      {isPositive ? "↑" : "↓"} {Math.abs(value)}%
    </Badge>
  );
};

const EarningItem = ({
  label,
  value,
  variant = "primary",
  isTotal = false,
}) => (
  <div className={`earning-item ${isTotal ? "total-item" : ""}`}>
    <div className="d-flex justify-content-between">
      <span className={isTotal ? "fw-bold" : ""}>{label}</span>
      <span className={`text-${variant} ${isTotal ? "fw-bold" : ""}`}>
        {value}
      </span>
    </div>
    {!isTotal && <hr className="my-2" />}
  </div>
);

export default WorkerStats;
