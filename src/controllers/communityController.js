import { prisma } from "../config/db.js";
import { sanitizeHTML, sanitizeText } from "../utils/sanitize.js";
import { getUploadedImage } from "../utils/uploads.js";

export const createCommunityController = async (request, response) => {
  // return if no user data
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Community details required",
    });
  }
  // sanitize input first
  const data = request.body;
  const { id } = request.user;
  if (!request.user) {
    return response.status(400).json({
      success: false,
      message: "Unauthorsied Access",
    });
  }
  const name = sanitizeText(data.name);
  const description = sanitizeHTML(sanitizeText(data.description));
  if (!name) {
    return response.status(400).json({
      success: false,
      message: "Please enter the name community",
    });
  }
  if (!description) {
    return response.status(400).json({
      success: false,
      message: "Please write a short descpition of the community",
    });
  }
  try {
    const isCommunity = await prisma.community.findUnique({
      where: {
        name: name,
      },
    });
    if (isCommunity) {
      return response.status(400).json({
        success: false,
        message: "Cannot create community as we have already with same name!.",
      });
    }
    const community = await prisma.community.create({
      data: {
        name,
        creatorId: id,
      },
    });
    if (!community) {
      return response.status(400).json({
        success: false,
        message: "Not able to create, try again later.",
      });
    }
    const addCommunityMember = await prisma.communityMember.create({
      data: {
        userId: id,
        communityId: community.id,
      },
    });
    if (addCommunityMember) {
      return response.status(201).json({
        success: true,
        message: "Community create successfully and you are added",
        community: {
          communityId: community.id,
          name: community.name,
          creator: community.creatorId,
        },
      });
    }
    return response.status(201).json({
      success: true,
      message: "Community create successfully",
      community: {
        communityId: community.id,
        name: community.name,
        creator: community.creatorId,
      },
    });
  } catch (error) {
    console.error("Error creating community", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateCommunityAvatarController = async (request, response) => {
  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Please select a file to upload",
    });
  }
  const file = request.file;
  const { communityId } = request.body;
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Community key required",
    });
  }
  const uploadImage = getUploadedImage(file);
  if (!uploadImage) {
    return response.status(400).json({
      success: false,
      message: "Uploading falied",
    });
  }
  const fullpath = process.env.BASEURL + uploadImage.path;
  const { id } = request.user;
  try {
    const confirmCreator = await prisma.community.findUnique({
      where: {
        id: communityId,
        creatorId: id,
      },
    });
    if (!confirmCreator) {
      return response.status(401).json({
        success: false,
        message: "You are not authorised for this action",
      });
    }
    const updateCommunity = await prisma.community.update({
      where: { id: communityId },
      data: {
        avatar: fullpath,
      },
    });
    return response.json({
      success: true,
      message: "Community avatar uploaded successfully",
      avatar: fullpath,
    });
  } catch (error) {
    console.error("Error updating community avatar", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const updateCommunityBannerController = async (request, response) => {
  if (!request.file) {
    return response.status(400).json({
      success: false,
      message: "Please select a file to upload ",
    });
  }
  const file = request.file;
  const { communityId } = request.body;
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Community key required",
    });
  }
  const uploadImage = getUploadedImage(file);
  if (!uploadImage) {
    return response.status(400).json({
      success: false,
      message: "Uploading falied",
    });
  }
  const fullpath = process.env.BASEURL + uploadImage.path;
  const { id } = request.user;
  try {
    const confirmCreator = await prisma.community.findUnique({
      where: {
        id: communityId,
        creatorId: id,
      },
    });
    if (!confirmCreator) {
      return response.status(401).json({
        success: false,
        message: "You are not authorised for this action",
      });
    }
    const updateCommunityBanner = await prisma.community.update({
      where: { id: communityId },
      data: {
        banner: fullpath,
      },
    });
    return response.json({
      success: true,
      message: "Community banner uploaded successfully",
      banner: updateCommunityBanner.banner,
    });
  } catch (error) {
    console.error("Error updating community banner", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateCommunityDescriptionController = async (
  request,
  response,
) => {
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Community data is required  ",
    });
  }

  // get details from request body
  const communityData = request.body;
  // const name = sanitizeText(communityData.name);
  const communityId = sanitizeText(communityData.communityId);
  const description = sanitizeHTML(sanitizeText(communityData.description));
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Community key missing",
    });
  }
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Unauthorised access",
    });
  }
  try {
    // check user if he/she is the creator
    const confirmCreator = await prisma.community.findUnique({
      where: {
        id: communityId,
        creatorId: id,
      },
    });
    if (!confirmCreator) {
      return response.status(401).json({
        success: false,
        message: "You are not authorised for this action",
      });
    }
    const updateDescription = await prisma.community.update({
      where: { id: communityId },
      data: { description: description },
    });

    if (!updateDescription) {
      return response.status(400).json({
        success: false,
        message: "Not able to update community description",
      });
    }
    return response.json({
      success: true,
      message: "Description updated successfully",
      description: updateDescription.description,
    });
  } catch (error) {
    console.error("Error occured while updating community details", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteCommunity = async (request, response) => {
  const { communityId } = request.params;
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Community key is missing",
    });
  }
  const { id } = request.user;
  console.log(id);
  try {
    //check user is the creator of the community
    const isCreator = await prisma.community.findUnique({
      where: {
        id: communityId,
        creatorId: id,
      },
    });
    if (!isCreator) {
      return response.status(401).json({
        success: false,
        message: "Unauthorised access! You cannot delete this community",
      });
    }
    const deleteCommunity = await prisma.community.delete({
      where: {
        id: communityId,
      },
    });
    if (!deleteCommunity) {
      return response.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    return response.json({
      success: true,
      message: "Community deleted successfully",
      post: { id: communityId },
    });
  } catch (error) {
    console.error("Error occured while deleting the community", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllCommunity = async (request, response) => {
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Please login to access the contents",
    });
  }
  try {
    const communities = await prisma.community.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!communities) {
      return response.status(404).json({
        success: false,
        message: "No community found!",
      });
    }
    communities.forEach((community) => {
      delete community.updateAt;
    });
    return response.json({
      success: true,
      message: "Community List",
      communities,
    });
  } catch (error) {
    console.error("Error occured while getting communities", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getCommunity = async (request, response) => {
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Please login to access the contents",
    });
  }
  const { communityId } = request.params;
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Community key is missing",
    });
  }

  try {
    const communityDetails = await prisma.community.findFirst({
      where: {
        id: communityId,
      },
    });

    if (!communityDetails) {
      return response.status(404).json({
        success: false,
        message: "No community found!",
      });
    }
    delete communityDetails.updateAt;

    return response.json({
      success: true,
      message: "Community",
      communityDetails,
    });
  } catch (error) {
    console.error("Error occured while getting Community", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
