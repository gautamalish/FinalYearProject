import axios from "axios";

// Profile Image Management
export const uploadProfileImage = async (userId, file, token) => {
  try {
    // 1. First upload to Cloudinary
    const cloudinaryUrl = await uploadImageToCloudinary(file);

    // 2. Then save the URL to your database
    const response = await axios.patch(
      `${API_URL}/users/${userId}/profile-image`,
      { profileImage: cloudinaryUrl },
      getAuthConfig(token)
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteProfileImage = async (userId, imageUrl, token) => {
  try {
    // 1. Delete from Cloudinary
    const publicId = extractPublicId(imageUrl);
    await deleteImageFromCloudinary(publicId);

    // 2. Remove from database
    const response = await axios.patch(
      `${API_URL}/users/${userId}/profile-image`,
      { profileImage: null },
      getAuthConfig(token)
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Cloudinary Helper Functions
const extractPublicId = (url) => {
  // Extract public ID from Cloudinary URL
  const matches = url.match(/upload\/(?:v\d+\/)?([^\.]+)/);
  return matches ? matches[1] : null;
};

const deleteImageFromCloudinary = async (publicId) => {
  try {
    if (!publicId) throw new Error("Invalid public ID");

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      formData
    );
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
};
