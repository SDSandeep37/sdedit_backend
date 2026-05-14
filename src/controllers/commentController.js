import { prisma } from "../config/db.js";
import { sanitizeHTML, sanitizeText } from "../utils/sanitize.js";

export const createCommnet = async (request, response) => {
  //check if request has it's body
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Comment details required to process your request",
    });
  }

  const { content, postId } = request.body;

  if (!content) {
    return response.status(400).json({
      success: false,
      message: "Please write something to comment",
    });
  }
  if (!postId) {
    return response.status(400).json({
      success: false,
      message: "Post key is missing",
    });
  }
  const { id } = request.user;
  if (!id) {
    return response.status(400).json({
      success: false,
      message: "Please login to post",
    });
  }
  const userComment = sanitizeHTML(sanitizeText(content));

  try {
    const saveComment = await prisma.comment.create({
      data: {
        content: userComment,
        postId: postId,
        authorId: id,
      },
    });
    if (!saveComment) {
      return response.status(400).json({
        success: false,
        message: "Comment not saved",
      });
    }
    return response.status(201).json({
      success: true,
      message: "Comment saved",
      commentDetails: {
        id: saveComment.id,
        content: saveComment.content,
        postId: saveComment.postId,
        authorId: saveComment.authorId,
        parentId: saveComment.parentId,
        createdAt: saveComment.createdAt,
      },
    });
  } catch (error) {
    console.error("Error occured while commenting", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const createReplies = async (request, response) => {
  //check if request has it's body
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Replie details required to process your request",
    });
  }

  const { content, postId, parentComment } = request.body;

  if (!content) {
    return response.status(400).json({
      success: false,
      message: "Please write something to reply",
    });
  }
  if (!postId) {
    return response.status(400).json({
      success: false,
      message: "Post key is missing",
    });
  }
  if (!parentComment) {
    return response.status(400).json({
      success: false,
      message: "Comment key is required to reply",
    });
  }
  const { id } = request.user;
  if (!id) {
    return response.status(400).json({
      success: false,
      message: "Please login to reply",
    });
  }
  const userReply = sanitizeHTML(sanitizeText(content));

  try {
    const saveReply = await prisma.comment.create({
      data: {
        content: userReply,
        authorId: id,
        postId: postId,
        parentId: parentComment,
      },
    });
    if (!saveReply) {
      return response.status(400).json({
        success: false,
        message: "Reply not saved",
      });
    }
    return response.status(201).json({
      success: true,
      message: "Reply saved",
      replyDetails: {
        id: saveReply.id,
        content: saveReply.content,
        postId: saveReply.postId,
        authorId: saveReply.authorId,
        parentId: saveReply.parentId,
        createdAt: saveReply.createdAt,
      },
    });
  } catch (error) {
    console.error("Error occured while repling", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllCommentsForPost = async (request, response) => {
  const { id } = request.user;
  const { postId } = request.params;

  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Please login to access the contents",
    });
  }
  if (!postId) {
    return response.status(401).json({
      success: false,
      message: "Post key is missing",
    });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentId: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!comments) {
      return response.status(404).json({
        success: true,
        message: "No comments found!",
      });
    }
    comments.forEach((comment) => {
      delete comment.updateAt;
    });
    return response.json({
      success: true,
      message: "Comment List",
      comments,
    });
  } catch (error) {
    console.error("Error occured while getting comments", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
export const getAllReplies = async (request, response) => {
  const { id } = request.user;
  const { postId, parentCommentId } = request.params;
  // console.log("post id ", postId);
  // console.log("parent id ", parentCommentId);
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Please login to access the contents",
    });
  }
  if (!postId) {
    return response.status(401).json({
      success: false,
      message: "Post key is missing",
    });
  }
  if (!parentCommentId) {
    return response.status(401).json({
      success: false,
      message: "Parnet comment key is missing",
    });
  }
  try {
    const replies = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentId: parentCommentId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!replies) {
      return response.status(404).json({
        success: false,
        message: "No reply found!",
      });
    }
    replies.forEach((reply) => {
      delete reply.updateAt;
    });
    return response.json({
      success: true,
      message: "Reply List",
      replies,
    });
  } catch (error) {
    console.error("Error occured while getting replies", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteCommentReply = async (request, response) => {
  const { commentId } = request.params;
  if (!commentId) {
    return response.status(400).json({
      success: false,
      message: "Comment key is missing",
    });
  }
  const { id } = request.user;
  try {
    //check user is the creator of the comment
    const isCreator = await prisma.comment.findUnique({
      where: {
        id: commentId,
        authorId: id,
      },
    });
    if (!isCreator) {
      return response.status(401).json({
        success: false,
        message: "Unauthorised access! ",
      });
    }
    const deleteComment = await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    if (!deleteComment) {
      return response.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    return response.json({
      success: true,
      message: "Deleted successfully",
      key: commentId,
    });
  } catch (error) {
    console.error("Error occured while deleting comment/reply", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateComment = async (request, response) => {
  if (!request.body) {
    return response.status(400).json({
      success: false,
      message: "Comment details required",
    });
  }
  const { commentId } = request.params;
  if (!commentId) {
    return response.status(400).json({
      success: false,
      message: "Comment key is missing",
    });
  }
  // get details from request body
  const { content } = request.body;
  const userCommment = sanitizeHTML(sanitizeText(content));

  const { id } = request.user;
  if (!id) {
    return response.status(401).json({
      success: false,
      message: "Unauthorised access",
    });
  }
  try {
    // check user if he/she is the creator
    const confirmUser = await prisma.comment.findUnique({
      where: {
        id: commentId,
        authorId: id,
      },
    });
    if (!confirmUser) {
      return response.status(401).json({
        success: false,
        message: "You are not authorised for this action",
      });
    }
    const updateComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: userCommment },
    });

    if (!updateComment) {
      return response.status(400).json({
        success: false,
        message: "Not able to update comment/reply",
      });
    }
    return response.json({
      success: true,
      message: "Updated successfully",
      content: updateComment.content,
    });
  } catch (error) {
    console.error("Error occured while updating comment/reply", error);
    response.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
