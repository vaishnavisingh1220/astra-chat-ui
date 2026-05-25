import Thread from "../models/Thread.js";

// 🧵 Create Thread (Authenticated)
export const createThread = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ from JWT
    const { participants } = req.body || {};

    // Optional validation (if you want group chats later)
    if (participants && !Array.isArray(participants)) {
      return res.status(400).json({
        success: false,
        message: "participants must be an array",
      });
    }

    const thread = await Thread.create({
  userId,
  participants: participants || [],
  title: "New Chat",
});

    res.status(201).json({
      success: true,
      data: thread,
    });

  } catch (error) {
    console.error("THREAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 📜 Get Threads (Authenticated)
export const getThreads = async (req, res) => {
  try {
    const userId = req.user.userId; // ✅ from JWT

    const threads = await Thread.find({ userId }).sort({
      updatedAt: -1,
    });

    res.json({
      success: true,
      data: threads,
    });

  } catch (err) {
    console.error("GET THREAD ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Error fetching threads",
    });
  }
};

// ✏️ Rename Thread
export const renameThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updatedThread =
      await Thread.findByIdAndUpdate(
        id,
        { title },
        { new: true }
      );

    res.json({
      success: true,
      data: updatedThread,
    });

  } catch (error) {
    console.error("RENAME THREAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🗑️ Delete Thread
export const deleteThread = async (req, res) => {
  try {
    const { id } = req.params;

    await Thread.findByIdAndDelete(id);

    await Message.deleteMany({ threadId: id });

    res.json({
      success: true,
      message: "Thread deleted",
    });

  } catch (error) {
    console.error("DELETE THREAD ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};