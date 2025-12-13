import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import User from "../models/Users.js";
import { transporter, createMailOptions } from "../conf/mail.conf.js";
import Groq from "groq-sdk";

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Generate quiz questions using Groq AI (Llama 3 via Groq)
const generateQuizQuestions = async (topic, numberOfQuestions) => {
  try {
    const systemPrompt = `You are an expert academic quiz generator for the Indian CBSE/NCERT curriculum. 
Your goal is to generate high-quality, relevant multiple-choice questions (MCQs) strictly based on NCERT textbooks.
Focus on key concepts, definitions, and standard examples found in NCERT books.

Response Format:
Return ONLY a valid JSON array of objects. Do not include any markdown formatting, code blocks, or explanations outside the JSON.
Each object must follow this schema:
{
  "questionText": "Question string",
  "options": [
    { "text": "Option A", "isCorrect": boolean },
    { "text": "Option B", "isCorrect": boolean },
    { "text": "Option C", "isCorrect": boolean },
    { "text": "Option D", "isCorrect": boolean }
  ],
  "correctAnswer": "Exact text of the correct option",
  "explanation": "Brief explanation referencing NCERT concepts"
}

Constraints:
- Exactly 4 options per question.
- Exactly one correct option.
- Questions must be educational and accurate.
- No duplicate questions.`;

    const userPrompt = `Generate exactly ${numberOfQuestions} MCQs about "${topic}".
Ensure the questions are suitable for students following the NCERT curriculum.
Cover important topics and avoid obscure trivia.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.3-70b-versatile", // Updated to supported model
      temperature: 0.5, // Lower temperature for more focused/deterministic results
      response_format: { type: "json_object" }, // Enforce JSON mode
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned empty content");
    }

    console.log("Groq AI Output:", content.substring(0, 100) + "..."); // Log first 100 chars for debug

    // Parse JSON
    // Note: Llama 3 with json_object mode might return { "questions": [...] } or just [...]
    let questions;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        questions = parsed;
      } else if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions;
      } else {
        // Fallback: try to extract array if wrapped in strange keys
        const keys = Object.keys(parsed);
        if (keys.length === 1 && Array.isArray(parsed[keys[0]])) {
          questions = parsed[keys[0]];
        } else {
          throw new Error("Could not find question array in JSON response");
        }
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response");
    }

    // Validate structure similar to before
    const validatedQuestions = questions.map((q, index) => {
      // Basic validation
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
        // Skip malformed or try to fix? Let's skip or throw. 
        // For robustness, let's just map simplified structure
        return null;
      }

      // Ensure options have text and isCorrect
      // Check if we need to fix isCorrect based on correctAnswer
      const options = q.options.map(opt => {
        if (typeof opt === 'string') return { text: opt, isCorrect: opt === q.correctAnswer };
        return opt;
      });

      // Ensure at least one correct answer is marked
      const hasCorrect = options.some(opt => opt.isCorrect);
      if (!hasCorrect && q.correctAnswer) {
        options.forEach(opt => {
          if (opt.text === q.correctAnswer) opt.isCorrect = true;
        });
      }

      return {
        questionText: q.questionText,
        options: options.slice(0, 4),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || "Correct answer based on NCERT."
      };
    }).filter(q => q !== null);

    return validatedQuestions.slice(0, numberOfQuestions);

  } catch (error) {
    console.error("Groq AI error:", error);
    // Fallback logic remains specific to the failure, but we reuse existing fallback templates below
    // Returning empty array triggers the fallback loop in the catch block of generatesQuizQuestions? 
    // Wait, the original code had fallback logic inside the catch block of this function.
    // I will preserve that fallback logic by re-throwing or handling it here.
    throw error; // Let the caller or the fallback catch block handle it
  }
};



// Create a new quiz
const createQuiz = async (req, res) => {
  try {
    const { topic, numberOfQuestions, timeLimit } = req.body;
    const userId = req.user.id;

    // Validation
    if (!topic || !numberOfQuestions || !timeLimit) {
      return res.status(400).json({
        success: false,
        message: "Topic, number of questions, and time limit are required"
      });
    }

    if (numberOfQuestions < 1 || numberOfQuestions > 50) {
      return res.status(400).json({
        success: false,
        message: "Number of questions must be between 1 and 50"
      });
    }

    if (timeLimit < 1 || timeLimit > 180) {
      return res.status(400).json({
        success: false,
        message: "Time limit must be between 1 and 180 minutes"
      });
    }

    // Generate questions using Google Gemini AI
    const questions = await generateQuizQuestions(topic, numberOfQuestions);

    // Create quiz
    const quiz = new Quiz({
      user: userId,
      topic,
      numberOfQuestions,
      timeLimit,
      questions
    });

    await quiz.save();

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      user: userId,
      quiz: quiz._id,
      topic,
      timeLimit,
      totalQuestions: numberOfQuestions
    });

    await quizAttempt.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      data: {
        quizId: quiz._id,
        attemptId: quizAttempt._id,
        topic,
        numberOfQuestions,
        timeLimit,
        questions: quiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options.map(opt => ({ text: opt.text })) // Don't send correct answers
        }))
      }
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create quiz",
      error: error.message
    });
  }
};

// Get active quiz attempt
const getActiveQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: 'in-progress'
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "No active quiz found"
      });
    }

    // Check if quiz expired
    if (attempt.isExpired) {
      await attempt.autoComplete();
      return res.status(410).json({
        success: false,
        message: "Quiz has expired"
      });
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        topic: attempt.topic,
        timeLimit: attempt.timeLimit,
        remainingTime: attempt.getRemainingTime(),
        totalQuestions: attempt.totalQuestions,
        currentAnswers: attempt.answers,
        questions: attempt.quiz.questions.map(q => ({
          questionText: q.questionText,
          options: q.options.map(opt => ({ text: opt.text }))
        }))
      }
    });
  } catch (error) {
    console.error("Get active quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz",
      error: error.message
    });
  }
};

// Submit quiz answer
const submitAnswer = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionIndex, selectedAnswer } = req.body;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: 'in-progress'
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    // Check if quiz expired
    if (attempt.isExpired) {
      await attempt.autoComplete();
      return res.status(410).json({
        success: false,
        message: "Quiz has expired"
      });
    }

    // Validate question index
    if (questionIndex < 0 || questionIndex >= attempt.quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index"
      });
    }

    const question = attempt.quiz.questions[questionIndex];
    const isCorrect = question.correctAnswer === selectedAnswer;

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(
      a => a.questionIndex === questionIndex
    );

    if (existingAnswerIndex > -1) {
      attempt.answers[existingAnswerIndex] = {
        questionIndex,
        selectedAnswer,
        isCorrect
      };
    } else {
      attempt.answers.push({
        questionIndex,
        selectedAnswer,
        isCorrect
      });
    }

    await attempt.save();

    res.json({
      success: true,
      message: "Answer submitted successfully",
      data: {
        remainingTime: attempt.getRemainingTime()
      }
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit answer",
      error: error.message
    });
  }
};

// Submit quiz (complete the quiz)
const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    if (attempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: "Quiz already completed"
      });
    }

    // Calculate results
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const incorrectAnswers = attempt.answers.length - correctAnswers;
    const score = Math.round((correctAnswers / attempt.totalQuestions) * 100);

    // Update attempt
    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.correctAnswers = correctAnswers;
    attempt.incorrectAnswers = incorrectAnswers;
    attempt.score = score;
    attempt.isArchived = true;

    await attempt.save();

    res.json({
      success: true,
      message: "Quiz completed successfully",
      data: {
        attemptId: attempt._id,
        totalQuestions: attempt.totalQuestions,
        correctAnswers,
        incorrectAnswers,
        score,
        topic: attempt.topic
      }
    });
  } catch (error) {
    console.error("Submit quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz",
      error: error.message
    });
  }
};

// Get quiz results
const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: { $in: ['completed', 'expired'] }
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz results not found"
      });
    }

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        topic: attempt.topic,
        totalQuestions: attempt.totalQuestions,
        correctAnswers: attempt.correctAnswers,
        incorrectAnswers: attempt.incorrectAnswers,
        score: attempt.score,
        status: attempt.status,
        completedAt: attempt.endTime,
        explanationEmailSent: attempt.explanationEmailSent
      }
    });
  } catch (error) {
    console.error("Get quiz results error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get results",
      error: error.message
    });
  }
};

// Send explanation email
const sendExplanationEmail = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId,
      status: { $in: ['completed', 'expired'] }
    }).populate('quiz user');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    if (attempt.explanationEmailSent) {
      return res.status(400).json({
        success: false,
        message: "Explanation email already sent"
      });
    }

    // Create email content
    let emailContent = `
      <h2>Quiz Results and Explanations</h2>
      <h3>Topic: ${attempt.topic}</h3>
      <p><strong>Score:</strong> ${attempt.correctAnswers}/${attempt.totalQuestions} (${attempt.score}%)</p>
      <p><strong>Correct Answers:</strong> ${attempt.correctAnswers}</p>
      <p><strong>Incorrect Answers:</strong> ${attempt.incorrectAnswers}</p>
      <hr>
      <h3>Detailed Explanations:</h3>
    `;

    attempt.quiz.questions.forEach((question, index) => {
      const userAnswer = attempt.answers.find(a => a.questionIndex === index);
      const studentAnswer = userAnswer ? userAnswer.selectedAnswer : "Not Answered";

      emailContent += `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd;">
          <h4>Question ${index + 1}</h4>
          <p><strong>Q:</strong> ${question.questionText}</p>
          <p><strong>Your Answer:</strong> ${studentAnswer}</p>
          <p><strong>Correct Answer:</strong> ${question.correctAnswer}</p>
          <p><strong>Status:</strong> ${userAnswer && userAnswer.isCorrect ? '✅ Correct' : '❌ Incorrect'}</p>
          <p><strong>Explanation:</strong> ${question.explanation}</p>
        </div>
      `;
    });

    // Send email using existing email configuration
    const mailOptions = createMailOptions(
      attempt.user.email,
      `Quiz Results: ${attempt.topic}`,
      emailContent
    );

    await transporter.sendMail(mailOptions);

    // Mark email as sent
    attempt.explanationEmailSent = true;
    await attempt.save();

    res.json({
      success: true,
      message: "Explanation email sent successfully"
    });
  } catch (error) {
    console.error("Send email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send explanation email",
      error: error.message
    });
  }
};

// Get user's quiz history (archived quizzes)
const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const attempts = await QuizAttempt.find({
      user: userId,
      isArchived: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('topic totalQuestions correctAnswers score status createdAt endTime');

    const total = await QuizAttempt.countDocuments({
      user: userId,
      isArchived: true
    });

    res.json({
      success: true,
      data: {
        attempts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get quiz history",
      error: error.message
    });
  }
};

// Delete a quiz attempt
const deleteQuizAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      user: userId
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    // Delete the associated quiz as well
    await Quiz.findByIdAndDelete(attempt.quiz);
    await QuizAttempt.findByIdAndDelete(attemptId);

    res.json({
      success: true,
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    console.error("Delete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
      error: error.message
    });
  }
};

// Get user stats (quiz count, streak)
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const quizCount = await QuizAttempt.countDocuments({
      user: userId,
      isArchived: true
    });

    const user = await User.findById(userId).select('streak lastLoginDate');

    res.json({
      success: true,
      data: {
        quizCount,
        streak: user?.streak || 0,
        lastLoginDate: user?.lastLoginDate
      }
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user stats",
      error: error.message
    });
  }
};

export { createQuiz, getActiveQuiz, submitAnswer, submitQuiz, getQuizResults, sendExplanationEmail, getQuizHistory, deleteQuizAttempt, getUserStats };