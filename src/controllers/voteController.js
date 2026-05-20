import { prisma } from "../config/db.js";

// export const voteContoller = async (request, response) => {
//   if (!request.body) {
//     return response.status(400).json({
//       success: false,
//       message: "Some user data is required to vote",
//     });
//   }
//   const userData = request.body;
//   const postId = userData.postId;
//   const commentId = userData.commentId;
//   if (!postId) {
//     return response.status(400).json({
//       success: false,
//       message: "Post key is missing",
//     });
//   }
//   // if (!commentId) {
//   //   return response.status(400).json({
//   //     success: false,
//   //     message: "Comment key is missing",
//   //   });
//   // }
//   const { id } = request.user;
//   if (!id) {
//     return response.status(400).json({
//       success: false,
//       message: "Unauthorised action!",
//     });
//   }
//   try {
//     const isUserVoted = await prisma.vote.findFirst({
//       where: {
//         postId: postId,
//         commentId: commentId,
//         userId: id,
//       },
//     });
//     if (!isUserVoted) {
//       const voted = await prisma.vote.create({
//         data: {
//           postId: postId,
//           commentId: commentId,
//           userId: id,
//           value: 1,
//         },
//       });
//       if (!voted) {
//         return response.status(400).json({
//           success: false,
//           message: "Voting failed",
//         });
//       }
//       return response.json({
//         success: true,
//         message: "Voting done",
//         vote: voted.value,
//       });
//     }
//     // const voting = isUserVoted.value === 1 ? 0 : 1;
//     const voting = isUserVoted.value ^ 1; // XOR toggle between 0 and 1

//     const updateVote = await prisma.vote.update({
//       where: { id: isUserVoted.id },
//       data: {
//         value: voting,
//       },
//     });
//     if (!updateVote) {
//       return response.status(400).json({
//         success: false,
//         message: "Voting failed",
//       });
//     }
//     return response.json({
//       success: true,
//       message: "Voting done",
//       vote: updateVote.value,
//     });
//   } catch (error) {
//     console.error("Error occured voting", error);
//     response.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
export const voteContoller = async (request, response) => {
  const { postId, commentId, value } = request.body;

  const { id: userId } = request.user;

  if (!userId) {
    return response.status(401).json({
      success: false,
      message: "Unauthorized action!",
    });
  }

  if (!postId && !commentId) {
    return response.status(400).json({
      success: false,
      message: "PostId or CommentId is required",
    });
  }

  // only allow 1 or -1
  if (![1, -1].includes(value)) {
    return response.status(400).json({
      success: false,
      message: "Invalid vote value",
    });
  }

  try {
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,

        ...(postId && { postId }),

        ...(commentId && { commentId }),
      },
    });

    // user already voted
    if (existingVote) {
      // same vote clicked again -> remove vote
      if (existingVote.value === value) {
        await prisma.vote.delete({
          where: {
            id: existingVote.id,
          },
        });

        return response.json({
          success: true,
          message: "Vote removed",
          vote: null,
        });
      }

      // change vote
      const updatedVote = await prisma.vote.update({
        where: {
          id: existingVote.id,
        },

        data: {
          value,
        },
      });

      return response.json({
        success: true,
        message: "Vote updated",
        vote: updatedVote.value,
      });
    }

    // create new vote
    const createdVote = await prisma.vote.create({
      data: {
        value,
        userId,

        ...(postId && { postId }),

        ...(commentId && { commentId }),
      },
    });

    return response.json({
      success: true,
      message: "Vote added",
      vote: createdVote.value,
    });
  } catch (error) {
    console.error("Error occured voting", error);

    return response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
