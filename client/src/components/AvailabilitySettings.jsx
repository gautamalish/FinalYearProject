import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { Form, Button, Row, Col, Spinner, Alert } from "react-bootstrap";
import { TimePicker } from "react-bootstrap-time-picker";

const AvailabilitySettings = ({ initialAvailability, onSave }) => {
  const { currentUser } = useAuth();
  const [availability, setAvailability] = useState({
    days: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
    hours: {
      start: "09:00",
      end: "17:00",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (initialAvailability) {
      setAvailability({
        days: {
          monday: initialAvailability.monday || false,
          tuesday: initialAvailability.tuesday || false,
          wednesday: initialAvailability.wednesday || false,
          thursday: initialAvailability.thursday || false,
          friday: initialAvailability.friday || false,
          saturday: initialAvailability.saturday || false,
          sunday: initialAvailability.sunday || false,
        },
        hours: initialAvailability.hours || {
          start: "09:00",
          end: "17:00",
        },
      });
    }
  }, [initialAvailability]);

  const handleDayChange = (day) => {
    setAvailability((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: !prev.days[day],
      },
    }));
  };

  const handleTimeChange = (type, value) => {
    // Convert seconds to HH:mm format
    const hours = Math.floor(value / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((value % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const timeString = `${hours}:${minutes}`;

    setAvailability((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [type]: timeString,
      },
    }));
  };

  const validateTimes = () => {
    const { start, end } = availability.hours;
    if (start >= end) {
      setError("End time must be after start time");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateTimes()) return;

    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.patch(
        `/api/workers/${currentUser.uid}/availability`,
        availability,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSave(response.data.availability);
      setSuccess("Availability updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability");
    } finally {
      setLoading(false);
    }
  };

  // Convert HH:mm to seconds for TimePicker
  const timeToSeconds = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 3600 + minutes * 60;
  };

  return (
    <Form onSubmit={handleSubmit} className="availability-form">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <h5 className="mb-3">Working Days</h5>
      <Row className="mb-4">
        {Object.entries(availability.days).map(([day, isAvailable]) => (
          <Col key={day} xs={6} sm={4} md={3} className="mb-2">
            <Form.Check
              type="switch"
              id={`day-${day}`}
              label={day.charAt(0).toUpperCase() + day.slice(1)}
              checked={isAvailable}
              onChange={() => handleDayChange(day)}
            />
          </Col>
        ))}
      </Row>

      <h5 className="mb-3">Working Hours</h5>
      <Row className="mb-4">
        <Col md={6} className="mb-3">
          <Form.Label>Start Time</Form.Label>
          <TimePicker
            start="00:00"
            end="23:59"
            step={30}
            format={24}
            value={timeToSeconds(availability.hours.start)}
            onChange={(value) => handleTimeChange("start", value)}
          />
        </Col>
        <Col md={6} className="mb-3">
          <Form.Label>End Time</Form.Label>
          <TimePicker
            start="00:00"
            end="23:59"
            step={30}
            format={24}
            value={timeToSeconds(availability.hours.end)}
            onChange={(value) => handleTimeChange("end", value)}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <Button
          variant="primary"
          type="submit"
          disabled={loading}
          className="save-button"
        >
          {loading ? (
            <Spinner as="span" animation="border" size="sm" />
          ) : (
            "Save Availability"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default AvailabilitySettings;
