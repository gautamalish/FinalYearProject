import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Tab,
  Nav,
  Spinner,
  Alert,
} from "react-bootstrap";
import WorkerCategoryForm from "../components/WorkerCategoryForm";
import ProfileImageUpload from "../components/ProfileImageUpload";
import AvailabilitySettings from "../components/AvailabilitySettings";
import WorkerStats from "../components/WorkerStats";

const WorkerProfilePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!currentUser || currentUser.role !== "worker") {
      navigate("/");
      return;
    }

    const fetchProfileData = async () => {
      try {
        const token = await currentUser.getIdToken();
        const response = await axios.get(`/api/workers/${currentUser.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfileData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser, navigate]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await axios.patch(
        `/api/workers/${currentUser.uid}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileData(response.data);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Update failed",
      };
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={12}>
          <h1 className="mb-4">Worker Profile</h1>

          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Row>
              <Col lg={3}>
                <Card className="mb-4">
                  <Card.Body className="p-3">
                    <div className="text-center mb-3">
                      <ProfileImageUpload
                        currentImage={profileData.profileImage}
                        onUpload={(url) =>
                          handleProfileUpdate({ profileImage: url })
                        }
                      />
                      <h4 className="mt-3">{profileData.name || "Worker"}</h4>
                      <p className="text-muted">
                        {profileData.title || "Service Professional"}
                      </p>
                    </div>

                    <Nav variant="pills" className="flex-column">
                      <Nav.Item>
                        <Nav.Link eventKey="profile">
                          Profile Information
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="categories">
                          Service Categories
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="availability">
                          Availability
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="stats">Performance Stats</Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="profile">
                    <Card className="mb-4">
                      <Card.Header as="h5">Basic Information</Card.Header>
                      <Card.Body>
                        <form>
                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="name" className="form-label">
                                Full Name
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="name"
                                defaultValue={profileData.name}
                                onBlur={(e) =>
                                  handleProfileUpdate({ name: e.target.value })
                                }
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="title" className="form-label">
                                Professional Title
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                id="title"
                                defaultValue={profileData.title}
                                onBlur={(e) =>
                                  handleProfileUpdate({ title: e.target.value })
                                }
                              />
                            </div>
                          </div>

                          <div className="mb-3">
                            <label htmlFor="bio" className="form-label">
                              Bio
                            </label>
                            <textarea
                              className="form-control"
                              id="bio"
                              rows="4"
                              defaultValue={profileData.bio}
                              onBlur={(e) =>
                                handleProfileUpdate({ bio: e.target.value })
                              }
                            ></textarea>
                          </div>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <label htmlFor="email" className="form-label">
                                Email
                              </label>
                              <input
                                type="email"
                                className="form-control"
                                id="email"
                                defaultValue={currentUser.email}
                                disabled
                              />
                            </div>
                            <div className="col-md-6">
                              <label htmlFor="phone" className="form-label">
                                Phone Number
                              </label>
                              <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                defaultValue={profileData.phone}
                                onBlur={(e) =>
                                  handleProfileUpdate({ phone: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </form>
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="categories">
                    <Card className="mb-4">
                      <Card.Header as="h5">Service Categories</Card.Header>
                      <Card.Body>
                        <WorkerCategoryForm
                          initialCategories={profileData.categories || []}
                          onUpdate={(categories) => {
                            handleProfileUpdate({ categories });
                          }}
                        />
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="availability">
                    <Card className="mb-4">
                      <Card.Header as="h5">Availability Settings</Card.Header>
                      <Card.Body>
                        <AvailabilitySettings
                          availability={profileData.availability || {}}
                          onSave={(availability) => {
                            handleProfileUpdate({ availability });
                          }}
                        />
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="stats">
                    <Card className="mb-4">
                      <Card.Header as="h5">Performance Statistics</Card.Header>
                      <Card.Body>
                        <WorkerStats workerId={currentUser.uid} />
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkerProfilePage;
