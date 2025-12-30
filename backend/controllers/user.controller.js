import User from "../models/Users.js";
import Notification from "../models/Notification.js";

import QuizAttempt from "../models/QuizAttempt.js";
import imagekit from "../conf/imagekit.js";



// Get user profile stats
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user data
    const user = await User.findById(userId).select('name email class streak bestStreak lastLoginDate profilePicture');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Get all completed quiz attempts
    const quizAttempts = await QuizAttempt.find({
      user: userId,
      isArchived: true
    }).sort({ createdAt: -1 });

    // Calculate stats
    const totalQuizzes = quizAttempts.length;

    let bestScore = 0;
    let totalScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalQuestions = 0;

    const topicCounts = {};

    quizAttempts.forEach(attempt => {
      if (attempt.score > bestScore) {
        bestScore = attempt.score;
      }
      totalScore += attempt.score || 0;
      totalCorrect += attempt.correctAnswers || 0;
      totalIncorrect += attempt.incorrectAnswers || 0;
      totalQuestions += attempt.totalQuestions || 0;

      // Count topics
      if (attempt.topic) {
        topicCounts[attempt.topic] = (topicCounts[attempt.topic] || 0) + 1;
      }
    });

    const averageScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

    // Get favorite topics (sorted by count)
    const favoriteTopics = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent quizzes (last 6)
    const recentQuizzes = quizAttempts.slice(0, 6).map(q => ({
      _id: q._id,
      topic: q.topic,
      score: q.score,
      correctAnswers: q.correctAnswers,
      totalQuestions: q.totalQuestions,
      createdAt: q.createdAt
    }));

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        semester: user.semester,
        currentStreak: user.streak || 0,
        bestStreak: user.bestStreak || user.streak || 0,
        profilePicture: user.profilePicture || null,
        totalQuizzes,
        bestScore,
        averageScore,
        totalCorrect,
        totalIncorrect,
        totalQuestions,
        favoriteTopics,
        recentQuizzes
      }
    });
  } catch (error) {
    console.error("Get profile stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile stats",
      error: error.message
    });
  }
};

// Update user name
export const updateName = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select('name email semester streak');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Name updated successfully",
      data: {
        name: user.name,
        email: user.email,
        semester: user.semester,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error("Update name error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update name",
      error: error.message
    });
  }
};

// Update user semester
export const updateSemester = async (req, res) => {
  try {
    const userId = req.user.id;
    const { semester } = req.body;

    if (!semester || semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: "Semester must be between 1 and 8"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { semester: parseInt(semester) },
      { new: true }
    ).select('name email semester streak');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Semester updated successfully",
      data: {
        name: user.name,
        email: user.email,
        semester: user.semester,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error("Update semester error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update semester",
      error: error.message
    });
  }
};

// Update user class
export const updateClass = async (req, res) => {
  try {
    const userId = req.user.id;
    const { class: userClass } = req.body;

    if (!userClass || (userClass !== 9 && userClass !== 10)) {
      return res.status(400).json({
        success: false,
        message: "Class must be either 9 or 10"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { class: parseInt(userClass) },
      { new: true }
    ).select('name email class streak');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Class updated successfully",
      data: {
        name: user.name,
        email: user.email,
        class: user.class,
        streak: user.streak
      }
    });
  } catch (error) {
    console.error("Update class error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update class",
      error: error.message
    });
  }
};

// Upload profile picture
export const uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Upload to ImageKit
    const result = await imagekit.upload({
      file: req.file.buffer, // ImageKit supports buffer directly
      fileName: `profile-${userId}`,
      folder: '/profile_pictures',
      useUniqueFileName: false, // We want to overwrite if possible or keep consistent naming
      overwriteFile: true, // Try to overwrite existing file
    });

    // Construct transformed URL
    const transformedUrl = imagekit.url({
      src: result.url,
      transformation: [{
        height: "300",
        width: "300",
        focus: "face", // Face center crop
        crop: "maintain_ratio"
      }]
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: transformedUrl },
      { new: true }
    ).select('name email profilePicture');

    res.json({
      success: true,
      message: "Profile picture uploaded successfully",
      data: {
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
      error: error.message
    });
  }
};

// Remove profile picture
export const removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    // For ImageKit, we just remove the reference. 
    // Since we use consistent file naming (profile-userId), 
    // subsequent uploads will overwrite this anyway.

    const user = await User.findByIdAndUpdate(userId, { profilePicture: null });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile picture removed successfully"
    });
  } catch (error) {
    console.error("Remove profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove profile picture",
      error: error.message
    });
  }
};

// Get profile picture
export const getProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('profilePicture');

    res.json({
      success: true,
      data: {
        profilePicture: user?.profilePicture || null
      }
    });
  } catch (error) {
    console.error("Get profile picture error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get profile picture",
      error: error.message
    });
  }
};

// Get Notifications for User
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Fetch notifications:
    // 1. targetAudience is "all" 
    // 2. OR targetAudience is "class" AND targetClass matches user.class
    const notifications = await Notification.find({
      $or: [
        { targetAudience: "all" },
        { targetAudience: "class", targetClass: String(user.class) }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    // Count unread
    const unreadCount = notifications.filter(n => !n.readBy.includes(userId)).length;

    res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);
    res.status(500).json({ success: false, message: "Error fetching notifications" });
  }
};

// Mark Notification as Read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await Notification.findByIdAndUpdate(notificationId, {
      $addToSet: { readBy: userId }
    });

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Mark Read Error:", error);
    res.status(500).json({ success: false, message: "Error marking notification as read" });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || !q.trim()) {
      return res.json({
        success: true,
        data: []
      });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .select('name email profilePicture class streak')
      .limit(10);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search users",
      error: error.message
    });
  }
};

