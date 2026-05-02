import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.model.js";
import User from "../models/User.model.js";

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts controller: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessagesByUserId controller: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    const senderId = req.user._id;
    const { id: receiverId } = req.params;

    if (!text && !image) {
      return res
        .status(400)
        .json({ message: "Message text or image is required!" });
    }

    if (receiverId === senderId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send message to yourself!" });
    }

    const receiverExists = await User.exists({ _id: receiverId });

    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found!" });
    }

    let imageUrl;

    if (image) {
      //  upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // todo: send message in real-time if user is online - socket.io
  } catch (error) {
    console.log("Error in sendMessage controller: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((mesg) =>
          msg.senderId.toString() === loggedInUserId
            ? msg.receiverId.toString()
            : msg.senderId.toString(),
        ),
      ),
    ];

    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.log("Error in getChatPartners controller: ", error);
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
