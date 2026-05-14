import { prisma } from "../config/db.js";

export const addCommunityMember = async (request, response) => {
  //check if request has it's body
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Community details required to process your request",
    });
  }

  //get community id from request body
  const { communityId } = request.body;
  if (!communityId) {
    return response.status(400).json({
      success: false,
      message: "Community key missing",
    });
  }

  // get user id from cookie token
  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Cannot create community unauthorised access! Please login",
    });
  }

  try {
    const isCommunityMember = await prisma.communityMember.findUnique({
      where: {
        //here userId_communityId because of this componsite key @@unique([userId, communityId])
        userId_communityId: {
          userId: id,
          communityId: communityId,
        },
      },
    });
    // const isCommunityMember = await prisma.communityMember.findFirst({
    //   where: {
    //     userId: id,
    //     communityId,
    //   },
    // });
    if (isCommunityMember) {
      // 202 Accepted → Request accepted but not yet processed.
      return response.status(202).json({
        success: true,
        message: "Your have already joined this community",
      });
    }
    const member = await prisma.communityMember.create({
      data: {
        userId: id,
        communityId: communityId,
      },
    });
    if (!member) {
      return response.status(400).json({
        success: false,
        message: "Community joining falied! Please try again.",
      });
    }

    return response.status(201).json({
      success: true,
      message: "Your are successfully add to this community",
      member: {
        id: member.id,
        communityId: member.communityId,
        userId: member.userId,
      },
    });
  } catch (error) {
    console.error("Error added community member", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
