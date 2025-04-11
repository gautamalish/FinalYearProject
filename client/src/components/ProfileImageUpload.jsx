import React, { useState, useRef } from "react";
import { uploadProfileImage, deleteProfileImage } from "../services/profile";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  Button,
  Spinner,
  Alert,
  Image,
  ProgressBar,
} from "react-bootstrap";
import { FaCamera, FaTrash } from "react-icons/fa";

const ProfileImageUpload = ({ userId, currentImage, onUpdate }) => {
  const { currentUser } = useAuth();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate image
    if (!file.type.match("image.*")) {
      setError("Please select an image file (JPEG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size should be less than 5MB");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Create progress callback
      const progressCallback = (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      };

      // Upload the image
      const updatedUser = await uploadProfileImage(
        userId,
        file,
        await currentUser.getIdToken(),
        progressCallback
      );

      onUpdate(updatedUser.profileImage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImage) return;

    setLoading(true);
    try {
      await deleteProfileImage(
        userId,
        currentImage,
        await currentUser.getIdToken()
      );
      onUpdate(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="text-center border-0">
      <Card.Body>
        <div
          className="position-relative mx-auto"
          style={{ width: "150px", height: "150px" }}
        >
          {currentImage ? (
            <Image
              src={currentImage}
              roundedCircle
              thumbnail
              className="w-100 h-100 object-fit-cover"
              alt="Profile"
            />
          ) : (
            <div
              className="d-flex align-items-center justify-content-center w-100 h-100 rounded-circle bg-light text-secondary"
              style={{ fontSize: "3rem" }}
            >
              <FaCamera />
            </div>
          )}

          <label
            htmlFor="profile-upload"
            className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 cursor-pointer"
            style={{ width: "40px", height: "40px" }}
            title="Change photo"
          >
            <FaCamera />
            <input
              id="profile-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="d-none"
              disabled={loading}
            />
          </label>
        </div>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {loading && (
          <div className="mt-3">
            <ProgressBar
              now={progress}
              label={`${progress}%`}
              className="mb-2"
            />
            <small className="text-muted">
              {progress < 100 ? "Uploading..." : "Processing..."}
            </small>
          </div>
        )}

        {currentImage && !loading && (
          <Button
            variant="outline-danger"
            onClick={handleRemoveImage}
            className="mt-3"
            size="sm"
          >
            <FaTrash className="me-1" /> Remove Photo
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProfileImageUpload;
