"use client";

import { Heart, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import CommentDrawer from "./commentDrawer";
import { useAuth } from "@clerk/nextjs";
interface LikeButtonProps {
  imageId: number;
}

const LikeButton = ({ imageId }: LikeButtonProps) => {
  const user = useAuth();
  const userId = user.userId;
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (userId === null) {
      console.error("User ID is null, cannot fetch like status");
      return;
    }

    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(
          `/api/status?userId=${userId}&imageId=${imageId}`,
        );
        if (response.ok) {
          const result = await response.json();
          setIsLiked(result.isLiked);
        } else {
          console.error("Failed to fetch like status");
        }
      } catch (error) {
        console.error("Error fetching like status", error);
      }
    };

    fetchLikeStatus();
  }, [userId, imageId]);

  const handleLike = async () => {
    console.log("Like button clicked");
    setIsLiked(!isLiked);

    if (userId === null) {
      console.error("User ID is null, cannot update like status");
      return;
    }

    try {
      const userResponse = await fetch("/api/checkUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (userResponse.ok) {
        const userResult = await userResponse.json();
        if (!userResult.exists) {
          await fetch("/api/createUser", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });
        }
      } else {
        throw new Error("Failed to check user existence");
      }

      console.log(
        `Sending request to API: userId=${userId}, imageId=${imageId}, like=${!isLiked}`,
      );
      const response = await fetch("/api/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, imageId, like: !isLiked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update like status");
      }

      const result = await response.json();
      console.log("API response:", result);
    } catch (error) {
      console.error("Failed to update like status", error);
      setIsLiked(isLiked);
    }
  };

  return (
    <div className="flex flex-row px-1">
      <button className="px-1" onClick={handleLike}>
        <Heart stroke="white" fill={isLiked ? "red" : "none"} />
      </button>
      <div className="mt-[5px] ">
        <CommentDrawer imageId={imageId} />
      </div>
    </div>
  );
};

export default LikeButton;
